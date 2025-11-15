"""
Google Gemini API Medical Report Parser (FREE Alternative)
Uses Google's free Gemini API for parsing medical reports
"""

import os
import json
import re
from typing import Dict, Any, Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()


class GeminiReportParser:
    """
    Medical report parser using Google Gemini API (FREE)
    No cost - uses Google's free tier
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini parser

        Args:
            api_key: Google API key (defaults to GOOGLE_API_KEY env var)
        """
        self.api_key = api_key or os.environ.get("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")

        # Configure Gemini with API key directly
        genai.configure(api_key=self.api_key)

        # Use gemini-2.5-flash model (latest stable and free)
        self.model = genai.GenerativeModel('gemini-2.5-flash')  # FREE!

        # System prompt for medical report parsing
        self.system_prompt = self._build_system_prompt()

    def _build_system_prompt(self) -> str:
        """Build the comprehensive system prompt for medical report parsing"""
        return """You are an expert medical report parser with 100% accuracy requirement. Your task is to extract EVERY SINGLE test parameter from medical laboratory reports.

INPUT: Full report text with page separators `---PAGE 1---`, `---PAGE 2---`, etc. OCR-extracted text may contain:
- OCR errors (5.5 → 5,5, O → 0, l → 1)
- Missing spaces, broken lines, merged words
- Inconsistent spacing and alignment

**CRITICAL MISSION: EXTRACT 100% OF ALL MEDICAL TEST PARAMETERS - DO NOT MISS EVEN ONE!**

SCANNING STRATEGY (Read the ENTIRE document multiple times):
1. **First Pass**: Scan for all test names/parameters (look for medical terminology)
2. **Second Pass**: For each test name found, search nearby text (±3 lines) for its value
3. **Third Pass**: Look for values without obvious test names (isolated numbers with units)
4. **Fourth Pass**: Check tables, multi-column layouts, and edge cases
5. **Final Verification**: Count total extracted tests and compare with visual inspection

MANDATORY EXTRACTION RULES:
- **EXTRACT EVERY TEST** - Even if value is missing, extract the test name
- **LOOK EVERYWHERE**: Headers, tables, footnotes, multiple columns, continued sections
- **MULTI-LINE TESTS**: Test name on one line, value on next line (common in reports)
- **GROUPED TESTS**: Tests under category headers (CBC, Lipid Profile, etc.)
- **ABBREVIATED TESTS**: Common abbreviations (Hb, WBC, RBC, PLT, etc.)
- **CALCULATED TESTS**: Ratios and derived values (e.g., Total/HDL Ratio)
- **QUALITATIVE TESTS**: Tests with text results (Positive/Negative, Present/Absent)

INTELLIGENT VALUE MATCHING:
- "Hemoglobin A1C 5.5 % 0.0-5.6%" → test_name="Hemoglobin A1C", value="5.5", unit="%", reference_range="0.0-5.6%"
- "Cholesterol184mg/dL<200" → test_name="Cholesterol", value="184", unit="mg/dL", reference_range="<200"
- Multi-line: "Hemoglobin" (line 1) + "12.5" (line 2) → match them together
- Table format: Test names in column 1, values in column 2, units in column 3
- Fix OCR: 5,5→5.5, O.5→0.5, l2.5→12.5

COMMON MEDICAL TEST CATEGORIES (Extract ALL from these):
- **Complete Blood Count (CBC)**: Hemoglobin, RBC, WBC, Platelets, Hematocrit, MCV, MCH, MCHC, RDW, MPV
- **Differential Count**: Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils (% and absolute)
- **Lipid Profile**: Total Cholesterol, Triglycerides, HDL, LDL, VLDL, Cholesterol/HDL Ratio
- **Diabetes**: Glucose (Fasting/Random/PP), HbA1c, Insulin
- **Liver Function**: SGPT/ALT, SGOT/AST, ALP, GGT, Bilirubin (Total/Direct/Indirect), Protein, Albumin, Globulin
- **Kidney Function**: Creatinine, Urea, BUN, Uric Acid, Electrolytes (Na, K, Cl, Ca)
- **Thyroid**: T3, T4, TSH, Free T3, Free T4
- **Vitamins**: Vitamin D, B12, Folate
- **Iron Studies**: Iron, Ferritin, TIBC, Transferrin Saturation
- **Inflammation**: ESR, CRP, hs-CRP
- **Other**: Any other test visible on the report

STATUS INFERENCE (compare value to reference range):
- "Low" = value < reference minimum
- "Normal" = value within range
- "High" = value > reference maximum
- "Unknown" = cannot determine
- Follow explicit H/L/N markers if present

JSON SCHEMA (required output):
{
  "per_page": [
    {
      "page_number": integer,
      "patient_name": string,
      "age": string,
      "gender": string,
      "report_date": string,
      "lab_name": string,
      "doctor_names": [string],
      "tests": [
        {
          "category": string,
          "test_name": string,
          "value": string,
          "unit": string,
          "reference_range": string,
          "status": string,
          "remarks": string,
          "page_number": integer
        }
      ]
    }
  ],
  "consolidated": {
    "patient_name": string,
    "age": string,
    "gender": string,
    "report_date": string,
    "lab_name": string,
    "doctor_names": [string],
    "tests": [
      {
        "category": string,
        "test_name": string,
        "value": string,
        "unit": string,
        "reference_range": string,
        "status": string,
        "remarks": string,
        "history": [ {"page_number": integer, "value": string, "unit": string, "reference_range": string} ]
      }
    ],
    "overall_summary": string
  }
}

FINAL INSTRUCTIONS:
- Return ONLY valid JSON (no markdown, no code fences, no commentary)
- Keep numbers as strings in `value` field
- Extract EVERY SINGLE medical test parameter - aim for 100% extraction rate
- If you're unsure about a test name, include it anyway (better to over-extract than miss tests)
- Double-check: Did you scan the ENTIRE document? Did you check ALL columns and sections?
- Dedupe consolidated tests by (category + test_name), keep latest value, record history
- **VERIFY YOUR WORK**: Before returning, mentally count how many distinct test parameters you found

QUALITY CHECK:
- Typical blood test report has 10-30+ parameters
- If you extracted less than 8 parameters from a full blood report, YOU MISSED TESTS - scan again!
- Common missed tests: Differential counts, ratios, calculated values, tests at page edges"""

    def parse_report(
        self,
        report_text: str,
        temperature: float = 0.0
    ) -> Dict[str, Any]:
        """
        Parse medical report using Gemini API (FREE)

        Args:
            report_text: Full report text with page markers (---PAGE N---)
            temperature: Gemini temperature (0.0 = deterministic)

        Returns:
            Parsed report as dictionary with per_page and consolidated data

        Raises:
            ValueError: If parsing fails or returns invalid JSON
        """
        try:
            # Combine system prompt with user input
            full_prompt = f"{self.system_prompt}\n\nNow parse this report:\n\n{report_text}"

            # Make API call to Gemini (FREE!) with optimized settings
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=8192,  # Limit output for faster response
                    top_p=0.95,  # Slight optimization for faster generation
                )
            )

            # Extract response text
            response_text = response.text

            # Parse JSON from response
            parsed_data = self._extract_json(response_text)

            # Validate schema
            self._validate_schema(parsed_data)

            return parsed_data

        except Exception as e:
            raise ValueError(f"Failed to parse report with Gemini: {str(e)}")

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """
        Extract JSON from Gemini's response (handles code fences if present)
        """
        text = text.strip()

        # Try to find JSON within code fences
        json_match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', text, re.DOTALL)
        if json_match:
            text = json_match.group(1)

        # Parse JSON with multiple fallback strategies
        for attempt in range(3):
            try:
                return json.loads(text)
            except json.JSONDecodeError as e:
                if attempt == 0:
                    # Attempt 1: Try to extract just the JSON object
                    json_match = re.search(r'\{.*\}', text, re.DOTALL)
                    if json_match:
                        text = json_match.group(0)
                        continue
                elif attempt == 1:
                    # Attempt 2: Fix common JSON errors
                    text = self._fix_common_json_errors(text)
                    continue
                else:
                    # Attempt 3: Save the malformed JSON for debugging and raise error
                    print(f"[Gemini Parser] JSON parsing failed at line {e.lineno}, column {e.colno}")
                    print(f"[Gemini Parser] Error: {e.msg}")
                    # Show context around error
                    lines = text.split('\n')
                    if e.lineno and e.lineno <= len(lines):
                        print(f"[Gemini Parser] Problem line: {lines[e.lineno-1]}")
                    raise ValueError(f"Could not parse JSON from response after 3 attempts: {e}")

    def _fix_common_json_errors(self, text: str) -> str:
        """
        Fix common JSON formatting errors from LLM responses
        """
        # Remove trailing commas before closing brackets/braces
        text = re.sub(r',(\s*[}\]])', r'\1', text)

        # Fix missing commas between objects (heuristic)
        text = re.sub(r'"\s*\n\s*"', r'",\n"', text)

        # Fix unescaped quotes in strings (basic - catches some cases)
        # This is tricky and imperfect, but helps with common cases

        return text

    def _validate_schema(self, data: Dict[str, Any]) -> None:
        """Validate that parsed data matches expected schema"""
        if "per_page" not in data:
            raise ValueError("Missing 'per_page' key in parsed data")
        if "consolidated" not in data:
            raise ValueError("Missing 'consolidated' key in parsed data")
        if not isinstance(data["per_page"], list):
            raise ValueError("'per_page' must be a list")
        consolidated = data["consolidated"]
        if not isinstance(consolidated, dict):
            raise ValueError("'consolidated' must be a dictionary")
        if "tests" not in consolidated or not isinstance(consolidated["tests"], list):
            raise ValueError("'consolidated.tests' must be a list")

    def format_report_for_parsing(self, pages: list[str]) -> str:
        """Format list of page texts with page markers"""
        formatted_pages = []
        for i, page_text in enumerate(pages, start=1):
            formatted_pages.append(f"---PAGE {i}---\n{page_text}")
        return "\n\n".join(formatted_pages)


# Singleton instance
_gemini_parser_instance: Optional[GeminiReportParser] = None


def get_gemini_parser() -> GeminiReportParser:
    """Get singleton instance of GeminiReportParser"""
    global _gemini_parser_instance
    if _gemini_parser_instance is None:
        _gemini_parser_instance = GeminiReportParser()
    return _gemini_parser_instance
