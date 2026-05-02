package service

import (
	"database/sql"
	"log"
	"time"
)

// StartScheduler runs rental status transitions in the background every minute.
// Transitions:
//   reserved    → checked_out  when start_at <= NOW()
//   checked_out → returned     when end_at   <= NOW()
//   returned    → completed    immediately
func StartScheduler(db *sql.DB) {
	go func() {
		runRentalTransitions(db) // run once at startup
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			runRentalTransitions(db)
		}
	}()
}

func runRentalTransitions(db *sql.DB) {
	// 1. reserved → checked_out  (start time reached)
	if _, err := db.Exec(`
		UPDATE orders SET status = 'checked_out', updated_at = NOW()
		WHERE status = 'reserved'
		  AND order_type IN ('rental', 'mixed')
		  AND EXISTS (
		      SELECT 1 FROM order_items oi
		      WHERE oi.order_id = orders.id
		        AND oi.item_type = 'rental'
		        AND oi.start_at IS NOT NULL
		        AND oi.start_at <= NOW()
		  )
		  AND NOT EXISTS (
		      SELECT 1 FROM order_items oi
		      WHERE oi.order_id = orders.id
		        AND oi.item_type = 'rental'
		        AND (oi.start_at IS NULL OR oi.start_at > NOW())
		  )
	`); err != nil {
		log.Printf("[scheduler] reserved→checked_out: %v", err)
	}

	// Sync rental_reservations: reserved → checked_out
	if _, err := db.Exec(`
		UPDATE rental_reservations SET status = 'checked_out'
		WHERE status = 'reserved' AND start_at <= NOW()
	`); err != nil {
		log.Printf("[scheduler] reservations reserved→checked_out: %v", err)
	}

	// Sync equipment_units: available/reserved → checked_out
	if _, err := db.Exec(`
		UPDATE equipment_units SET status = 'checked_out'
		WHERE id IN (
		    SELECT equipment_unit_id FROM rental_reservations
		    WHERE status = 'checked_out'
		)
		AND status != 'checked_out'
	`); err != nil {
		log.Printf("[scheduler] units →checked_out: %v", err)
	}

	// 2. checked_out → returned  (end time reached)
	if _, err := db.Exec(`
		UPDATE orders SET status = 'returned', updated_at = NOW()
		WHERE status = 'checked_out'
		  AND EXISTS (
		      SELECT 1 FROM order_items oi
		      WHERE oi.order_id = orders.id
		        AND oi.item_type = 'rental'
		        AND oi.end_at IS NOT NULL
		        AND oi.end_at <= NOW()
		  )
		  AND NOT EXISTS (
		      SELECT 1 FROM order_items oi
		      WHERE oi.order_id = orders.id
		        AND oi.item_type = 'rental'
		        AND (oi.end_at IS NULL OR oi.end_at > NOW())
		  )
	`); err != nil {
		log.Printf("[scheduler] checked_out→returned: %v", err)
	}

	// Sync rental_reservations: checked_out → returned
	if _, err := db.Exec(`
		UPDATE rental_reservations SET status = 'returned'
		WHERE status = 'checked_out' AND end_at <= NOW()
	`); err != nil {
		log.Printf("[scheduler] reservations →returned: %v", err)
	}

	// Free equipment units that have been returned
	if _, err := db.Exec(`
		UPDATE equipment_units SET status = 'available'
		WHERE id IN (
		    SELECT equipment_unit_id FROM rental_reservations
		    WHERE status = 'returned'
		)
		AND status = 'checked_out'
	`); err != nil {
		log.Printf("[scheduler] units →available: %v", err)
	}

	// 3. returned → completed  (automatic)
	if _, err := db.Exec(`
		UPDATE orders SET status = 'completed', updated_at = NOW()
		WHERE status = 'returned'
	`); err != nil {
		log.Printf("[scheduler] returned→completed: %v", err)
	}
}
