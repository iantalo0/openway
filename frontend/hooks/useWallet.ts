"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getProvider,
  connectWallet,
  signMessage,
  buildAuthMessage,
  subscribeToEvents,
  type WalletState,
  type WalletProvider,
} from "@/lib/web3/client";

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    provider: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const provider = getProvider(state.provider);

  const refresh = useCallback(async () => {
    if (!provider) return;
    try {
      const accounts: string[] = await provider.request({
        method: "eth_accounts",
      });
      const chainId: string = await provider.request({ method: "eth_chainId" });
      if (accounts.length > 0) {
        setState((s) => ({
          ...s,
          address: accounts[0],
          chainId,
          isConnected: true,
          error: null,
        }));
      }
    } catch {
      // silent fail on refresh
    }
  }, [provider]);

  useEffect(() => {
    refresh();
    if (!provider) return;

    const unsubscribe = subscribeToEvents(provider, {
      onAccountsChanged: (accounts) => {
        if (accounts.length === 0) {
          setState({
            address: null,
            chainId: null,
            provider: null,
            isConnected: false,
            isConnecting: false,
            error: null,
          });
        } else {
          setState((s) => ({ ...s, address: accounts[0], isConnected: true }));
        }
      },
      onChainChanged: (chainId) => {
        setState((s) => ({ ...s, chainId }));
        window.location.reload();
      },
      onDisconnect: () => {
        setState({
          address: null,
          chainId: null,
          provider: null,
          isConnected: false,
          isConnecting: false,
          error: null,
        });
      },
    });

    return unsubscribe;
  }, [provider, refresh]);

  const connect = useCallback(async (type: WalletProvider = "metamask") => {
    setState((s) => ({
      ...s,
      isConnecting: true,
      error: null,
      provider: type,
    }));
    try {
      const { address, chainId } = await connectWallet(type);
      setState({
        address,
        chainId,
        provider: type,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
      return { address, chainId };
    } catch (err: any) {
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: err.message || "Connection failed",
        provider: null,
      }));
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      provider: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  const authenticate = useCallback(async () => {
    if (!state.address || !state.chainId) {
      throw new Error("Wallet not connected");
    }
    const message = buildAuthMessage(state.address, state.chainId);
    const signature = await signMessage(state.address, message, state.provider);
    return { message, signature, address: state.address };
  }, [state.address, state.chainId, state.provider]);

  return {
    ...state,
    connect,
    disconnect,
    authenticate,
    refresh,
  };
}
