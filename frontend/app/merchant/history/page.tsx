"use client";

import { useState, useEffect } from "react";
import { getMerchantTransactions } from "@/lib/api";

type Tx = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  created_at: string;
  counterparty: string;
  direction: "in" | "out";
  tx_hash?: string;
};

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Received", value: "in" },
  { label: "Sent", value: "out" },
  { label: "Pending", value: "pending" },
];

export default function MerchantHistoryPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  import { getMerchantSettlements } from "@/lib/api";

  // Replace the existing useEffect with this:
  useEffect(() => {
    getMerchantSettlements()
      .then((data) => {
        // Map settlements to Tx format
        const mapped = (data || []).map((s: any) => ({
          id: s.id,
          type: s.type || "cross_border",
          amount: s.amount,
          currency: s.currency,
          status:
            s.status === "AWAITING_PAYMENT"
              ? "pending"
              : s.status === "EGRESS_COMPLETE"
                ? "completed"
                : "pending",
          created_at: s.created_at,
          counterparty: s.counterparty || s.receiver_phone,
          direction: s.direction || "out",
          tx_hash: s.tx_hash,
        }));
        setTxs(mapped);
        setLoading(false);
      })
      .catch(() => {
        setTxs([]);
        setLoading(false);
      });
  }, []);

  const filtered = txs
    .filter((tx) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "pending") return tx.status === "pending";
      return tx.direction === activeFilter;
    })
    .filter(
      (tx) =>
        search === "" ||
        tx.counterparty?.toLowerCase().includes(search.toLowerCase()) ||
        tx.id?.toLowerCase().includes(search.toLowerCase()) ||
        tx.tx_hash?.toLowerCase().includes(search.toLowerCase()),
    );

  const formatKes = (n: number) =>
    `KSh ${(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

  const grouped = groupByDate(filtered);

  if (loading) return <HistorySkeleton />;

  return (
    <div className="space-y-4 p-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-es-xl font-bold text-es-text">History</h1>
        <button className="p-2 text-es-text-secondary hover:text-es-text rounded-lg hover:bg-es-bg transition-colors">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-2.5 w-4 h-4 text-es-text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, ID, or hash..."
          className="w-full h-10 pl-9 pr-3 bg-white border border-es-border rounded-xl text-es-sm text-es-text placeholder-es-text-muted focus:border-es-blue focus:outline-none focus:ring-2 focus:ring-es-blue/10 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-2.5 text-es-text-muted hover:text-es-text"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-es-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === f.value
                ? "bg-es-blue text-white shadow-md shadow-es-blue/20"
                : "bg-white text-es-text-secondary border border-es-border hover:bg-es-bg"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-es-xs text-es-text-muted">
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
        </span>
        <span className="text-es-xs text-es-text-muted">Last 90 days</span>
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <EmptyHistory search={search} filter={activeFilter} />
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-es-xs font-semibold text-es-text-secondary uppercase tracking-wider mb-2 px-0.5">
                {date}
              </h3>
              <div className="space-y-2">
                {items.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white rounded-xl p-3.5 border border-es-border active:bg-es-bg-hover transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            tx.direction === "in"
                              ? "bg-es-success-bg"
                              : tx.status === "failed"
                                ? "bg-es-danger-bg"
                                : "bg-es-blue-faint"
                          }`}
                        >
                          {tx.direction === "in" ? (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#00A186"
                              strokeWidth="2.5"
                            >
                              <path d="M12 5v14M19 12l-7 7-7-7" />
                            </svg>
                          ) : tx.status === "failed" ? (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#DE4437"
                              strokeWidth="2.5"
                            >
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          ) : (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#0784C3"
                              strokeWidth="2.5"
                            >
                              <path d="M12 19V5M5 12l7-7 7 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-es-sm font-medium text-es-text">
                            {tx.counterparty || tx.type}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <TxDot status={tx.status} />
                            <span className="text-es-xs text-es-text-muted">
                              {timeOnly(tx.created_at)}
                            </span>
                            {tx.tx_hash && (
                              <span className="text-es-xs es-mono text-es-blue">
                                {tx.tx_hash.slice(0, 6)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-es-sm font-bold ${
                            tx.direction === "in"
                              ? "text-es-success"
                              : "text-es-text"
                          }`}
                        >
                          {tx.direction === "in" ? "+" : "-"}
                          {formatKes(tx.amount)}
                        </p>
                        <p className="text-es-xs text-es-text-muted mt-0.5">
                          {tx.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Helpers */
function groupByDate(txs: Tx[]): Record<string, Tx[]> {
  const groups: Record<string, Tx[]> = {};
  txs.forEach((tx) => {
    const d = new Date(tx.created_at);
    const key = isToday(d)
      ? "Today"
      : isYesterday(d)
        ? "Yesterday"
        : d.toLocaleDateString("en-KE", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  return groups;
}

function isToday(d: Date) {
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isYesterday(d: Date) {
  const now = new Date();
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  return d.toDateString() === yest.toDateString();
}

function timeOnly(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TxDot({ status }: { status: string }) {
  if (status === "completed")
    return <span className="w-2 h-2 rounded-full bg-es-success" />;
  if (status === "pending")
    return (
      <span className="w-2 h-2 rounded-full bg-es-warning animate-pulse" />
    );
  return <span className="w-2 h-2 rounded-full bg-es-danger" />;
}

function EmptyHistory({ search, filter }: { search: string; filter: string }) {
  return (
    <div className="py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-es-bg-dark flex items-center justify-center mx-auto mb-4">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ADB5BD"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
        </svg>
      </div>
      <h3 className="text-es-sm font-semibold text-es-text mb-1">
        {search ? "No matches found" : "No transactions yet"}
      </h3>
      <p className="text-es-xs text-es-text-secondary max-w-xs mx-auto">
        {search
          ? `No results for "${search}". Try a different ID or counterparty name.`
          : filter !== "all"
            ? `No ${filter === "in" ? "received" : filter === "out" ? "sent" : "pending"} transactions in the last 90 days.`
            : "Your settlement history will appear here once you start receiving or sending payments."}
      </p>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      <div className="h-8 bg-es-bg-dark rounded-lg w-1/3" />
      <div className="h-10 bg-es-bg-dark rounded-xl" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 bg-es-bg-dark rounded-full w-20" />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 bg-white rounded-xl border border-es-border"
        />
      ))}
    </div>
  );
}
