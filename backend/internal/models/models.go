package models

import "time"

type Category struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
}
type MenuItem struct {
	ID           string   `json:"id"`
	CategoryID   string   `json:"category_id"`
	CategoryName string   `json:"category_name"`
	Name         string   `json:"name"`
	Slug         string   `json:"slug"`
	Description  string   `json:"description"`
	Price        int64    `json:"price"`
	ImageURL     string   `json:"image_url"`
	DietaryTags  []string `json:"dietary_tags"`
	SpicyLevel   int      `json:"spicy_level"`
	IsAvailable  bool     `json:"is_available"`
}
type OrderItemInput struct {
	MenuItemID string `json:"menu_item_id"`
	Quantity   int    `json:"quantity"`
}
type Customer struct {
	Name    string `json:"name"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
	City    string `json:"city"`
	Email   string `json:"email"`
}
type CreateOrderInput struct {
	Customer      Customer         `json:"customer"`
	Items         []OrderItemInput `json:"items"`
	PaymentMethod string           `json:"payment_method"`
}
type Order struct {
	ID          string    `json:"id"`
	Status      string    `json:"status"`
	Subtotal    int64     `json:"subtotal"`
	DeliveryFee int64     `json:"delivery_fee"`
	Total       int64     `json:"total"`
	CreatedAt   time.Time `json:"created_at"`
	Customer    Customer  `json:"customer"`
}
type KhaltiInitiateResponse struct {
	Pidx       string `json:"pidx"`
	PaymentURL string `json:"payment_url"`
	ExpiresAt  string `json:"expires_at"`
	ExpiresIn  int    `json:"expires_in"`
}
type PaymentLookupResponse struct {
	Pidx          string  `json:"pidx"`
	TotalAmount   int64   `json:"total_amount"`
	Status        string  `json:"status"`
	TransactionID *string `json:"transaction_id"`
	Fee           int64   `json:"fee"`
	Refunded      bool    `json:"refunded"`
}
