"""
Ollama Local AI Parser (100% FREE - Runs Locally)
No API costs, no limits, complete privacy
"""

import json
import re
from typing import Dict, Any
import requests


class OllamaReportParser:
    """
    Medical report parser using Ollama (FREE local AI)
    Runs entirely on your machine - no API costs
    """

    def __init__(self, model_name: str = "llama3.2", base_url: str = "http://localhost:11434"):
        """
        Initialize Ollama parser

        Args:
            model_name: Ollama model to use (llama3.2, mistral, etc.)
            base_url: Ollama API endpoint
        """
        self.model_name = model_name
        self.base_url = base_url
        self.system_prompt = self._build_system_prompt()

    def _build_system_prompt(self) -> str:
        """Build the system prompt"""
        return """You are an expert system for extracting structured data from multi-page medical laboratory reports.

Parse the report and return ONLY a valid JSON object with this exact schema:

{
  "per_page": [
    {
      "page_number": int,
      "patient_name": str,
      "age": str,
      "gender": str,
      "report_date": str,
      "lab_name": str,
      "doctor_names": [str],
      "tests": [
        {
          "category": str,
          "test_name": str,
          "value": str,
          "unit": str,
          "reference_range": str,
          "status": str,  // "Low", "Normal", "High", "Unknown"
          "remarks": str,
          "page_number": int
        }
      ]
    }
  ],
  "consolidated": {
    "patient_name": str,
    "age": str,
    "gender": str,
    "report_date": str,
    "lab_name": str,
    "doctor_names": [str],
    "tests": [...],
    "overall_summary": str
  }
}

Return ONLY the JSON. No markdown, no extra text."""

    def parse_report(self, report_text: str) -> Dict[str, Any]:
        """
        Parse medical report using Ollama (FREE)

        Args:
            report_text: Full report text

        Returns:
            Parsed report dictionary
        """
        try:
            # Make request to Ollama
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model_name,
                    "prompt": f"{self.system_prompt}\n\nReport:\n{report_text}",
                    "stream": False,
                    "temperature": 0.0
                },
                timeout=120
            )

            if response.status_code != 200:
                raise ValueError(f"Ollama error: {response.text}")

            result = response.json()
            response_text = result.get('response', '')

            # Parse JSON
            parsed_data = self._extract_json(response_text)
            return parsed_data

        except requests.ConnectionError:
            raise ValueError(
                "Cannot connect to Ollama. "
                "Is it running? Start with: ollama serve"
            )
        except Exception as e:
            raise ValueError(f"Failed to parse with Ollama: {str(e)}")

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from response"""
        text = text.strip()
        json_match = re.search(r'```(?:json)?\s*(\{.*\})\s*```', text, re.DOTALL)
        if json_match:
            text = json_match.group(1)

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            raise ValueError("Could not parse JSON from response")

    def format_report_for_parsing(self, pages: list[str]) -> str:
        """Format pages with markers"""
        formatted_pages = []
        for i, page_text in enumerate(pages, start=1):
            formatted_pages.append(f"---PAGE {i}---\n{page_text}")
        return "\n\n".join(formatted_pages)


def get_ollama_parser() -> OllamaReportParser:
    """Get Ollama parser instance"""
    return OllamaReportParser()
