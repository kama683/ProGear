package model

import "time"

type Order struct{
	ID 			uint
	UserId 		string
	OrderType 	string
	Status 		string
	TotalAmount float64
	CreatedAt	time.Time
}


type OrderItem struct{
	ID 					uint
	OrderId 			int
	ItemType 			string
	EquipmentId 		uint
	EquipmentUnitId 	*uint
	Quantity			int
	PricePerUnit		float64
	TotalPricce			float64
	StartAt				*time.Time
	EndAt				*time.Time
}