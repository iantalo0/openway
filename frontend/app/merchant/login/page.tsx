"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { loginMerchant } from "@/lib/api";
import type { WalletProvider } from "@/lib/web3/client";

export default function MerchantLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  const {
    connect,
    authenticate,
    address,
    provider,
    isConnecting,
    error: walletError,
  } = useWallet();
  const [step, setStep] = useState<
    "idle" | "connecting" | "signing" | "submitting"
  >("idle");
  const [localError, setLocalError] = useState<string | null>(null);
  const [showWalletSelect, setShowWalletSelect] = useState(false);

  const handleLogin = async (walletType: WalletProvider) => {
    setLocalError(null);
    setShowWalletSelect(false);

    try {
      // Step 1: Connect wallet
      if (!address) {
        setStep("connecting");
        await connect(walletType);
      }

      // Step 2: Sign auth message
      setStep("signing");
      const { message, signature } = await authenticate();

      // Step 3: Submit to backend
      setStep("submitting");
      await loginMerchant(address!, message, signature);

      router.push("/merchant/portal");
    } catch (err: any) {
      setLocalError(err.message || "Authentication failed");
      setStep("idle");
    }
  };

  const statusText = {
    idle: "Connect Wallet",
    connecting: "Requesting Wallet...",
    signing: "Waiting for Signature...",
    submitting: "Verifying...",
  };

  const isBusy =
    step === "connecting" || step === "signing" || step === "submitting";

  const walletLabel =
    provider === "coinbase"
      ? "Coinbase"
      : provider === "metamask"
        ? "MetaMask"
        : "Wallet";

  return (
    <div className="min-h-screen bg-es-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-es-blue flex items-center justify-center mx-auto mb-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-es-xl font-bold text-es-text">Merchant Portal</h1>
          <p className="text-es-sm text-es-text-secondary mt-1">
            Cross-border settlement for African traders
          </p>
        </div>

        {/* Success Banner */}
        {justRegistered && (
          <div className="mb-4 p-3 bg-es-success-bg border border-es-success/20 rounded-es flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00A186"
              strokeWidth="2.5"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <p className="text-es-xs text-es-success font-medium">
              Registration successful! Sign in with your wallet.
            </p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white border border-es-border rounded-es-lg shadow-es-card overflow-hidden">
          <div className="p-6 space-y-5">
            {/* Wallet Status */}
            {address ? (
              <div className="bg-es-success-bg border border-es-success/20 rounded-es p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-es-success" />
                  <span className="text-es-sm font-medium text-es-success">
                    {walletLabel} Connected
                  </span>
                </div>
                <p className="es-mono text-es-xs text-es-text-secondary break-all">
                  {address}
                </p>
              </div>
            ) : (
              <div className="bg-es-bg border border-es-border rounded-es p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-es-bg-dark flex items-center justify-center mx-auto mb-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6C757D"
                    strokeWidth="2"
                  >
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </svg>
                </div>
                <p className="text-es-sm font-medium text-es-text">
                  Connect Your Wallet
                </p>
                <p className="text-es-xs text-es-text-secondary mt-1">
                  Choose your preferred wallet
                </p>
              </div>
            )}

            {/* Network Badge */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 bg-es-bg rounded border border-es-border">
              <span className="w-2 h-2 rounded-full bg-es-blue" />
              <span className="text-es-xs text-es-text-secondary font-medium">
                Celo Alfajores Testnet
              </span>
            </div>

            {/* Wallet Selector or Action Button */}
            {!address ? (
              <div className="space-y-2">
                {!showWalletSelect ? (
                  <button
                    onClick={() => setShowWalletSelect(true)}
                    disabled={isBusy || isConnecting}
                    className="w-full h-11 bg-es-blue hover:bg-es-blue-hover disabled:bg-es-text-muted text-white font-semibold rounded-es text-es-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {isBusy && (
                      <svg
                        className="animate-spin w-4 h-4"
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
                    <span>{statusText[step]}</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleLogin("coinbase")}
                      disabled={isBusy}
                      className="w-full h-11 bg-[#0052FF] hover:bg-[#0043d1] disabled:bg-es-text-muted text-white font-semibold rounded-es text-es-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle cx="12" cy="12" r="10" fill="white" />
                        <path
                          d="M12 6v12M6 12h12"
                          stroke="#0052FF"
                          strokeWidth="2"
                        />
                      </svg>
                      Coinbase Wallet
                    </button>
                    <button
                      onClick={() => handleLogin("metamask")}
                      disabled={isBusy}
                      className="w-full h-11 bg-[#F6851B] hover:bg-[#e07710] disabled:bg-es-text-muted text-white font-semibold rounded-es text-es-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
                          fill="#E2761B"
                        />
                        <path
                          d="M12 7v10M7 12h10"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </svg>
                      MetaMask
                    </button>
                    <button
                      onClick={() => setShowWalletSelect(false)}
                      className="w-full h-9 text-es-text-secondary hover:text-es-text text-es-xs font-medium transition-colors"
                    >
                      ← Back
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleLogin(provider || "metamask")}
                disabled={isBusy}
                className="w-full h-11 bg-es-blue hover:bg-es-blue-hover disabled:bg-es-text-muted text-white font-semibold rounded-es text-es-sm transition-colors flex items-center justify-center gap-2"
              >
                {isBusy && (
                  <svg
                    className="animate-spin w-4 h-4"
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
                <span>{isBusy ? statusText[step] : "Sign & Login"}</span>
              </button>
            )}

            {/* Error */}
            {(localError || walletError) && (
              <div className="bg-es-danger-bg border border-es-danger/20 rounded-es p-3 flex items-start gap-2">
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
                <p className="text-es-xs text-es-danger font-medium">
                  {localError || walletError}
                </p>
              </div>
            )}

            {/* Security Note */}
            <div className="flex items-start gap-2.5 pt-2 border-t border-es-border">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ADB5BD"
                strokeWidth="2"
                className="shrink-0 mt-0.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
              <p className="text-es-xs text-es-text-secondary leading-relaxed">
                This signature proves wallet ownership without revealing your
                private key. We never hold funds or request spending
                permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center space-y-2">
          <p className="text-es-xs text-es-text-muted">
            New merchant?{" "}
            <a
              href="/merchant/register"
              className="text-es-blue hover:underline font-medium"
            >
              Register your business
            </a>
          </p>
          <p className="text-es-xs text-es-text-muted">
            © 2026 Openway Protocol
          </p>
        </div>
      </div>
    </div>
  );
}
