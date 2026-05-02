package handler

import (
	"rental/internal/dto"
	"rental/internal/service"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type CardHandler struct {
	cards service.CardService
}

func NewCardHandler(svc *service.Services) *CardHandler {
	return &CardHandler{cards: svc.Cards}
}

func (h *CardHandler) List(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(uint)
	cards, err := h.cards.List(uid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Internal server error"})
	}
	return c.JSON(cards)
}

func (h *CardHandler) Add(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(uint)
	var req dto.AddCardRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request body"})
	}
	card, err := h.cards.Add(uid, req)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(card)
}

func (h *CardHandler) Delete(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid card id"})
	}
	if err := h.cards.Delete(uid, uint(id)); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(204)
}

func (h *CardHandler) SetDefault(c *fiber.Ctx) error {
	uid := c.Locals("user_id").(uint)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid card id"})
	}
	card, err := h.cards.SetDefault(uid, uint(id))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(card)
}
