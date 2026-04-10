package service

import (
	"database/sql"

	"rental/internal/config"
)

type Services struct {
	Auth      UserAuthService
	Users     UserService
	Equipment EquipmentService
	Rentals   RentalService
	Orders    OrderService
}

func NewServices(cfg *config.Config, db *sql.DB) *Services {
	return &Services{
		Auth:      NewAuthService(cfg, db),
		Users:     NewUserService(db),
		Equipment: NewEquipmentService(db),
		Rentals:   NewRentalService(db),
		Orders:    NewOrderService(db),
	}
}
