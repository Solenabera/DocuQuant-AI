"use client";

import { useState, useRef } from "react";
import { FileUp, FileText, X, Play, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { formatBytes } from "@/library/utils";
import { DEMO_PRESETS } from "@/hooks/useExtraction";

interface DocumentUploaderProps {
  file: File | null;
  setFile: (file: File | null) => void;
  onUpload: () => void;
  onLoadPreset: (presetId: string) => void;
  isLoading: boolean;
}

export function DocumentUploader({
  file,
  setFile,
  onUpload,
  onLoadPreset,
  isLoading,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" || droppedFile.name.toLowerCase().endsWith(".pdf")) {
        setFile(droppedFile);
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 transition-all hover:border-slate-300/80">

      {/* Header and Quick Demo Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <FileUp className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Financial Document Ingestion
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Upload corporate financial disclosures (SEC 10-K, 10-Q, earnings releases) for layout-preserving table extraction and multi-agent audit verification.
          </p>
        </div>

        {/* Interactive Demo Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 flex items-center mr-1">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
            Demo Presets:
          </span>
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onLoadPreset(preset.id)}
              disabled={isLoading}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all disabled:opacity-50 shadow-2xs"
            >
              <span className="font-semibold text-slate-900 mr-1.5">{preset.ticker}</span>
              <span className="text-indigo-600 font-mono text-[11px] hidden sm:inline">{preset.period}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all ${isDragging
            ? "border-indigo-500 bg-indigo-50/70 scale-[1.005]"
            : file
              ? "border-emerald-300 bg-emerald-50/40 hover:border-emerald-400"
              : "border-slate-300 bg-slate-50/60 hover:border-indigo-400 hover:bg-slate-50/90"
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {file ? (
          <div className="flex flex-col items-center justify-center space-y-3.5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-500/10">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center justify-center space-x-2 text-slate-900 font-semibold text-base">
                <span>{file.name}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {formatBytes(file.size)} • PDF Ready for LangGraph Multi-Agent Audit
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="inline-flex items-center px-3 py-1 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Remove document
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-slate-200 text-indigo-600 shadow-2xs group-hover:scale-105 transition-transform">
              <FileUp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                <span className="text-indigo-600 font-semibold hover:underline">Click to browse file</span> or drag & drop PDF here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports certified PDF disclosures up to 50MB (10-K, 10-Q, 8-K, Earnings releases)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-500 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Pipeline:</span>
          <span className="text-slate-700 font-medium">pdfplumber Markdown</span>
          <ArrowRight className="w-3 h-3 text-slate-400 inline" />
          <span className="text-slate-700 font-medium">Extractor Agent</span>
          <ArrowRight className="w-3 h-3 text-slate-400 inline" />
          <span className="text-indigo-600 font-semibold">Compliance Auditor</span>
        </div>

        <button
          type="button"
          onClick={onUpload}
          disabled={!file || isLoading}
          className="inline-flex items-center justify-center px-7 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-[0.98] shadow-md shadow-indigo-600/25 hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Play className="w-4 h-4 mr-2 fill-current" />
          Start Extraction Pipeline
        </button>
      </div>

    </div>
  );
}
