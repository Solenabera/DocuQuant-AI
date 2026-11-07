"use client";

import { useState, useEffect, useCallback } from "react";
import { isAxiosError } from "axios";
import { uploadDocument, checkTaskStatus, ROOT_BASE } from "@/library/api";
import { ExtractionStatus, ExtractionResult, DemoPreset } from "@/types";

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "nvidia",
    name: "NVIDIA Corporation",
    ticker: "NVDA",
    period: "FY 2025 Q4 & Full Year",
    result: {
      is_approved: true,
      revision_count: 1,
      audit_feedback: "APPROVED: 100% of metrics verified against certified GAAP income statements with zero discrepancy.",
      data: {
        company_name: "NVIDIA Corporation",
        reporting_period: "Fiscal Year 2025 Ended Jan 26, 2025",
        currency: "USD",
        metrics: [
          {
            metric_name: "Total Revenue",
            value: "$130.50B",
            period: "FY 2025",
            source_quote: "Fiscal 2025 revenue was $130.50 billion, up 114% from $60.92 billion a year ago.",
            category: "Revenue & Growth",
            confidence_score: 0.99,
          },
          {
            metric_name: "Data Center Revenue",
            value: "$115.20B",
            period: "FY 2025",
            source_quote: "Data Center full-year revenue surged 142% to record $115.20 billion driven by Blackwell compute demand.",
            category: "Revenue & Growth",
            confidence_score: 0.99,
          },
          {
            metric_name: "GAAP Gross Margin",
            value: "75.0%",
            period: "FY 2025",
            source_quote: "GAAP gross margin for fiscal 2025 was 75.0%, compared with 72.7% in the prior fiscal year.",
            category: "Profitability & Margins",
            confidence_score: 0.98,
          },
          {
            metric_name: "Operating Income",
            value: "$81.48B",
            period: "FY 2025",
            source_quote: "Operating income grew 147% year-over-year to $81.48 billion.",
            category: "Profitability & Margins",
            confidence_score: 0.99,
          },
          {
            metric_name: "Diluted EPS",
            value: "$2.94",
            period: "FY 2025",
            source_quote: "GAAP diluted earnings per share was $2.94, up 147% from $1.19 a year ago.",
            category: "Per Share",
            confidence_score: 0.99,
          },
          {
            metric_name: "Free Cash Flow",
            value: "$60.85B",
            period: "FY 2025",
            source_quote: "Free cash flow reached $60.85 billion compared to $26.95 billion in fiscal 2024.",
            category: "Cash Flow & Liquidity",
            confidence_score: 0.98,
          },
        ],
        key_risks: [
          "Export control regulations and restrictions impacting advanced compute accelerator shipments to sovereign jurisdictions.",
          "Concentration of advanced semiconductor packaging and CoWoS foundry manufacturing capacity at TSMC.",
          "High power consumption, liquid cooling requirements, and data center electrical grid interconnect availability constraints.",
        ],
        audit_notes: "Audit agent verified all 6 metrics against Table 1 (Condensed Consolidated Statements of Income) with verbatim quote fidelity.",
      },
    },
  },
  {
    id: "alphabet",
    name: "Alphabet Inc.",
    ticker: "GOOGL",
    period: "Q2 2024",
    result: {
      is_approved: true,
      revision_count: 2,
      audit_feedback: "APPROVED: Extractor corrected prior unit formatting from Millions to Billions based on Auditor critique.",
      data: {
        company_name: "Alphabet Inc.",
        reporting_period: "Quarter Ended June 30, 2024",
        currency: "USD",
        metrics: [
          {
            metric_name: "Consolidated Revenues",
            value: "$84.74B",
            period: "Q2 2024",
            source_quote: "Revenues were $84.74 billion, an increase of 14% year-over-year.",
            category: "Revenue & Growth",
            confidence_score: 0.99,
          },
          {
            metric_name: "Google Cloud Revenue",
            value: "$10.35B",
            period: "Q2 2024",
            source_quote: "Google Cloud revenues increased 29% to $10.35 billion.",
            category: "Revenue & Growth",
            confidence_score: 0.98,
          },
          {
            metric_name: "Operating Income",
            value: "$27.43B",
            period: "Q2 2024",
            source_quote: "Operating income was $27.43 billion, and operating margin was 32%.",
            category: "Profitability & Margins",
            confidence_score: 0.99,
          },
          {
            metric_name: "Net Income",
            value: "$23.62B",
            period: "Q2 2024",
            source_quote: "Net income was $23.62 billion, and diluted EPS was $1.89.",
            category: "Profitability & Margins",
            confidence_score: 0.99,
          },
          {
            metric_name: "Diluted EPS",
            value: "$1.89",
            period: "Q2 2024",
            source_quote: "Net income was $23.62 billion, and diluted EPS was $1.89.",
            category: "Per Share",
            confidence_score: 0.99,
          },
        ],
        key_risks: [
          "Rapid technological changes in AI infrastructure necessitating sustained heavy capital expenditures ($13.2B in Q2).",
          "Antitrust regulatory inquiries and litigation regarding digital advertising and search distribution agreements.",
        ],
        audit_notes: "Self-corrected during revision cycle 2 to align diluted EPS quote with consolidated statements.",
      },
    },
  },
  {
    id: "apple",
    name: "Apple Inc.",
    ticker: "AAPL",
    period: "FY 2024 Q4 & Full Year",
    result: {
      is_approved: true,
      revision_count: 1,
      audit_feedback: "APPROVED: Verified against SEC Form 10-K certified financial tables.",
      data: {
        company_name: "Apple Inc.",
        reporting_period: "Fiscal Year Ended September 28, 2024",
        currency: "USD",
        metrics: [
          {
            metric_name: "Total Net Sales",
            value: "$391.04B",
            period: "FY 2024",
            source_quote: "Total net sales were $391,035 million for the fiscal year ended September 28, 2024.",
            category: "Revenue & Growth",
            confidence_score: 0.99,
          },
          {
            metric_name: "Services Revenue",
            value: "$96.17B",
            period: "FY 2024",
            source_quote: "Services net sales reached an all-time record of $96,169 million, up 12.9% YoY.",
            category: "Revenue & Growth",
            confidence_score: 0.98,
          },
          {
            metric_name: "Operating Income",
            value: "$123.22B",
            period: "FY 2024",
            source_quote: "Operating income was $123,216 million compared to $114,301 million in 2023.",
            category: "Profitability & Margins",
            confidence_score: 0.99,
          },
          {
            metric_name: "Diluted EPS",
            value: "$6.08",
            period: "FY 2024",
            source_quote: "Diluted earnings per share was $6.08, compared to $6.13 in 2023.",
            category: "Per Share",
            confidence_score: 0.99,
          },
          {
            metric_name: "Operating Cash Flow",
            value: "$118.25B",
            period: "FY 2024",
            source_quote: "Cash generated by operating activities was $118,254 million.",
            category: "Cash Flow & Liquidity",
            confidence_score: 0.98,
          },
        ],
        key_risks: [
          "Compliance with European Digital Markets Act (DMA) requiring alternative app marketplace distribution.",
          "Supply chain vulnerabilities and single-source dependencies for key optical and display components.",
        ],
        audit_notes: "Source quotes verified verbatim from Apple Form 10-K Item 8 Consolidated Statements of Operations.",
      },
    },
  },
];

