"use client";

import { useState } from "react";

type EscrowStatus = "pending" | "processing" | "completed" | "failed";

type Escrow = {
  id: string;
  merchant: string;
  country: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  type: string;
  created: string;
  expires: string;
  txHash?: string;
};

const FILTERS: { label: string; value: EscrowStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
];

export default function AdminEscrowsPage() {
  const [activeFilter, setActiveFilter] = useState<EscrowStatus | "all">("all");
  const [escrows] = useState<Escrow[]>([]);

  const filtered =
    activeFilter === "all"
      ? escrows
      : escrows.filter((e) => e.status === activeFilter);

  const formatKes = (n: number) =>
    `KSh ${n.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-5 max-w-es-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-es-2xl font-bold text-es-text">Active Escrows</h1>
          <p className="text-es-sm text-es-text-secondary mt-0.5">
            Real-time settlement escrow monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-es-success animate-pulse" />
          <span className="text-es-xs text-es-text-secondary">Live</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Escrows" value="0" icon="esc" />
        <StatCard label="Pending" value="0" icon="pending" />
        <StatCard label="Processing" value="0" icon="processing" />
        <StatCard label="Completed (24h)" value="0" icon="completed" />
      </div>

      {/* Main Card */}
      <div className="es-card">
        {/* Filter Bar */}
        <div className="flex items-center justify-between p-4 border-b border-es-border">
          <div className="flex items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-3 py-1.5 rounded-es text-es-xs font-medium transition-colors ${
                  activeFilter === f.value
                    ? "bg-es-blue text-white"
                    : "bg-es-bg text-es-text-secondary hover:bg-es-bg-hover"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-es-bg border border-es-border rounded-es text-es-xs text-es-text-secondary hover:bg-es-bg-hover flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Content */}
        {escrows.length === 0 ? (
          <EmptyEscrowState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-es-border bg-es-bg">
                    <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                      Escrow ID
                    </th>
                    <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                      Merchant
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
                      Created
                    </th>
                    <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((escrow) => (
                    <tr
                      key={escrow.id}
                      className="border-b border-es-border hover:bg-es-bg-hover transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="es-mono text-es-blue hover:underline cursor-pointer">
                          {escrow.id.slice(0, 12)}...
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-es-sm text-es-text">
                          {escrow.merchant}
                        </div>
                        <div className="text-es-xs text-es-text-secondary">
                          {escrow.country}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-es-sm text-es-text">
                        {escrow.type}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={escrow.status} />
                      </td>
                      <td className="px-4 py-3 text-right es-mono text-es-sm font-medium">
                        {formatKes(escrow.amount)}
                      </td>
                      <td className="px-4 py-3 text-es-xs text-es-text-secondary">
                        {escrow.created}
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-es-xs text-es-blue hover:underline">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination total={filtered.length} all={escrows.length} />
          </>
        )}
      </div>
    </div>
  );
}

/* Subcomponents */
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  const icons: Record<string, JSX.Element> = {
    esc: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0784C3"
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      </svg>
    ),
    pending: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#F5A623"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    processing: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#3498DB"
        strokeWidth="2"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    completed: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#00A186"
        strokeWidth="2"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  };
  return (
    <div className="es-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-es-xs font-medium text-es-text-secondary uppercase tracking-wider">
          {label}
        </span>
        <div className="p-1.5 bg-es-bg rounded">{icons[icon]}</div>
      </div>
      <div className="text-es-2xl font-bold text-es-text tracking-tight">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "es-badge-pending",
    processing: "es-badge-info",
    completed: "es-badge-success",
    failed: "es-badge-danger",
  };
  return (
    <span className={styles[status] || "es-badge-info"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function EmptyEscrowState() {
  return (
    <div className="py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-es-bg-dark flex items-center justify-center mx-auto mb-4">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ADB5BD"
          strokeWidth="1.5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
      </div>
      <h3 className="text-es-lg font-semibold text-es-text mb-2">
        No Active Escrows
      </h3>
      <p className="text-es-sm text-es-text-secondary max-w-sm mx-auto mb-6">
        New settlement escrows will appear here once merchants initiate
        cross-border transactions through the network.
      </p>
      <div className="flex items-center justify-center gap-6 text-es-xs text-es-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-success" />
          Network Online
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-blue" />
          Relayers Active
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-purple" />
          Awaiting Transactions
        </div>
      </div>
    </div>
  );
}

function Pagination({ total, all }: { total: number; all: number }) {
  return (
    <div className="flex items-center justify-between p-4 border-t border-es-border">
      <span className="text-es-xs text-es-text-secondary">
        Showing {total} of {all} escrows
      </span>
      <div className="flex items-center gap-1">
        <button className="px-3 py-1 bg-es-bg border border-es-border rounded-es text-es-xs text-es-text-secondary hover:bg-es-bg-hover">
          First
        </button>
        <button className="px-3 py-1 bg-es-bg border border-es-border rounded-es text-es-xs text-es-text-secondary hover:bg-es-bg-hover">
          ←
        </button>
        <span className="px-3 py-1 bg-es-blue text-white rounded-es text-es-xs font-medium">
          1
        </span>
        <button className="px-3 py-1 bg-es-bg border border-es-border rounded-es text-es-xs text-es-text-secondary hover:bg-es-bg-hover">
          →
        </button>
        <button className="px-3 py-1 bg-es-bg border border-es-border rounded-es text-es-xs text-es-text-secondary hover:bg-es-bg-hover">
          Last
        </button>
      </div>
    </div>
  );
}
