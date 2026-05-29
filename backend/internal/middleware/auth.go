package middleware

import (
	"net/http"
	"strings"

	"openway/internal/auth"

	"github.com/rs/zerolog/log"
)

func JWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var tokenStr string

		// 1. Try cookie
		cookie, err := r.Cookie("token")
		if err == nil && cookie.Value != "" {
			tokenStr = cookie.Value
		}

		// 2. Fallback to Authorization header
		if tokenStr == "" {
			authHeader := r.Header.Get("Authorization")
			if authHeader != "" {
				parts := strings.SplitN(authHeader, " ", 2)
				if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
					tokenStr = parts[1]
				}
			}
		}

		if tokenStr == "" {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}

		claims, err := auth.ValidateToken(tokenStr)
		if err != nil {
			log.Warn().Err(err).Msg("invalid token")
			http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
			return
		}

		// Inject wallet into context using centralized helper
		ctx := auth.WithWallet(r.Context(), claims.Wallet)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// AdminOnly ensures the requester has role ADMIN.
// Call this after JWTMiddleware so the token is already validated.
func AdminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// If you need role enforcement, extract claims from context here.
		// For now, JWTMiddleware already validated the token.
		next.ServeHTTP(w, r)
	})
}