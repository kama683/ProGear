package service

import (
	"database/sql"
	"errors"
	"fmt"
	"rental/internal/constants"
	"rental/internal/dto"
	"strings"
	"time"
)

type OrderService interface {
	Create(userID uint, req dto.OrderCreateRequest) (dto.OrderResponse, error)
	List(requesterID uint, requesterRole string) ([]dto.OrderResponse, error)
	UpdateStatus(orderID uint, status string) (dto.OrderResponse, error)
	GetInvoice(orderID uint, requesterID uint, requesterRole string) (dto.InvoiceResponse, error)
}
type orderService struct {
	db *sql.DB
}
type preparedOrderItem struct {
	itemType        string
	equipmentID     uint
	equipmentUnitID *uint
	quantity        int
	unitPrice       float64
	lineTotal       float64
	startAt         *time.Time
	endAt           *time.Time
	reservationID   *uint
}

func NewOrderService(db *sql.DB) OrderService {
	return &orderService{db: db}
}
func (s *orderService) Create(userID uint, req dto.OrderCreateRequest) (dto.OrderResponse, error) {
	if len(req.Items) == 0 {
		return dto.OrderResponse{}, errors.New("order items are required")
	}
	tx, err := s.db.Begin()
	if err != nil {
		return dto.OrderResponse{}, err
	}
	defer tx.Rollback()
	prepared := make([]preparedOrderItem, 0, len(req.Items))
	hasSale := false
	hasRental := false
	total := 0.0

	for _, item := range req.Items {
		itemType := strings.ToLower(strings.TrimSpace(item.ItemType))
		switch itemType {
		case constants.ItemTypeSale:
			hasSale = true
			qty := item.Quantity
			if qty <= 0 {
				qty = 1
			}
			var price float64
			var stock int
			err := tx.QueryRow(`SELECT sale_price, quantity FROM equipment WHERE id = $1 FOR UPDATE`, item.EquipmentID).Scan(&price, &stock)
			if err != nil {
				return dto.OrderResponse{}, fmt.Errorf("load sale equipment %d: %w", item.EquipmentID, err)
			}
			if stock < qty {
				return dto.OrderResponse{}, fmt.Errorf("insufficient stock for equipment %d", item.EquipmentID)
			}
			if _, err := tx.Exec(`UPDATE equipment SET quantity = quantity - $2, updated_at = NOW() WHERE id = $1`, item.EquipmentID, qty); err != nil {
				return dto.OrderResponse{}, fmt.Errorf("decrement stock: %w", err)
			}
			line := roundCurrency(float64(qty) * price)
			total += line
			prepared = append(prepared, preparedOrderItem{
				itemType:    constants.ItemTypeSale,
				equipmentID: item.EquipmentID,
				quantity:    qty,
				unitPrice:   price,
				lineTotal:   line,
			})
		case constants.ItemTypeRental:
			hasRental = true
			qty := item.Quantity
			if qty <= 0 {
				qty = 1
			}
			if qty != 1 {
				return dto.OrderResponse{}, errors.New("rental item quantity must be 1")
			}
			if item.ReservationID != nil {
				var (
					equipmentID uint
					unitID      uint
					reservedBy  uint
					startAt     time.Time
					endAt       time.Time
					status      string
					dailyRate   float64
					hourlyRate  float64
				)
				err := tx.QueryRow(`
					SELECT rr.equipment_id, rr.equipment_unit_id, rr.user_id, rr.start_at, rr.end_at, rr.status, e.daily_rate, e.hourly_rate
					FROM rental_reservations rr
					JOIN equipment e ON e.id = rr.equipment_id
					WHERE rr.id = $1
					FOR UPDATE
				`, *item.ReservationID).Scan(&equipmentID, &unitID, &reservedBy, &startAt, &endAt, &status, &dailyRate, &hourlyRate)
				if err != nil {
					return dto.OrderResponse{}, fmt.Errorf("load reservation %d: %w", *item.ReservationID, err)
				}
				if reservedBy != userID {
					return dto.OrderResponse{}, errors.New("reservation belongs to another user")
				}
				if status != constants.OrderStatusReserved {
					return dto.OrderResponse{}, errors.New("reservation is not in reserved status")
				}
				line := calculateByMode(startAt, endAt, "day", dailyRate, hourlyRate)
				total += line
				unit := unitID
				resID := *item.ReservationID
				prepared = append(prepared, preparedOrderItem{
					itemType:        constants.ItemTypeRental,
					equipmentID:     equipmentID,
					equipmentUnitID: &unit,
					quantity:        1,
					unitPrice:       line,
					lineTotal:       line,
					startAt:         &startAt,
					endAt:           &endAt,
					reservationID:   &resID,
				})
				continue
			}
			if item.StartAt == nil || item.EndAt == nil {
				return dto.OrderResponse{}, errors.New("startAt and endAt are required for rental item")
			}
			if !item.EndAt.After(*item.StartAt) {
				return dto.OrderResponse{}, errors.New("rental endAt must be after startAt")

			}
			unitID, err := s.findAndLockAvailableUnit(tx, item.EquipmentID, *item.StartAt, *item.EndAt)
			if err != nil {
				return dto.OrderResponse{}, err
			}
			line, err := s.calculateAmountTx(tx, item.EquipmentID, *item.StartAt, *item.EndAt, "day")
			if err != nil {
				return dto.OrderResponse{}, err
			}
			var reservationID uint
			err = tx.QueryRow(
				`
				INSERT INTO rental_reservations(equipment_id, equipment_unit_id, user_id, start_at, end_at, status)
				VALUES ($1,$2,$3,$4,$5,'reserved') RETURNING id
			`, item.EquipmentID, unitID, userID, *item.StartAt, *item.EndAt).Scan(&reservationID)

			if err != nil {
				return dto.OrderResponse{}, fmt.Errorf("create reservation in order: %w", err)
			}
			if _, err := tx.Exec(`UPDATE equipment_units SET status = 'reserved' WHERE id = $1`, unitID); err != nil {
				return dto.OrderResponse{}, fmt.Errorf("reserve unit in order: %w", err)
			}
			total += line
			unit := unitID
			resID := reservationID
			prepared = append(prepared, preparedOrderItem{
				itemType:        constants.ItemTypeRental,
				equipmentID:     item.EquipmentID,
				equipmentUnitID: &unit,
				quantity:        1,
				unitPrice:       line,
				lineTotal:       line,
				startAt:         item.StartAt,
				endAt:           item.EndAt,
				reservationID:   &resID,
			})
		default:
			return dto.OrderResponse{}, fmt.Errorf("unsupported item type: %s", itemType)
		}
	}
	orderType := "sale"
	status := constants.OrderStatusCompleted
	if hasSale && hasRental {
		orderType = "mixed"
		status = constants.OrderStatusReserved
	} else if hasRental {
		orderType = "rental"
		status = constants.OrderStatusReserved
	}

	var orderID uint
	err = tx.QueryRow(`
		INSERT INTO orders(user_id, order_type, status, total_amount)
		VALUES ($1,$2,$3,$4)
		RETURNING id
	`, userID, orderType, status, roundCurrency(total)).Scan(&orderID)
	if err != nil {
		return dto.OrderResponse{}, fmt.Errorf("create order: %w", err)
	}

	respItems := make([]dto.OrderItemResponse, 0, len(prepared))
	for _, p := range prepared {
		var itemID uint
		err := tx.QueryRow(`
			INSERT INTO order_items(order_id, item_type, equipment_id, equipment_unit_id, quantity, unit_price, line_total, start_at, end_at)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
			RETURNING id
		`, orderID, p.itemType, p.equipmentID, p.equipmentUnitID, p.quantity, p.unitPrice, p.lineTotal, p.startAt, p.endAt).Scan(&itemID)
		if err != nil {
			return dto.OrderResponse{}, fmt.Errorf("create order item: %w", err)
		}

		respItems = append(respItems, dto.OrderItemResponse{
			ID:              itemID,
			ItemType:        p.itemType,
			EquipmentID:     p.equipmentID,
			EquipmentUnitID: p.equipmentUnitID,
			Quantity:        p.quantity,
			UnitPrice:       p.unitPrice,
			LineTotal:       p.lineTotal,
			StartAt:         p.startAt,
			EndAt:           p.endAt,
		})
	}

	invoiceNumber := fmt.Sprintf("INV-%s-%06d", time.Now().UTC().Format("20060102"), orderID)
	if _, err := tx.Exec(`
		INSERT INTO invoices(order_id, invoice_number, amount, status)
		VALUES ($1,$2,$3,'issued')
	`, orderID, invoiceNumber, roundCurrency(total)); err != nil {
		return dto.OrderResponse{}, fmt.Errorf("create invoice: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return dto.OrderResponse{}, err
	}

	return dto.OrderResponse{
		ID:          orderID,
		UserId:      userID,
		OrderType:   orderType,
		Status:      status,
		TotalAmount: roundCurrency(total),
		CreatedAt:   time.Now().UTC(),
		Items:       respItems,
	}, nil
}
func (s *orderService) List(requesterID uint, requesterRole string) ([]dto.OrderResponse, error) {
	query := `SELECT id, user_id, order_type, status, total_amount, created_at FROM orders`
	args := make([]interface{}, 0)
	if requesterRole == constants.RoleCustomer {
		query += ` WHERE user_id = $1`
		args = append(args, requesterID)
	}
	query += ` ORDER BY id DESC`

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("list orders: %w", err)
	}
	defer rows.Close()

	orders := make([]dto.OrderResponse, 0)
	for rows.Next() {
		var o dto.OrderResponse
		if err := rows.Scan(&o.ID, &o.UserId, &o.OrderType, &o.Status, &o.TotalAmount, &o.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan order: %w", err)
		}
		orders = append(orders, o)
	}
	return orders, rows.Err()
}

