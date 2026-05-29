package api

import (
	"encoding/json"
	"net/http"

	"openway/internal/repository"

	"github.com/rs/zerolog/log"
)

type AdminHandlers struct {
	settlementRepo *repository.SettlementRepository
	merchantRepo   *repository.MerchantRepository
	nodeRepo       *repository.NodeRepository
}

func NewAdminHandlers(sr *repository.SettlementRepository, mr *repository.MerchantRepository, nr *repository.NodeRepository) *AdminHandlers {
	return &AdminHandlers{settlementRepo: sr, merchantRepo: mr, nodeRepo: nr}
}

// GET /api/v1/admin/stats
func (h *AdminHandlers) GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	volume, err := h.settlementRepo.GetVolume24h(ctx)
	if err != nil {
		log.Error().Err(err).Msg("failed to get 24h volume")
	}

	escrowCount, err := h.settlementRepo.GetActiveEscrowCount(ctx)
	if err != nil {
		log.Error().Err(err).Msg("failed to get escrow count")
	}

	successRate, err := h.settlementRepo.GetSettlementSuccessRate(ctx)
	if err != nil {
		log.Error().Err(err).Msg("failed to get success rate")
	}

	nodes, err := h.nodeRepo.List(ctx)
	if err != nil {
		log.Error().Err(err).Msg("failed to list nodes")
	}
	onlineCount := 0
	for _, n := range nodes {
		if n.Status == "online" {
			onlineCount++
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"volume_24h":     volume,
		"active_escrows": escrowCount,
		"success_rate":   successRate,
		"nodes_online":   onlineCount,
		"nodes_total":    len(nodes),
	})
}

// GET /api/v1/admin/transactions
func (h *AdminHandlers) GetRecentTransactions(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	txs, err := h.settlementRepo.GetRecent(ctx, 50)
	if err != nil {
		log.Error().Err(err).Msg("failed to get recent transactions")
		http.Error(w, `{"error":"failed to fetch transactions"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(txs)
}

// GET /api/v1/admin/nodes
func (h *AdminHandlers) GetNodes(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	nodes, err := h.nodeRepo.List(ctx)
	if err != nil {
		log.Error().Err(err).Msg("failed to list nodes")
		http.Error(w, `{"error":"failed to fetch nodes"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nodes)
}

// GET /api/v1/admin/merchants/top
func (h *AdminHandlers) GetTopMerchants(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	merchants, err := h.merchantRepo.GetTopByVolume(ctx, 10, 24)
	if err != nil {
		log.Error().Err(err).Msg("failed to get top merchants")
		http.Error(w, `{"error":"failed to fetch merchants"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(merchants)
}