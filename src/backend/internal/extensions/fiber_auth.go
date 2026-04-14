package extensions

import (
	"strconv"
	"strings"

	"rental/internal/config"
	"rental/internal/util"

	"github.com/gofiber/fiber/v2"
)

const fiberClaimsContextKey = "claims"

func FiberAuthMiddleware(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := strings.TrimSpace(c.Get("Authorization"))
		token := authHeader
		if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
			token = strings.TrimSpace(authHeader[7:])
		}
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "missing bearer token"})
		}

		claims, err := util.ParseGeneratedTokens(token, cfg)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid access token"})
		}

		uid, err := strconv.ParseUint(claims.Sub, 10, 64)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid user id in token"})
		}
		c.Locals(fiberClaimsContextKey, claims)
		c.Locals("user_id", uint(uid))
		c.Locals("user_role", claims.Role)
		return c.Next()
	}
}
func RequireRoles(roles ...string) fiber.Handler {
	allowed := make(map[string]struct{}, len(roles))
	for _, r := range roles {
		allowed[strings.ToLower(strings.TrimSpace(r))] = struct{}{}
	}
	return func(c *fiber.Ctx) error {
		role, _ := c.Locals("user_role").(string)
		if _, ok := allowed[strings.ToLower(strings.TrimSpace(role))]; !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		return c.Next()
	}
}
