package handler

import (
	"rental/internal/service"
)

type Handler struct {
	Auth      *AuthHandler
	Users     *UsersHandler
	Equipment *EquipmentHandler
	Rentals   *RentalHandler
	Orders    *OrderHandler
	Reviews   *ReviewHandler
	Cards     *CardHandler
}

func NewHandler(svc *service.Services) *Handler {
	return &Handler{
		Auth:      NewAuthHandler(svc),
		Users:     NewUserHandler(svc),
		Equipment: NewEquipmentHandler(svc),
		Rentals:   NewRentalHandler(svc),
		Orders:    NewOrderHandler(svc),
		Reviews:   NewReviewHandler(svc),
		Cards:     NewCardHandler(svc),
	}
}
