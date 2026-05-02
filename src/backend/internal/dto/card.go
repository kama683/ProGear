package dto

import "time"

type AddCardRequest struct {
	CardNumber     string
	CardholderName string
	ExpiryMonth    int
	ExpiryYear     int
	CVV            string
	SetDefault     bool
}

type CardResponse struct {
	ID             uint      `json:"ID"`
	CardholderName string    `json:"CardholderName"`
	LastFour       string    `json:"LastFour"`
	ExpiryMonth    int       `json:"ExpiryMonth"`
	ExpiryYear     int       `json:"ExpiryYear"`
	CardType       string    `json:"CardType"`
	IsDefault      bool      `json:"IsDefault"`
	CreatedAt      time.Time `json:"CreatedAt"`
}
