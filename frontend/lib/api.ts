const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Request failed");
    let error: string;
    try {
      const parsed = JSON.parse(text);
      error = parsed.error || text;
    } catch {
      error = text;
    }
    throw new Error(error);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

// Admin APIs
export const getAdminStats = () => fetchApi<any>("/api/v1/admin/stats");
export const getAdminTransactions = () =>
  fetchApi<any[]>("/api/v1/admin/transactions");
export const getAdminNodes = () => fetchApi<any[]>("/api/v1/admin/nodes");
export const getTopMerchants = () =>
  fetchApi<any[]>("/api/v1/admin/merchants/top");

// Merchant APIs
export const getMerchantProfile = () =>
  fetchApi<any>("/api/v1/merchant/profile");
export const getMerchantBalance = () =>
  fetchApi<any>("/api/v1/merchant/balance");
export const getMerchantTransactions = () =>
  fetchApi<any[]>("/api/v1/merchant/transactions");

// Auth
export const getSession = () =>
  fetchApi<{ userId: string; role: string } | null>("/api/auth/session");
export const logoutApi = () =>
  fetchApi<void>("/api/auth/logout", { method: "POST" });

// ── Merchant Auth ──
export const loginMerchant = (
  address: string,
  message: string,
  signature: string,
) =>
  fetchApi<{ token: string; merchant: any }>("/api/auth/merchant", {
    method: "POST",
    body: JSON.stringify({ address, message, signature }),
  });

export const registerMerchant = (body: {
  wallet: string;
  businessName: string;
  email: string;
  country: string;
  phone: string;
  message: string;
  signature: string;
}) =>
  fetchApi<any>("/api/v1/merchant/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

// ── Payments ──
export const initiatePayment = (body: {
  recipient: string;
  amount: number;
  note?: string;
  currency?: string;
}) =>
  fetchApi<any>("/api/v1/payments", {
    method: "POST",
    body: JSON.stringify(body),
  });

// ── Settlements ──
export const createSettlement = (body: {
  recipientCountry: string;
  recipientPhone: string;
  amount: number;
  currency: string;
  purpose?: string;
}) =>
  fetchApi<any>("/api/v1/merchant/settlements", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getMerchantSettlements = () =>
  fetchApi<any[]>("/api/v1/merchant/settlements");

export const getSettlement = (id: string) =>
  fetchApi<any>(`/api/v1/merchant/settlements/${id}`);
