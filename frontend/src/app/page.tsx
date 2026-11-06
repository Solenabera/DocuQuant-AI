"use client";

import { useState } from "react";
import { useExtraction } from "@/hooks/useExtraction";
import { DocumentUploader } from "@/components/DocumentUploader";
import { ProcessingStepper } from "@/components/ProcessingStepper";
import { AuditSummaryCard } from "@/components/AuditSummaryCard";
import { MetricsTable } from "@/components/MetricsTable";
import { RiskFactorsCard } from "@/components/RiskFactorsCard";
import { RawJsonModal } from "@/components/RawJsonModal";
import { Sparkles, ShieldCheck, Zap, Layers, Lock, FileCheck2, Cpu } from "lucide-react";

export default function Dashboard() {
  const {
    file,
    setFile,
    status,
    details,
    result,
    errorMsg,
    elapsedSeconds,
    handleUpload,
    loadPreset,
    resetState,
  } = useExtraction();

  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  const isProcessing =
    status === "UPLOADING" ||
    status === "POLLING" ||
    status === "PARSING_DOCUMENT" ||
    status === "AI_EXTRACTION_AND_AUDIT";

  return (
    <div className="space-y-8">
      
      {/* Hero Banner / Value Proposition */}
      <div className="relative overflow-hidden p-6 sm:p-9 rounded-3xl bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/30 border border-slate-200/90 shadow-lg shadow-slate-200/50">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute -top-24 right-1/4 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Autonomous Self-Correcting Financial Auditor
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Financial Metric Extraction <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
                & Multi-Agent Compliance Audit
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Upload institutional disclosures (Form 10-K, 10-Q, quarterly earnings releases) to extract revenue, operating margins, EBITDA, and risk factors. An independent LangGraph auditor cross-references every parameter against verbatim source text to guarantee zero hallucinations.
            </p>
          </div>

          {/* Architecture Feature Badges */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <div className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-700 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Celery + Redis Async Queue</span>
            </div>
            <div className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-700 shadow-xs">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>LangGraph Multi-Agent Feedback</span>
            </div>
            <div className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-700 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Verbatim Citation Fidelity</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Ribbon */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Verification</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono">100% Grounded</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Worker Latency</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono">&lt; 2.5s Polling</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Hallucinations</p>
              <p className="text-xs sm:text-sm font-bold text-emerald-600 font-mono">0.0% Tolerance</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Circuit Breaker</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono">3 Cycles Max</p>
            </div>
          </div>
        </div>

      </div>

      {/* Upload Zone & Interactive Demo Selector */}
      <DocumentUploader
        file={file}
        setFile={setFile}
        onUpload={() => handleUpload()}
        onLoadPreset={loadPreset}
        isLoading={isProcessing}
      />

      {/* Stepper Progress Indicator */}
      <ProcessingStepper
        status={status}
        details={details}
        errorMsg={errorMsg}
        elapsedSeconds={elapsedSeconds}
        onReset={resetState}
      />

      {/* Audit Results View (Activated on SUCCESS) */}
      {status === "SUCCESS" && result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Executive Summary Card */}
          <AuditSummaryCard
            result={result}
            onOpenJson={() => setIsJsonModalOpen(true)}
            onReset={resetState}
          />

          {/* Grid Layout: Extracted Metrics Table (2 cols) & Risk Disclosures (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MetricsTable metrics={result.data.metrics || []} />
            </div>

            <div className="lg:col-span-1">
              <RiskFactorsCard risks={result.data.key_risks || []} />
            </div>
          </div>

        </div>
      )}

      {/* Raw JSON Modal Viewer */}
      <RawJsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        result={result}
      />

    </div>
  );
}
