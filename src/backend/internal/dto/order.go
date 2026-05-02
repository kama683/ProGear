package dto

import "time"

type OrderCreateRequest struct {
	Items []OrderItemCreateRequest
}

type OrderItemCreateRequest struct {
	ItemType      string
	EquipmentID   uint
	Quantity      int
	StartAt       *time.Time
	EndAt         *time.Time
	ReservationID *uint
}

type OrderResponse struct {
	ID          uint
	UserId      uint
	OrderType   string
	Status      string
	TotalAmount float64
	CreatedAt   time.Time
	Items       []OrderItemResponse
}

type OrderItemResponse struct {
	ID              uint
	ItemType        string
	EquipmentID     uint
	EquipmentName   string
	EquipmentUnitID *uint
	Quantity        int
	UnitPrice       float64
	LineTotal       float64
	StartAt         *time.Time
	EndAt           *time.Time
}

type OrderStatusUpdateRequest struct {
	Status string
}

type InvoiceResponse struct {
	OrderID       uint
	InvoiceNumber string
	Amount        float64
	InvoiceStatus string
	IssuedAt      time.Time
}
