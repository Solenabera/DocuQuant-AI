"use client";

import { useState, useMemo } from "react";
import { Search, Copy, Check, Quote, BarChart2, CheckCircle2, Filter } from "lucide-react";
import { FinancialMetric, MetricCategory } from "@/types";

interface MetricsTableProps {
  metrics: FinancialMetric[];
}

const CATEGORIES: MetricCategory[] = [
  "All",
  "Revenue & Growth",
  "Profitability & Margins",
  "Cash Flow & Liquidity",
  "Per Share",
];

export function MetricsTable({ metrics }: MetricsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MetricCategory>("All");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const filteredMetrics = useMemo(() => {
    return metrics.filter((m) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        m.metric_name.toLowerCase().includes(query) ||
        m.value.toLowerCase().includes(query) ||
        m.period.toLowerCase().includes(query) ||
        m.source_quote.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "All" ||
        (m.category && m.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [metrics, searchTerm, selectedCategory]);

  const handleCopyQuote = (quote: string, index: number) => {
    navigator.clipboard.writeText(quote);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 transition-all">
      
      {/* Header Bar with Search & Category Tabs */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Audited Financial Metrics
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredMetrics.length} of {metrics.length} validated metric parameters with source quotes.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search metric or quote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30"
                  : "bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-6">Metric Name</th>
              <th className="py-3.5 px-6">Extracted Value</th>
              <th className="py-3.5 px-6">Fiscal Period</th>
              <th className="py-3.5 px-6">Verifiable Source Citation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredMetrics.length > 0 ? (
              filteredMetrics.map((metric, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                  
                  {/* Metric Name & Category */}
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    <span className="block font-medium">{metric.metric_name}</span>
                    {metric.category && (
                      <span className="inline-block mt-0.5 text-[10px] text-indigo-600 font-mono font-medium">
                        {metric.category}
                      </span>
                    )}
                  </td>

                  {/* Value */}
                  <td className="py-4 px-6 font-mono font-bold text-emerald-700 text-sm whitespace-nowrap">
                    {metric.value}
                  </td>

                  {/* Period */}
                  <td className="py-4 px-6 text-slate-600 font-medium whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]">
                      {metric.period}
                    </span>
                  </td>

                  {/* Source Quote */}
                  <td className="py-4 px-6 max-w-md">
                    <div className="relative bg-slate-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl p-3 text-slate-700 text-[11px] leading-relaxed transition-colors shadow-2xs">
                      <Quote className="w-3 h-3 text-indigo-500 inline mr-1.5 -mt-1" />
                      &ldquo;{metric.source_quote}&rdquo;
                      <button
                        type="button"
                        onClick={() => handleCopyQuote(metric.source_quote, idx)}
                        title="Copy source citation"
                        className="ml-2 inline-flex items-center text-[10px] font-sans font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 mr-1 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            <span>Cite</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">No matching financial metrics</p>
                    <p className="text-xs text-slate-500">
                      Try adjusting your search query or selecting &ldquo;All&rdquo; categories.
                    </p>
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="mt-2 text-xs text-indigo-600 hover:underline font-medium"
                      >
                        Reset search filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
