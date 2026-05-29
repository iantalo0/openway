// lib/auth.ts — thin wrapper that delegates to api.ts to avoid duplication
import {
  getSession as apiGetSession,
  loginMerchant as apiLoginMerchant,
} from "./api";

export const getSession = apiGetSession;
export const loginMerchant = apiLoginMerchant;
