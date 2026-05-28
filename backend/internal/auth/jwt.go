package auth

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("openway-prod-secret-change-in-env")

type contextKey string

const walletContextKey contextKey = "wallet"

type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	Wallet string `json:"wallet"` // populated for merchant sessions
	jwt.RegisteredClaims
}

func GenerateToken(userID, role, wallet string) (string, error) {
	claims := Claims{
		UserID: userID,
		Role:   role,
		Wallet: wallet,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ValidateToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

// GetWalletFromContext extracts the wallet address injected by JWTMiddleware.
func GetWalletFromContext(ctx context.Context) (string, bool) {
	wallet, ok := ctx.Value(walletContextKey).(string)
	return wallet, ok
}

// WithWallet returns a new context with the wallet value set.
func WithWallet(ctx context.Context, wallet string) context.Context {
	return context.WithValue(ctx, walletContextKey, wallet)
}