"use client";

import { useState } from "react";

type ApiEndpoint = {
  method: string;
  path: string;
  description: string;
  auth: boolean;
};

type DeveloperTool = {
  name: string;
  description: string;
  icon: string;
  href: string;
  status: "live" | "beta" | "coming";
};

const ENDPOINTS: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api/auth/merchant",
    description: "Authenticate merchant via wallet signature",
    auth: false,
  },
  {
    method: "POST",
    path: "/api/auth/admin",
    description: "Administrator email/password login",
    auth: false,
  },
  {
    method: "GET",
    path: "/api/v1/merchant/profile",
    description: "Get authenticated merchant profile",
    auth: true,
  },
  {
    method: "GET",
    path: "/api/v1/merchant/balance",
    description: "Available and pending balance",
    auth: true,
  },
  {
    method: "GET",
    path: "/api/v1/merchant/transactions",
    description: "Merchant settlement history",
    auth: true,
  },
  {
    method: "GET",
    path: "/api/v1/admin/stats",
    description: "Dashboard statistics aggregation",
    auth: true,
  },
  {
    method: "GET",
    path: "/api/v1/admin/transactions",
    description: "All network settlements",
    auth: true,
  },
  {
    method: "GET",
    path: "/api/v1/admin/nodes",
    description: "Relayer node health status",
    auth: true,
  },
  {
    method: "GET",
    path: "/api/v1/admin/merchants/top",
    description: "Top merchants by volume",
    auth: true,
  },
  {
    method: "POST",
    path: "/api/v1/nodes/heartbeat",
    description: "Relayer node heartbeat ping",
    auth: false,
  },
  {
    method: "GET",
    path: "/api/v1/nodes",
    description: "Public node listing",
    auth: false,
  },
  {
    method: "GET",
    path: "/health",
    description: "Service health check",
    auth: false,
  },
];

