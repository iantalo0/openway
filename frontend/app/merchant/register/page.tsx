"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { registerMerchant } from "@/lib/api";

type RegisterStep =
  | "wallet"
  | "details"
  | "kyc"
  | "review"
  | "submitting"
  | "done";

const COUNTRIES = [
  { code: "KE", name: "Kenya", currency: "KES", flag: "🇰🇪" },
  { code: "NG", name: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", currency: "GHS", flag: "🇬🇭" },
  { code: "ZA", name: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  { code: "TZ", name: "Tanzania", currency: "TZS", flag: "🇹🇿" },
  { code: "UG", name: "Uganda", currency: "UGX", flag: "🇺🇬" },
  { code: "RW", name: "Rwanda", currency: "RWF", flag: "🇷🇼" },
];

export default function MerchantRegisterPage() {
  const router = useRouter();
  const { connect, authenticate, address, isConnecting } = useWallet();
  const [step, setStep] = useState<RegisterStep>("wallet");
  const [form, setForm] = useState({
    businessName: "",
    email: "",
    country: "KE",
    phone: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      await connect();
      setStep("details");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const submit = async () => {
    setError(null);
    setStep("submitting");
    try {
      const { message, signature } = await authenticate();
      await registerMerchant({
        wallet: address!,
        businessName: form.businessName,
        email: form.email,
        country: form.country,
        phone: form.phone,
        message,
        signature,
      });
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setStep("review");
    }
  };

  const progressMap: Record<RegisterStep, number> = {
    wallet: 1,
    details: 2,
    kyc: 3,
    review: 4,
    submitting: 4,
    done: 5,
  };
  const progress = progressMap[step];

  return (
    <div className="min-h-screen bg-es-bg flex flex-col">
      {/* Progress Header */}
      <div className="bg-white border-b border-es-border px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-es-lg font-bold text-es-text">
            Register Business
          </h1>
          <span className="text-es-xs text-es-text-muted font-medium">
            Step {progress} of 5
          </span>
        </div>
        <div className="h-1.5 bg-es-bg-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-es-blue rounded-full transition-all duration-500"
            style={{ width: `${(progress / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 p-5 max-w-md mx-auto w-full">
        {error && (
          <div className="mb-4 bg-es-danger-bg border border-es-danger/20 rounded-xl p-3 flex items-start gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#DE4437"
              strokeWidth="2"
              className="shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-es-xs text-es-danger font-medium">{error}</p>
          </div>
        )}

        {step === "wallet" && (
          <div className="space-y-6 py-8 text-center">
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
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-es-xl font-bold text-es-text">
                Connect Wallet
              </h2>
              <p className="text-es-sm text-es-text-secondary mt-1.5 max-w-xs mx-auto">
                Your wallet is your identity. No passwords needed — just sign to
                verify ownership.
              </p>
            </div>

            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full h-14 bg-es-blue text-white rounded-xl text-es-base font-semibold hover:bg-es-blue-hover disabled:bg-es-text-muted transition-colors shadow-lg shadow-es-blue/20 flex items-center justify-center gap-2"
            >
              {isConnecting ? (
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
                  Opening Wallet...
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                  Connect Wallet
                </>
              )}
            </button>

            <p className="text-es-xs text-es-text-muted">
              Supported: MetaMask, Trust, Coinbase, Rabby, WalletConnect
            </p>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-5">
            <div>
              <label className="block text-es-xs font-semibold text-es-text-secondary uppercase mb-1.5">
                Business Name
              </label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, businessName: e.target.value }))
                }
                placeholder="e.g. JumiaPay Kenya Ltd"
                className="w-full h-12 px-4 bg-white border border-es-border rounded-xl text-es-sm text-es-text placeholder-es-text-muted focus:border-es-blue focus:outline-none focus:ring-2 focus:ring-es-blue/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-es-xs font-semibold text-es-text-secondary uppercase mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="finance@business.co.ke"
                className="w-full h-12 px-4 bg-white border border-es-border rounded-xl text-es-sm text-es-text placeholder-es-text-muted focus:border-es-blue focus:outline-none focus:ring-2 focus:ring-es-blue/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-es-xs font-semibold text-es-text-secondary uppercase mb-1.5">
                Country / Market
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setForm((f) => ({ ...f, country: c.code }))}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      form.country === c.code
                        ? "border-es-blue bg-es-blue-faint text-es-blue"
                        : "border-es-border bg-white text-es-text hover:bg-es-bg"
                    }`}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <div>
                      <p className="text-es-sm font-medium">{c.name}</p>
                      <p className="text-es-xs text-es-text-muted">
                        {c.currency}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-es-xs font-semibold text-es-text-secondary uppercase mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+254 712 345 678"
                className="w-full h-12 px-4 bg-white border border-es-border rounded-xl text-es-sm text-es-text placeholder-es-text-muted focus:border-es-blue focus:outline-none focus:ring-2 focus:ring-es-blue/10 transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => setStep("kyc")}
                disabled={!form.businessName || !form.email}
                className="w-full h-14 bg-es-blue text-white rounded-xl text-es-base font-semibold hover:bg-es-blue-hover disabled:bg-es-text-muted transition-colors shadow-lg shadow-es-blue/20"
              >
                Continue to KYC
              </button>
            </div>
          </div>
        )}

        {step === "kyc" && (
          <div className="space-y-5">
            <div className="bg-es-blue-faint border border-es-blue-light rounded-xl p-4 flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0784C3"
                strokeWidth="2"
                className="shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <div>
                <p className="text-es-sm font-medium text-es-text">
                  Why we need this
                </p>
                <p className="text-es-xs text-es-text-secondary mt-1 leading-relaxed">
                  Openway is a licensed settlement network. We verify all
                  merchants to comply with AML/CFT regulations in each African
                  market.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <KycStep
                number={1}
                title="Business Registration"
                desc="Certificate of Incorporation or Business Permit"
                status="pending"
              />
              <KycStep
                number={2}
                title="Tax Identification"
                desc="KRA PIN, TIN, or equivalent tax document"
                status="pending"
              />
              <KycStep
                number={3}
                title="Director ID"
                desc="National ID or Passport of primary director"
                status="pending"
              />
              <KycStep
                number={4}
                title="Bank Verification"
                desc="Cancelled cheque or bank statement"
                status="pending"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => setStep("review")}
                className="w-full h-14 bg-es-blue text-white rounded-xl text-es-base font-semibold hover:bg-es-blue-hover transition-colors shadow-lg shadow-es-blue/20"
              >
                Continue
              </button>
              <p className="text-es-xs text-es-text-muted text-center mt-2">
                Documents can be uploaded later from your Profile
              </p>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-5">
            <h2 className="text-es-lg font-bold text-es-text">Review</h2>

            <div className="bg-white rounded-xl border border-es-border p-5 space-y-4">
              <ReviewItem label="Wallet" value={address || "-"} mono />
              <ReviewItem label="Business" value={form.businessName} />
              <ReviewItem label="Email" value={form.email} />
              <ReviewItem
                label="Country"
                value={
                  COUNTRIES.find((c) => c.code === form.country)?.name ||
                  form.country
                }
              />
              <ReviewItem label="Phone" value={form.phone || "-"} />
            </div>

            <label className="flex items-start gap-3 p-3 bg-es-bg rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-es-border text-es-blue focus:ring-es-blue mt-0.5"
              />
              <span className="text-es-xs text-es-text-secondary leading-relaxed">
                I agree to the{" "}
                <span className="text-es-blue font-medium">Merchant Terms</span>{" "}
                and{" "}
                <span className="text-es-blue font-medium">
                  Settlement Agreement
                </span>
                . I confirm all information is accurate.
              </span>
            </label>

            <button
              onClick={submit}
              disabled={!agreed}
              className="w-full h-14 bg-es-blue text-white rounded-xl text-es-base font-semibold hover:bg-es-blue-hover disabled:bg-es-text-muted transition-colors shadow-lg shadow-es-blue/20"
            >
              Submit Registration
            </button>
          </div>
        )}

        {step === "submitting" && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <svg
              className="animate-spin w-12 h-12 text-es-blue"
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
            <p className="text-es-sm font-medium text-es-text">
              Creating your account...
            </p>
            <p className="text-es-xs text-es-text-secondary">
              Verifying wallet signature
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-es-success-bg flex items-center justify-center">
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
            </div>
            <div>
              <h2 className="text-es-xl font-bold text-es-text">
                Application Submitted
              </h2>
              <p className="text-es-sm text-es-text-secondary mt-1.5 max-w-xs mx-auto">
                Verification usually takes 1–2 business days. You will receive
                an email at {form.email}.
              </p>
            </div>
            <div className="w-full max-w-xs space-y-3">
              <button
                onClick={() => router.push("/merchant/login?registered=true")}
                className="w-full h-14 bg-es-blue text-white rounded-xl text-es-base font-semibold hover:bg-es-blue-hover transition-colors shadow-lg shadow-es-blue/20"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push("/merchant/portal")}
                className="w-full h-12 bg-white border border-es-border text-es-text rounded-xl text-es-sm font-semibold hover:bg-es-bg transition-colors"
              >
                Preview Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KycStep({
  number,
  title,
  desc,
  status,
}: {
  number: number;
  title: string;
  desc: string;
  status: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-es-border rounded-xl">
      <div className="w-8 h-8 rounded-full bg-es-bg-dark flex items-center justify-center text-es-xs font-bold text-es-text-secondary shrink-0">
        {number}
      </div>
      <div className="flex-1">
        <p className="text-es-sm font-medium text-es-text">{title}</p>
        <p className="text-es-xs text-es-text-secondary mt-0.5">{desc}</p>
      </div>
      <span className="px-2 py-1 bg-es-warning-bg text-es-warning text-[10px] font-bold uppercase rounded">
        {status}
      </span>
    </div>
  );
}

function ReviewItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-es-xs text-es-text-secondary uppercase font-medium">
        {label}
      </span>
      <span
        className={`text-es-sm text-es-text ${mono ? "es-mono" : "font-medium"}`}
      >
        {mono ? `${value.slice(0, 6)}...${value.slice(-4)}` : value}
      </span>
    </div>
  );
}
