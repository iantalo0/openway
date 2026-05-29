package repository

import "time"

type SettlementStatus string

const (
	StatusPending    SettlementStatus = "PENDING"
	StatusProcessed  SettlementStatus = "PROCESSED"
	StatusFailed     SettlementStatus = "FAILED"
	StatusEscrow     SettlementStatus = "ESCROW"
)

type Settlement struct {
	ID                string    `json:"id"`
	TelcoReference    string    `json:"telco_reference"`
	IntentHash        []byte    `json:"intent_hash"`
	SenderPhone       string    `json:"sender_phone"`
	ReceiverPhone     string    `json:"receiver_phone"`
	Amount            float64   `json:"amount"`
	Currency          string    `json:"currency"`
	Status            string    `json:"status"`
	RawPayload        []byte    `json:"raw_payload"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
	MerchantID        string    `json:"merchant_id"`
	TxHash            string    `json:"tx_hash"`
	Type              string    `json:"type"`
	Direction         string    `json:"direction"`
	Counterparty      string    `json:"counterparty"`
	FromAddress       string    `json:"from_address"`
	ToAddress         string    `json:"to_address"`
	ReceiverCountry   string    `json:"receiver_country"`
	RecipientCurrency string    `json:"recipient_currency"`
	RecipientAmount   float64   `json:"recipient_amount"`
}

type Merchant struct {
	ID            string    `db:"id" json:"id"`
	UserID        string    `db:"user_id" json:"user_id"`
	WalletAddress string    `db:"wallet_address" json:"wallet_address"`
	BusinessName  string    `db:"business_name" json:"business_name"`
	ContactPhone  string    `db:"contact_phone" json:"-"`
	CountryCode   string    `db:"country_code" json:"country"`
	KYCStatus     string    `db:"kyc_status" json:"kyc_status"`
	CreatedAt     time.Time `db:"created_at" json:"created_at"`
}

// User — auth identity only. No business/country fields here; use Merchant for that.
type User struct {
	ID           string    `db:"id" json:"id"`
	Email        string    `db:"email" json:"email"`
	PasswordHash string    `db:"password_hash" json:"-"`
	Role         string    `db:"role" json:"role"`
	Wallet       string    `db:"wallet" json:"wallet"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

type Node struct {
	ID        string    `db:"id" json:"id"`
	Region    string    `db:"region" json:"region"`
	Status    string    `db:"status" json:"status"`
	LatencyMs int       `db:"latency_ms" json:"latency_ms"`
	Version   string    `db:"version" json:"version"`
	LastSeen  time.Time `db:"last_seen" json:"last_seen"`
}

type TopMerchant struct {
	BusinessName string  `db:"business_name" json:"business_name"`
	Volume24h    float64 `db:"volume_24h" json:"volume_24h"`
	TxCount      int     `db:"tx_count" json:"tx_count"`
	Status       string  `json:"status"`
}