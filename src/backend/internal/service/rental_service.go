package service

import (
	"database/sql"
	"errors"
	"fmt"
	"math"
	"rental/internal/constants"
	"rental/internal/dto"
	"strings"
	"time"
)

type RentalService interface {
	CheckAvailability(equipmentID uint, startAt, endAr time.Time) (dto.AvaialbilityResponse, error)
	Book(userID uint, req dto.RentalBookRequest) (dto.RentalBookResponse, error)
	Calculate(req dto.RentalCalculateRequest) (dto.RentalCalculateResponse, error)
}

type rentalService struct {
	db *sql.DB
}

func NewRentalService(db *sql.DB) RentalService {
	return &rentalService{db: db}
}

func (s *rentalService) CheckAvailability(equipmentID uint, startAt, endAt time.Time) (dto.AvaialbilityResponse, error) {
	if !endAt.After(startAt) {
		return dto.AvaialbilityResponse{}, errors.New("endAt must be after startAt")
	}
	availableCount, err := s.countAvailableUnits(equipmentID, startAt, endAt)
	if err != nil {
		return dto.AvaialbilityResponse{}, err
	}
	return dto.AvaialbilityResponse{
		EquipmentID:    equipmentID,
		StartAt:        startAt,
		EndAt:          endAt,
		Available:      availableCount > 0,
		AvailableUnits: availableCount,
	}, nil
}

func (s *rentalService) Book(userId uint, req dto.RentalBookRequest) (dto.RentalBookResponse, error) {
	if !req.EndAt.After(req.StartAt) {
		return dto.RentalBookResponse{}, errors.New("When renting u cannot choose the time before the start date")
	}
	tx, err := s.db.Begin()
	if err != nil {
		return dto.RentalBookResponse{}, err
	}
	defer tx.Rollback()

	unitId, err := s.findAndLockAvailableUnit(tx, req.EquipmentID, req.StartAt, req.EndAt)
	if err != nil {
		return dto.RentalBookResponse{}, err
	}
	amount, err := s.calculateAmountTx(tx, req.EquipmentID, req.StartAt, req.EndAt, "day")
	if err != nil {
		return dto.RentalBookResponse{}, err
	}

	var reservationID uint
	err = tx.QueryRow(`
		INSERT INTO rental_reservations(equipment_id, equipment_unit_id, user_id, start_at, end_at, status)
		VALUES ($1,$2,$3,$4,$5,'reserved')
		RETURNING id
	`, req.EquipmentID, unitId, userId, req.StartAt, req.EndAt).Scan(&reservationID)
	if err != nil {
		return dto.RentalBookResponse{}, fmt.Errorf("Error creating reservation: %w", err)
	}

	if _, err := tx.Exec(`UPDATE equipment_units SET status = 'reserved' WHERE id = $1`, unitId); err != nil {
		return dto.RentalBookResponse{}, fmt.Errorf("reserve equipment unit: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return dto.RentalBookResponse{}, err
	}

	return dto.RentalBookResponse{
		ReservationID: reservationID,
		EquipmentId:   req.EquipmentID,
		EquipmentUnit: unitId,
		Status:        constants.OrderStatusReserved,
		StartAt:       req.StartAt,
		EndAt:         req.EndAt,
		EstimatedCost: amount,
	}, nil
}

func (s *rentalService) Calculate(req dto.RentalCalculateRequest) (dto.RentalCalculateResponse, error) {
	if !req.EndAt.After(req.StartAt) {
		return dto.RentalCalculateResponse{}, errors.New("endAt must be greater than start")
	}
	mode := strings.ToLower(strings.TrimSpace(req.Mode))
	if mode == "" {
		mode = "day"
	}

	amount, err := s.calculateAmount(req.EquipmentId, req.StartAt, req.EndAt, mode)
	if err != nil {
		return dto.RentalCalculateResponse{}, err
	}

	return dto.RentalCalculateResponse{
		EquipmentId: req.EquipmentId,
		StartAt:     req.StartAt,
		EndAt:       req.EndAt,
		Mode:        mode,
		Amount:      amount,
	}, nil
}

func (s *rentalService) countAvailableUnits(equipmentID uint, startAt, endAt time.Time) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM equipment_units eu
		WHERE eu.equipment_id = $1
		  AND eu.status IN ('available','reserved')
		  AND NOT EXISTS (
			SELECT 1
			FROM rental_reservations rr
			WHERE rr.equipment_unit_id = eu.id
			  AND rr.status IN ('reserved','checked_out')
			  AND rr.start_at < $3
			  AND rr.end_at > $2
		  )
	`
	var count int
	if err := s.db.QueryRow(query, equipmentID, startAt, endAt).Scan(&count); err != nil {
		return 0, fmt.Errorf("count available units: %w", err)
	}
	return count, nil
}

func (s *rentalService) findAndLockAvailableUnit(tx *sql.Tx, equipmentID uint, startAt, endAt time.Time) (uint, error) {
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

func (s *rentalService) calculateAmount(equipmentID uint, startAt, endAt time.Time, mode string) (float64, error) {
	var dailyRate, hourlyRate float64
	err := s.db.QueryRow(`SELECT daily_rate, hourly_rate FROM equipment WHERE id = $1`, equipmentID).Scan(&dailyRate, &hourlyRate)
	if err != nil {
		return 0, fmt.Errorf("get pricing: %w", err)
	}
	return calculateByMode(startAt, endAt, mode, dailyRate, hourlyRate), nil
}

func (s *rentalService) calculateAmountTx(tx *sql.Tx, equipmentID uint, startAt, endAt time.Time, mode string) (float64, error) {
	var dailyRate, hourlyRate float64
	err := tx.QueryRow(`SELECT daily_rate, hourly_rate FROM equipment WHERE id = $1`, equipmentID).Scan(&dailyRate, &hourlyRate)
	if err != nil {
		return 0, fmt.Errorf("get pricing: %w", err)
	}
	return calculateByMode(startAt, endAt, mode, dailyRate, hourlyRate), nil
}

func calculateByMode(startAt, endAt time.Time, mode string, dailyRate, hourlyRate float64) float64 {
	duration := endAt.Sub(startAt)
	if strings.EqualFold(mode, "hour") {
		hours := math.Ceil(duration.Hours())
		return roundCurrency(hours * hourlyRate)
	}
	days := math.Ceil(duration.Hours() / 24)
	return roundCurrency(days * dailyRate)
}

func roundCurrency(v float64) float64 {
	return math.Round(v*100) / 100
}
