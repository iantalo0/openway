package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type MerchantRepository struct {
	pool *pgxpool.Pool
}

func NewMerchantRepository(pool *pgxpool.Pool) *MerchantRepository {
	return &MerchantRepository{pool: pool}
}

func (r *MerchantRepository) Create(ctx context.Context, m *Merchant) error {
	return r.pool.QueryRow(ctx, `
		INSERT INTO merchants (user_id, wallet_address, business_name, contact_phone, country_code, kyc_status)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at`,
		m.UserID, m.WalletAddress, m.BusinessName, m.ContactPhone, m.CountryCode, m.KYCStatus,
	).Scan(&m.ID, &m.CreatedAt)
}

func (r *MerchantRepository) GetByWallet(ctx context.Context, wallet string) (*Merchant, error) {
	var m Merchant
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, wallet_address, business_name, contact_phone, country_code, kyc_status, created_at 
		FROM merchants WHERE wallet_address = $1`, wallet).Scan(
		&m.ID, &m.UserID, &m.WalletAddress, &m.BusinessName, &m.ContactPhone, &m.CountryCode, &m.KYCStatus, &m.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *MerchantRepository) GetByID(ctx context.Context, id string) (*Merchant, error) {
	var m Merchant
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, wallet_address, business_name, contact_phone, country_code, kyc_status, created_at 
		FROM merchants WHERE id = $1`, id).Scan(
		&m.ID, &m.UserID, &m.WalletAddress, &m.BusinessName, &m.ContactPhone, &m.CountryCode, &m.KYCStatus, &m.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

// GetTopByVolume returns merchants ranked by processed settlement volume
func (r *MerchantRepository) GetTopByVolume(ctx context.Context, limit int, sinceHours int) ([]TopMerchant, error) {
	query := `
		SELECT m.business_name, COALESCE(SUM(s.amount), 0) as volume_24h, COUNT(s.id) as tx_count
		FROM merchants m
		LEFT JOIN settlements s ON m.id = s.merchant_id 
			AND s.status = 'PROCESSED' 
			AND s.created_at > NOW() - INTERVAL '1 hour' * $2
		GROUP BY m.id, m.business_name
		ORDER BY volume_24h DESC
		LIMIT $1`

	rows, err := r.pool.Query(ctx, query, limit, sinceHours)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []TopMerchant
	for rows.Next() {
		var t TopMerchant
		if err := rows.Scan(&t.BusinessName, &t.Volume24h, &t.TxCount); err != nil {
			continue
		}
		t.Status = "active"
		if t.TxCount == 0 {
			t.Status = "inactive"
		}
		results = append(results, t)
	}
	return results, nil
}

// List returns all merchants
func (r *MerchantRepository) List(ctx context.Context) ([]Merchant, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, wallet_address, business_name, contact_phone, country_code, kyc_status, created_at 
		FROM merchants ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []Merchant
	for rows.Next() {
		var m Merchant
		if err := rows.Scan(
			&m.ID, &m.UserID, &m.WalletAddress, &m.BusinessName,
			&m.ContactPhone, &m.CountryCode, &m.KYCStatus, &m.CreatedAt,
		); err != nil {
			continue
		}
		results = append(results, m)
	}
	return results, nil
}

// UpdateKYCStatus updates merchant verification state
func (r *MerchantRepository) UpdateKYCStatus(ctx context.Context, id string, status string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE merchants SET kyc_status = $1 WHERE id = $2
	`, status, id)
	return err
}