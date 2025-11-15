"""
Upload Router
Handles medical report file uploads
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from pathlib import Path
import uuid
import os
from routers.auth import get_current_user

router = APIRouter(prefix="/upload", tags=["upload"])

# Upload directory configuration
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {'.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.bmp'}


@router.post("/")
async def upload_report(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a medical report file
    Args:
        file: Uploaded file (PDF or image)
        current_user: Authenticated user
    Returns:
        Upload confirmation with file details
    """
    # Validate file extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "stored_filename": unique_filename,
            "file_path": str(file_path),
            "file_size": len(content),
            "user_id": current_user["_id"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )


@router.get("/allowed-formats")
async def get_allowed_formats():
    """
    Get list of allowed file formats
    Returns:
        List of allowed file extensions
    """
    return {
        "allowed_formats": list(ALLOWED_EXTENSIONS),
        "max_file_size_mb": 10
    }
