package repository

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrDuplicateReference = errors.New("duplicate telco reference")

type SettlementRepository struct {
	pool *pgxpool.Pool
}

func NewSettlementRepository(pool *pgxpool.Pool) *SettlementRepository {
	return &SettlementRepository{pool: pool}
}

func (r *SettlementRepository) Create(ctx context.Context, s *Settlement) error {
	query := `
		INSERT INTO settlements (
			telco_reference, sender_phone, receiver_phone, amount, currency, 
			status, raw_payload, merchant_id, type, direction, counterparty
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at, updated_at`

	err := r.pool.QueryRow(ctx, query,
		s.TelcoReference, s.SenderPhone, s.ReceiverPhone, s.Amount, s.Currency,
		s.Status, s.RawPayload, s.MerchantID, s.Type, s.Direction, s.Counterparty,
	).Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ErrDuplicateReference
		}
		return err
	}
	return nil
}

func (r *SettlementRepository) UpdateStatus(ctx context.Context, id string, status SettlementStatus, intentHash []byte) error {
	query := `UPDATE settlements SET status = $1, intent_hash = $2, updated_at = NOW() WHERE id = $3`
	_, err := r.pool.Exec(ctx, query, status, intentHash, id)
	return err
}

func (r *SettlementRepository) UpdateTxHash(ctx context.Context, id string, txHash string) error {
	query := `UPDATE settlements SET tx_hash = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.pool.Exec(ctx, query, txHash, id)
	return err
}

func (r *SettlementRepository) List(ctx context.Context, limit, offset int) ([]Settlement, error) {
	query := `
		SELECT id, telco_reference, tx_hash, sender_phone, receiver_phone, amount, currency, 
		       status, merchant_id, type, direction, counterparty, from_address, to_address,
		       created_at, updated_at
		FROM settlements
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2`

	rows, err := r.pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var settlements []Settlement
	for rows.Next() {
		var s Settlement
		err := rows.Scan(
			&s.ID, &s.TelcoReference, &s.TxHash, &s.SenderPhone, &s.ReceiverPhone,
			&s.Amount, &s.Currency, &s.Status, &s.MerchantID, &s.Type, &s.Direction,
			&s.Counterparty, &s.FromAddress, &s.ToAddress, &s.CreatedAt, &s.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		settlements = append(settlements, s)
	}
	return settlements, nil
}

// GetVolume24h returns total processed volume in last 24 hours
func (r *SettlementRepository) GetVolume24h(ctx context.Context) (float64, error) {
	var volume float64
	err := r.pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0) 
		FROM settlements 
		WHERE status = 'PROCESSED' AND created_at > NOW() - INTERVAL '24 hours'
	`).Scan(&volume)
	return volume, err
}

