CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users & Auth
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    wallet_address VARCHAR(42) UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'MERCHANT')),
    business_name VARCHAR(255),
    country_code VARCHAR(3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Merchants
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    country_code VARCHAR(3),
    kyc_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settlements
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES merchants(id),
    telco_reference VARCHAR(255) UNIQUE NOT NULL,
    intent_hash BYTEA,
    sender_phone VARCHAR(50) NOT NULL,
    receiver_phone VARCHAR(50) NOT NULL,
    amount NUMERIC(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    raw_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settlements_telco_ref ON settlements(telco_reference);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);
CREATE INDEX IF NOT EXISTS idx_merchants_wallet ON merchants(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Seed Data
INSERT INTO users (email, password_hash, role, country_code) VALUES
('admin@openway.africa', '\$2a\$12\$LJ3m4ys3Lg5VYzP8qWxKzOxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQ', 'ADMIN', 'KE') ON CONFLICT (email) DO NOTHING;

INSERT INTO users (wallet_address, role, business_name, country_code) VALUES
('0x7a2d4e8f1c9b3a5d6e7f8a9b0c1d2e3f4a5b6c7d', 'MERCHANT', 'Kampala Cross-Border Traders Ltd', 'UG') ON CONFLICT (wallet_address) DO NOTHING;

INSERT INTO merchants (user_id, wallet_address, business_name, contact_phone, country_code, kyc_status)
SELECT id, wallet_address, business_name, '+254712000111', country_code, 'VERIFIED'
FROM users WHERE wallet_address = '0x7a2d4e8f1c9b3a5d6e7f8a9b0c1d2e3f4a5b6c7d' ON CONFLICT (wallet_address) DO NOTHING;

INSERT INTO settlements (telco_reference, sender_phone, receiver_phone, amount, currency, status, raw_payload) VALUES
('MPESA-KE-TEST-001', '254712000111', '256772000222', 45000.00, 'KES', 'PROCESSED', '{"test": true}'),
('MTN-UG-TEST-002', '254733000333', '250788000444', 120000.00, 'UGX', 'PENDING', '{"test": true}')
ON CONFLICT (telco_reference) DO NOTHING;