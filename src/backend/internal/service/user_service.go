package service

import (
	"database/sql"
	"fmt"
	"rental/internal/dto"
)

type UserService interface {
	GetMe(userID uint) (dto.MyResponse, error)
	ListUsers() ([]dto.MyResponse, error)
}

type userService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) UserService {
	return &userService{db: db}
}

func (s *userService) GetMe(userID uint) (dto.MyResponse, error) {
	var out dto.MyResponse
	err := s.db.QueryRow(`SELECT id, name, email, role FROM users WHERE id = $1`, userID).Scan(&out.ID, &out.Name, &out.Email, &out.Role)
	if err != nil {
		return dto.MyResponse{}, fmt.Errorf("fetch current user: %w", err)
	}
	return out, nil
}

func (s *userService) ListUsers() ([]dto.MyResponse, error) {
	rows, err := s.db.Query(`SELECT id, name, email, role FROM users ORDER BY id`)
	if err != nil {
		return nil, fmt.Errorf("list users: %w", err)
	}
	defer rows.Close()

	users := make([]dto.MyResponse, 0)
	for rows.Next() {
		var u dto.MyResponse
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role); err != nil {
			return nil, fmt.Errorf("scan user: %w", err)
		}
		users = append(users, u)
	}

	return users, rows.Err()
}
