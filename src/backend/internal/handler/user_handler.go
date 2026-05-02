package handler

import (
	"rental/internal/dto"
	"rental/internal/service"

	"github.com/gofiber/fiber/v2"
)

type UsersHandler struct {
	users service.UserService
}

func NewUserHandler(svc *service.Services) *UsersHandler {
	return &UsersHandler{users: svc.Users}
}

func (h *UsersHandler) Me(c *fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	resp, err := h.users.GetMe(uid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Internal server error"})
	}
	return c.JSON(resp)
}

func (h *UsersHandler) UpdateMe(c *fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	var req dto.UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}
	resp, err := h.users.UpdateProfile(uid, req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(resp)
}

func (h *UsersHandler) List(c *fiber.Ctx) error {
	users, err := h.users.ListUsers()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Internal server error"})
	}
	return c.JSON(users)
}
