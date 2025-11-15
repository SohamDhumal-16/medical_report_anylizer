"""
Comparison Router
Handles comparison of medical reports to track progress
"""

from fastapi import APIRouter, HTTPException, status, Depends
from models.report import MedicalValue, ComparisonHistory
from services.compare_service import compare_service
from routers.auth import get_current_user
from database.connection import get_database
from typing import List
from datetime import datetime
import uuid

router = APIRouter(prefix="/compare", tags=["comparison"])


@router.get("/{user_id}")
async def compare_reports(
    user_id: str,
    old_report_id: str,
    new_report_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Compare two medical reports
    Args:
        user_id: User ID (from path)
        old_report_id: ID of older report (query param)
        new_report_id: ID of newer report (query param)
        current_user: Authenticated user
    Returns:
        Comparison results with trends
    """
    db = get_database()
    reports_collection = db["reports"]

    # Verify user owns both reports
    if current_user["_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access these reports"
        )

    # Get both reports
    old_report = reports_collection.find_one({
        "_id": old_report_id,
        "user_id": user_id
    })

    new_report = reports_collection.find_one({
        "_id": new_report_id,
        "user_id": user_id
    })

    if not old_report or not new_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both reports not found"
        )

    # Convert to MedicalValue objects
    old_values = [MedicalValue(**val) for val in old_report.get("medical_values", [])]
    new_values = [MedicalValue(**val) for val in new_report.get("medical_values", [])]

    # Compare reports
    comparison_results = compare_service.compare_reports(old_values, new_values)
    summary = compare_service.generate_summary(comparison_results)

    # Save comparison to database
    comparisons_collection = db["comparisons"]
    comparison_id = str(uuid.uuid4())

    comparison_history = {
        "_id": comparison_id,
        "user_id": user_id,
        "old_report_id": old_report_id,
        "new_report_id": new_report_id,
        "comparison_date": datetime.utcnow(),
        "comparisons": [comp.dict() for comp in comparison_results],
        "summary": summary,
        "old_report_info": {
            "id": old_report["_id"],
            "file_name": old_report["file_name"],
            "date": old_report["report_date"],
            "parameters_count": len(old_values)
        },
        "new_report_info": {
            "id": new_report["_id"],
            "file_name": new_report["file_name"],
            "date": new_report["report_date"],
            "parameters_count": len(new_values)
        }
    }

    # Insert or update comparison
    # Remove _id from the update dict to avoid immutable field error
    update_data = {k: v for k, v in comparison_history.items() if k != "_id"}
    comparisons_collection.update_one(
        {"old_report_id": old_report_id, "new_report_id": new_report_id, "user_id": user_id},
        {"$set": update_data, "$setOnInsert": {"_id": comparison_id}},
        upsert=True
    )

    print(f"[Comparison] Saved comparison {comparison_id} to database")

    return {
        "comparison_id": comparison_id,
        "old_report": {
            "id": old_report["_id"],
            "file_name": old_report["file_name"],
            "date": old_report["report_date"]
        },
        "new_report": {
            "id": new_report["_id"],
            "file_name": new_report["file_name"],
            "date": new_report["report_date"]
        },
        "summary": summary,
        "comparisons": [comp.dict() for comp in comparison_results]
    }


@router.get("/user/{user_id}/latest-comparison")
async def get_latest_comparison(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get comparison of user's two most recent reports
    Args:
        user_id: User ID
        current_user: Authenticated user
    Returns:
        Comparison of latest reports
    """
    if current_user["_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    db = get_database()
    reports_collection = db["reports"]

    # Get two most recent reports
    reports = list(
        reports_collection.find({"user_id": user_id})
        .sort("report_date", -1)
        .limit(2)
    )

    if len(reports) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough reports for comparison (minimum 2 required)"
        )

    # Compare
    new_report = reports[0]
    old_report = reports[1]

    old_values = [MedicalValue(**val) for val in old_report.get("medical_values", [])]
    new_values = [MedicalValue(**val) for val in new_report.get("medical_values", [])]

    comparison_results = compare_service.compare_reports(old_values, new_values)
    summary = compare_service.generate_summary(comparison_results)

    # Save comparison to database
    comparisons_collection = db["comparisons"]
    comparison_id = str(uuid.uuid4())

    comparison_history = {
        "_id": comparison_id,
        "user_id": user_id,
        "old_report_id": old_report["_id"],
        "new_report_id": new_report["_id"],
        "comparison_date": datetime.utcnow(),
        "comparisons": [comp.dict() for comp in comparison_results],
        "summary": summary,
        "old_report_info": {
            "id": old_report["_id"],
            "file_name": old_report["file_name"],
            "date": old_report["report_date"],
            "parameters_count": len(old_values)
        },
        "new_report_info": {
            "id": new_report["_id"],
            "file_name": new_report["file_name"],
            "date": new_report["report_date"],
            "parameters_count": len(new_values)
        }
    }

    # Insert or update comparison
    # Remove _id from the update dict to avoid immutable field error
    update_data = {k: v for k, v in comparison_history.items() if k != "_id"}
    comparisons_collection.update_one(
        {"old_report_id": old_report["_id"], "new_report_id": new_report["_id"], "user_id": user_id},
        {"$set": update_data, "$setOnInsert": {"_id": comparison_id}},
        upsert=True
    )

    print(f"[Latest Comparison] Saved comparison {comparison_id} to database")

    return {
        "comparison_id": comparison_id,
        "old_report": {
            "id": old_report["_id"],
            "file_name": old_report["file_name"],
            "date": old_report["report_date"]
        },
        "new_report": {
            "id": new_report["_id"],
            "file_name": new_report["file_name"],
            "date": new_report["report_date"]
        },
        "summary": summary,
        "comparisons": [comp.dict() for comp in comparison_results]
    }


@router.get("/history/{user_id}")
async def get_comparison_history(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    limit: int = 10
):
    """
    Get all comparison history for a user
    Args:
        user_id: User ID
        current_user: Authenticated user
        limit: Maximum number of comparisons to return
    Returns:
        List of comparison history
    """
    if current_user["_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    db = get_database()
    comparisons_collection = db["comparisons"]

    # Get comparison history sorted by date (newest first)
    comparisons = list(
        comparisons_collection.find({"user_id": user_id})
        .sort("comparison_date", -1)
        .limit(limit)
    )

    return {
        "total_comparisons": len(comparisons),
        "comparisons": comparisons
    }


@router.get("/detail/{comparison_id}")
async def get_comparison_detail(
    comparison_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed comparison by ID
    Args:
        comparison_id: Comparison ID
        current_user: Authenticated user
    Returns:
        Full comparison details
    """
    db = get_database()
    comparisons_collection = db["comparisons"]

    comparison = comparisons_collection.find_one({
        "_id": comparison_id,
        "user_id": current_user["_id"]
    })

    if not comparison:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comparison not found"
        )

    return comparison
