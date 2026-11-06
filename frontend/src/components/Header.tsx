"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Cpu, BookOpen, Sparkles, ExternalLink } from "lucide-react";
import { checkHealth, API_DOCS_URL } from "@/lib/api";

export function Header() {
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const verifyHealth = async () => {
      const healthy = await checkHealth();
      if (isMounted) setIsBackendHealthy(healthy);
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20 ring-1 ring-black/5">
              <ShieldCheck className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  DocuQuant <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI</span>
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-600" /> Enterprise v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Autonomous Financial PDF Extraction & Multi-Agent Compliance Audit
              </p>
            </div>
          </div>

          {/* Right Action & Status Area */}
          <div className="flex items-center space-x-3 sm:space-x-4">

            {/* Tech Stack Chip */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-600">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-slate-500 font-medium">Engine:</span>
              <span className="text-slate-800 font-mono text-[11px]">FastAPI • Celery • LangGraph</span>
            </div>

            {/* API Documentation Link - Clean URL & Standard Label */}
            <a
              href={API_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Open FastAPI Swagger Interactive Documentation"
              className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-indigo-300 text-xs font-medium text-slate-700 hover:text-indigo-600 transition-all shadow-xs group"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-indigo-600 group-hover:text-indigo-500" />
              <span>API Documentation</span>
              <ExternalLink className="w-3 h-3 ml-1 text-slate-400 group-hover:text-indigo-500" />
            </a>

            {/* Live Backend Status Badge */}
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isBackendHealthy === true
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs"
                  : isBackendHealthy === false
                    ? "bg-rose-50 text-rose-700 border-rose-200 shadow-xs"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
            >
              <span className="relative flex h-2 w-2">
                {isBackendHealthy === true && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${isBackendHealthy === true
                      ? "bg-emerald-500"
                      : isBackendHealthy === false
                        ? "bg-rose-500"
                        : "bg-slate-400"
                    }`}
                />
              </span>
              <span className="font-medium text-[11px]">
                {isBackendHealthy === true
                  ? "Backend Online"
                  : isBackendHealthy === false
                    ? "Demo Mode (Offline)"
                    : "Checking API..."}
              </span>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
