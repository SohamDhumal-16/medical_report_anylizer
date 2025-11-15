"""
User Model
Defines user schema and validation for MongoDB
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user model with common fields"""
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(UserBase):
    """User creation model with password"""
    password: str


class UserInDB(UserBase):
    """User model as stored in database"""
    id: str = Field(alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    class Config:
        populate_by_name = True


class UserResponse(UserBase):
    """User response model (excludes sensitive data)"""
    id: str
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True
