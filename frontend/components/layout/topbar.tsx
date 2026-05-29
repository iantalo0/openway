"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <header className="h-14 bg-es-navy border-b border-es-navy-light flex items-center px-4 sticky top-0 z-50">
      <div className="flex items-center gap-6 w-full max-w-es-container mx-auto">
        {/* Logo */}
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 shrink-0"
        >
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
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Tx Hash, Telco Reference, or Wallet Address..."
              className="w-full h-9 pl-3 pr-24 bg-es-navy-dark border border-es-navy-light rounded-es text-es-sm text-white placeholder-es-text-muted focus:outline-none focus:border-es-blue transition-colors"
            />
            <button className="absolute right-1 top-1 bottom-1 px-3 bg-es-blue hover:bg-es-blue-hover text-white text-es-xs font-medium rounded transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Network Badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-es-navy-dark rounded border border-es-navy-light">
            <span className="w-2 h-2 rounded-full bg-es-success animate-pulse" />
            <span className="text-es-xs font-medium text-white">
              Celo Alfajores
            </span>
          </div>

          {/* Block Number */}
          <div className="hidden md:flex items-center gap-1.5 text-es-sm text-es-text-muted">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span className="es-mono text-white">24,901,223</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-white/70 hover:text-white hover:bg-es-navy-light rounded transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-es-danger" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-es-lg border border-es-border shadow-es-dropdown overflow-hidden">
                <div className="px-4 py-3 border-b border-es-border flex items-center justify-between">
                  <span className="text-es-sm font-semibold text-es-text">
                    Notifications
                  </span>
                  <button className="text-es-xs text-es-blue hover:underline">
                    Mark all read
                  </button>
                </div>
                <div className="py-8 text-center">
                  <p className="text-es-sm text-es-text-secondary">
                    No new notifications
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pr-2 rounded hover:bg-es-navy-light transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-es-blue to-es-blue-hover flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                className={`transition-transform ${profileOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-es-lg border border-es-border shadow-es-dropdown overflow-hidden">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-es-border bg-es-bg">
                  <p className="text-es-sm font-semibold text-es-text">
                    Administrator
                  </p>
                  <p className="text-es-xs text-es-text-secondary mt-0.5">
                    admin@openway.io
                  </p>
                  <span className="inline-flex mt-1.5 px-1.5 py-0.5 bg-es-navy text-white text-[10px] font-bold rounded">
                    ADMIN
                  </span>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2 text-es-sm text-es-text hover:bg-es-bg-hover transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2.5 px-4 py-2 text-es-sm text-es-text hover:bg-es-bg-hover transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    API Configuration
                  </Link>
                  <Link
                    href="/admin/logs"
                    className="flex items-center gap-2.5 px-4 py-2 text-es-sm text-es-text hover:bg-es-bg-hover transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    System Logs
                  </Link>
                </div>

                <div className="border-t border-es-border py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-es-sm text-es-danger hover:bg-es-danger-bg transition-colors"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
