export type ExtractionStatus =
  | 'IDLE'
  | 'UPLOADING'
  | 'POLLING'
  | 'PARSING_DOCUMENT'
  | 'AI_EXTRACTION_AND_AUDIT'
  | 'SUCCESS'
  | 'ERROR';

export type MetricCategory =
  | 'All'
  | 'Revenue & Growth'
  | 'Profitability & Margins'
  | 'Cash Flow & Liquidity'
  | 'Per Share'
  | 'Balance Sheet'
  | 'General';

export interface FinancialMetric {
  metric_name: string;
  value: string;
  period: string;
  source_quote: string;
  category?: string;
  confidence_score?: number;
}

export interface FinancialData {
  company_name: string;
  reporting_period: string;
  currency?: string;
  metrics: FinancialMetric[];
  key_risks: string[];
  audit_notes?: string;
}

export interface ExtractionResult {
  is_approved: boolean;
  revision_count: number;
  audit_feedback?: string;
  data: FinancialData;
}

export interface TaskStatusResponse {
  task_id: string;
  status: string;
  details?: string;
  result?: ExtractionResult;
  error?: string;
}

export interface UploadResponse {
  message: string;
  task_id: string;
  status_url: string;
}

export interface DemoPreset {
  id: string;
  name: string;
  ticker: string;
  period: string;
  result: ExtractionResult;
}
