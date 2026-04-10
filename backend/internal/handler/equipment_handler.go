package handler

import (
	"rental/internal/dto"
	"rental/internal/service"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type EquipmentHandler struct {
	equipment service.EquipmentService
}

func NewEquipmentHandler(svc *service.Services) *EquipmentHandler {
	return &EquipmentHandler{equipment: svc.Equipment}
}

// List godoc
// @Summary List equipment
// @Tags equipment
// @Produce json
// @Param type query string false "Equipment type"
// @Param category query string false "Equipment category"
// @Success 200 {array} dto.EquipmentResponse
// @Failure 500 {object} map[string]string
// @Router /equipment [get]
func (h *EquipmentHandler) List(c *fiber.Ctx) error {
	resp, err := h.equipment.List(c.Query("type"), c.Query("category"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(resp)
}

// Detail godoc
// @Summary Get equipment by id
// @Tags equipment
// @Produce json
// @Param id path int true "Equipment ID"
// @Success 200 {object} dto.EquipmentDetailResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /equipment/{id} [get]
func (h *EquipmentHandler) Detail(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}
	resp, err := h.equipment.GetByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(resp)
}

// Create godoc
// @Summary Create equipment
// @Tags equipment
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.EquipmentCreateRequest true "Create equipment request"
// @Success 201 {object} dto.EquipmentResponse
// @Failure 400 {object} map[string]string
// @Router /equipment [post]
func (h *EquipmentHandler) Create(c *fiber.Ctx) error {
	var req dto.EquipmentCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if strings.TrimSpace(req.Name) == "" || strings.TrimSpace(req.Category) == "" || strings.TrimSpace(req.Type) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "name, category and type are required"})
	}
	resp, err := h.equipment.Create(req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(resp)
}

// Update godoc
// @Summary Update equipment
// @Tags equipment
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Equipment ID"
// @Param request body dto.EquipmentUpdateRequest true "Update equipment request"
// @Success 200 {object} dto.EquipmentResponse
// @Failure 400 {object} map[string]string
// @Router /equipment/{id} [put]
func (h *EquipmentHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}
	var req dto.EquipmentUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	resp, err := h.equipment.Update(uint(id), req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(resp)
}
