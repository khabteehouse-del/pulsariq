import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "PulsarIQ — Enterprise AI", template: "%s | PulsarIQ" },
  description: "Upload any document. Ask any question. PulsarIQ searches your enterprise knowledge base with AI — precise answers with exact citations.",
  openGraph: {
    type: "website",
    title: "PulsarIQ — Enterprise AI",
    description: "Your enterprise knowledge, pulsing with intelligence.",
    siteName: "PulsarIQ",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080F",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.variable + " font-sans antialiased bg-void-950 text-slate-100"}>
        {children}
        <Toaster
          position="bottom-right"
          expand
          richColors
          toastOptions={{
            style: {
              background: "rgba(13,15,28,0.96)",
              border: "1px solid rgba(99,102,241,0.2)",
              color: "#F1F5F9",
              backdropFilter: "blur(24px)",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
