package handlers

import (
	"nepalbhoj/backend/internal/models"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OrderHandler struct{ DB *pgxpool.Pool }

var phoneRE = regexp.MustCompile(`^9[678]\d{8}$`)

func (h *OrderHandler) Create(c *gin.Context) {
	var in models.CreateOrderInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(400, gin.H{"error": "invalid request body"})
		return
	}
	in.Customer.Name = strings.TrimSpace(in.Customer.Name)
	in.Customer.Address = strings.TrimSpace(in.Customer.Address)
	in.Customer.City = strings.TrimSpace(in.Customer.City)
	in.Customer.Phone = strings.TrimSpace(in.Customer.Phone)
	if in.Customer.Name == "" || in.Customer.Address == "" || (in.Customer.City != "Kathmandu" && in.Customer.City != "Pokhara") || !phoneRE.MatchString(in.Customer.Phone) || len(in.Items) == 0 {
		c.JSON(400, gin.H{"error": "provide a name, Kathmandu/Pokhara address, valid Nepal mobile number, and at least one item"})
		return
	}
	tx, err := h.DB.BeginTx(c, pgx.TxOptions{})
	if err != nil {
		c.JSON(500, gin.H{"error": "could not start order"})
		return
	}
	defer tx.Rollback(c)
	orderID := uuid.New()
	var subtotal int64
	type checked struct {
		id    uuid.UUID
		qty   int
		price int64
		name  string
	}
	checkedItems := make([]checked, 0, len(in.Items))
	for _, it := range in.Items {
		if it.Quantity < 1 || it.Quantity > 20 {
			c.JSON(400, gin.H{"error": "invalid quantity"})
			return
		}
		var id uuid.UUID
		var price int64
		var name string
		var available bool
		err = tx.QueryRow(c, `SELECT id,price,name,is_available FROM menu_items WHERE id=$1`, it.MenuItemID).Scan(&id, &price, &name, &available)
		if err != nil || !available {
			c.JSON(400, gin.H{"error": "menu item unavailable"})
			return
		}
		subtotal += price * int64(it.Quantity)
		checkedItems = append(checkedItems, checked{id, it.Quantity, price, name})
	}
	deliveryFee := int64(120)
	if subtotal >= 2000 {
		deliveryFee = 0
	}
	total := subtotal + deliveryFee
	_, err = tx.Exec(c, `INSERT INTO orders(id,status,customer_name,customer_phone,customer_address,customer_city,customer_email,payment_method,subtotal,delivery_fee,total) VALUES($1,'pending',$2,$3,$4,$5,$6,$7,$8,$9,$10)`, orderID, in.Customer.Name, in.Customer.Phone, in.Customer.Address, in.Customer.City, in.Customer.Email, in.PaymentMethod, subtotal, deliveryFee, total)
	if err != nil {
		c.JSON(500, gin.H{"error": "could not create order"})
		return
	}
	for _, it := range checkedItems {
		_, err = tx.Exec(c, `INSERT INTO order_items(order_id,menu_item_id,item_name,unit_price,quantity,line_total) VALUES($1,$2,$3,$4,$5,$6)`, orderID, it.id, it.name, it.price, it.qty, it.price*int64(it.qty))
		if err != nil {
			c.JSON(500, gin.H{"error": "could not add order items"})
			return
		}
	}
	if err = tx.Commit(c); err != nil {
		c.JSON(500, gin.H{"error": "could not save order"})
		return
	}
	c.JSON(201, gin.H{"data": models.Order{ID: orderID.String(), Status: "pending", Subtotal: subtotal, DeliveryFee: deliveryFee, Total: total, Customer: in.Customer}})
}

func (h *OrderHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "invalid order id"})
		return
	}
	var o models.Order
	err = h.DB.QueryRow(c, `SELECT id::text,status,subtotal,delivery_fee,total,created_at,customer_name,customer_phone,customer_address,customer_city,customer_email FROM orders WHERE id=$1`, id).Scan(&o.ID, &o.Status, &o.Subtotal, &o.DeliveryFee, &o.Total, &o.CreatedAt, &o.Customer.Name, &o.Customer.Phone, &o.Customer.Address, &o.Customer.City, &o.Customer.Email)
	if err == pgx.ErrNoRows {
		c.JSON(404, gin.H{"error": "order not found"})
		return
	}
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to load order"})
		return
	}
	c.JSON(200, gin.H{"data": o})
}
