export const CELO_ALFAJORES = {
  chainId: "0xaef3", // 44787 decimal
  chainName: "Celo Alfajores Testnet",
  nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
  blockExplorerUrls: ["https://alfajores.celoscan.io/"],
};

export type WalletProvider = "metamask" | "coinbase" | null;

export type WalletState = {
  address: string | null;
  chainId: string | null;
  provider: WalletProvider;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
};

// ── Provider Detection ──

export function getMetaMaskProvider(): any | null {
  if (typeof window === "undefined") return null;
  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;
  // Coinbase also sets isMetaMask=true, so check isCoinbaseWallet first
  if (ethereum.isCoinbaseWallet) return null;
  return (
    ethereum.providers?.find((p: any) => p.isMetaMask && !p.isCoinbaseWallet) ||
    ethereum
  );
}

export function getCoinbaseProvider(): any | null {
  if (typeof window === "undefined") return null;
  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;
  if (ethereum.isCoinbaseWallet) return ethereum;
  return ethereum.providers?.find((p: any) => p.isCoinbaseWallet) || null;
}

export function getProvider(type: WalletProvider = "metamask"): any | null {
  if (type === "coinbase") return getCoinbaseProvider();
  return getMetaMaskProvider();
}

// ── Chain Switching ──

export async function switchToCelo(provider: any): Promise<void> {
  if (!provider) throw new Error("No provider");
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CELO_ALFAJORES.chainId }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [CELO_ALFAJORES],
      });
    } else {
      throw switchError;
    }
  }
}

// ── Connection ──

export async function connectMetaMask(): Promise<{
  address: string;
  chainId: string;
}> {
  const provider = getMetaMaskProvider();
  if (!provider) {
    throw new Error(
      "MetaMask not detected. Please install MetaMask or use Coinbase Wallet.",
    );
  }

  const accounts: string[] = await provider.request({
    method: "eth_requestAccounts",
  });
  if (!accounts || accounts.length === 0) {
    throw new Error("Wallet connection rejected.");
  }

  try {
    await switchToCelo(provider);
  } catch (err: any) {
    console.warn("Celo switch failed:", err.message);
  }

  const chainId: string = await provider.request({ method: "eth_chainId" });
  return { address: accounts[0], chainId };
}

export async function connectCoinbase(): Promise<{
  address: string;
  chainId: string;
}> {
  const provider = getCoinbaseProvider();
  if (!provider) {
    throw new Error(
      "Coinbase Wallet not detected. Please install Coinbase Wallet extension or scan QR with mobile app.",
    );
  }

  const accounts: string[] = await provider.request({
    method: "eth_requestAccounts",
  });
  if (!accounts || accounts.length === 0) {
    throw new Error("Wallet connection rejected.");
  }

  // Coinbase has native Celo support, but try to switch just in case
  try {
    await switchToCelo(provider);
  } catch (err: any) {
    console.warn("Celo switch on Coinbase:", err.message);
    // Coinbase may already be on Celo, continue
  }

  const chainId: string = await provider.request({ method: "eth_chainId" });
  return { address: accounts[0], chainId };
}

export async function connectWallet(
  type: WalletProvider = "metamask",
): Promise<{
  address: string;
  chainId: string;
}> {
  if (type === "coinbase") return connectCoinbase();
  return connectMetaMask();
}

// ── Signing ──

export async function signMessage(
  address: string,
  message: string,
  providerType: WalletProvider = "metamask",
): Promise<string> {
  const provider = getProvider(providerType);
  if (!provider) throw new Error("Wallet not connected");

  const params = [message, address];

  try {
    const signature: string = await provider.request({
      method: "personal_sign",
      params,
    });
    return signature;
  } catch (err: any) {
    if (err.code === 4001) {
      throw new Error("Signature request was cancelled.");
    }
    if (err.code === -32002) {
      throw new Error(
        "A signature request is already pending. Check your wallet.",
      );
    }
    if (err.message?.includes("params") || err.code === -32602) {
      try {
        const signature: string = await provider.request({
          method: "personal_sign",
          params: [params[1], params[0]],
        });
        return signature;
      } catch (retryErr: any) {
        throw new Error(`Signature failed: ${retryErr.message}`);
      }
    }
    throw err;
  }
}

export function buildAuthMessage(address: string, chainId: string): string {
  const timestamp = Date.now();
  const networkName =
    chainId === CELO_ALFAJORES.chainId
      ? CELO_ALFAJORES.chainName
      : `Chain ${chainId}`;
  return `Sign this message to authenticate with Openway.\n\nThis signature proves you own this wallet without revealing your private key.\n\nNetwork: ${networkName}\nWallet: ${address}\nTimestamp: ${timestamp}`;
}

// ── Events ──

export function subscribeToEvents(
  provider: any,
  handlers: {
    onAccountsChanged?: (accounts: string[]) => void;
    onChainChanged?: (chainId: string) => void;
    onDisconnect?: () => void;
  },
): () => void {
  if (!provider) return () => {};

  if (handlers.onAccountsChanged)
    provider.on("accountsChanged", handlers.onAccountsChanged);
  if (handlers.onChainChanged)
    provider.on("chainChanged", handlers.onChainChanged);
  if (handlers.onDisconnect) provider.on("disconnect", handlers.onDisconnect);

  return () => {
    if (handlers.onAccountsChanged)
      provider.removeListener("accountsChanged", handlers.onAccountsChanged);
    if (handlers.onChainChanged)
      provider.removeListener("chainChanged", handlers.onChainChanged);
    if (handlers.onDisconnect)
      provider.removeListener("disconnect", handlers.onDisconnect);
  };
}
