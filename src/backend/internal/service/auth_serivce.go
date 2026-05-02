package service

import (
	"database/sql"
	"errors"
	"fmt"
	"rental/internal/config"
	"rental/internal/constants"
	"rental/internal/dto"
	"rental/internal/util"
	"strings"
)

type UserAuthService interface {
	Login(req dto.LoginRequest) (dto.AuthResponse, error)
	Register(req dto.ReqisterRequest) (dto.RegisterResponse, error)
}

type userAuthServices struct {
	cfg *config.Config
	db  *sql.DB
}

func NewAuthService(cfg *config.Config, db *sql.DB) UserAuthService {
	return &userAuthServices{cfg: cfg, db: db}
}
func (s *userAuthServices) Register(req dto.ReqisterRequest) (dto.RegisterResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	role := constants.RoleCustomer
	name := strings.TrimSpace(req.Name)

	if req.Password != req.ConfirmPassword {
		return dto.RegisterResponse{}, errors.New("passwords do not match")
	}

	hashedPassword, err := util.HashPassword(req.Password)
	if err != nil {
		return dto.RegisterResponse{}, fmt.Errorf("password hash: %w", err)
	}

	var id uint

	err = s.db.QueryRow(`
		INSERT INTO users(name, email, password_hash, role, is_active)
		VALUES ($1, $2, $3, $4, TRUE)
		RETURNING id
	`, name, email, hashedPassword, role).Scan(&id)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			return dto.RegisterResponse{}, errors.New("email is registered")
		}
		return dto.RegisterResponse{}, fmt.Errorf("create user: %w", err)
	}

	return dto.RegisterResponse{User: dto.UserResponse{ID: id, Name: name, Email: email, Role: role}}, nil
}

func (s *userAuthServices) Login(req dto.LoginRequest) (dto.AuthResponse, error) {
	var (
		id             uint
		name           string
		email          string
		hashedPassword string
		role           string
		isActive       bool
		phone          string
		address        string
	)

	err := s.db.QueryRow(`
		SELECT id, name, email, password_hash, role, is_active, phone, address
		FROM users
		WHERE email = $1
	`, strings.ToLower(strings.TrimSpace(req.Email))).Scan(&id, &name, &email, &hashedPassword, &role, &isActive, &phone, &address)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return dto.AuthResponse{}, errors.New("username or password is incorrect")
		}
		return dto.AuthResponse{}, fmt.Errorf("finding user: %w", err)
	}
	if !isActive {
		return dto.AuthResponse{}, errors.New("user is not online")
	}
	if !util.ComparePassword(hashedPassword, req.Password) {
		return dto.AuthResponse{}, errors.New("credentials are invalid")
	}

	access, err := util.GenerateAccessToken(s.cfg, id, email, role)
	if err != nil {
		return dto.AuthResponse{}, fmt.Errorf("error while generating access token: %w", err)
	}
	refresh, err := util.GenerateRefreshToken(s.cfg, id, email, role)
	if err != nil {
		return dto.AuthResponse{}, fmt.Errorf("error while generating refresh token: %w", err)
	}

	_, _ = s.db.Exec("UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1", id)

	return dto.AuthResponse{
		AccessToken:  access,
		RefreshToken: refresh,
		User: dto.UserResponse{
			ID:      id,
			Name:    name,
			Email:   email,
			Role:    role,
			Phone:   phone,
			Address: address,
		},
	}, nil
}
