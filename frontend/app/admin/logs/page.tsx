"use client";

import { useState } from "react";

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  trace?: string;
};

const LEVEL_COLORS: Record<
  LogLevel,
  { bg: string; text: string; dot: string }
> = {
  INFO: { bg: "bg-es-info-bg", text: "text-es-info", dot: "bg-es-info" },
  WARN: {
    bg: "bg-es-warning-bg",
    text: "text-es-warning",
    dot: "bg-es-warning",
  },
  ERROR: { bg: "bg-es-danger-bg", text: "text-es-danger", dot: "bg-es-danger" },
  DEBUG: {
    bg: "bg-es-bg-dark",
    text: "text-es-text-muted",
    dot: "bg-es-text-muted",
  },
};

export default function AdminLogsPage() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [logs] = useState<LogEntry[]>([]);

  return (
    <div className="space-y-5 max-w-es-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-es-2xl font-bold text-es-text">System Logs</h1>
          <p className="text-es-sm text-es-text-secondary mt-0.5">
            Real-time infrastructure and application logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-es-success animate-pulse" />
          <span className="text-es-xs text-es-text-secondary">Streaming</span>
        </div>
      </div>

      {/* Controls */}
      <div className="es-card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full h-9 pl-9 pr-3 bg-es-bg border border-es-border rounded-es text-es-sm text-es-text placeholder-es-text-muted focus:border-es-blue focus:outline-none"
            />
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
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as LogLevel | "all")}
            className="h-9 px-3 bg-es-bg border border-es-border rounded-es text-es-sm text-es-text focus:border-es-blue focus:outline-none"
          >
            <option value="all">All Levels</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warn</option>
            <option value="ERROR">Error</option>
            <option value="DEBUG">Debug</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="h-9 px-3 bg-es-bg border border-es-border rounded-es text-es-sm text-es-text focus:border-es-blue focus:outline-none"
          >
            <option value="all">All Services</option>
            <option value="api">API</option>
            <option value="settlement">Settlement</option>
            <option value="auth">Auth</option>
            <option value="webhook">Webhook</option>
          </select>

          <button className="h-9 px-3 bg-es-bg border border-es-border rounded-es text-es-text-secondary hover:bg-es-bg-hover flex items-center gap-1.5">
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
            <span className="text-es-xs">Export</span>
          </button>

          <button className="h-9 px-3 bg-es-bg border border-es-border rounded-es text-es-text-secondary hover:bg-es-bg-hover">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Logs Display */}
      <div className="es-card overflow-hidden">
        {logs.length === 0 ? (
          <EmptyLogsState />
        ) : (
          <div className="divide-y divide-es-border">
            {logs.map((log, i) => (
              <div
                key={i}
                className="px-4 py-3 hover:bg-es-bg-hover transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${LEVEL_COLORS[log.level].dot}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${LEVEL_COLORS[log.level].bg} ${LEVEL_COLORS[log.level].text}`}
                      >
                        {log.level}
                      </span>
                      <span className="text-es-xs text-es-text-muted font-mono">
                        {log.timestamp}
                      </span>
                      <span className="text-es-xs text-es-text-secondary font-mono">
                        [{log.service}]
                      </span>
                    </div>
                    <p className="text-es-sm text-es-text">{log.message}</p>
                    {log.trace && (
                      <pre className="mt-2 p-2 bg-es-bg-dark rounded text-es-xs text-es-text-secondary font-mono overflow-x-auto">
                        {log.trace}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyLogsState() {
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
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
      </div>
      <h3 className="text-es-lg font-semibold text-es-text mb-2">
        No Logs Available
      </h3>
      <p className="text-es-sm text-es-text-secondary max-w-sm mx-auto mb-6">
        System logs will appear here once the application starts processing
        requests and generating telemetry.
      </p>
      <div className="flex items-center justify-center gap-6 text-es-xs text-es-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-success" />
          Logger Initialized
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-blue" />
          Zerolog Active
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-es-purple" />
          Structured JSON
        </div>
      </div>
    </div>
  );
}
