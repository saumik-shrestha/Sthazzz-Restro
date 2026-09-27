package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"nepalbhoj/backend/internal/config"
	"nepalbhoj/backend/internal/handlers"
)

func Register(r *gin.Engine, db *pgxpool.Pool, cfg config.Config) {
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })
	api := r.Group("/api/v1")
	mh := &handlers.MenuHandler{DB: db}
	oh := &handlers.OrderHandler{DB: db}
	ph := &handlers.PaymentHandler{DB: db, Cfg: cfg}
	api.GET("/menu", mh.List)
	api.GET("/categories", mh.Categories)
	api.POST("/orders", oh.Create)
	api.GET("/orders/:id", oh.Get)
	api.POST("/payment/khalti/initiate", ph.Initiate)
	api.GET("/payment/khalti/verify", ph.Verify)
	api.POST("/demo/pay", ph.DemoPay)
}
