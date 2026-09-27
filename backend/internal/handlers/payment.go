package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"nepalbhoj/backend/internal/config"
	"nepalbhoj/backend/internal/models"
)

type PaymentHandler struct {
	DB  *pgxpool.Pool
	Cfg config.Config
}

type initiatePayload struct {
	ReturnURL         string            `json:"return_url"`
	WebsiteURL        string            `json:"website_url"`
	Amount            int64             `json:"amount"`
	PurchaseOrderID   string            `json:"purchase_order_id"`
	PurchaseOrderName string            `json:"purchase_order_name"`
	CustomerInfo      map[string]string `json:"customer_info"`
}

func (h *PaymentHandler) Initiate(c *gin.Context) {
	var body struct {
		OrderID string `json:"order_id"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.OrderID == "" {
		c.JSON(400, gin.H{"error": "order_id is required"})
		return
	}
	var total int64
	var status string
	var name, phone, email string
	err := h.DB.QueryRow(c, `SELECT total,status,customer_name,customer_phone,customer_email FROM orders WHERE id=$1`, body.OrderID).Scan(&total, &status, &name, &phone, &email)
	if err != nil {
		c.JSON(404, gin.H{"error": "order not found"})
		return
	}
	if status != "pending" {
		c.JSON(400, gin.H{"error": "order is not payable"})
		return
	}
	if h.Cfg.KhaltiSecretKey == "" {
		c.JSON(503, gin.H{"error": "KHALTI_SECRET_KEY is not configured. Use DEMO mode or add a sandbox key in .env"})
		return
	}
	payload := initiatePayload{ReturnURL: fmt.Sprintf("%s/payment/success", strings.TrimRight(h.Cfg.FrontendURL, "/")), WebsiteURL: h.Cfg.WebsiteURL, Amount: total * 100, PurchaseOrderID: body.OrderID, PurchaseOrderName: "Nepal Bhoj Order", CustomerInfo: map[string]string{"name": name, "email": email, "phone": phone}}
	raw, _ := json.Marshal(payload)
	req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, strings.TrimRight(h.Cfg.KhaltiBaseURL, "/")+"/epayment/initiate/", bytes.NewReader(raw))
	req.Header.Set("Authorization", "Key "+h.Cfg.KhaltiSecretKey)
	req.Header.Set("Content-Type", "application/json")
	client := http.Client{Timeout: 20 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		c.JSON(502, gin.H{"error": "Khalti request failed"})
		return
	}
	defer res.Body.Close()
	data, _ := io.ReadAll(res.Body)
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		c.JSON(502, gin.H{"error": "Khalti initiation failed", "details": string(data)})
		return
	}
	var kr models.KhaltiInitiateResponse
	if err := json.Unmarshal(data, &kr); err != nil || kr.Pidx == "" {
		c.JSON(502, gin.H{"error": "invalid Khalti response"})
		return
	}
	_, _ = h.DB.Exec(c, `UPDATE orders SET khalti_pidx=$1,updated_at=now() WHERE id=$2`, kr.Pidx, body.OrderID)
	_, _ = h.DB.Exec(c, `INSERT INTO payments(order_id,pidx,status,amount,payment_gateway) VALUES($1,$2,'initiated',$3,'khalti') ON CONFLICT (order_id) DO UPDATE SET pidx=EXCLUDED.pidx,status='initiated',amount=EXCLUDED.amount,updated_at=now()`, body.OrderID, kr.Pidx, total)
	c.JSON(200, gin.H{"data": kr})
}

func (h *PaymentHandler) Verify(c *gin.Context) {
	pidx := strings.TrimSpace(c.Query("pidx"))
	if pidx == "" {
		c.JSON(400, gin.H{"error": "pidx is required"})
		return
	}
	var orderID string
	var expected int64
	err := h.DB.QueryRow(c, `SELECT order_id::text,total FROM payments WHERE pidx=$1`, pidx).Scan(&orderID, &expected)
	if err != nil {
		c.JSON(404, gin.H{"error": "payment reference not found"})
		return
	}
	if h.Cfg.KhaltiSecretKey == "" {
		c.JSON(503, gin.H{"error": "KHALTI_SECRET_KEY is not configured"})
		return
	}
	raw, _ := json.Marshal(map[string]string{"pidx": pidx})
	req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, strings.TrimRight(h.Cfg.KhaltiBaseURL, "/")+"/epayment/lookup/", bytes.NewReader(raw))
	req.Header.Set("Authorization", "Key "+h.Cfg.KhaltiSecretKey)
	req.Header.Set("Content-Type", "application/json")
	client := http.Client{Timeout: 20 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		c.JSON(502, gin.H{"error": "Khalti lookup failed"})
		return
	}
	defer res.Body.Close()
	data, _ := io.ReadAll(res.Body)
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		c.JSON(502, gin.H{"error": "Khalti lookup failed", "details": string(data)})
		return
	}
	var lr models.PaymentLookupResponse
	if err := json.Unmarshal(data, &lr); err != nil {
		c.JSON(502, gin.H{"error": "invalid Khalti response"})
		return
	}
	status := strings.ToLower(lr.Status)
	internal := "pending"
	paymentStatus := "pending"
	switch status {
	case "completed":
		if lr.TotalAmount != expected*100 {
			internal = "failed"
			paymentStatus = "failed"
		} else {
			internal = "paid"
			paymentStatus = "completed"
		}
	case "expired", "canceled", "refunded":
		internal = "failed"
		paymentStatus = status
	case "initiated", "pending":
		internal = "pending"
		paymentStatus = status
	default:
		internal = "pending"
		paymentStatus = status
	}
	_, _ = h.DB.Exec(c, `UPDATE orders SET status=$1,updated_at=now() WHERE id=$2`, internal, orderID)
	_, _ = h.DB.Exec(c, `UPDATE payments SET status=$1,transaction_id=$2,raw_response=$3,verified_at=now(),updated_at=now() WHERE pidx=$4`, paymentStatus, lr.TransactionID, string(data), pidx)
	c.JSON(200, gin.H{"data": gin.H{"order_id": orderID, "order_status": internal, "payment": lr}})
}

// DemoPay is intentionally local-only and does not contact Khalti. It lets the full UX be demonstrated without a gateway credential.
func (h *PaymentHandler) DemoPay(c *gin.Context) {
	var body struct {
		OrderID string `json:"order_id"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.OrderID == "" {
		c.JSON(400, gin.H{"error": "order_id is required"})
		return
	}
	_, err := h.DB.Exec(c, `UPDATE orders SET status='paid',updated_at=now() WHERE id=$1 AND status='pending'`, body.OrderID)
	if err != nil {
		c.JSON(500, gin.H{"error": "demo payment failed"})
		return
	}
	c.JSON(200, gin.H{"data": gin.H{"order_id": body.OrderID, "status": "paid", "demo": true}})
}
