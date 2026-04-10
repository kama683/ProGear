package dto

import "time"

type EquipmentCreateRequest struct {
	Name 		string
	Category	string
	Description	string
	Type 		string
	DailyRate	float64
	SalePrice	float64
	Quantity	int
	Serials 	[]string
}


type EquipmentUpdateRequest struct {
	Name 		*string
	Category 	*string
	Description	*string
	Type		*string
	DailyRate	*float64
	SalePrice	*float64
	Quantity	*int
}


type EquipmentResponse struct{
	ID 			uint 
	Name 		string
	Category	string
	Description	string
	Type		string
	DailyRate	string
	SalePrice	string
	Quantity	int
	CreatedAt	time.Time
	UpdatedAt	time.Time
}


type EquipmentDetailResponse struct {
	EquipmentResponse
	AvailableUnits int      
	Serials        []string 
}