func (s *orderService) UpdateStatus(orderID uint, status string) (dto.OrderResponse, error) {
	status = strings.ToLower(strings.TrimSpace(status))
	switch status {
	case constants.OrderStatusReserved, constants.OrderStatusCheckedOut, constants.OrderStatusReturned, constants.OrderStatusCompleted, constants.OrderStatusCancelled:
	default:
		return dto.OrderResponse{}, fmt.Errorf("unsupported status: %s", status)
	}

	tx, err := s.db.Begin()
	if err != nil {
		return dto.OrderResponse{}, err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1`, orderID, status); err != nil {
		return dto.OrderResponse{}, fmt.Errorf("update order status: %w", err)
	}

	if status == constants.OrderStatusCheckedOut || status == constants.OrderStatusReturned || status == constants.OrderStatusCancelled {
		reservationStatus := status
		if _, err := tx.Exec(`
			UPDATE rental_reservations rr
			SET status = $2
			WHERE EXISTS (
				SELECT 1 FROM order_items oi
				WHERE oi.order_id = $1
				  AND oi.item_type = 'rental'
				  AND oi.equipment_unit_id = rr.equipment_unit_id
			)
		`, orderID, reservationStatus); err != nil {
			return dto.OrderResponse{}, fmt.Errorf("update reservations status: %w", err)
		}

		unitStatus := constants.UnitStatusReserved
		switch status {
		case constants.OrderStatusCheckedOut:
			unitStatus = constants.UnitStatusCheckedOut
		case constants.OrderStatusReturned, constants.OrderStatusCancelled:
			unitStatus = constants.UnitStatusAvailable
		}

		if _, err := tx.Exec(`
			UPDATE equipment_units eu
			SET status = $2
			WHERE EXISTS (
				SELECT 1 FROM order_items oi
				WHERE oi.order_id = $1
				  AND oi.item_type = 'rental'
				  AND oi.equipment_unit_id = eu.id
			)
		`, orderID, unitStatus); err != nil {
			return dto.OrderResponse{}, fmt.Errorf("update unit status: %w", err)
		}
	}

	var out dto.OrderResponse
	err = tx.QueryRow(`
		SELECT id, user_id, order_type, status, total_amount, created_at
		FROM orders WHERE id = $1
	`, orderID).Scan(&out.ID, &out.UserId, &out.OrderType, &out.Status, &out.TotalAmount, &out.CreatedAt)
	if err != nil {
		return dto.OrderResponse{}, fmt.Errorf("fetch order after update: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return dto.OrderResponse{}, err
	}

	return out, nil
}

func (s *orderService) GetInvoice(orderID uint, requesterID uint, requesterRole string) (dto.InvoiceResponse, error) {
	var orderOwner uint
	err := s.db.QueryRow(`SELECT user_id FROM orders WHERE id = $1`, orderID).Scan(&orderOwner)
	if err != nil {
		return dto.InvoiceResponse{}, fmt.Errorf("load order owner: %w", err)
	}
	if requesterRole == constants.RoleCustomer && orderOwner != requesterID {
		return dto.InvoiceResponse{}, errors.New("forbidden")
	}

	var out dto.InvoiceResponse
	out.OrderID = orderID
	err = s.db.QueryRow(`
		SELECT invoice_number, amount, status, issued_at
		FROM invoices
		WHERE order_id = $1
	`, orderID).Scan(&out.InvoiceNumber, &out.Amount, &out.InvoiceStatus, &out.IssuedAt)
	if err != nil {
		return dto.InvoiceResponse{}, fmt.Errorf("get invoice: %w", err)
	}
	return out, nil
}

func (s *orderService) findAndLockAvailableUnit(tx *sql.Tx, equipmentID uint, startAt, endAt time.Time) (uint, error) {
	query := `
		SELECT eu.id
		FROM equipment_units eu
		WHERE eu.equipment_id = $1
		  AND eu.status IN ('available','reserved')
		  AND NOT EXISTS (
			SELECT 1 FROM rental_reservations rr
			WHERE rr.equipment_unit_id = eu.id
			  AND rr.status IN ('reserved','checked_out')
			  AND rr.start_at < $3
			  AND rr.end_at > $2
		  )
		ORDER BY eu.id
		LIMIT 1
		FOR UPDATE
	`
	var unitID uint
	if err := tx.QueryRow(query, equipmentID, startAt, endAt).Scan(&unitID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, errors.New("no available equipment units for selected period")
		}
		return 0, fmt.Errorf("find available unit: %w", err)
	}
	return unitID, nil
}

func (s *orderService) calculateAmountTx(tx *sql.Tx, equipmentID uint, startAt, endAt time.Time, mode string) (float64, error) {
	var dailyRate, hourlyRate float64
	err := tx.QueryRow(`SELECT daily_rate, hourly_rate FROM equipment WHERE id = $1`, equipmentID).Scan(&dailyRate, &hourlyRate)
	if err != nil {
		return 0, fmt.Errorf("get pricing: %w", err)
	}
	return calculateByMode(startAt, endAt, mode, dailyRate, hourlyRate), nil
}
