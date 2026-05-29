package api

import (
	"encoding/json"
	"net/http"
	"time"

	"openway/internal/repository"

	"github.com/rs/zerolog/log"
)

type NodeHandlers struct {
	nodeRepo *repository.NodeRepository
}

func NewNodeHandlers(nr *repository.NodeRepository) *NodeHandlers {
	return &NodeHandlers{nodeRepo: nr}
}

// GET /api/v1/nodes
func (h *NodeHandlers) ListNodes(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	nodes, err := h.nodeRepo.List(ctx)
	if err != nil {
		log.Error().Err(err).Msg("failed to list nodes")
		http.Error(w, `{"error":"database error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nodes)
}

// POST /api/v1/nodes/heartbeat
func (h *NodeHandlers) Heartbeat(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req struct {
		NodeID  string `json:"node_id"`
		Version string `json:"version"`
		Region  string `json:"region"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
		return
	}

	err := h.nodeRepo.UpsertHeartbeat(ctx, req.NodeID, req.Version, req.Region, time.Now())
	if err != nil {
		log.Error().Err(err).Msg("heartbeat failed")
		http.Error(w, `{"error":"failed to record heartbeat"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}