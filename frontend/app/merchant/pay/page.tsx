"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { createSettlement } from "@/lib/api";

type Step = "recipient" | "amount" | "review" | "stk";

const RATES: Record<
  string,
  { code: string; name: string; flag: string; rate: number; fee: number }
> = {
  UG: { code: "UGX", name: "Uganda", flag: "🇺🇬", rate: 27.8, fee: 0.005 },
  NG: { code: "NGN", name: "Nigeria", flag: "🇳🇬", rate: 5.9, fee: 0.006 },
  GH: { code: "GHS", name: "Ghana", flag: "🇬🇭", rate: 0.095, fee: 0.005 },
  TZ: { code: "TZS", name: "Tanzania", flag: "🇹🇿", rate: 18.5, fee: 0.004 },
  RW: { code: "RWF", name: "Rwanda", flag: "🇷🇼", rate: 9.2, fee: 0.005 },
};

export default function MerchantPayPage() {
  const router = useRouter();
  const { address } = useWallet();
  const [step, setStep] = useState << Step > "recipient";
  const [country, setCountry] = useState("UG");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [settlementId, setSettlementId] = useState<string | null>(null);

  const rateInfo = RATES[country];
  const numAmount = Number(amount) || 0;
  const fee = numAmount * rateInfo.fee;
  const recipientGets = Math.max(0, (numAmount - fee) * rateInfo.rate);

  const handleCreate = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await createSettlement({
        recipientCountry: country,
        recipientPhone: phone,
        amount: numAmount,
        currency: "KES",
        purpose,
      });
      setSettlementId(res.id);
      setStep("stk");
    } catch (err: any) {
      alert(err.message || "Failed to create settlement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-es-bg flex flex-col">
      <div className="bg-white border-b border-es-border px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-es-lg font-bold text-es-text">
            Cross-Border Pay
          </h1>
          <span className="text-es-xs text-es-text-muted font-medium capitalize">
            {step}
          </span>
        </div>
        <div className="h-1.5 bg-es-bg-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-es-blue rounded-full transition-all duration-500"
            style={{
              width:
                step === "recipient"
                  ? "25%"
                  : step === "amount"
                    ? "50%"
                    : step === "review"
                      ? "75%"
                      : "100%",
            }}
          />
        </div>
      </div>

      <div className="flex-1 p-5 max-w-md mx-auto w-full">
        {step === "recipient" && (
          <div className="space-y-5">
            <div>
              <label className="block text-es-xs font-semibold text-es-text-secondary uppercase mb-2">
                Destination Country
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(RATES).map(([code, info]) => (
                  <button
                    key={code}
                    onClick={() => setCountry(code)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      country === code
                        ? "border-es-blue bg-es-blue-faint text-es-blue"
                        : "border-es-border bg-white text-es-text hover:bg-es-bg"
                    }`}
                  >
                    <span className="text-lg">{info.flag}</span>
                    <div>
                      <p className="text-es-sm font-medium">{info.name}</p>
                      <p className="text-es-xs text-es-text-muted">
                        {info.code}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-es-xs font-semibold text-es-text-secondary uppercase mb-1.5">
                Recipient Mobile Money Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 712 345 678"
                className="w-full h-12 px-4 bg-white border border-es-border rounded-xl text-es-sm text-es-text placeholder-es-text-muted focus:border-es-blue focus:outline-none focus:ring-2 focus:ring-es-blue/10 transition-all"
              />
            </div>

            <button
              onClick={() => setStep("amount")}
              disabled={!phone}
              className="w-full h-14 bg-es-blue text-white rounded-xl text-es-base font-semibold hover:bg-es-blue-hover disabled:bg-es-text-muted transition-colors shadow-lg shadow-es-blue/20"
            >
              Continue
            </button>
          </div>
        )}

        {step === "amount" && (
          <div className="space-y-5">
            <div>
              <label className="block text-es-xs font-semibold text-es-text-secondary uppercase mb-1.5">
                You Send (KES)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-es-lg font-bold text-es-text-muted">
                  KSh
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-16 pl-16 pr-4 bg-white border border-es-border rounded-xl text-3xl font-bold text-es-text placeholder-es-text-muted focus:border-es-blue focus:outline-none focus:ring-2 focus:ring-es-blue/10 transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-es-border p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-es-xs text-es-text-secondary">
                  Exchange Rate
                </span>
                <span className="text-es-sm font-medium text-es-text">
                  1 KES = {rateInfo.rate} {rateInfo.code}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-es-xs text-es-text-secondary">
                  Routing Fee
                </span>
                <span className="text-es-sm font-medium text-es-text">
                  KSh{" "}
                  {fee.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-px bg-es-border" />
              <div className="flex justify-between items-center">
                <span className="text-es-sm font-semibold text-es-text">
                  Recipient Gets
                </span>
                <span className="text-es-lg font-bold text-es-success">
                  {rateInfo.code}{" "}
                  {recipientGets.toLocaleString("en-KE", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-es-xs font-semibold text-es-text-secondary uppercase mb-1.5">
                Purpose (optional)
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Coffee beans payment"
                className="w-full h-12 px-4 bg-white border border-es-border rounded-xl text-es-sm text-es-text placeholder-es-text-muted focus:border-es-blue focus:outline-none focus:ring-2 focus:ring-es-blue/10 transition-all"
              />
            </div>

            <button
              onClick={() => setStep("review")}
              disabled={numAmount <= 0}
              className="w-full h-14 bg-es-blue text-white rounded-xl text-es-base font-semibold hover:bg-es-blue-hover disabled:bg-es-text-muted transition-colors shadow-lg shadow-es-blue/20"
            >
              Review Transfer
            </button>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-5">
            <h2 className="text-es-lg font-bold text-es-text">
              Confirm Transfer
            </h2>

            <div className="bg-white rounded-xl border border-es-border p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-es-xs text-es-text-secondary uppercase">
                  From
                </span>
                <span className="es-mono text-es-sm text-es-text">
                  {address?.slice(0, 10)}...
                </span>
              </div>
              <div className="h-px bg-es-border" />
              <div className="flex justify-between items-center">
                <span className="text-es-xs text-es-text-secondary uppercase">
                  To
                </span>
                <span className="text-es-sm font-medium text-es-text">
                  {rateInfo.flag} {phone}
                </span>
              </div>
              <div className="h-px bg-es-border" />
              <div className="flex justify-between items-center">
                <span className="text-es-xs text-es-text-secondary uppercase">
                  You Send
                </span>
                <span className="text-es-xl font-bold text-es-text">
                  KSh{" "}
                  {numAmount.toLocaleString("en-KE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="h-px bg-es-border" />
              <div className="flex justify-between items-center">
                <span className="text-es-xs text-es-text-secondary uppercase">
                  Recipient Gets
                </span>
                <span className="text-es-lg font-bold text-es-success">
                  {rateInfo.code}{" "}
                  {recipientGets.toLocaleString("en-KE", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>

            <div className="flex-1" />

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full h-14 bg-es-blue text-white rounded-xl text-es-base font-semibold hover:bg-es-blue-hover disabled:bg-es-text-muted transition-colors shadow-lg shadow-es-blue/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
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
                  Creating Escrow...
                </>
              ) : (
                "Lock Funds & Continue"
              )}
            </button>
            <button
              onClick={() => setStep("amount")}
              disabled={loading}
              className="w-full h-12 bg-white border border-es-border text-es-text rounded-xl text-es-sm font-semibold hover:bg-es-bg transition-colors"
            >
              Go Back
            </button>
          </div>
        )}

        {step === "stk" && settlementId && (
          <div className="space-y-6 text-center py-4">
            <div className="w-20 h-20 rounded-full bg-es-blue-faint flex items-center justify-center mx-auto">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0784C3"
                strokeWidth="1.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>

            <div>
              <h2 className="text-es-xl font-bold text-es-text">
                Awaiting M-Pesa Payment
              </h2>
              <p className="text-es-sm text-es-text-secondary mt-1.5 max-w-xs mx-auto">
                Check your phone for the STK push. Enter your M-Pesa PIN to fund
                the escrow.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-es-border p-5 text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-es-xs text-es-text-secondary">
                  Paybill
                </span>
                <span className="es-mono text-es-sm font-bold text-es-text">
                  522522
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-es-xs text-es-text-secondary">
                  Account No
                </span>
                <span className="es-mono text-es-sm font-bold text-es-text">
                  {settlementId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-es-xs text-es-text-secondary">
                  Amount
                </span>
                <span className="text-es-sm font-bold text-es-text">
                  KSh{" "}
                  {numAmount.toLocaleString("en-KE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push(`/merchant/history`)}
              className="w-full h-14 bg-es-blue text-white rounded-xl text-es-base font-semibold hover:bg-es-blue-hover transition-colors shadow-lg shadow-es-blue/20"
            >
              Track Transfer
            </button>

            <p className="text-es-xs text-es-text-muted">
              Settlement ID: <span className="es-mono">{settlementId}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
