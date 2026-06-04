import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Billify — Invoice & Tenancy Receipt Generator",
  description: "Professional IT invoices and tenancy receipts. VAT 21%/9%/0%, KvK, IBAN, 6 templates, save & resume.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
