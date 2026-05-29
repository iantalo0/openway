"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initiatePayment } from "@/lib/api";

type PayStep = "scan" | "amount" | "confirm" | "success" | "failed";

export default function MerchantScanPage() {
  const router = useRouter();
  const [step, setStep] = useState<PayStep>("scan");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "amount") inputRef.current?.focus();
  }, [step]);

  const handleScan = (data: string) => {
    // In production: parse QR payload (wallet address or payment request)
    setRecipient(data || "0x742d...8f3a");
    setStep("amount");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await initiatePayment({ recipient, amount: Number(amount), note });
      await new Promise((r) => setTimeout(r, 1500)); // Simulate
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setStep("failed");
    } finally {
      setLoading(false);
    }
  };

  const formatKes = (n: number) =>
    `KSh ${n.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {step === "scan" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
          {/* Camera Frame */}
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 border-2 border-dashed border-es-blue/30 rounded-3xl" />
            <div className="absolute inset-4 border-2 border-es-blue rounded-2xl flex items-center justify-center bg-es-blue-faint/50">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0784C3"
                strokeWidth="1.5"
              >
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <rect x="7" y="7" width="10" height="10" rx="1" />
              </svg>
            </div>
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-es-blue rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-es-blue rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-es-blue rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-es-blue rounded-br-xl" />
          </div>

          <div className="text-center space-y-1">
            <p className="text-es-sm font-medium text-es-text">Scan QR Code</p>
            <p className="text-es-xs text-es-text-secondary">
              Align code within frame to pay
            </p>
          </div>

          {/* Manual Entry Fallback */}
          <button
            onClick={() => setStep("amount")}
            className="w-full max-w-xs py-3 bg-white border border-es-border rounded-xl text-es-sm font-semibold text-es-text hover:bg-es-bg transition-colors flex items-center justify-center gap-2"
          >
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
            Enter manually
          </button>
        </div>
      )}

      {step === "amount" && (
        <div className="flex-1 flex flex-col p-5 space-y-5">
          <div>
            <label className="block text-es-xs font-semibold text-es-text-secondary uppercase mb-1.5">
              Recipient
            </label>
            <div className="flex items-center gap-3 p-3 bg-white border border-es-border rounded-xl">
              <div className="w-8 h-8 rounded-full bg-es-blue-faint flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0784C3"
                  strokeWidth="2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-es-sm font-medium text-es-text truncate">
                  {recipient || "Unknown"}
                </p>
                <p className="text-es-xs text-es-text-muted">Celo Alfajores</p>
              </div>
              <button
                onClick={() => setStep("scan")}
                className="text-es-xs text-es-blue font-medium"
              >
                Change
              </button>
            </div>
          </div>

          <div>
            <label className="block text-es-xs font-semibold text-es-text-secondary uppercase mb-1.5">
              Amount (KSh)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-es-lg font-bold text-es-text-muted">
                KSh
              </span>
              <input
                ref={inputRef}
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-16 pl-16 pr-4 bg-white border border-es-border rounded-xl text-3xl font-bold text-es-text placeholder-es-text-muted focus:border-es-blue focus:outline-none focus:ring-2 focus:ring-es-blue/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-es-xs font-semibold text-es-text-secondary uppercase mb-1.5">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Invoice #1024"
              className="w-full h-12 px-4 bg-white border border-es-border rounded-xl text-es-sm text-es-text placeholder-es-text-muted focus:border-es-blue focus:outline-none focus:ring-2 focus:ring-es-blue/10 transition-all"
            />
          </div>

          <div className="flex-1" />

          <button
            onClick={() => setStep("confirm")}
            disabled={!amount || Number(amount) <= 0}
            className="w-full h-14 bg-es-blue text-white rounded-xl text-es-base font-semibold hover:bg-es-blue-hover disabled:bg-es-text-muted disabled:cursor-not-allowed transition-colors shadow-lg shadow-es-blue/20"
          >
            Review Payment
          </button>
        </div>
      )}

      {step === "confirm" && (
        <div className="flex-1 flex flex-col p-5 space-y-5">
          <h2 className="text-es-lg font-bold text-es-text">Confirm Payment</h2>

          <div className="bg-white rounded-xl border border-es-border p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-es-sm text-es-text-secondary">Amount</span>
              <span className="text-es-xl font-bold text-es-text">
                {formatKes(Number(amount))}
              </span>
            </div>
            <div className="h-px bg-es-border" />
            <div className="flex justify-between items-center">
              <span className="text-es-sm text-es-text-secondary">To</span>
              <span className="es-mono text-es-sm text-es-text">
                {recipient}
              </span>
            </div>
            <div className="h-px bg-es-border" />
            <div className="flex justify-between items-center">
              <span className="text-es-sm text-es-text-secondary">
                Network Fee
              </span>
              <span className="text-es-sm font-medium text-es-text">
                ~KSh 2.50
              </span>
            </div>
            <div className="h-px bg-es-border" />
            <div className="flex justify-between items-center">
              <span className="text-es-sm font-semibold text-es-text">
                Total
              </span>
              <span className="text-es-lg font-bold text-es-blue">
                {formatKes(Number(amount) + 2.5)}
              </span>
            </div>
          </div>

          {note && (
            <div className="bg-es-bg rounded-lg p-3">
              <p className="text-es-xs text-es-text-secondary mb-0.5">Note</p>
              <p className="text-es-sm text-es-text">{note}</p>
            </div>
          )}

          <div className="flex-1" />

          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-14 bg-es-blue text-white rounded-xl text-es-base font-semibold hover:bg-es-blue-hover disabled:bg-es-text-muted transition-colors shadow-lg shadow-es-blue/20 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg
                  className="animate-spin w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {loading ? "Processing..." : "Confirm & Pay"}
            </button>
            <button
              onClick={() => setStep("amount")}
              disabled={loading}
              className="w-full h-12 bg-white border border-es-border text-es-text rounded-xl text-es-sm font-semibold hover:bg-es-bg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {(step === "success" || step === "failed") && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              step === "success" ? "bg-es-success-bg" : "bg-es-danger-bg"
            }`}
          >
            {step === "success" ? (
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00A186"
                strokeWidth="3"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DE4437"
                strokeWidth="3"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            )}
          </div>

          <div>
            <h3 className="text-es-xl font-bold text-es-text">
              {step === "success" ? "Payment Sent" : "Payment Failed"}
            </h3>
            <p className="text-es-sm text-es-text-secondary mt-1 max-w-xs mx-auto">
              {step === "success"
                ? `KSh ${amount} has been sent to ${recipient.slice(0, 10)}...`
                : error || "Something went wrong. Please try again."}
            </p>
          </div>

          <div className="w-full max-w-xs space-y-3">
            {step === "success" && (
              <div className="bg-es-bg rounded-xl p-4 space-y-2 text-left">
                <div className="flex justify-between text-es-xs">
                  <span className="text-es-text-secondary">Tx Hash</span>
                  <span className="es-mono text-es-blue">0x8a3f...2d1c</span>
                </div>
                <div className="flex justify-between text-es-xs">
                  <span className="text-es-text-secondary">Time</span>
                  <span className="text-es-text">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setAmount("");
                setRecipient("");
                setNote("");
                setError(null);
                setStep("scan");
              }}
              className={`w-full h-14 rounded-xl text-es-base font-semibold transition-colors ${
                step === "success"
                  ? "bg-es-blue text-white hover:bg-es-blue-hover shadow-lg shadow-es-blue/20"
                  : "bg-es-danger text-white hover:bg-es-danger-hover"
              }`}
            >
              {step === "success" ? "New Payment" : "Try Again"}
            </button>

            {step === "success" && (
              <button
                onClick={() => router.push("/merchant/history")}
                className="w-full h-12 bg-white border border-es-border text-es-text rounded-xl text-es-sm font-semibold hover:bg-es-bg transition-colors"
              >
                View History
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
