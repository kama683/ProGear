package service

import (
	"database/sql"
	"errors"
	"fmt"
	"rental/internal/dto"
	"strings"
	"unicode"
)

type CardService interface {
	List(userID uint) ([]dto.CardResponse, error)
	Add(userID uint, req dto.AddCardRequest) (dto.CardResponse, error)
	Delete(userID, cardID uint) error
	SetDefault(userID, cardID uint) (dto.CardResponse, error)
}

type cardService struct {
	db *sql.DB
}

func NewCardService(db *sql.DB) CardService {
	return &cardService{db: db}
}

func (s *cardService) List(userID uint) ([]dto.CardResponse, error) {
	rows, err := s.db.Query(`
		SELECT id, cardholder_name, last_four, expiry_month, expiry_year, card_type, is_default, created_at
		FROM payment_cards WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("list cards: %w", err)
	}
	defer rows.Close()

	out := make([]dto.CardResponse, 0)
	for rows.Next() {
		var c dto.CardResponse
		if err := rows.Scan(&c.ID, &c.CardholderName, &c.LastFour, &c.ExpiryMonth, &c.ExpiryYear, &c.CardType, &c.IsDefault, &c.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan card: %w", err)
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

func (s *cardService) Add(userID uint, req dto.AddCardRequest) (dto.CardResponse, error) {
	digits := extractDigits(req.CardNumber)
	if len(digits) < 13 || len(digits) > 19 {
		return dto.CardResponse{}, errors.New("card number must be 13–19 digits")
	}
	cvvDigits := extractDigits(req.CVV)
	if len(cvvDigits) < 3 || len(cvvDigits) > 4 {
		return dto.CardResponse{}, errors.New("CVV must be 3–4 digits")
	}
	if req.ExpiryMonth < 1 || req.ExpiryMonth > 12 {
		return dto.CardResponse{}, errors.New("invalid expiry month")
	}
	if req.ExpiryYear < 2024 {
		return dto.CardResponse{}, errors.New("card has expired")
	}
	name := strings.TrimSpace(req.CardholderName)
	if name == "" {
		return dto.CardResponse{}, errors.New("cardholder name is required")
	}

	lastFour := digits[len(digits)-4:]
	cardType := detectCardType(digits)

	tx, err := s.db.Begin()
	if err != nil {
		return dto.CardResponse{}, err
	}
	defer tx.Rollback()

	if req.SetDefault {
		if _, err := tx.Exec(`UPDATE payment_cards SET is_default = FALSE WHERE user_id = $1`, userID); err != nil {
			return dto.CardResponse{}, fmt.Errorf("unset defaults: %w", err)
		}
	}

	// If this is the user's first card, make it default automatically
	var count int
	_ = tx.QueryRow(`SELECT COUNT(*) FROM payment_cards WHERE user_id = $1`, userID).Scan(&count)
	isDefault := req.SetDefault || count == 0

	var c dto.CardResponse
	err = tx.QueryRow(`
		INSERT INTO payment_cards(user_id, cardholder_name, last_four, expiry_month, expiry_year, card_type, is_default)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		RETURNING id, cardholder_name, last_four, expiry_month, expiry_year, card_type, is_default, created_at
	`, userID, name, lastFour, req.ExpiryMonth, req.ExpiryYear, cardType, isDefault).Scan(
		&c.ID, &c.CardholderName, &c.LastFour, &c.ExpiryMonth, &c.ExpiryYear, &c.CardType, &c.IsDefault, &c.CreatedAt,
	)
	if err != nil {
		return dto.CardResponse{}, fmt.Errorf("insert card: %w", err)
	}

	return c, tx.Commit()
}

func (s *cardService) Delete(userID, cardID uint) error {
	res, err := s.db.Exec(`DELETE FROM payment_cards WHERE id = $1 AND user_id = $2`, cardID, userID)
	if err != nil {
		return fmt.Errorf("delete card: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("card not found")
	}
	return nil
}

func (s *cardService) SetDefault(userID, cardID uint) (dto.CardResponse, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return dto.CardResponse{}, err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`UPDATE payment_cards SET is_default = FALSE WHERE user_id = $1`, userID); err != nil {
		return dto.CardResponse{}, fmt.Errorf("unset defaults: %w", err)
	}

	var c dto.CardResponse
	err = tx.QueryRow(`
		UPDATE payment_cards SET is_default = TRUE WHERE id = $1 AND user_id = $2
		RETURNING id, cardholder_name, last_four, expiry_month, expiry_year, card_type, is_default, created_at
	`, cardID, userID).Scan(
		&c.ID, &c.CardholderName, &c.LastFour, &c.ExpiryMonth, &c.ExpiryYear, &c.CardType, &c.IsDefault, &c.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return dto.CardResponse{}, errors.New("card not found")
		}
		return dto.CardResponse{}, fmt.Errorf("set default: %w", err)
	}

	return c, tx.Commit()
}

func extractDigits(s string) string {
	var b strings.Builder
	for _, r := range s {
		if unicode.IsDigit(r) {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func detectCardType(digits string) string {
	if len(digits) == 0 {
		return "unknown"
	}
	switch digits[0] {
	case '4':
		return "visa"
	case '5':
		return "mastercard"
	case '3':
		return "amex"
	case '6':
		return "discover"
	default:
		return "unknown"
	}
}
