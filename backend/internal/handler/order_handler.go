package handler

import (
	"github.com/gofiber/fiber/v2"
	"rental/internal/dto"
	"rental/internal/service"
	"strconv"
)

type OrderHandler struct {
	orders service.OrderService
}

func NewOrderHandler(svc *service.Services) *OrderHandler {
	return &OrderHandler{orders: svc.Orders}
}

// Create godoc
// @Summary Create order
// @Tags orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.OrderCreateRequest true "Create order request"
// @Success 201 {object} dto.OrderResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /orders [post]
func (h *OrderHandler) Create(c *fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	var req dto.OrderCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	resp, err := h.orders.Create(uid, req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(fiber.StatusCreated).JSON(resp)
}

// List godoc
// @Summary List orders
// @Tags orders
// @Produce json
// @Security BearerAuth
// @Success 200 {array} dto.OrderResponse
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /orders [get]
func (h *OrderHandler) List(c *fiber.Ctx) error {
	uid, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	role, _ := c.Locals("user_role").(string)
	resp, err := h.orders.List(uid, role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(resp)
}

// UpdateStatus godoc
// @Summary Update order status
// @Tags orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Order ID"
// @Param request body dto.OrderStatusUpdateRequest true "Order status update request"
// @Success 200 {object} dto.OrderResponse
// @Failure 400 {object} map[string]string
// @Router /orders/{id}/status [patch]
func (h *OrderHandler) UpdateStatus(c *fiber.Ctx) error {
	orderID, err := strconv.Atoi(c.Params("id"))
	if err != nil || orderID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid order id"})
	}
	var req dto.OrderStatusUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	resp, err := h.orders.UpdateStatus(uint(orderID), req.Status)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(resp)
}

// Invoice godoc
// @Summary Get order invoice
// @Tags orders
// @Produce json
// @Security BearerAuth
// @Param id path int true "Order ID"
// @Success 200 {object} dto.InvoiceResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Router /orders/{id}/invoice [get]
func (h *OrderHandler) Invoice(c *fiber.Ctx) error {
	orderID, err := strconv.Atoi(c.Params("id"))
	if err != nil || orderID <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid order id"})
	}
	uid, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	role, _ := c.Locals("user_role").(string)
	resp, err := h.orders.GetInvoice(uint(orderID), uid, role)
	if err != nil {
		status := fiber.StatusBadRequest
		if err.Error() == "forbidden" {
			status = fiber.StatusForbidden
		}
		return c.Status(status).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(resp)
}
