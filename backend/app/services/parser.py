import io
import re
from typing import List, Dict, Any, Optional
import pdfplumber
import pypdf

from app.core.logging import logger


class FinancialPDFParser:
    """
    Extracts text and tabular data from financial PDFs (10-K, 10-Q, earnings disclosures),
    converting structured tables into GitHub-flavored Markdown to preserve spatial relationships for LLMs.
    """

    @staticmethod
    def _clean_text(text: str) -> str:
        """Removes excessive whitespace and junk characters while preserving structural line breaks."""
        if not text:
            return ""
        # Normalize non-breaking spaces and irregular whitespace
        cleaned = text.replace("\u00a0", " ").replace("\r\n", "\n").replace("\r", "\n")
        lines = [re.sub(r"[ \t]+", " ", line).strip() for line in cleaned.splitlines()]
        return "\n".join([line for line in lines if line])

    @staticmethod
    def _table_to_markdown(table: List[List[Optional[str]]]) -> str:
        """Converts a 2D table grid into standard GitHub-flavored Markdown."""
        if not table or not any(table):
            return ""

        # Filter out empty rows
        cleaned_rows = []
        for row in table:
            if not row or all(cell is None or str(cell).strip() == "" for cell in row):
                continue
            cleaned_row = [
                str(cell).strip().replace("\n", " ").replace("|", "\\|") if cell is not None else ""
                for cell in row
            ]
            cleaned_rows.append(cleaned_row)

        if not cleaned_rows:
            return ""

        # Ensure consistent column count
        max_cols = max(len(r) for r in cleaned_rows)
        normalized_rows = [r + [""] * (max_cols - len(r)) for r in cleaned_rows]

        header = normalized_rows[0]
        separator = ["---"] * max_cols
        data_rows = normalized_rows[1:]

        md_lines = [
            "| " + " | ".join(header) + " |",
            "| " + " | ".join(separator) + " |",
        ]
        for row in data_rows:
            md_lines.append("| " + " | ".join(row) + " |")

        return "\n".join(md_lines)

    def extract_from_bytes(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Parses a PDF provided as raw bytes.
        Returns combined clean markdown text, total page count, and page summaries.
        """
        if not pdf_bytes or len(pdf_bytes) == 0:
            raise ValueError("Empty or invalid PDF byte stream provided.")

        full_text_parts = []
        page_summaries = []

        try:
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                total_pages = len(pdf.pages)
                logger.info(f"Parsing financial PDF ({total_pages} pages detected)...")

                for page_idx, page in enumerate(pdf.pages, start=1):
                    # 1. Extract and convert tables to markdown
                    table_md_list = []
                    try:
                        tables = page.extract_tables() or []
                        for table in tables:
                            md = self._table_to_markdown(table)
                            if md:
                                table_md_list.append(md)
                    except Exception as tbl_err:
                        logger.warning(f"Failed table extraction on page {page_idx}: {tbl_err}")

                    # 2. Extract standard text layout
                    try:
                        raw_text = page.extract_text(layout=False) or ""
                    except Exception:
                        raw_text = ""

                    cleaned_text = self._clean_text(raw_text)

                    # Fallback to PyPDF if pdfplumber yields no text
                    if not cleaned_text and not table_md_list:
                        try:
                            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
                            if page_idx - 1 < len(reader.pages):
                                cleaned_text = self._clean_text(reader.pages[page_idx - 1].extract_text() or "")
                        except Exception:
                            pass

                    # 3. Assemble page representation
                    page_content = f"--- [Page {page_idx} of {total_pages}] ---\n"
                    if cleaned_text:
                        page_content += cleaned_text + "\n\n"
                    if table_md_list:
                        page_content += "### Extracted Tables:\n" + "\n\n".join(table_md_list) + "\n"

                    full_text_parts.append(page_content)
                    page_summaries.append({
                        "page_number": page_idx,
                        "table_count": len(table_md_list),
                        "character_count": len(cleaned_text),
                    })

        except Exception as e:
            logger.error(f"pdfplumber extraction failed: {e}. Attempting PyPDF fallback...", exc_info=True)
            try:
                reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
                total_pages = len(reader.pages)
                for page_idx, page in enumerate(reader.pages, start=1):
                    txt = self._clean_text(page.extract_text() or "")
                    full_text_parts.append(f"--- [Page {page_idx} of {total_pages}] ---\n{txt}\n")
                    page_summaries.append({
                        "page_number": page_idx,
                        "table_count": 0,
                        "character_count": len(txt),
                    })
            except Exception as fallback_err:
                raise ValueError(f"Unable to parse PDF document: {str(fallback_err)}") from fallback_err

        combined_text = "\n\n".join(full_text_parts).strip()
        if not combined_text:
            raise ValueError("The uploaded PDF contains no extractable text or tables (might be scanned images).")

        return {
            "combined_text": combined_text,
            "total_pages": len(page_summaries),
            "pages": page_summaries,
        }

    def extract_from_file_path(self, file_path: str) -> Dict[str, Any]:
        """Convenience method for parsing from a local file path."""
        with open(file_path, "rb") as f:
            return self.extract_from_bytes(f.read())


# Global reusable parser instance
pdf_parser = FinancialPDFParser()
