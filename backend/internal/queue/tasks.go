package queue

import (
	"encoding/json"

	"github.com/hibiken/asynq"
)

const TypeSettlementProcess = "settlement:process"

type SettlementProcessPayload struct {
	SettlementID   string  `json:"settlement_id"`
	TelcoReference string  `json:"telco_reference"`
	Amount         float64 `json:"amount"`
	Currency       string  `json:"currency"`
}

func NewSettlementProcessTask(p SettlementProcessPayload) (*asynq.Task, error) {
	payload, err := json.Marshal(p)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeSettlementProcess, payload, asynq.Queue("critical"), asynq.MaxRetry(3)), nil
}