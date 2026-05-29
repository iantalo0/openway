"use client";

import { useState } from "react";

type KycStatus = "VERIFIED" | "PENDING" | "REJECTED" | "SUSPENDED";
type MerchantStatus = "active" | "inactive" | "suspended";

type Merchant = {
  id: string;
  businessName: string;
  country: string;
  wallet: string;
  kycStatus: KycStatus;
  status: MerchantStatus;
  volume24h: number;
  txCount: number;
  joined: string;
};

const FILTERS: {
  label: string;
  value: KycStatus | "all" | "active" | "suspended";
}[] = [
  { label: "All", value: "all" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Pending KYC", value: "PENDING" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
];

export default function AdminMerchantsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [merchants] = useState<Merchant[]>([]);

  return (
    <div className="space-y-5 max-w-es-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-es-2xl font-bold text-es-text">Merchants</h1>
          <p className="text-es-sm text-es-text-secondary mt-0.5">
            Registered businesses across African markets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-es-success animate-pulse" />
          <span className="text-es-xs text-es-text-secondary">Live</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Merchants" value="0" icon="users" />
        <StatCard label="Verified" value="0" icon="verified" />
        <StatCard label="Pending KYC" value="0" icon="pending" />
        <StatCard label="Suspended" value="0" icon="suspended" />
      </div>

      {/* Main Card */}
      <div className="es-card">
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

        {merchants.length === 0 ? (
          <EmptyMerchantState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-es-border bg-es-bg">
                  <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Business
                  </th>
                  <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Country
                  </th>
                  <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Wallet
                  </th>
                  <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    KYC
                  </th>
                  <th className="text-right px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Volume (24h)
                  </th>
                  <th className="text-right px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Txns
                  </th>
                  <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Joined
                  </th>
                  <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-es-border hover:bg-es-bg-hover transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-es-bg-dark flex items-center justify-center text-es-xs font-bold text-es-text-secondary">
                          {m.businessName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-es-sm font-medium text-es-text">
                            {m.businessName}
                          </div>
                          <div className="text-es-xs text-es-text-secondary">
                            {m.status}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-es-sm text-es-text">
                      {m.country}
                    </td>
                    <td className="px-4 py-3">
                      <span className="es-mono text-es-xs text-es-blue hover:underline cursor-pointer">
                        {m.wallet.slice(0, 6)}...{m.wallet.slice(-4)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <KycBadge status={m.kycStatus} />
                    </td>
                    <td className="px-4 py-3 text-right es-mono text-es-sm font-medium">
                      KSh {m.volume24h.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-es-sm text-es-text">
                      {m.txCount}
                    </td>
                    <td className="px-4 py-3 text-es-xs text-es-text-secondary">
                      {m.joined}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-es-xs text-es-blue hover:underline">
                          View
                        </button>
                        {m.kycStatus === "PENDING" && (
                          <button className="text-es-xs text-es-success hover:underline">
                            Verify
                          </button>
                        )}
                      </div>
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
    users: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0784C3"
        strokeWidth="2"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    verified: (
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
    suspended: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#DE4437"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" x2="9" y1="9" y2="15" />
        <line x1="9" x2="15" y1="9" y2="15" />
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

function KycBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    VERIFIED: {
      bg: "bg-es-success-bg",
      text: "text-es-success",
      label: "Verified",
    },
    PENDING: {
      bg: "bg-es-warning-bg",
      text: "text-es-warning",
      label: "Pending",
    },
    REJECTED: {
      bg: "bg-es-danger-bg",
      text: "text-es-danger",
      label: "Rejected",
    },
    SUSPENDED: {
      bg: "bg-es-bg-dark",
      text: "text-es-text-muted",
      label: "Suspended",
    },
  };
  const s = styles[status] || styles.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.bg} ${s.text}`}
    >
      {status === "VERIFIED" && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
      {s.label}
    </span>
  );
}

function EmptyMerchantState() {
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
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <h3 className="text-es-lg font-semibold text-es-text mb-2">
        No Merchants Registered
      </h3>
      <p className="text-es-sm text-es-text-secondary max-w-sm mx-auto mb-6">
        Merchants will appear here once they complete wallet registration and
        KYC verification through the merchant portal.
      </p>
      <div className="flex items-center justify-center gap-6 text-es-xs text-es-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-success" />
          Registration Open
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-blue" />
          KYC Required
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-purple" />
          Wallet-Only Auth
        </div>
      </div>
    </div>
  );
}
