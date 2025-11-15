"""
Medical Report Model
Defines report schema and validation for MongoDB
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Union
from datetime import datetime


class MedicalValue(BaseModel):
    """Individual medical test value"""
    name: str
    value: Optional[Union[float, str]] = None  # Support both numeric and string values
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    status: Optional[str] = None  # normal, high, low


class ReportBase(BaseModel):
    """Base report model"""
    user_id: str
    report_type: str  # blood_test, xray, mri, etc.
    report_date: datetime


class ReportCreate(ReportBase):
    """Report creation model"""
    file_name: str
    file_path: str


class ReportInDB(ReportBase):
    """Report model as stored in database"""
    id: str = Field(alias="_id")
    file_name: str
    file_path: str
    extracted_text: Optional[str] = None
    medical_values: List[MedicalValue] = []
    raw_data: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    processed: bool = False

    class Config:
        populate_by_name = True


class ReportResponse(ReportBase):
    """Report response model"""
    id: str
    file_name: str
    medical_values: List[MedicalValue]
    created_at: datetime
    processed: bool

    class Config:
        from_attributes = True


class ComparisonResult(BaseModel):
    """Model for comparing two reports"""
    parameter_name: str
    old_value: Optional[Union[float, str]]  # Support both numeric and string values
    new_value: Optional[Union[float, str]]  # Support both numeric and string values
    change: Optional[float]
    change_percentage: Optional[float]
    trend: str  # improved, worsened, stable
    unit: Optional[str]


class ComparisonHistory(BaseModel):
    """Model for storing comparison history in database"""
    comparison_id: str
    user_id: str
    old_report_id: str
    new_report_id: str
    comparison_date: datetime = Field(default_factory=datetime.utcnow)
    comparisons: List[Dict[str, Any]]  # List of ComparisonResult as dicts
    summary: Dict[str, Any]  # Summary with health score, trends, insights
    old_report_info: Dict[str, Any]  # Metadata about old report
    new_report_info: Dict[str, Any]  # Metadata about new report
