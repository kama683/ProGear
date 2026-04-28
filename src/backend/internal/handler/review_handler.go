package handler

import (
	"rental/internal/dto"
	"rental/internal/service"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type ReviewHandler struct {
	reviews service.ReviewService
}

func NewReviewHandler(svc *service.Services) *ReviewHandler {
	return &ReviewHandler{reviews: svc.Reviews}
}

// List godoc
// @Summary List equipment reviews
// @Tags reviews
// @Produce json
// @Param id path int true "Equipment ID"
// @Success 200 {object} dto.ReviewSummary
// @Router /equipment/{id}/reviews [get]
func (h *ReviewHandler) List(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid equipment id"})
	}
	summary, err := h.reviews.List(uint(id))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Internal server error"})
	}
	return c.JSON(summary)
}

// Create godoc
// @Summary Submit a review for equipment
// @Tags reviews
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Equipment ID"
// @Param request body dto.ReviewCreateRequest true "Review request"
// @Success 201 {object} dto.ReviewResponse
// @Router /equipment/{id}/reviews [post]
func (h *ReviewHandler) Create(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid equipment id"})
	}
	uid, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	var req dto.ReviewCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	rev, err := h.reviews.Create(uint(id), uid, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(rev)
}
