package api

import (
	"encoding/json"
	"net/http"

	"openway/internal/auth"
	"openway/internal/repository"

	"github.com/rs/zerolog/log"
)

type MerchantHandlers struct {
	merchantRepo   *repository.MerchantRepository
	settlementRepo *repository.SettlementRepository
}

func NewMerchantHandlers(mr *repository.MerchantRepository, sr *repository.SettlementRepository) *MerchantHandlers {
	return &MerchantHandlers{merchantRepo: mr, settlementRepo: sr}
}

// GET /api/v1/merchant/profile
func (h *MerchantHandlers) GetProfile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Extract wallet from JWT context (set by auth middleware)
	wallet, ok := auth.GetWalletFromContext(ctx)
	if !ok {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	profile, err := h.merchantRepo.GetByWallet(ctx, wallet)
	if err != nil {
		log.Error().Err(err).Str("wallet", wallet).Msg("merchant not found")
		http.Error(w, `{"error":"merchant not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

// GET /api/v1/merchant/balance
func (h *MerchantHandlers) GetBalance(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	wallet, ok := auth.GetWalletFromContext(ctx)
	if !ok {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	balance, pending, err := h.settlementRepo.GetMerchantBalance(ctx, wallet)
	if err != nil {
		log.Error().Err(err).Str("wallet", wallet).Msg("failed to get balance")
		http.Error(w, `{"error":"failed to fetch balance"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"available": balance,
		"pending":   pending,
		"currency":  "KES",
	})
}

// GET /api/v1/merchant/transactions
func (h *MerchantHandlers) GetTransactions(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	wallet, ok := auth.GetWalletFromContext(ctx)
	if !ok {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	txs, err := h.settlementRepo.GetByMerchantWallet(ctx, wallet, 50)
	if err != nil {
		log.Error().Err(err).Str("wallet", wallet).Msg("failed to get transactions")
		http.Error(w, `{"error":"failed to fetch transactions"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(txs)
}