package config

import (
	"os"
)

type Config struct {
	Port            string
	DatabaseURL     string
	KhaltiSecretKey string
	KhaltiBaseURL   string
	FrontendURL     string
	WebsiteURL      string
}

func Load() Config {
	return Config{
		Port:            get("PORT", "8080"),
		DatabaseURL:     get("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/nepal_bhoj?sslmode=disable"),
		KhaltiSecretKey: os.Getenv("KHALTI_SECRET_KEY"),
		KhaltiBaseURL:   get("KHALTI_BASE_URL", "https://dev.khalti.com/api/v2"),
		FrontendURL:     get("FRONTEND_URL", "http://localhost:5173"),
		WebsiteURL:      get("WEBSITE_URL", "http://localhost:5173"),
	}
}

func get(k, fallback string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return fallback
}
