"use client";

import { Building2, Calendar, RefreshCw, Code2, Download, ShieldAlert, BarChart3, AlertOctagon, ShieldCheck } from "lucide-react";
import { ExtractionResult } from "@/types";
import { exportMetricsToCSV, exportSummaryAsJSON } from "@/lib/utils";

interface AuditSummaryCardProps {
  result: ExtractionResult;
  onOpenJson: () => void;
  onReset: () => void;
}

export function AuditSummaryCard({
  result,
  onOpenJson,
  onReset,
}: AuditSummaryCardProps) {
  const { is_approved, revision_count, audit_feedback, data } = result;

  const handleExportCSV = () => {
    exportMetricsToCSV(data.company_name, data.metrics || []);
  };

  const handleDownloadJSON = () => {
    exportSummaryAsJSON(data.company_name, result);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 transition-all">
      
      {/* Top Banner Status */}
      <div
        className={`p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6 transition-all ${
          is_approved
            ? "bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white border-emerald-200/90 text-emerald-950 shadow-2xs"
            : "bg-gradient-to-r from-amber-50 via-yellow-50/40 to-white border-amber-200/90 text-amber-950 shadow-2xs"
        }`}
      >
        <div className="flex items-start sm:items-center space-x-4">
          {is_approved ? (
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-sm shadow-emerald-500/10">
              <ShieldCheck className="w-7 h-7" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-sm shadow-amber-500/10">
              <ShieldAlert className="w-7 h-7" />
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {is_approved ? "Auditor Approved • Zero Discrepancy" : "Auditor Variance Flagged"}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                {revision_count} Revision Cycle{revision_count === 1 ? "" : "s"}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {audit_feedback ||
                (is_approved
                  ? "LangGraph verification agent successfully validated all extracted financial metrics against verbatim source text excerpts."
                  : "Auditor agent detected potential discrepancies between reported metrics and textual disclosures.")}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={handleDownloadJSON}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
            Save JSON
          </button>
          
          <button
            type="button"
            onClick={onOpenJson}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl transition-all shadow-2xs"
          >
            <Code2 className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
            Raw Payload
          </button>

          <button
            type="button"
            onClick={onReset}
            title="Upload another document"
            className="p-2 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Document Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Company Card */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 flex items-center space-x-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Reporting Entity</p>
            <p className="text-sm font-bold text-slate-900 truncate" title={data.company_name}>
              {data.company_name || "Unspecified Entity"}
            </p>
          </div>
        </div>

        {/* Fiscal Period Card */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 flex items-center space-x-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Fiscal Period</p>
            <p className="text-sm font-bold text-slate-900 truncate">
              {data.reporting_period || "Full Year / Quarter"}
            </p>
          </div>
        </div>

        {/* Metrics Count Card */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 flex items-center space-x-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Verified Metrics</p>
            <p className="text-sm font-bold text-emerald-700 font-mono">
              {data.metrics?.length || 0} Parameters
            </p>
          </div>
        </div>

        {/* Risk Flags Count Card */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 flex items-center space-x-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Risk Flags</p>
            <p className="text-sm font-bold text-amber-800 font-mono">
              {data.key_risks?.length || 0} Disclosures
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
