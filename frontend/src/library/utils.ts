import { FinancialMetric } from '@/types';

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function truncateText(text: string, maxLength = 120): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export interface RiskSeverityInfo {
  label: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  badgeClass: string;
  dotClass: string;
}

export function getRiskSeverity(risk: string): RiskSeverityInfo {
  const lower = risk.toLowerCase();

  if (
    lower.includes('investigation') ||
    lower.includes('litigation') ||
    lower.includes('insolven') ||
    lower.includes('breach') ||
    lower.includes('sanction') ||
    lower.includes('fraud')
  ) {
    return {
      label: 'CRITICAL',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500',
    };
  }

  if (
    lower.includes('decline') ||
    lower.includes('drop') ||
    lower.includes('loss') ||
    lower.includes('debt') ||
    lower.includes('volatility') ||
    lower.includes('adverse') ||
    lower.includes('regulatory')
  ) {
    return {
      label: 'HIGH',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500',
    };
  }

  if (
    lower.includes('competition') ||
    lower.includes('market') ||
    lower.includes('dependency') ||
    lower.includes('fluctuat') ||
    lower.includes('supply chain') ||
    lower.includes('currency')
  ) {
    return {
      label: 'MEDIUM',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      dotClass: 'bg-blue-500',
    };
  }

  return {
    label: 'LOW',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  };
}

export function exportMetricsToCSV(
  companyName: string,
  metrics: FinancialMetric[]
): void {
  const headers = ['Metric Name', 'Value', 'Fiscal Period', 'Category', 'Verifiable Source Quote'];
  const rows = metrics.map((m) => [
    `"${(m.metric_name || '').replace(/"/g, '""')}"`,
    `"${(m.value || '').replace(/"/g, '""')}"`,
    `"${(m.period || '').replace(/"/g, '""')}"`,
    `"${(m.category || 'General').replace(/"/g, '""')}"`,
    `"${(m.source_quote || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizedName = (companyName || 'financial_report').toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `${sanitizedName}_audited_metrics.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportSummaryAsJSON(companyName: string, data: unknown): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizedName = (companyName || 'financial_report').toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `${sanitizedName}_audit_payload.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
