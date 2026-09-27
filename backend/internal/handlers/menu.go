package handlers

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"nepalbhoj/backend/internal/models"
)

type MenuHandler struct{ DB *pgxpool.Pool }

func (h *MenuHandler) List(c *gin.Context) {
	category := strings.TrimSpace(c.Query("category"))
	q := `SELECT m.id::text,m.category_id::text,c.name,m.name,m.slug,m.description,m.price,m.image_url,m.dietary_tags,m.spicy_level,m.is_available
          FROM menu_items m JOIN categories c ON c.id=m.category_id WHERE m.is_available=true`
	args := []any{}
	if category != "" {
		q += ` AND c.slug=$1`
		args = append(args, category)
	}
	q += ` ORDER BY c.sort_order,m.name`
	rows, err := h.DB.Query(context.Background(), q, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load menu"})
		return
	}
	defer rows.Close()
	out := []models.MenuItem{}
	for rows.Next() {
		var m models.MenuItem
		if err := rows.Scan(&m.ID, &m.CategoryID, &m.CategoryName, &m.Name, &m.Slug, &m.Description, &m.Price, &m.ImageURL, &m.DietaryTags, &m.SpicyLevel, &m.IsAvailable); err != nil {
			c.JSON(500, gin.H{"error": "failed to read menu"})
			return
		}
		out = append(out, m)
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

func (h *MenuHandler) Categories(c *gin.Context) {
	rows, err := h.DB.Query(context.Background(), `SELECT id::text,name,slug,description FROM categories ORDER BY sort_order`)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to load categories"})
		return
	}
	defer rows.Close()
	out := []models.Category{}
	for rows.Next() {
		var x models.Category
		if err := rows.Scan(&x.ID, &x.Name, &x.Slug, &x.Description); err != nil {
			c.JSON(500, gin.H{"error": "failed to read categories"})
			return
		}
		out = append(out, x)
	}
	c.JSON(200, gin.H{"data": out})
}
