package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

func (r *UserRepository) Create(ctx context.Context, u *User) error {
	return r.pool.QueryRow(ctx, `
		INSERT INTO users (email, password_hash, role, wallet)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at`,
		u.Email, u.PasswordHash, u.Role, u.Wallet,
	).Scan(&u.ID, &u.CreatedAt)
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*User, error) {
	var u User
	err := r.pool.QueryRow(ctx, `
		SELECT id, email, password_hash, role, wallet, created_at 
		FROM users WHERE email = $1`, email).Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.Role, &u.Wallet, &u.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) GetByWallet(ctx context.Context, wallet string) (*User, error) {
	var u User
	err := r.pool.QueryRow(ctx, `
		SELECT id, email, password_hash, role, wallet, created_at 
		FROM users WHERE wallet = $1`, wallet).Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.Role, &u.Wallet, &u.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*User, error) {
	var u User
	err := r.pool.QueryRow(ctx, `
		SELECT id, email, password_hash, role, wallet, created_at 
		FROM users WHERE id = $1`, id).Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.Role, &u.Wallet, &u.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}
