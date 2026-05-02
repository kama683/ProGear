package service

import (
	"database/sql"
	"errors"
	"fmt"
	"rental/internal/dto"
	"strings"
)

type UserService interface {
	GetMe(userID uint) (dto.MyResponse, error)
	ListUsers() ([]dto.MyResponse, error)
	UpdateProfile(userID uint, req dto.UpdateProfileRequest) (dto.MyResponse, error)
}

type userService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) UserService {
	return &userService{db: db}
}

func (s *userService) GetMe(userID uint) (dto.MyResponse, error) {
	var out dto.MyResponse
	err := s.db.QueryRow(
		`SELECT id, name, email, role, phone, address FROM users WHERE id = $1`, userID,
	).Scan(&out.ID, &out.Name, &out.Email, &out.Role, &out.Phone, &out.Address)
	if err != nil {
		return dto.MyResponse{}, fmt.Errorf("fetch current user: %w", err)
	}
	return out, nil
}

func (s *userService) ListUsers() ([]dto.MyResponse, error) {
	rows, err := s.db.Query(`SELECT id, name, email, role, phone, address FROM users ORDER BY id`)
	if err != nil {
		return nil, fmt.Errorf("list users: %w", err)
	}
	defer rows.Close()

	users := make([]dto.MyResponse, 0)
	for rows.Next() {
		var u dto.MyResponse
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.Phone, &u.Address); err != nil {
			return nil, fmt.Errorf("scan user: %w", err)
		}
		users = append(users, u)
	}

	return users, rows.Err()
}

func (s *userService) UpdateProfile(userID uint, req dto.UpdateProfileRequest) (dto.MyResponse, error) {
	phone := strings.TrimSpace(req.Phone)
	address := strings.TrimSpace(req.Address)
	if phone == "" || address == "" {
		return dto.MyResponse{}, errors.New("phone and address are required")
	}

	var out dto.MyResponse
	err := s.db.QueryRow(`
		UPDATE users SET phone = $2, address = $3, updated_at = NOW()
		WHERE id = $1
		RETURNING id, name, email, role, phone, address
	`, userID, phone, address).Scan(&out.ID, &out.Name, &out.Email, &out.Role, &out.Phone, &out.Address)
	if err != nil {
		return dto.MyResponse{}, fmt.Errorf("update profile: %w", err)
	}
	return out, nil
}
