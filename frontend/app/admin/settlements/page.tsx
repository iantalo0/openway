"use client";

import { useState } from "react";

type SettlementStatus = "completed" | "pending" | "failed" | "refunded";

export default function AdminSettlementsPage() {
  const [dateRange, setDateRange] = useState("24h");
  const [countryFilter, setCountryFilter] = useState("all");
  const [settlements] = useState<any[]>([]);

  return (
    <div className="space-y-5 max-w-es-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-es-2xl font-bold text-es-text">Settlements</h1>
          <p className="text-es-sm text-es-text-secondary mt-0.5">
            Completed and archived settlement batches
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-es-success animate-pulse" />
          <span className="text-es-xs text-es-text-secondary">Live</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Today" value="KSh 0.00" icon="today" />
        <StatCard label="This Week" value="KSh 0.00" icon="week" />
        <StatCard label="This Month" value="KSh 0.00" icon="month" />
        <StatCard label="Success Rate" value="0.0%" icon="rate" />
      </div>

      {/* Filters */}
      <div className="es-card p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            {["1h", "6h", "12h", "24h", "7d", "30d"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-es text-es-xs font-medium transition-colors ${
                  dateRange === range
                    ? "bg-es-blue text-white"
                    : "bg-es-bg text-es-text-secondary hover:bg-es-bg-hover"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-es-border" />
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-1 bg-es-bg border border-es-border rounded-es text-es-xs text-es-text focus:border-es-blue focus:outline-none"
          >
            <option value="all">All Markets</option>
            <option value="KE">Kenya</option>
            <option value="NG">Nigeria</option>
            <option value="GH">Ghana</option>
            <option value="ZA">South Africa</option>
            <option value="TZ">Tanzania</option>
            <option value="UG">Uganda</option>
            <option value="RW">Rwanda</option>
          </select>
        </div>

        {settlements.length === 0 ? (
          <EmptySettlementState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-es-border bg-es-bg">
                  <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Settlement ID
                  </th>
                  <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Merchant
                  </th>
                  <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Route
                  </th>
                  <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Status
                  </th>
                  <th className="text-right px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Amount
                  </th>
                  <th className="text-right px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Fee
                  </th>
                  <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Settled
                  </th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-es-border hover:bg-es-bg-hover transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="es-mono text-es-blue hover:underline cursor-pointer">
                        {s.id?.slice(0, 12)}...
                      </span>
                    </td>
                    <td className="px-4 py-3 text-es-sm text-es-text">
                      {s.merchant}
                    </td>
                    <td className="px-4 py-3 text-es-xs text-es-text-secondary">
                      {s.route}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`es-badge-${s.status === "completed" ? "success" : s.status === "pending" ? "pending" : "danger"}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right es-mono text-es-sm font-medium">
                      KSh {s.amount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right es-mono text-es-xs text-es-text-secondary">
                      KSh {s.fee?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-es-xs text-es-text-secondary">
                      {s.settledAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

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
    today: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0784C3"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    week: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#00A186"
        strokeWidth="2"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    month: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6C5CE7"
        strokeWidth="2"
      >
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" x2="4" y1="22" y2="15" />
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

function EmptySettlementState() {
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
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
      <h3 className="text-es-lg font-semibold text-es-text mb-2">
        No Settlements Recorded
      </h3>
      <p className="text-es-sm text-es-text-secondary max-w-sm mx-auto mb-6">
        Completed settlements will appear here once the network processes its
        first cross-border payment batch.
      </p>
      <div className="flex items-center justify-center gap-6 text-es-xs text-es-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-success" />
          Settlement Engine Ready
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-blue" />
          Auto-Batching Enabled
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-purple" />
          Awaiting First Txn
        </div>
      </div>
    </div>
  );
}