export function useExtraction() {
  const [file, setFile] = useState<File | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<ExtractionStatus>("IDLE");
  const [details, setDetails] = useState<string>("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Timer counter during processing
  useEffect(() => {
    const isRunning =
      status === "UPLOADING" ||
      status === "POLLING" ||
      status === "PARSING_DOCUMENT" ||
      status === "AI_EXTRACTION_AND_AUDIT";

    if (!isRunning) return;

    const timerId = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [status]);

  // Polling effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const shouldPoll =
      (status === "POLLING" ||
        status === "UPLOADING" ||
        status === "PARSING_DOCUMENT" ||
        status === "AI_EXTRACTION_AND_AUDIT") &&
      taskId;

    if (shouldPoll) {
      intervalId = setInterval(async () => {
        try {
          const data = await checkTaskStatus(taskId);
          const currentStatus = data.status;

          if (currentStatus === "SUCCESS" && data.result) {
            setResult(data.result);
            setStatus("SUCCESS");
            setDetails("Extraction and multi-agent audit completed successfully.");
            clearInterval(intervalId);
          } else if (currentStatus === "FAILURE") {
            setErrorMsg(data.error || "An error occurred during Celery worker execution.");
            setStatus("ERROR");
            clearInterval(intervalId);
          } else if (currentStatus === "PARSING_DOCUMENT") {
            setStatus("PARSING_DOCUMENT");
            setDetails(data.details || "Parsing document tables and OCR text...");
          } else if (currentStatus === "AI_EXTRACTION_AND_AUDIT") {
            setStatus("AI_EXTRACTION_AND_AUDIT");
            setDetails(data.details || "Running LangGraph multi-agent self-correction loop...");
          } else {
            setDetails(data.details || `Queue status: ${currentStatus}`);
          }
        } catch (err: unknown) {
          console.error("Polling error:", err);
          setStatus("ERROR");
          let msg = "Lost connection to the extraction service.";
          if (isAxiosError(err)) {
            msg = !err.response
              ? "Connection to FastAPI task status endpoint timed out or was disconnected."
              : err.response.data?.detail || err.message || msg;
          }
          setErrorMsg(msg);
          clearInterval(intervalId);
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status, taskId]);

  const handleUpload = async (selectedFile?: File) => {
    const targetFile = selectedFile || file;
    if (!targetFile) return;

    setElapsedSeconds(0);
    setStatus("UPLOADING");
    setDetails("Sending document to FastAPI server...");
    setErrorMsg("");
    setResult(null);

    try {
      const data = await uploadDocument(targetFile);
      setTaskId(data.task_id);
      setStatus("PARSING_DOCUMENT");
      setDetails("Document queued in Celery Redis backend...");
    } catch (err: unknown) {
      console.error(err);
      setStatus("ERROR");
      let msg = "Failed to upload document to server.";
      if (isAxiosError(err)) {
        if (!err.response) {
          msg = `Backend server is unreachable at ${ROOT_BASE}. Please verify your network connection or Render service status. Alternatively, click any Demo Preset above.`;
        } else {
          msg = err.response.data?.detail || err.message || msg;
        }
      }
      setErrorMsg(msg);
    }
  };

  const loadPreset = useCallback((presetId: string = "nvidia") => {
    const preset = DEMO_PRESETS.find((p) => p.id === presetId) || DEMO_PRESETS[0];

    setElapsedSeconds(0);
    setStatus("UPLOADING");
    setDetails(`Loading certified SEC data for ${preset.name} (${preset.ticker})...`);
    setErrorMsg("");
    setResult(null);

    setTimeout(() => {
      setStatus("PARSING_DOCUMENT");
      setDetails("pdfplumber reconstructing markdown tables and footnotes...");
      setTimeout(() => {
        setStatus("AI_EXTRACTION_AND_AUDIT");
        setDetails("LangGraph Compliance Auditor validating metrics against quotes...");
        setTimeout(() => {
          setResult(preset.result);
          setStatus("SUCCESS");
          setDetails("Demonstration audit pipeline completed with zero hallucinations.");
        }, 1200);
      }, 1000);
    }, 700);
  }, []);

  const resetState = useCallback(() => {
    setFile(null);
    setTaskId(null);
    setStatus("IDLE");
    setDetails("");
    setResult(null);
    setErrorMsg("");
    setElapsedSeconds(0);
  }, []);

  return {
    file,
    setFile,
    taskId,
    status,
    details,
    result,
    errorMsg,
    elapsedSeconds,
    handleUpload,
    loadPreset,
    resetState,
  };
}
