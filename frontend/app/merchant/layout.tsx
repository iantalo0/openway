import Link from "next/link";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-etherscan-bg-body flex flex-col">
      <header className="h-14 bg-etherscan-bg-card border-b border-etherscan-border flex items-center justify-between px-4 sticky top-0 z-10">
        <span className="text-etherscan-base font-bold text-etherscan-blue">
          Openway
        </span>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-etherscan-success" />
          <span className="text-etherscan-xs text-etherscan-text-secondary">
            Online
          </span>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-etherscan-bg-card border-t border-etherscan-border flex justify-around items-center h-16 z-10">
        <Link
          href="/merchant/portal"
          className="flex flex-col items-center space-y-1 text-etherscan-blue"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <span className="text-[10px] font-medium">Portal</span>
        </Link>
        <Link
          href="/merchant/scan"
          className="flex flex-col items-center space-y-1 text-etherscan-text-secondary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <rect x="7" y="7" width="10" height="10" rx="1" />
          </svg>
          <span className="text-[10px] font-medium">Scan</span>
        </Link>
        <Link
          href="/merchant/history"
          className="flex flex-col items-center space-y-1 text-etherscan-text-secondary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
          <span className="text-[10px] font-medium">History</span>
        </Link>
      </nav>
    </div>
  );
}
