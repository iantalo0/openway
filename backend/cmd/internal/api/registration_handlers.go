package api

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"openway/internal/auth"
	"openway/internal/repository"

	"github.com/rs/zerolog/log"
)

type RegistrationHandlers struct {
	userRepo     *repository.UserRepository
	merchantRepo *repository.MerchantRepository
}

func NewRegistrationHandlers(u *repository.UserRepository, m *repository.MerchantRepository) *RegistrationHandlers {
	return &RegistrationHandlers{userRepo: u, merchantRepo: m}
}

type RegisterRequest struct {
	Wallet       string `json:"wallet"`
	Message      string `json:"message"`
	Signature    string `json:"signature"`
	BusinessName string `json:"business_name"`
	CountryCode  string `json:"country_code"`
	Phone        string `json:"phone"`
	KycDocURL    string `json:"kyc_doc_url"`
}

func (h *RegistrationHandlers) HandleRegister(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Wallet == "" || req.BusinessName == "" || req.CountryCode == "" || req.Phone == "" {
		http.Error(w, `{"error":"missing required fields"}`, http.StatusBadRequest)
		return
	}

	// Verify wallet ownership
	if !auth.VerifyWalletSignature(req.Wallet, req.Message, req.Signature) {
		http.Error(w, `{"error":"invalid wallet signature"}`, http.StatusUnauthorized)
		return
	}

	// Normalize inputs
	req.Wallet = strings.ToLower(req.Wallet)
	req.CountryCode = strings.ToUpper(req.CountryCode)

	// Check for existing wallet
	existing, _ := h.userRepo.GetByWallet(r.Context(), req.Wallet)
	if existing != nil {
		http.Error(w, `{"error":"wallet already registered"}`, http.StatusConflict)
		return
	}

	// Create auth user (no password for wallet-based auth)
	user := &repository.User{
		Email:        req.Wallet + "@wallet.openway",
		PasswordHash: "-", // wallet auth only — no password
		Role:         "MERCHANT",
		Wallet:       req.Wallet,
		CreatedAt:    time.Now(),
	}
	if err := h.userRepo.Create(r.Context(), user); err != nil {
		log.Error().Err(err).Str("wallet", req.Wallet).Msg("failed to create user")
		http.Error(w, `{"error":"registration failed"}`, http.StatusInternalServerError)
		return
	}

	// Create merchant business record
	merchant := &repository.Merchant{
		UserID:        user.ID,
		WalletAddress: req.Wallet,
		BusinessName:  req.BusinessName,
		ContactPhone:  req.Phone,
		CountryCode:   req.CountryCode,
		KYCStatus:     "PENDING",
		CreatedAt:     time.Now(),
	}
	if err := h.merchantRepo.Create(r.Context(), merchant); err != nil {
		log.Error().Err(err).Str("wallet", req.Wallet).Msg("failed to create merchant")
		http.Error(w, `{"error":"registration failed"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "registered",
		"user_id": user.ID,
		"kyc":     "PENDING",
	})
}