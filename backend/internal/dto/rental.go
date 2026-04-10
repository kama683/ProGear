package dto

import "time"

type AvaialbilityResponse struct {
	EquipmentID    uint
	StartAt        time.Time
	EndAt          time.Time
	Available      bool
	AvailableUnits int
}

type RentalBookRequest struct {
	EquipmentID uint
	StartAt     time.Time
	EndAt       time.Time
}

type RentalBookResponse struct {
	ReservationID uint
	EquipmentId   uint
	EquipmentUnit uint
	Status        string
	StartAt       time.Time
	EndAt         time.Time
	EstimatedCost float64
}

type RentalCalculateRequest struct {
	EquipmentId uint
	StartAt     time.Time
	EndAt       time.Time
	Mode        string
}

type RentalCalculateResponse struct {
	EquipmentId uint
	StartAt     time.Time
	EndAt       time.Time
	Mode        string
	Amount      float64
}
