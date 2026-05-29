"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { getMerchantProfile } from "@/lib/api";

type Profile = {
  business_name: string;
  email: string;
  country: string;
  wallet_address: string;
  kyc_status: "VERIFIED" | "PENDING" | "REJECTED" | "LEVEL_1" | "LEVEL_2";
  kyc_level: number;
  joined_at: string;
  daily_limit: number;
};

export default function MerchantProfilePage() {
  const router = useRouter();
  const { address, disconnect } = useWallet();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showWallet, setShowWallet] = useState(false);

  useEffect(() => {
    getMerchantProfile()
      .then(setProfile)
      .catch(() => {});
  }, []);

  const shortAddr = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-6)}`;

  const kycSteps = [
    { label: "Wallet Connected", done: true },
    { label: "Business Details", done: true },
    { label: "KYC Documents", done: (profile?.kyc_level || 0) >= 1 },
    {
      label: "Verification",
      done:
        profile?.kyc_status === "VERIFIED" || profile?.kyc_status === "LEVEL_2",
    },
  ];

  return (
    <div className="space-y-4 p-4 pb-8">
      {/* Header */}
      <h1 className="text-es-xl font-bold text-es-text">Profile</h1>

      {/* Identity Card */}
      <div className="bg-gradient-to-br from-es-navy via-es-navy to-es-navy-light rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-2xl font-bold border-2 border-white/20">
            {(profile?.business_name || "?").charAt(0)}
          </div>
          <div>
            <h2 className="text-es-base font-bold">
              {profile?.business_name || "Merchant"}
            </h2>
            <p className="text-es-xs text-white/60 mt-0.5">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <KycPill status={profile?.kyc_status || "PENDING"} />
              <span className="text-[10px] text-white/40">•</span>
              <span className="text-es-xs text-white/40">
                Since{" "}
                {profile?.joined_at
                  ? new Date(profile.joined_at).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
            <span className="es-mono text-es-xs text-white/80 truncate">
              {showWallet ? address || "-" : shortAddr(address || "-")}
            </span>
          </div>
          <button
            onClick={() => setShowWallet(!showWallet)}
            className="text-white/50 hover:text-white p-1"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {showWallet ? (
                <>
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <>
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.78 0 1.53-.09 2.24-.26" />
                  <path d="M2 2l20 20" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* KYC Progress */}
      <div className="bg-white rounded-xl border border-es-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-es-sm font-semibold text-es-text">
            KYC Progress
          </h3>
          <span className="text-es-xs text-es-blue font-medium">
            {profile?.kyc_status === "VERIFIED" ? "Complete" : "In Progress"}
          </span>
        </div>
        <div className="space-y-4">
          {kycSteps.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  s.done ? "bg-es-success" : "bg-es-bg-dark"
                }`}
              >
                {s.done ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <span className="text-es-xs text-es-text-muted font-bold">
                    {i + 1}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-es-sm ${s.done ? "text-es-text font-medium" : "text-es-text-secondary"}`}
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
        {profile?.kyc_status !== "VERIFIED" && (
          <button className="w-full mt-4 h-11 bg-es-blue-faint text-es-blue rounded-xl text-es-sm font-semibold hover:bg-es-blue/10 transition-colors">
            Continue Verification
          </button>
        )}
      </div>

      {/* Limits */}
      <div className="bg-white rounded-xl border border-es-border p-5">
        <h3 className="text-es-sm font-semibold text-es-text mb-3">
          Settlement Limits
        </h3>
        <div className="space-y-3">
          <LimitBar
            label="Daily Volume"
            used={profile?.daily_limit ? profile.daily_limit * 0.3 : 0}
            total={profile?.daily_limit || 1000000}
            currency="KSh"
          />
          <LimitBar
            label="Cross-Border (Monthly)"
            used={200000}
            total={5000000}
            currency="KSh"
          />
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl border border-es-border overflow-hidden">
        <MenuItem
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          }
          label="Edit Business Details"
          onClick={() => {}}
        />
        <MenuItem
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
          }
          label="Export Transaction CSV"
          onClick={() => {}}
        />
        <MenuItem
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4 17.5a1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 11a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          }
          label="Preferences"
          onClick={() => {}}
        />
        <div className="border-t border-es-border">
          <button
            onClick={() => {
              disconnect();
              router.push("/merchant/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-es-danger hover:bg-es-danger-bg transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span className="text-es-sm font-medium">Disconnect Wallet</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center space-y-1 pt-2">
        <p className="text-es-xs text-es-text-muted">Openway Merchant v1.0.4</p>
        <p className="text-es-xs text-es-text-muted">Celo Alfajores Testnet</p>
      </div>
    </div>
  );
}

function KycPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    VERIFIED: {
      bg: "bg-es-success/20",
      text: "text-es-success",
      label: "Verified",
    },
    LEVEL_2: {
      bg: "bg-es-success/20",
      text: "text-es-success",
      label: "Level 2",
    },
    LEVEL_1: {
      bg: "bg-es-warning/20",
      text: "text-es-warning",
      label: "Level 1",
    },
    PENDING: {
      bg: "bg-es-warning/20",
      text: "text-es-warning",
      label: "Pending",
    },
    REJECTED: {
      bg: "bg-es-danger/20",
      text: "text-es-danger",
      label: "Rejected",
    },
  };
  const s = map[status] || map.PENDING;
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

function LimitBar({
  label,
  used,
  total,
  currency,
}: {
  label: string;
  used: number;
  total: number;
  currency: string;
}) {
  const pct = Math.min((used / total) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-es-xs text-es-text-secondary">{label}</span>
        <span className="text-es-xs font-medium text-es-text">
          {currency} {used.toLocaleString()} / {currency}{" "}
          {total.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-es-bg-dark rounded-full overflow-hidden">
        <div
          className="h-full bg-es-blue rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-es-text hover:bg-es-bg transition-colors border-b border-es-border last:border-0"
    >
      <span className="text-es-text-secondary">{icon}</span>
      <span className="text-es-sm font-medium flex-1 text-left">{label}</span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ADB5BD"
        strokeWidth="2"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}
