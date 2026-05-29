"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = "Invalid credentials";
        try {
          const parsed = JSON.parse(text);
          msg = parsed.error || msg;
        } catch {
          msg = text || msg;
        }
        throw new Error(msg);
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-es-navy flex flex-col">
      {/* Top Bar — matches admin dashboard */}
      <header className="h-14 bg-es-navy border-b border-es-navy-light flex items-center px-4">
        <div className="flex items-center gap-2 max-w-es-container mx-auto w-full">
          <div className="w-7 h-7 rounded bg-es-blue flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
            </svg>
          </div>
          <span className="text-white font-bold text-es-lg tracking-tight">
            Openway
          </span>
          <span className="ml-2 px-1.5 py-0.5 bg-es-navy-light text-es-blue text-[10px] font-bold rounded">
            ADMIN
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px]">
          {/* Logo Block */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-es-blue to-es-blue-hover flex items-center justify-center mx-auto mb-4 shadow-lg shadow-es-blue/20">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Administrator Access
            </h1>
            <p className="text-es-sm text-white/50 mt-1.5">
              Openway Settlement Infrastructure
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-es-lg border border-es-border shadow-es-card overflow-hidden">
            <div className="p-6">
              <div className="mb-5">
                <h2 className="text-es-lg font-semibold text-es-text">
                  Sign In
                </h2>
                <p className="text-es-xs text-es-text-secondary mt-1">
                  Enter your credentials to access the control panel
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-es-xs font-semibold text-es-text uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full h-10 px-3 bg-es-bg border border-es-border rounded-es text-es-sm text-es-text placeholder-es-text-muted focus:border-es-blue focus:outline-none focus:ring-1 focus:ring-es-blue/20 transition-all"
                    placeholder="admin@openway.io"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-es-xs font-semibold text-es-text uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full h-10 px-3 pr-10 bg-es-bg border border-es-border rounded-es text-es-sm text-es-text focus:border-es-blue focus:outline-none focus:ring-1 focus:ring-es-blue/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-es-text-muted hover:text-es-text-secondary"
                    >
                      {showPassword ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.78 0 1.53-.09 2.24-.26" />
                          <path d="M2 2l20 20" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-es-border text-es-blue focus:ring-es-blue"
                    />
                    <span className="text-es-xs text-es-text-secondary">
                      Remember me
                    </span>
                  </label>
                  <a
                    href="#"
                    className="text-es-xs text-es-blue hover:underline font-medium"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-es-danger-bg border border-es-danger/20 rounded-es p-3 flex items-start gap-2.5">
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
                      {error}
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-es-blue hover:bg-es-blue-hover disabled:bg-es-text-muted text-white font-semibold rounded-es text-es-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading && (
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
                  <span>{loading ? "Authenticating..." : "Sign In"}</span>
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-es-bg border-t border-es-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-es-success" />
                <span className="text-es-xs text-es-text-secondary">
                  System Operational
                </span>
              </div>
              <span className="text-es-xs text-es-text-muted">v1.0.4</span>
            </div>
          </div>

          {/* Bottom Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-es-xs text-white/30">
              Protected by JWT authentication. All access is logged and audited.
            </p>
            <p className="text-es-xs text-white/20">© 2026 Openway Protocol</p>
          </div>
        </div>
      </main>
    </div>
  );
}
