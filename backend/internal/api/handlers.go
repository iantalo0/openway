package api

import (
	"encoding/json"
	"io"
	"net/http"

	"openway/internal/repository"
	"openway/internal/service"

	"github.com/rs/zerolog/log"
)

type Handlers struct {
	settlementSvc  *service.SettlementService
	settlementRepo *repository.SettlementRepository
}

func NewHandlers(svc *service.SettlementService, repo *repository.SettlementRepository) *Handlers {
	return &Handlers{settlementSvc: svc, settlementRepo: repo}
}

type DarajaWebhookPayload struct {
	TransID       string  `json:"TransID"`
	TransTime     string  `json:"TransTime"`
	TransAmount   float64 `json:"TransAmount"`
	MSISDN        string  `json:"MSISDN"`
	BillRefNumber string  `json:"BillRefNumber"`
}

func (h *Handlers) HandleDarajaWebhook(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "failed to read body", http.StatusBadRequest)
		return
	}

	var payload DarajaWebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	err = h.settlementSvc.ProcessWebhook(
		r.Context(),
		payload.TransID,
		payload.MSISDN,
		payload.BillRefNumber,
		"KES",
		payload.TransAmount,
		body,
	)

	if err != nil {
		log.Error().Err(err).Msg("webhook processing failed")
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"ResultCode": "0", "ResultDesc": "Success"}`))
}