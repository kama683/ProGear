package main

import (
	"fmt"
	"log"

	"rental/internal/config"
	"rental/internal/constants"
	"rental/internal/db"
	"rental/internal/extensions"
	"rental/internal/handler"
	"rental/internal/service"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// @title Rental API
// @version 1.0
// @description Equipment rental and sales API.
// @BasePath /api/v1
// @schemes http https
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	cfg, err := config.LoadConfig("")
	if err != nil {
		log.Fatal(err)
	}

	dbConn, err := db.OpenDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer dbConn.Close()

	if err := db.InitSchema(dbConn); err != nil {
		log.Fatal(err)
	}

	svc := service.NewServices(cfg, dbConn)
	service.StartScheduler(dbConn)
	h := handler.NewHandler(svc)

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowCredentials: false,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
	}))
	app.Static("/docs", "./docs")
	app.Get("/swagger", func(c *fiber.Ctx) error {
		return c.Type("html").SendString(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pixel Rental API - Swagger</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/docs/swagger.yaml",
        dom_id: "#swagger-ui"
      });
    };
  </script>
</body>
</html>`)
	})

	v1 := app.Group("/api/v1")
	{
		auth := v1.Group("/auth")
		auth.Post("/register", h.Auth.Register)
		auth.Post("/login", h.Auth.Login)

		users := v1.Group("/users", extensions.FiberAuthMiddleware(cfg))
		users.Get("/me", h.Users.Me)
		users.Put("/me", h.Users.UpdateMe)
		users.Get("", extensions.RequireRoles(constants.RoleAdmin), h.Users.List)

		equipment := v1.Group("/equipment")
		equipment.Get("", h.Equipment.List)
		equipment.Get("/:id", h.Equipment.Detail)
		equipment.Get("/:id/reviews", h.Reviews.List)
		equipment.Post("/:id/reviews", extensions.FiberAuthMiddleware(cfg), h.Reviews.Create)

		equipmentProtected := v1.Group("/equipment", extensions.FiberAuthMiddleware(cfg), extensions.RequireRoles(constants.RoleAdmin, constants.RoleManager))
		equipmentProtected.Post("", h.Equipment.Create)
		equipmentProtected.Put("/:id", h.Equipment.Update)

		rentals := v1.Group("/rentals")
		rentals.Get("/availability", h.Rentals.Availability)
		rentals.Post("/calculate", h.Rentals.Calculate)
		rentals.Post("/book", extensions.FiberAuthMiddleware(cfg), extensions.RequireRoles(constants.RoleCustomer), h.Rentals.Book)

		orders := v1.Group("/orders", extensions.FiberAuthMiddleware(cfg))
		orders.Post("", extensions.RequireRoles(constants.RoleCustomer), h.Orders.Create)
		orders.Get("", h.Orders.List)
		orders.Patch("/:id/status", extensions.RequireRoles(constants.RoleAdmin, constants.RoleManager), h.Orders.UpdateStatus)
		orders.Get("/:id/invoice", h.Orders.Invoice)

		cards := v1.Group("/cards", extensions.FiberAuthMiddleware(cfg))
		cards.Get("", h.Cards.List)
		cards.Post("", h.Cards.Add)
		cards.Delete("/:id", h.Cards.Delete)
		cards.Put("/:id/default", h.Cards.SetDefault)
	}

	log.Fatal(app.Listen(fmt.Sprintf(":%d", cfg.AppPort)))
}
