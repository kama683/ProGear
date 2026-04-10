package db

import (
	"database/sql"
	"fmt"
)

func InitSchema(db *sql.DB) error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id BIGSERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'manager', 'customer')),
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			last_login_at TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS equipment (
			id BIGSERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			category TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			type TEXT NOT NULL CHECK (type IN ('rental','sale','both')),
			daily_rate NUMERIC(12,2) NOT NULL DEFAULT 0,
			hourly_rate NUMERIC(12,2) NOT NULL DEFAULT 0,
			sale_price NUMERIC(12,2) NOT NULL DEFAULT 0,
			quantity INTEGER NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS equipment_units (
			id BIGSERIAL PRIMARY KEY,
			equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
			serial_number TEXT NOT NULL UNIQUE,
			status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','checked_out')),
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS rental_reservations (
			id BIGSERIAL PRIMARY KEY,
			equipment_id BIGINT NOT NULL REFERENCES equipment(id),
			equipment_unit_id BIGINT NOT NULL REFERENCES equipment_units(id),
			user_id BIGINT NOT NULL REFERENCES users(id),
			start_at TIMESTAMPTZ NOT NULL,
			end_at TIMESTAMPTZ NOT NULL,
			status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','checked_out','returned','cancelled')),
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			CHECK (end_at > start_at)
		);`,
		`CREATE TABLE IF NOT EXISTS orders (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(id),
			order_type TEXT NOT NULL CHECK (order_type IN ('rental','sale','mixed')),
			status TEXT NOT NULL CHECK (status IN ('reserved','checked_out','returned','completed','cancelled')),
			total_amount NUMERIC(12,2) NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS order_items (
			id BIGSERIAL PRIMARY KEY,
			order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
			item_type TEXT NOT NULL CHECK (item_type IN ('rental','sale')),
			equipment_id BIGINT NOT NULL REFERENCES equipment(id),
			equipment_unit_id BIGINT REFERENCES equipment_units(id),
			quantity INTEGER NOT NULL,
			unit_price NUMERIC(12,2) NOT NULL,
			line_total NUMERIC(12,2) NOT NULL,
			start_at TIMESTAMPTZ,
			end_at TIMESTAMPTZ
		);`,
		`CREATE TABLE IF NOT EXISTS invoices (
			id BIGSERIAL PRIMARY KEY,
			order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
			invoice_number TEXT NOT NULL UNIQUE,
			amount NUMERIC(12,2) NOT NULL,
			status TEXT NOT NULL DEFAULT 'issued',
			issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,
		`CREATE INDEX IF NOT EXISTS idx_rental_reservations_dates ON rental_reservations(start_at, end_at);`,
		`CREATE INDEX IF NOT EXISTS idx_rental_reservations_unit_dates ON rental_reservations(equipment_unit_id, start_at, end_at);`,
		`CREATE INDEX IF NOT EXISTS idx_equipment_units_equipment_status ON equipment_units(equipment_id, status);`,
		`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;`,
		`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();`,
		`ALTER TABLE equipment ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(12,2) NOT NULL DEFAULT 0;`,
		`ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();`,
	}

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("begin schema transaction: %w", err)
	}
	defer tx.Rollback()

	for i, stmt := range stmts {
		if _, err := tx.Exec(stmt); err != nil {
			return fmt.Errorf("apply schema statement %d: %w", i+1, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit schema transaction: %w", err)
	}

	return nil
}
