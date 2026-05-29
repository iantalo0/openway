package middleware

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"io"
	"net/http"
	"strings"

	"github.com/rs/zerolog/log"
)

func HMACValidation(secretKey string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if secretKey == "" {
				log.Warn().Msg("HMAC secret key not configured, skipping validation")
				next.ServeHTTP(w, r)
				return
			}

			signature := r.Header.Get("X-Webhook-Signature")
			if signature == "" {
				http.Error(w, "missing signature", http.StatusUnauthorized)
				return
			}

			body, err := io.ReadAll(r.Body)
			if err != nil {
				http.Error(w, "failed to read body", http.StatusInternalServerError)
				return
			}
			
			r.Body = io.NopCloser(strings.NewReader(string(body)))

			mac := hmac.New(sha256.New, []byte(secretKey))
			mac.Write(body)
			expectedMAC := hex.EncodeToString(mac.Sum(nil))

			if !hmac.Equal([]byte(expectedMAC), []byte(signature)) {
				log.Warn().Str("ip", r.RemoteAddr).Msg("invalid hmac signature")
				http.Error(w, "invalid signature", http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}