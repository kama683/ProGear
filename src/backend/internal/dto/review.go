package dto

import "time"

type ReviewCreateRequest struct {
	Rating  int    `json:"Rating"`
	Comment string `json:"Comment"`
}

type ReviewResponse struct {
	ID          uint      `json:"ID"`
	EquipmentID uint      `json:"EquipmentID"`
	UserID      uint      `json:"UserID"`
	UserName    string    `json:"UserName"`
	Rating      int       `json:"Rating"`
	Comment     string    `json:"Comment"`
	CreatedAt   time.Time `json:"CreatedAt"`
}

type ReviewSummary struct {
	AverageRating float64          `json:"AverageRating"`
	TotalReviews  int              `json:"TotalReviews"`
	Reviews       []ReviewResponse `json:"Reviews"`
}