const TOOLS: DeveloperTool[] = [
  {
    name: "API Plans",
    description: "Rate limits, quotas, and pricing tiers",
    icon: "plans",
    href: "#",
    status: "live",
  },
  {
    name: "API Documentation",
    description: "Interactive OpenAPI/Swagger reference",
    icon: "docs",
    href: "#",
    status: "live",
  },
  {
    name: "Code Reader",
    description: "Decode settlement intent calldata",
    icon: "code",
    href: "#",
    status: "beta",
  },
  {
    name: "Verify Contract",
    description: "Verify and publish source code",
    icon: "verify",
    href: "#",
    status: "coming",
  },
  {
    name: "Contract Diff Checker",
    description: "Compare deployed contract versions",
    icon: "diff",
    href: "#",
    status: "coming",
  },
  {
    name: "Broadcast Transaction",
    description: "Submit raw signed transactions",
    icon: "broadcast",
    href: "#",
    status: "live",
  },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "endpoints" | "keys" | "webhooks" | "network" | "tools"
  >("endpoints");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey = "ow_live_51H8m...9xK2p"; // In production, fetch from backend

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "endpoints" as const, label: "Endpoints", count: ENDPOINTS.length },
    { id: "keys" as const, label: "API Keys", count: 1 },
    { id: "webhooks" as const, label: "Webhooks", count: 2 },
    { id: "network" as const, label: "Network", count: null },
    { id: "tools" as const, label: "Developer Tools", count: TOOLS.length },
  ];

  return (
    <div className="space-y-5 max-w-es-container">
      {/* Header */}
      <div>
        <h1 className="text-es-2xl font-bold text-es-text">
          API Configuration
        </h1>
        <p className="text-es-sm text-es-text-secondary mt-0.5">
          Endpoints, authentication, and developer tools for Openway integration
        </p>
      </div>

      {/* Environment Banner */}
      <div className="flex items-center gap-4 p-4 bg-es-navy rounded-es border border-es-navy-light">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-es-success animate-pulse" />
          <span className="text-es-sm font-medium text-white">Production</span>
        </div>
        <div className="h-4 w-px bg-es-navy-light" />
        <span className="text-es-xs text-white/60">Celo Alfajores Testnet</span>
        <span className="text-es-xs text-white/60 ml-auto">
          Protocol v1.0.4
        </span>
      </div>

      {/* Tabs */}
      <div className="es-card overflow-hidden">
        <div className="border-b border-es-border bg-es-bg">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-es-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-es-blue text-es-blue bg-white"
                    : "border-transparent text-es-text-secondary hover:text-es-text hover:bg-es-bg-hover"
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeTab === tab.id ? "bg-es-blue text-white" : "bg-es-bg-dark text-es-text-muted"}`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {activeTab === "endpoints" && <EndpointsTab />}
          {activeTab === "keys" && (
            <KeysTab
              apiKey={apiKey}
              showKey={showKey}
              setShowKey={setShowKey}
              copied={copied}
              copyKey={copyKey}
            />
          )}
          {activeTab === "webhooks" && <WebhooksTab />}
          {activeTab === "network" && <NetworkTab />}
          {activeTab === "tools" && <ToolsTab />}
        </div>
      </div>
    </div>
  );
}

/* Sub-tabs */

function EndpointsTab() {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? ENDPOINTS : ENDPOINTS.filter((e) => e.method === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {["all", "GET", "POST"].map((m) => (
          <button
            key={m}
            onClick={() => setFilter(m)}
            className={`px-3 py-1 rounded-es text-es-xs font-medium transition-colors ${
              filter === m
                ? "bg-es-blue text-white"
                : "bg-es-bg text-es-text-secondary hover:bg-es-bg-hover"
            }`}
          >
            {m === "all" ? "All Methods" : m}
          </button>
        ))}
      </div>

      <div className="border border-es-border rounded-es overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-es-border bg-es-bg">
              <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                Method
              </th>
              <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                Endpoint
              </th>
              <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                Description
              </th>
              <th className="text-left px-4 py-2.5 text-es-xs font-semibold text-es-text-secondary uppercase">
                Auth
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ep, i) => (
              <tr
                key={i}
                className="border-b border-es-border hover:bg-es-bg-hover transition-colors"
              >
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ep.method === "GET"
                        ? "bg-es-success-bg text-es-success"
                        : "bg-es-blue-faint text-es-blue"
                    }`}
                  >
                    {ep.method}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="es-mono text-es-sm text-es-blue">
                    {ep.path}
                  </code>
                </td>
                <td className="px-4 py-3 text-es-sm text-es-text">
                  {ep.description}
                </td>
                <td className="px-4 py-3">
                  {ep.auth ? (
                    <span className="es-badge-info">JWT Required</span>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-es-bg-dark text-es-text-muted">
                      Public
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KeysTab({
  apiKey,
  showKey,
  setShowKey,
  copied,
  copyKey,
}: {
  apiKey: string;
  showKey: boolean;
  setShowKey: (v: boolean) => void;
  copied: boolean;
  copyKey: () => void;
}) {
  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <label className="block text-es-xs font-semibold text-es-text uppercase tracking-wider mb-2">
          Production API Key
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              readOnly
              className="w-full h-10 px-3 pr-20 bg-es-bg border border-es-border rounded-es text-es-sm font-mono text-es-text"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-2 text-es-xs text-es-text-secondary hover:text-es-text"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          <button
            onClick={copyKey}
            className={`px-4 h-10 rounded-es text-es-xs font-medium transition-colors flex items-center gap-1.5 ${
              copied
                ? "bg-es-success text-white"
                : "bg-es-blue text-white hover:bg-es-blue-hover"
            }`}
          >
            {copied ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <p className="text-es-xs text-es-text-muted mt-1.5">
          Last used: 2 minutes ago • Created: May 15, 2026
        </p>
      </div>

      <div className="p-4 bg-es-warning-bg border border-es-warning/20 rounded-es">
        <div className="flex items-start gap-2.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#B45309"
            strokeWidth="2"
            className="shrink-0 mt-0.5"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" x2="12" y1="9" y2="13" />
            <line x1="12" x2="12.01" y1="17" y2="17" />
          </svg>
          <div>
            <p className="text-es-sm font-medium text-es-warning">
              Keep your key secure
            </p>
            <p className="text-es-xs text-es-text-secondary mt-0.5">
              Never expose this key in client-side code. Use environment
              variables or a secrets manager.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-es-border pt-4">
        <h3 className="text-es-sm font-semibold text-es-text mb-3">
          Rate Limits
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Requests/min", value: "1,000", usage: 45 },
            { label: "Requests/hour", value: "50,000", usage: 12 },
            { label: "Burst limit", value: "100", usage: 0 },
          ].map((limit) => (
            <div
              key={limit.label}
              className="p-3 bg-es-bg rounded-es border border-es-border"
            >
              <p className="text-es-xs text-es-text-secondary">{limit.label}</p>
              <p className="text-es-lg font-bold text-es-text mt-1">
                {limit.value}
              </p>
              <div className="mt-2 h-1.5 bg-es-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-es-blue rounded-full"
                  style={{ width: `${limit.usage}%` }}
                />
              </div>
              <p className="text-es-xs text-es-text-muted mt-1">
                {limit.usage}% used
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WebhooksTab() {
  const [webhooks] = useState([
    {
      url: "https://api.openway.io/v1/webhooks/settlement",
      events: ["settlement.completed", "settlement.failed"],
      active: true,
      lastDelivery: "200 OK • 2s ago",
    },
    {
      url: "https://backup.openway.io/webhooks",
      events: ["merchant.registered"],
      active: false,
      lastDelivery: "Failed • 1h ago",
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-es-sm text-es-text-secondary">
          Configure callback URLs for real-time event notifications
        </p>
        <button className="px-3 py-1.5 bg-es-blue text-white rounded-es text-es-xs font-medium hover:bg-es-blue-hover">
          Add Webhook
        </button>
      </div>

      {webhooks.map((wh, i) => (
        <div
          key={i}
          className="p-4 border border-es-border rounded-es hover:border-es-border-dark transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${wh.active ? "bg-es-success" : "bg-es-danger"}`}
              />
              <code className="es-mono text-es-sm text-es-text">{wh.url}</code>
            </div>
            <span
              className={`text-es-xs ${wh.active ? "text-es-success" : "text-es-danger"}`}
            >
              {wh.lastDelivery}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {wh.events.map((e) => (
              <span
                key={e}
                className="px-2 py-0.5 bg-es-bg-dark rounded text-es-xs text-es-text-secondary font-mono"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function NetworkTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        {
          label: "RPC Endpoint",
          value: "https://alfajores-forno.celo-testnet.org",
          type: "url",
        },
        { label: "Chain ID", value: "44787 (0xaef3)", type: "text" },
        {
          label: "Block Explorer",
          value: "https://alfajores.celoscan.io",
          type: "url",
        },
        { label: "Currency Symbol", value: "CELO", type: "text" },
        { label: "Currency Decimals", value: "18", type: "text" },
        { label: "Native Token", value: "Celo", type: "text" },
      ].map((item) => (
        <div
          key={item.label}
          className="p-4 bg-es-bg rounded-es border border-es-border"
        >
          <label className="block text-es-xs font-semibold text-es-text-secondary uppercase tracking-wider mb-1.5">
            {item.label}
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 es-mono text-es-sm text-es-text truncate">
              {item.value}
            </code>
            <button className="p-1.5 text-es-text-muted hover:text-es-blue transition-colors">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      <div className="md:col-span-2 p-4 bg-es-blue-faint border border-es-blue-light rounded-es">
        <div className="flex items-start gap-3">
          <svg
            width="16"
            height="16"
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
              Network Status
            </p>
            <p className="text-es-xs text-es-text-secondary mt-0.5">
              Connected to Celo Alfajores Testnet. All relayer nodes
              operational. Average block time: 5.2s. Gas price: 0.05 gwei.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {TOOLS.map((tool) => (
        <button
          key={tool.name}
          className="p-4 border border-es-border rounded-es hover:border-es-blue hover:shadow-es-card transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-es-bg-dark flex items-center justify-center group-hover:bg-es-blue-faint transition-colors">
              <ToolIcon name={tool.icon} />
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                tool.status === "live"
                  ? "bg-es-success-bg text-es-success"
                  : tool.status === "beta"
                    ? "bg-es-warning-bg text-es-warning"
                    : "bg-es-bg-dark text-es-text-muted"
              }`}
            >
              {tool.status}
            </span>
          </div>
          <h3 className="text-es-sm font-semibold text-es-text group-hover:text-es-blue transition-colors">
            {tool.name}
          </h3>
          <p className="text-es-xs text-es-text-secondary mt-1">
            {tool.description}
          </p>
        </button>
      ))}
    </div>
  );
}

function ToolIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    plans: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6C757D"
        strokeWidth="2"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    docs: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6C757D"
        strokeWidth="2"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    code: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6C757D"
        strokeWidth="2"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    verify: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6C757D"
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    diff: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6C757D"
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="M2 12h20" />
      </svg>
    ),
    broadcast: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6C757D"
        strokeWidth="2"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  };
  return icons[name] || icons.docs;
}
