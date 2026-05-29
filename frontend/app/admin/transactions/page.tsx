"use client";

import { useState } from "react";
import Link from "next/link";

type TxType = "all" | "pending" | "cross-border" | "contract-events" | "failed";

const SUBNAV: { label: string; value: TxType; description: string }[] = [
  {
    label: "All Settlements",
    value: "all",
    description: "All processed and pending settlement transactions",
  },
  {
    label: "Pending",
    value: "pending",
    description: "Settlements awaiting confirmation or escrow release",
  },
  {
    label: "Cross-Border",
    value: "cross-border",
    description: "International settlements between African markets",
  },
  {
    label: "Contract Events",
    value: "contract-events",
    description: "Smart contract event logs and internal calls",
  },
  {
    label: "Failed",
    value: "failed",
    description: "Failed or reverted settlement transactions",
  },
];

export default function AdminTransactionsPage() {
  const [activeTab, setActiveTab] = useState<TxType>("all");
  const [transactions] = useState<any[]>([]);

  const currentNav = SUBNAV.find((n) => n.value === activeTab)!;

  return (
    <div className="space-y-5 max-w-es-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-es-2xl font-bold text-es-text">Transactions</h1>
          <p className="text-es-sm text-es-text-secondary mt-0.5">
            {currentNav.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-es-success animate-pulse" />
          <span className="text-es-xs text-es-text-secondary">Live</span>
        </div>
      </div>

      {/* Sub-navigation — Etherscan-style tabs */}
      <div className="es-card overflow-hidden">
        <div className="border-b border-es-border bg-es-bg">
          <div className="flex overflow-x-auto">
            {SUBNAV.map((nav) => (
              <button
                key={nav.value}
                onClick={() => setActiveTab(nav.value)}
                className={`px-4 py-3 text-es-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === nav.value
                    ? "border-es-blue text-es-blue bg-white"
                    : "border-transparent text-es-text-secondary hover:text-es-text hover:bg-es-bg-hover"
                }`}
              >
                {nav.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between p-4 border-b border-es-border">
          <div className="flex items-center gap-3">
            <span className="text-es-xs text-es-text-secondary">
              A total of <span className="font-semibold text-es-text">0</span>{" "}
              transactions found
            </span>
            <span className="text-es-xs text-es-text-muted">
              (Showing the last 100 records)
            </span>
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
              Download CSV
            </button>
          </div>
        </div>

        {/* Content */}
        {transactions.length === 0 ? (
          <EmptyTxState activeTab={activeTab} />
        ) : (
          <TxTable transactions={transactions} />
        )}
      </div>
    </div>
  );
}

function EmptyTxState({ activeTab }: { activeTab: TxType }) {
  const messages: Record<TxType, { title: string; body: string }> = {
    all: {
      title: "No Transactions Yet",
      body: "Settlement transactions will appear here once the network processes its first cross-border payment.",
    },
    pending: {
      title: "No Pending Settlements",
      body: "All settlements are currently confirmed. New pending transactions will appear here.",
    },
    "cross-border": {
      title: "No Cross-Border Settlements",
      body: "International transactions between African markets will be listed here once initiated.",
    },
    "contract-events": {
      title: "No Contract Events",
      body: "Smart contract event logs will appear here when escrows are created or released on-chain.",
    },
    failed: {
      title: "No Failed Transactions",
      body: "Failed or reverted settlements will be logged here for review and debugging.",
    },
  };

  const msg = messages[activeTab];

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
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
          <path d="m6 14 2 2 4-4" />
        </svg>
      </div>
      <h3 className="text-es-lg font-semibold text-es-text mb-2">
        {msg.title}
      </h3>
      <p className="text-es-sm text-es-text-secondary max-w-md mx-auto mb-6">
        {msg.body}
      </p>
      <div className="flex items-center justify-center gap-6 text-es-xs text-es-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-success" />
          Network Operational
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-blue" />
          Celo Alfajores
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-purple" />8 Relayer
          Nodes
        </div>
      </div>
    </div>
  );
}

function TxTable({ transactions }: { transactions: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-es-border bg-es-bg">
            <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
              Txn Hash
            </th>
            <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
              Method
            </th>
            <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
              Status
            </th>
            <th className="text-right px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
              Amount
            </th>
            <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
              From → To
            </th>
            <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
              Time
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="border-b border-es-border hover:bg-es-bg-hover transition-colors"
            >
              <td className="px-4 py-3">
                <span className="es-mono text-es-blue hover:underline cursor-pointer">
                  {tx.txHash?.slice(0, 16)}...
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 bg-es-blue-faint text-es-blue text-[10px] font-medium rounded">
                  {tx.type || "Transfer"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="es-badge-success">{tx.status}</span>
              </td>
              <td className="px-4 py-3 text-right es-mono text-es-sm font-medium">
                KSh {tx.amount?.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-es-xs">
                  <span className="es-mono text-es-text-secondary">
                    {tx.from?.slice(0, 8)}...
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ADB5BD"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <span className="es-mono text-es-text-secondary">
                    {tx.to?.slice(0, 8)}...
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-es-xs text-es-text-secondary">
                2m ago
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
