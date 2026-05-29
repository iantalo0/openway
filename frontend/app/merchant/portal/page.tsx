"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMerchantProfile,
  getMerchantBalance,
  getMerchantTransactions,
} from "@/lib/api";

type Profile = {
  business_name: string;
  kyc_status: string;
  wallet_address: string;
  country: string;
  email: string;
};

type Balance = {
  available: number;
  pending: number;
  currency: string;
};

type Tx = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  counterparty: string;
  direction: "in" | "out";
};

export default function MerchantPortalPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [p, b, t] = await Promise.all([
          getMerchantProfile(),
          getMerchantBalance(),
          getMerchantTransactions(),
        ]);
        setProfile(p);
        setBalance(b);
        setTxs(t || []);
      } catch (err: any) {
        if (err.message?.includes("not found")) {
          setError("MERCHANT_NOT_FOUND");
        } else {
          setError(err.message || "Failed to load portal data");
        }
      } finally {
        setLoading(false);
      }
    }
    load();

    const interval = setInterval(async () => {
      try {
        const b = await getMerchantBalance();
        setBalance(b);
      } catch {
        // silent
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatKes = (n: number) =>
    `KSh ${(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const shortAddr = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "-";

  if (loading) return <PortalSkeleton />;
  if (error === "MERCHANT_NOT_FOUND") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 p-6">
        <p className="text-es-text-secondary text-center">
          Complete registration to activate your merchant account.
        </p>
        <a
          href="/merchant/register"
          className="px-4 py-2 bg-es-blue text-white rounded-es text-es-sm font-medium"
        >
          Register Business
        </a>
      </div>
    );
  }
  if (error) return <PortalError message={error} />;

  return (
    <div className="space-y-4 p-4">
      {/* Profile Header */}
      <div className="bg-es-navy rounded-es-lg p-4 text-white shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold">
              {(profile?.business_name || "?").charAt(0)}
            </div>
            <div>
              <h2 className="text-es-sm font-semibold">
                {profile?.business_name || "Unknown"}
              </h2>
              <p className="text-es-xs text-white/60">
                {profile?.country || "-"} •{" "}
                {shortAddr(profile?.wallet_address || "")}
              </p>
            </div>
          </div>
          <KycBadge status={profile?.kyc_status || "PENDING"} />
        </div>

        <div className="mt-4">
          <p className="text-es-xs text-white/60 mb-1">Total Balance</p>
          <p className="text-es-3xl font-bold tracking-tight">
            {formatKes(balance?.available || 0)}
          </p>
          {(balance?.pending || 0) > 0 && (
            <p className="text-es-xs text-es-warning mt-1">
              + {formatKes(balance?.pending || 0)} pending
            </p>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          <button
            onClick={() => router.push("/merchant/pay")}
            className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <SendIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-medium text-white/80">Send</span>
          </button>
          <button
            onClick={() => router.push("/merchant/scan")}
            className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <rect x="7" y="7" width="10" height="10" rx="1" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-white/80">Scan</span>
          </button>
          <button
            onClick={() => router.push("/merchant/history")}
            className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <HistorySmallIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-medium text-white/80">
              History
            </span>
          </button>
          <button
            onClick={() => router.push("/merchant/profile")}
            className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-white/80">
              Profile
            </span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-es p-3 border border-es-border">
          <p className="text-es-xs text-es-text-secondary">
            Today&apos;s Volume
          </p>
          <p className="text-es-lg font-bold text-es-text mt-1">
            {formatKes(
              txs
                .filter((t) => t.direction === "in")
                .reduce((a, t) => a + (t.amount || 0), 0),
            )}
          </p>
          <p className="text-es-xs text-es-success mt-0.5">{txs.length} txs</p>
        </div>
        <div className="bg-white rounded-es p-3 border border-es-border">
          <p className="text-es-xs text-es-text-secondary">Settlement Rate</p>
          <p className="text-es-lg font-bold text-es-text mt-1">
            {txs.length > 0
              ? `${((txs.filter((t) => t.status === "completed").length / txs.length) * 100).toFixed(1)}%`
              : "N/A"}
          </p>
          <p className="text-es-xs text-es-text-muted mt-0.5">Last 50 txs</p>
        </div>
      </div>

      {/* Activity */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-es-sm font-semibold text-es-text">
            Recent Activity
          </h3>
          <a
            href="/merchant/history"
            className="text-es-xs text-es-blue font-medium"
          >
            See All
          </a>
        </div>
        {txs.length === 0 ? (
          <div className="bg-white rounded-es border border-es-border p-6 text-center">
            <p className="text-es-sm text-es-text-secondary">
              No transactions yet. Your settlement history will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {txs.map((tx) => (
              <div
                key={tx.id}
                className="bg-white rounded-es p-3 border border-es-border flex items-center justify-between active:bg-es-bg-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      tx.direction === "in"
                        ? "bg-es-success-bg text-es-success"
                        : "bg-es-danger-bg text-es-danger"
                    }`}
                  >
                    {tx.direction === "in" ? (
                      <ArrowDownIcon />
                    ) : (
                      <ArrowUpIcon />
                    )}
                  </div>
                  <div>
                    <p className="text-es-sm font-medium text-es-text">
                      {tx.counterparty || tx.type}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <TxDot status={tx.status} />
                      <span className="text-es-xs text-es-text-muted">
                        {timeAgo(tx.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-es-sm font-semibold ${
                      tx.direction === "in" ? "text-es-success" : "text-es-text"
                    }`}
                  >
                    {tx.direction === "in" ? "+" : "-"}
                    {formatKes(tx.amount)}
                  </p>
                  <p className="text-es-xs text-es-text-muted">{tx.currency}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Subcomponents */
function KycBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    VERIFIED: "bg-es-success/20 text-es-success",
    PENDING: "bg-es-warning/20 text-es-warning",
    REJECTED: "bg-es-danger/20 text-es-danger",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
        styles[status] || styles.PENDING
      }`}
    >
      {status}
    </span>
  );
}

function TxDot({ status }: { status: string }) {
  if (status === "completed")
    return <span className="w-1.5 h-1.5 rounded-full bg-es-success" />;
  if (status === "pending")
    return (
      <span className="w-1.5 h-1.5 rounded-full bg-es-warning animate-pulse" />
    );
  return <span className="w-1.5 h-1.5 rounded-full bg-es-danger" />;
}

function PortalSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      <div className="h-48 bg-es-navy rounded-es-lg" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 bg-white rounded-es border border-es-border" />
        <div className="h-20 bg-white rounded-es border border-es-border" />
      </div>
      <div className="h-32 bg-white rounded-es border border-es-border" />
    </div>
  );
}

function PortalError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 p-6">
      <div className="w-12 h-12 rounded-full bg-es-danger-bg flex items-center justify-center">
        <svg
          width="20"
          height="20"
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
      <p className="text-es-sm text-es-text-secondary text-center">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-es-blue text-white rounded-es text-es-sm font-medium"
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

function ArrowDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M12 19V5M19 12l-7-7-7 7" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function HistorySmallIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
