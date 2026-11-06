import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: "DocuQuant AI | Financial Audit & PDF Extraction Engine",
  description:
    "Autonomous Financial PDF Metric Extraction & Self-Correcting Multi-Agent Audit Engine powered by LangGraph, Celery & FastAPI.",
  keywords: [
    "Financial Extraction",
    "SEC 10-K Audit",
    "LangGraph Agents",
    "FastAPI",
    "Celery Worker",
    "Quantitative Audit",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
        {/* Soft Ambient Light Gradient & Mesh */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {/* Top Left Subtle Indigo Wash */}
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-500/8 rounded-full blur-[140px]" />
          {/* Top Right Subtle Violet Wash */}
          <div className="absolute -top-20 -right-20 w-[550px] h-[550px] bg-purple-500/8 rounded-full blur-[140px]" />
          {/* Subtle Sky Blue Glow */}
          <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-blue-400/6 rounded-full blur-[160px]" />
          {/* Delicate Dot Grid Accent */}
          <div className="absolute inset-0 light-dot-grid opacity-35" />
        </div>

        <Header />

        <main className="relative z-10 flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        <footer className="relative z-10 py-6 border-t border-slate-200/80 bg-white/70 backdrop-blur-md text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="font-medium text-slate-700">
                DocuQuant AI <span className="text-slate-400">•</span> Financial Intelligence & Compliance Platform
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono text-slate-500">
              <span>FastAPI 0.115</span>
              <span>•</span>
              <span>Celery 5.6</span>
              <span>•</span>
              <span>LangGraph v0.2</span>
              <span>•</span>
              <span className="text-emerald-600 font-sans font-medium">Zero Hallucinations</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
