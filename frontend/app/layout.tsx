import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Openway | B2B Cross-Border Settlement Infrastructure",
  description: "Non-custodial routing protocol for intra-African trade.",
  manifest: "/manifest.json",
  themeColor: "#0784C3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
