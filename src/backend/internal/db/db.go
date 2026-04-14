package db

import (
	"database/sql"
	"errors"
	"fmt"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func OpenDB(databaseURL string) (*sql.DB, error) {
	if databaseURL == "" {
		return nil, errors.New("database url is required")
	}

	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("open database connection: %w", err)
	}

	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping database connection: %w", err)
	}

	return db, nil
}
