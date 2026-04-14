package handler

import (
	"rental/internal/dto"
	"rental/internal/service"
	"time"

	"github.com/gofiber/fiber/v2"
)

type RentalHandler struct {
	rentals service.RentalService
}

func NewRentalHandler(svc *service.Services) *RentalHandler {
	return &RentalHandler{rentals: svc.Rentals}
}

// Availability godoc
// @Summary Check rental availability
// @Tags rentals
// @Produce json
// @Param equipmentId query int true "Equipment ID"
// @Param startAt query string true "Start datetime (RFC3339)"
// @Param endAt query string true "End datetime (RFC3339)"
// @Success 200 {object} dto.AvaialbilityResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /rentals/availability [get]
func (h *RentalHandler) Availability(c *fiber.Ctx) error {
	equipmentID := c.QueryInt("equipmentId")
	if equipmentID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "equipmentId is required"})
	}
	startAt, err := time.Parse(time.RFC3339, c.Query("endAt"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid startAt, use RFC3339"})
	}
	endAt, err := time.Parse(time.RFC3339, c.Query("endAt"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid endAt, use RFC3339"})
	}
	resp, err := h.rentals.CheckAvailability(uint(equipmentID), startAt, endAt)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(resp)
}

// Book godoc
// @Summary Book rental
// @Tags rentals
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.RentalBookRequest true "Book rental request"
// @Success 201 {object} dto.RentalBookResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /rentals/book [post]
func (h *RentalHandler) Book(c *fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	var req dto.RentalBookRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	resp, err := h.rentals.Book(uid, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(resp)
}

// Calculate godoc
// @Summary Calculate rental amount
// @Tags rentals
// @Accept json
// @Produce json
// @Param request body dto.RentalCalculateRequest true "Rental calculation request"
// @Success 200 {object} dto.RentalCalculateResponse
// @Failure 400 {object} map[string]string
// @Router /rentals/calculate [post]
func (h *RentalHandler) Calculate(c *fiber.Ctx) error {
	var req dto.RentalCalculateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	resp, err := h.rentals.Calculate(req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(resp)
}
