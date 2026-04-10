package model

import "time"

type Equipment struct {
	ID 				uint
	Name 			string
	Category 		string
	Description 	string 
	Type 			string
	DailyRate		string
	SalePrice		string
	Quantity		int
	CreatedAt		time.Time
	UpdatedAt		time.Time 
}


type EquipmentUnit struct {
	ID 				uint
	EquipmentId 	uint
	Serial 			string
	Status 			string
}