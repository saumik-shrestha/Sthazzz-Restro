# Nepal Bhoj 🇳🇵

A production-structured Nepali restaurant ordering app built with React + TypeScript + Tailwind + Framer Motion and Go + Gin + PostgreSQL. It includes catalog filtering, persistent cart, checkout, order creation, and Khalti Web Checkout v2 integration.

## Run with Docker (recommended)

1. Copy `.env.example` to `.env` and put your Khalti sandbox `live_secret_key` in `KHALTI_SECRET_KEY` when testing real sandbox checkout. Khalti's current Web Checkout docs use `https://dev.khalti.com/api/v2/` for sandbox and `Authorization: Key <SECRET_KEY>`. The initiation endpoint returns `pidx` and `payment_url`; verification is done with `/epayment/lookup/`. 
2. Run: `docker compose up --build`
3. Open `http://localhost:5173`
4. API health: `http://localhost:8080/health`

## Manual run

### PostgreSQL
Create a database named `nepal_bhoj`, then run `db/schema.sql`.

### Backend
```bash
cd backend
go mod tidy
go run main.go
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Khalti sandbox
The frontend creates an order through the Go backend, asks the backend to initiate Khalti, then redirects the browser to the `payment_url`. Khalti redirects back to `/payment/success?pidx=...&purchase_order_id=...`; the frontend then calls the backend verification endpoint, which performs the server-side lookup and updates the order. Never put the Khalti secret key in the frontend.

A demo payment path is also included in the UI for local development when a Khalti key is not available. It marks an order as paid locally without contacting Khalti; this is intentionally separate from the real sandbox integration.
