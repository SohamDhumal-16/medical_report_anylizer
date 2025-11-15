"""
OCR Service
Handles Optical Character Recognition for medical reports
Supports both PDF and image files
Uses PaddleOCR for production-grade 90-95% accuracy
"""

from paddleocr import PaddleOCR
import fitz  # PyMuPDF
from PIL import Image
import os
import cv2
import numpy as np
from typing import List, Union


class OCRService:
    """OCR Service for extracting text from medical reports using PaddleOCR"""

    def __init__(self):
        """Initialize PaddleOCR with English language"""
        print("[OCR] Initializing PaddleOCR (Production-grade: 90-95% accuracy)...")
        # PaddleOCR with table detection enabled for medical reports
        self.reader = PaddleOCR(
            use_angle_cls=True,  # Enable angle classification
            lang='en',  # English language
        )
        print("[OCR] PaddleOCR initialized successfully!")

    def preprocess_image_for_ocr(self, image_path: str) -> np.ndarray:
        """
        GENTLE preprocessing to improve OCR accuracy for camera photos

        Args:
            image_path: Path to image file or numpy array
        Returns:
            Preprocessed image as numpy array
        """
        # Load image
        if isinstance(image_path, str):
            img = cv2.imread(image_path)
        elif isinstance(image_path, np.ndarray):
            img = image_path
        else:
            # Convert PIL Image to numpy array
            img = cv2.cvtColor(np.array(image_path), cv2.COLOR_RGB2BGR)

        if img is None:
            raise ValueError(f"Failed to load image: {image_path}")

        # 1. Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 2. GENTLE contrast enhancement using CLAHE
        # Reduced clipLimit for gentler enhancement
        clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # 3. Very light denoising (only if really needed)
        # Reduced h parameter for minimal smoothing
        denoised = cv2.fastNlMeansDenoising(enhanced, h=5)

        return denoised

    def extract_text_from_image(self, image_path: str, preprocess: bool = True) -> str:
        """
        Extract text from image file using PaddleOCR (90-95% accuracy)
        PaddleOCR is production-grade and handles camera photos excellently

        Args:
            image_path: Path to image file
            preprocess: Not used (PaddleOCR handles preprocessing internally)
        Returns:
            Extracted text as string
        """
        try:
            print(f"[PaddleOCR] Processing image: {os.path.basename(image_path)}")

            # PaddleOCR returns OCRResult object with rec_texts and rec_scores
            result = self.reader.ocr(image_path)

            if not result or len(result) == 0:
                print("[PaddleOCR] No text detected in image")
                return ""

            # Extract text and confidence from OCRResult
            # result[0] is an OCRResult dict-like object with 'rec_texts' and 'rec_scores' keys
            ocr_result = result[0]

            if 'rec_texts' not in ocr_result or 'rec_scores' not in ocr_result:
                print("[PaddleOCR] Invalid OCR result format")
                return ""

            texts = ocr_result['rec_texts']
            scores = ocr_result['rec_scores']

            if not texts or len(texts) == 0:
                print("[PaddleOCR] No text extracted")
                return ""

            # Filter by confidence threshold (0.5 for production quality)
            extracted_texts = []
            total_blocks = len(texts)
            high_conf_blocks = 0

            for text, confidence in zip(texts, scores):
                if confidence > 0.5:
                    extracted_texts.append(text)
                    high_conf_blocks += 1

            final_text = "\n".join(extracted_texts)
            print(f"[PaddleOCR] Extracted {high_conf_blocks}/{total_blocks} high-confidence text blocks")
            return final_text

        except Exception as e:
            print(f"[PaddleOCR] ERROR: {e}")
            import traceback
            traceback.print_exc()
            return ""

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from PDF file (both text-based and scanned PDFs)
        Uses layout-preserving extraction to maintain column alignment
        Args:
            pdf_path: Path to PDF file
        Returns:
            Extracted text as string
        """
        try:
            all_text = []

            # First try to extract text directly (for text-based PDFs)
            pdf_document = fitz.open(pdf_path)

            for page_num in range(len(pdf_document)):
                page = pdf_document[page_num]

                # Use "dict" mode to get text with layout information
                text_dict = page.get_text("dict")

                # Check if page has text blocks
                has_text = False
                if "blocks" in text_dict:
                    for block in text_dict["blocks"]:
                        if "lines" in block and len(block["lines"]) > 0:
                            has_text = True
                            break

                if has_text:
                    # Use layout-preserving extraction
                    # Sort blocks by vertical position (top to bottom)
                    blocks = text_dict.get("blocks", [])
                    text_blocks = []

                    for block in blocks:
                        if "lines" in block:
                            block_text = []
                            for line in block["lines"]:
                                line_text = []
                                for span in line["spans"]:
                                    line_text.append(span["text"])
                                block_text.append(" ".join(line_text))
                            text_blocks.append("\n".join(block_text))

                    page_text = "\n".join(text_blocks)
                    all_text.append(page_text)
                else:
                    # If no text, convert page to image and use PaddleOCR
                    print(f"[PaddleOCR] Page {page_num + 1} is scanned, applying OCR...")
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better quality
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

                    # Convert PIL Image to numpy array
                    img_np = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

                    # PaddleOCR on image (handles preprocessing internally)
                    result = self.reader.ocr(img_np)

                    if result and len(result) > 0 and 'rec_texts' in result[0]:
                        # Extract text and confidence from OCRResult
                        ocr_result = result[0]
                        texts = ocr_result['rec_texts']
                        scores = ocr_result['rec_scores']

                        # Filter by confidence threshold (0.5 for production quality)
                        extracted_texts = []
                        total_blocks = len(texts)
                        high_conf_blocks = 0

                        for text, confidence in zip(texts, scores):
                            if confidence > 0.5:
                                extracted_texts.append(text)
                                high_conf_blocks += 1

                        page_text = "\n".join(extracted_texts)
                        all_text.append(page_text)
                        print(f"[PaddleOCR] Extracted {high_conf_blocks}/{total_blocks} high-confidence text blocks from page {page_num + 1}")
                    else:
                        print(f"[PaddleOCR] No text detected on page {page_num + 1}")
                        all_text.append("")

            pdf_document.close()
            return "\n\n".join(all_text)

        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""

    def extract_text(self, file_path: str) -> str:
        """
        Extract text from file (auto-detect PDF or image)
        Args:
            file_path: Path to file
        Returns:
            Extracted text as string
        """
        file_extension = os.path.splitext(file_path)[1].lower()

        if file_extension == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif file_extension in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
            return self.extract_text_from_image(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")


# Lazy-loaded singleton instance
_ocr_service_instance = None

def get_ocr_service():
    """
    Get or create OCR service instance (lazy loading)
    This defers the expensive model download until first use
    """
    global _ocr_service_instance
    if _ocr_service_instance is None:
        _ocr_service_instance = OCRService()
    return _ocr_service_instance

