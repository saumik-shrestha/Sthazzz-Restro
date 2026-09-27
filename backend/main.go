package main

import (
	"context"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"nepalbhoj/backend/internal/config"
	"nepalbhoj/backend/internal/db"
	"nepalbhoj/backend/internal/routes"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()
	pool := db.Connect(context.Background(), cfg.DatabaseURL)
	defer pool.Close()
	r := gin.Default()
	r.Use(cors.New(cors.Config{AllowOrigins: []string{cfg.FrontendURL}, AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}, AllowHeaders: []string{"Origin", "Content-Type", "Authorization"}}))
	routes.Register(r, pool, cfg)
	log.Printf("Nepal Bhoj API listening on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
