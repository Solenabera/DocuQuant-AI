"use client";

import { Loader2, CheckCircle2, AlertTriangle, FileSearch, Bot, Database, Clock, ShieldCheck } from "lucide-react";
import { ExtractionStatus } from "@/types";

interface ProcessingStepperProps {
  status: ExtractionStatus;
  details: string;
  errorMsg: string;
  elapsedSeconds?: number;
  onReset: () => void;
}

export function ProcessingStepper({
  status,
  details,
  errorMsg,
  elapsedSeconds = 0,
  onReset,
}: ProcessingStepperProps) {
  if (status === "IDLE") return null;

  const steps = [
    {
      key: "UPLOAD",
      title: "Document Uploaded",
      desc: "FastAPI multipart validation & disk persistence",
      icon: Database,
      isDone: true,
      isActive: status === "UPLOADING",
    },
    {
      key: "PARSING",
      title: "Table & OCR Parsing",
      desc: "pdfplumber tabular markdown reconstruction",
      icon: FileSearch,
      isDone: status === "AI_EXTRACTION_AND_AUDIT" || status === "SUCCESS",
      isActive: status === "PARSING_DOCUMENT" || status === "POLLING",
    },
    {
      key: "AGENT",
      title: "LangGraph Multi-Agent Audit",
      desc: "Extractor Specialist ↔ Compliance Auditor",
      icon: Bot,
      isDone: status === "SUCCESS",
      isActive: status === "AI_EXTRACTION_AND_AUDIT",
    },
    {
      key: "COMPLETE",
      title: "Audited & Verified",
      desc: "Financial data & verbatim quotes verified",
      icon: ShieldCheck,
      isDone: status === "SUCCESS",
      isActive: false,
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-lg shadow-slate-200/50 transition-all">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3.5">
          {status === "SUCCESS" ? (
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-500/10">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : status === "ERROR" ? (
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm shadow-rose-500/10">
              <AlertTriangle className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {status === "SUCCESS"
                  ? "Pipeline Execution Completed"
                  : status === "ERROR"
                  ? "Pipeline Execution Halted"
                  : "Processing Document Pipeline..."}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                {status}
              </span>
            </div>
            <p className="text-xs text-indigo-600 font-mono mt-1">
              {details || "Orchestrating asynchronous worker tasks across Celery & Redis"}
            </p>
          </div>
        </div>

        {/* Status Pills and Reset Button */}
        <div className="flex items-center space-x-3">
          {elapsedSeconds > 0 && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>{elapsedSeconds}s elapsed</span>
            </div>
          )}

          {status === "ERROR" && (
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors border border-slate-300"
            >
              Try Again
            </button>
          )}
        </div>
      </div>

      {/* Error Callout */}
      {status === "ERROR" && errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2 font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4-Step Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;

          return (
            <div
              key={step.key}
              className={`relative p-4 rounded-2xl border transition-all ${
                step.isDone
                  ? "bg-emerald-50/60 border-emerald-200 shadow-2xs"
                  : step.isActive
                  ? "bg-indigo-50/70 border-indigo-300 shadow-md shadow-indigo-100 ring-1 ring-indigo-200"
                  : "bg-slate-50/70 border-slate-200/80 opacity-75"
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    step.isDone
                      ? "bg-emerald-100 text-emerald-700"
                      : step.isActive
                      ? "bg-indigo-100 text-indigo-700 animate-pulse"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-semibold text-slate-400">
                  STEP 0{idx + 1}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 mb-1">{step.title}</h4>
              <p className="text-[11px] text-slate-500 leading-snug">{step.desc}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
