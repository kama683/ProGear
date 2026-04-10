package handler

import (
	"rental/internal/service"

	"github.com/gofiber/fiber/v2"
)

type UsersHandler struct {
	users service.UserService
}

func NewUserHandler(svc *service.Services) *UsersHandler {
	return &UsersHandler{users: svc.Users}
}

// Me godoc
// @Summary Get current user
// @Tags users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} dto.MyResponse
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /users/me [get]
func (h *UsersHandler) Me(c *fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	resp, err := h.users.GetMe(uid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(resp)
}

// List godoc
// @Summary List users
// @Tags users
// @Produce json
// @Security BearerAuth
// @Success 200 {array} dto.MyResponse
// @Failure 500 {object} map[string]string
// @Router /users [get]
func (h *UsersHandler) List(c *fiber.Ctx) error {
	users, err := h.users.ListUsers()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(users)
}
