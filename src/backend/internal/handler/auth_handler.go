package handler

import (
	"rental/internal/dto"
	"rental/internal/service"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	authSvc service.UserAuthService
}

func NewAuthHandler(svc *service.Services) *AuthHandler {
	return &AuthHandler{
		authSvc: svc.Auth,
	}
}

// Register godoc
// @Summary Register a user
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.ReqisterRequest true "Register request"
// @Success 201 {object} dto.RegisterResponse
// @Failure 400 {object} map[string]string
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req dto.ReqisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if strings.TrimSpace(req.Name) == "" ||
		strings.TrimSpace(req.Email) == "" ||
		strings.TrimSpace(req.Password) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "name, email and password are required"})
	}
	if req.Password != req.ConfirmPassword {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "passwords do not match"})
	}
	resp, err := h.authSvc.Register(req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(resp)
}

// Login godoc
// @Summary Login user
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "Login request"
// @Success 200 {object} dto.AuthResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req dto.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if strings.TrimSpace(req.Email) == "" || strings.TrimSpace(req.Password) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "email and password are required"})
	}
	resp, err := h.authSvc.Login(req)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(resp)
}
