package repository
package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type NodeRepository struct {
	pool *pgxpool.Pool
}

func NewNodeRepository(pool *pgxpool.Pool) *NodeRepository {
	return &NodeRepository{pool: pool}
}

func (r *NodeRepository) List(ctx context.Context) ([]Node, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, region, status, latency_ms, version, last_seen 
		FROM nodes ORDER BY region
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nodes []Node
	for rows.Next() {
		var n Node
		if err := rows.Scan(&n.ID, &n.Region, &n.Status, &n.LatencyMs, &n.Version, &n.LastSeen); err != nil {
			continue
		}
		nodes = append(nodes, n)
	}
	return nodes, nil
}

func (r *NodeRepository) UpsertHeartbeat(ctx context.Context, id, version, region string, lastSeen time.Time) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO nodes (id, region, status, version, last_seen, latency_ms)
		VALUES ($1, $2, 'online', $3, $4, 0)
		ON CONFLICT (id) DO UPDATE SET
			region = EXCLUDED.region,
			status = 'online',
			version = EXCLUDED.version,
			last_seen = EXCLUDED.last_seen
	`, id, region, version, lastSeen)
	return err
}

func (r *NodeRepository) UpdateLatency(ctx context.Context, id string, latencyMs int) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE nodes SET latency_ms = $1, last_seen = NOW() WHERE id = $2
	`, latencyMs, id)
	return err
}

func (r *NodeRepository) SetStatus(ctx context.Context, id string, status string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE nodes SET status = $1, last_seen = NOW() WHERE id = $2
	`, status, id)
	return err
}