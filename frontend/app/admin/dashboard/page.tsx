"use client";

import { useEffect, useState } from "react";
import {
  getAdminStats,
  getAdminTransactions,
  getAdminNodes,
  getTopMerchants,
} from "@/lib/api";

type Stats = {
  volume_24h: number;
  active_escrows: number;
  success_rate: number;
  nodes_online: number;
  nodes_total: number;
};

type Tx = {
  id: string;
  tx_hash: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  from_address: string;
  to_address: string;
};

type Node = {
  id: string;
  region: string;
  status: string;
  latency_ms: number;
  version: string;
  last_seen: string;
};

type TopMerchant = {
  business_name: string;
  volume_24h: number;
  tx_count: number;
  status: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [topMerchants, setTopMerchants] = useState<TopMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [s, t, n, m] = await Promise.all([
          getAdminStats(),
          getAdminTransactions(),
          getAdminNodes(),
          getTopMerchants(),
        ]);
        setStats(s);
        setTxs(t || []);
        setNodes(n || []);
        setTopMerchants(m || []);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();

    // Poll every 10s
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error)
    return (
      <DashboardError
        message={error}
        onRetry={() => window.location.reload()}
      />
    );

  const formatKes = (n: number) =>
    `KSh ${(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const shortAddr = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "-";

  return (
    <div className="space-y-5 max-w-es-container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-es-2xl font-bold text-es-text">
            Network Overview
          </h1>
          <p className="text-es-sm text-es-text-secondary mt-0.5">
            Real-time settlement infrastructure monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-es-success animate-pulse" />
          <span className="text-es-xs text-es-text-secondary">Live</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Volume (24h)"
          value={formatKes(stats?.volume_24h || 0)}
          icon="vol"
        />
        <StatCard
          label="Active Escrows"
          value={(stats?.active_escrows || 0).toLocaleString()}
          icon="esc"
        />
        <StatCard
          label="Settlement Rate"
          value={`${(stats?.success_rate || 0).toFixed(1)}%`}
          icon="rate"
        />
        <StatCard
          label="Relayer Nodes"
          value={`${stats?.nodes_online || 0}/${stats?.nodes_total || 0}`}
          icon="node"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Transactions */}
        <div className="lg:col-span-2 es-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-es-border">
            <h2 className="text-es-md font-semibold text-es-text">
              Recent Settlements
            </h2>
            <span className="text-es-xs text-es-text-muted">
              {txs.length} records
            </span>
          </div>
          {txs.length === 0 ? (
            <EmptyState message="No settlements yet. Transactions will appear here once the network processes them." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-es-border bg-es-bg">
                    <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                      Tx Hash
                    </th>
                    <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                      Type
                    </th>
                    <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                      Status
                    </th>
                    <th className="text-right px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                      Amount
                    </th>
                    <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-es-border hover:bg-es-bg-hover transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="es-mono text-es-blue hover:underline cursor-pointer">
                          {shortAddr(tx.tx_hash)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-es-sm text-es-text">
                        {tx.type}
                      </td>
                      <td className="px-4 py-3">
                        <TxBadge status={tx.status} />
                      </td>
                      <td className="px-4 py-3 text-right es-mono text-es-sm font-medium">
                        {formatKes(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-es-xs text-es-text-secondary">
                        {timeAgo(tx.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Nodes */}
        <div className="es-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-es-border">
            <h2 className="text-es-md font-semibold text-es-text">
              Relayer Nodes
            </h2>
            <span className="es-badge-success">
              {stats?.nodes_online || 0} Online
            </span>
          </div>
          {nodes.length === 0 ? (
            <EmptyState message="No nodes registered yet." />
          ) : (
            <div className="divide-y divide-es-border">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-es-bg-hover"
                >
                  <div className="flex items-center gap-3">
                    <NodeStatusDot status={node.status} />
                    <div>
                      <div className="text-es-sm font-medium text-es-text">
                        {node.id}
                      </div>
                      <div className="text-es-xs text-es-text-secondary">
                        {node.region}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="es-mono text-es-xs text-es-text-secondary">
                      {node.latency_ms > 0 ? `${node.latency_ms}ms` : "-"}
                    </div>
                    <div className="text-es-[10px] text-es-text-muted">
                      {node.version}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Merchants */}
      <div className="es-card">
        <div className="px-4 py-3 border-b border-es-border">
          <h2 className="text-es-md font-semibold text-es-text">
            Top Merchants (24h)
          </h2>
        </div>
        {topMerchants.length === 0 ? (
          <EmptyState message="No merchant activity in the last 24 hours." />
        ) : (
          <div className="divide-y divide-es-border">
            {topMerchants.map((m) => (
              <div
                key={m.business_name}
                className="px-4 py-3 flex items-center justify-between hover:bg-es-bg-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-es-bg-dark flex items-center justify-center text-es-xs font-bold text-es-text-secondary">
                    {m.business_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-es-sm font-medium text-es-text">
                      {m.business_name}
                    </div>
                    <div className="text-es-xs text-es-text-secondary">
                      {m.tx_count} transactions
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-es-sm font-semibold text-es-text">
                    {formatKes(m.volume_24h)}
                  </div>
                  <div
                    className={`text-es-xs ${m.status === "active" ? "text-es-success" : "text-es-warning"}`}
                  >
                    {m.status === "active" ? "● Active" : "● Slow"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* UI Components */
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="es-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-es-xs font-medium text-es-text-secondary uppercase tracking-wider">
          {label}
        </span>
        <StatIcon type={icon} />
      </div>
      <div className="text-es-2xl font-bold text-es-text tracking-tight">
        {value}
      </div>
    </div>
  );
}

function TxBadge({ status }: { status: string }) {
  if (status === "completed" || status === "success")
    return <span className="es-badge-success">Success</span>;
  if (status === "pending")
    return <span className="es-badge-pending">Pending</span>;
  return <span className="es-badge-danger">Failed</span>;
}

function NodeStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: "bg-es-success",
    syncing: "bg-es-warning",
    offline: "bg-es-danger",
  };
  return (
    <span
      className={`w-2 h-2 rounded-full ${colors[status] || "bg-es-text-muted"} ${status === "syncing" ? "animate-pulse" : ""}`}
    />
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-es-bg-dark flex items-center justify-center mx-auto mb-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ADB5BD"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <p className="text-es-sm text-es-text-secondary">{message}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5 max-w-es-container animate-pulse">
      <div className="h-8 bg-es-bg-dark rounded w-48" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 bg-white rounded border border-es-border"
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 h-96 bg-white rounded border border-es-border" />
        <div className="h-96 bg-white rounded border border-es-border" />
      </div>
    </div>
  );
}

function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-16 h-16 rounded-full bg-es-danger-bg flex items-center justify-center">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#DE4437"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-es-lg font-semibold text-es-text">
        Dashboard Unavailable
      </h2>
      <p className="text-es-sm text-es-text-secondary max-w-sm text-center">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-es-blue text-white rounded-es text-es-sm font-medium hover:bg-es-blue-hover"
      >
        Retry
      </button>
    </div>
  );
}

function timeAgo(iso: string): string {
  if (!iso) return "-";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatIcon({ type }: { type: string }) {
  const icons: Record<string, JSX.Element> = {
    vol: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0784C3"
        strokeWidth="2"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    esc: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#00A186"
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      </svg>
    ),
    rate: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#F5A623"
        strokeWidth="2"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    node: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6C5CE7"
        strokeWidth="2"
      >
        <rect width="20" height="8" x="2" y="2" rx="2" />
        <rect width="20" height="8" x="2" y="14" rx="2" />
        <line x1="6" x2="6.01" y1="6" y2="6" />
        <line x1="6" x2="6.01" y1="18" y2="18" />
      </svg>
    ),
  };
  return <div className="p-1.5 bg-es-bg rounded">{icons[type]}</div>;
}