// GetActiveEscrowCount returns pending settlements
func (r *SettlementRepository) GetActiveEscrowCount(ctx context.Context) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM settlements WHERE status = 'PENDING'
	`).Scan(&count)
	return count, err
}

// GetSettlementSuccessRate returns % of processed vs total in last 24h
func (r *SettlementRepository) GetSettlementSuccessRate(ctx context.Context) (float64, error) {
	var rate float64
	err := r.pool.QueryRow(ctx, `
		SELECT COALESCE(
			(COUNT(*) FILTER (WHERE status = 'PROCESSED') * 100.0 / NULLIF(COUNT(*), 0)), 
			0
		) FROM settlements 
		WHERE created_at > NOW() - INTERVAL '24 hours'
	`).Scan(&rate)
	return rate, err
}

// GetRecent returns latest settlements for admin dashboard
func (r *SettlementRepository) GetRecent(ctx context.Context, limit int) ([]Settlement, error) {
	query := `
		SELECT id, tx_hash, type, status, amount, currency, created_at, 
		       from_address, to_address, counterparty, direction
		FROM settlements 
		ORDER BY created_at DESC 
		LIMIT $1`

	rows, err := r.pool.Query(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []Settlement
	for rows.Next() {
		var s Settlement
		if err := rows.Scan(
			&s.ID, &s.TxHash, &s.Type, &s.Status, &s.Amount, &s.Currency,
			&s.CreatedAt, &s.FromAddress, &s.ToAddress, &s.Counterparty, &s.Direction,
		); err != nil {
			continue
		}
		results = append(results, s)
	}
	return results, nil
}

// GetByMerchantWallet returns settlements scoped to a merchant's wallet
func (r *SettlementRepository) GetByMerchantWallet(ctx context.Context, wallet string, limit int) ([]Settlement, error) {
	query := `
		SELECT s.id, s.type, s.amount, s.currency, s.status, s.created_at, 
		       s.counterparty, s.direction
		FROM settlements s
		JOIN merchants m ON s.merchant_id = m.id
		WHERE m.wallet_address = $1
		ORDER BY s.created_at DESC
		LIMIT $2`

	rows, err := r.pool.Query(ctx, query, wallet, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []Settlement
	for rows.Next() {
		var s Settlement
		if err := rows.Scan(
			&s.ID, &s.Type, &s.Amount, &s.Currency, &s.Status,
			&s.CreatedAt, &s.Counterparty, &s.Direction,
		); err != nil {
			continue
		}
		results = append(results, s)
	}
	return results, nil
}

// GetMerchantBalance returns (available, pending) for a merchant wallet
func (r *SettlementRepository) GetMerchantBalance(ctx context.Context, wallet string) (available, pending float64, err error) {
	err = r.pool.QueryRow(ctx, `
		SELECT 
			COALESCE(SUM(s.amount) FILTER (WHERE s.status = 'PROCESSED' AND s.direction = 'in'), 0) -
			COALESCE(SUM(s.amount) FILTER (WHERE s.status = 'PROCESSED' AND s.direction = 'out'), 0),
			COALESCE(SUM(s.amount) FILTER (WHERE s.status = 'PENDING'), 0)
		FROM settlements s
		JOIN merchants m ON s.merchant_id = m.id
		WHERE m.wallet_address = $1
	`, wallet).Scan(&available, &pending)
	return
}

// GetTodayVolume sums inbound processed volume since midnight UTC
func (r *SettlementRepository) GetTodayVolume(ctx context.Context, wallet string) (float64, error) {
	var vol float64
	err := r.pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(amount), 0)
		FROM settlements s
		JOIN merchants m ON s.merchant_id = m.id
		WHERE m.wallet_address = $1
		  AND s.direction = 'in'
		  AND s.status = 'PROCESSED'
		  AND s.created_at > DATE_TRUNC('day', NOW())
	`, wallet).Scan(&vol)
	return vol, err
}

func (r *SettlementRepository) GetByID(ctx context.Context, id string) (*Settlement, error) {
	var s Settlement
	err := r.pool.QueryRow(ctx, `
		SELECT id, telco_reference, sender_phone, receiver_phone, amount, currency, 
		       status, created_at, updated_at, merchant_id, tx_hash, type, direction, 
		       counterparty, from_address, to_address, receiver_country, recipient_currency
		FROM settlements WHERE id = $1
	`, id).Scan(
		&s.ID, &s.TelcoReference, &s.SenderPhone, &s.ReceiverPhone, &s.Amount, &s.Currency,
		&s.Status, &s.CreatedAt, &s.UpdatedAt, &s.MerchantID, &s.TxHash, &s.Type,
		&s.Direction, &s.Counterparty, &s.FromAddress, &s.ToAddress, &s.ReceiverCountry, &s.RecipientCurrency,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *SettlementRepository) GetMerchantByWallet(ctx context.Context, wallet string) (*Merchant, error) {
	var m Merchant
	err := r.pool.QueryRow(ctx, `
		SELECT id, wallet_address, business_name, contact_phone, kyc_status 
		FROM merchants WHERE wallet_address = $1
	`, wallet).Scan(&m.ID, &m.WalletAddress, &m.BusinessName, &m.ContactPhone, &m.KYCStatus)
	if err != nil {
		return nil, err
	}
	return &m, nil
}
