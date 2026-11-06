"use client";

import { ShieldAlert, AlertCircle, ShieldCheck } from "lucide-react";
import { getRiskSeverity } from "@/library/utils";

interface RiskFactorsCardProps {
  risks: string[];
}

export function RiskFactorsCard({ risks }: RiskFactorsCardProps) {
  if (!risks || risks.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-lg shadow-slate-200/50">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Identified Risk Factors
        </h3>
        <p className="text-xs text-slate-500">
          No critical compliance, operational, or credit risk factors detected in this filing.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-lg shadow-slate-200/50 flex flex-col h-full transition-all">

      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Identified Risk Factors
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Key operational, regulatory, and market risks extracted by the auditor.
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          {risks.length} Flags
        </span>
      </div>

      {/* Risk Disclosures List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
        {risks.map((risk, idx) => {
          const { label, badgeClass, dotClass } = getRiskSeverity(risk);

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 flex flex-col space-y-2 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${dotClass}`} />
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">
                    DISCLOSURE 0{idx + 1}
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${badgeClass}`}>
                  {label}
                </span>
              </div>

              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 leading-relaxed font-sans">{risk}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
