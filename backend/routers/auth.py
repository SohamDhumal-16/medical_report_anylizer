"""
Authentication Router
Handles user registration and login
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from models.user import UserCreate, UserResponse, UserInDB
from utils.token_handler import get_password_hash, verify_password, create_access_token
from database.connection import get_database
from datetime import timedelta, datetime
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel
from typing import Optional
import uuid
import os

router = APIRouter(prefix="/auth", tags=["authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# Pydantic model for Google OAuth
class GoogleAuthRequest(BaseModel):
    """Google OAuth token request"""
    token: str


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate):
    """
    Register a new user
    Args:
        user: User registration data
    Returns:
        Created user details
    """
    db = get_database()
    users_collection = db["users"]

    # Check if user already exists
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user document
    user_id = str(uuid.uuid4())
    user_dict = {
        "_id": user_id,
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": get_password_hash(user.password),
        "is_active": True,
        "created_at": datetime.utcnow()
    }

    # Insert into database
    users_collection.insert_one(user_dict)

    # Return user response
    return UserResponse(
        id=user_id,
        email=user.email,
        full_name=user.full_name,
        is_active=True,
        created_at=user_dict.get("created_at")
    )


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login user and return JWT token
    Args:
        form_data: Username (email) and password
    Returns:
        Access token and token type
    """
    db = get_database()
    users_collection = db["users"]

    # Find user by email (username field in OAuth2)
    user = users_collection.find_one({"email": form_data.username})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": user["email"], "user_id": user["_id"]},
        expires_delta=timedelta(minutes=30)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user["_id"],
        "full_name": user.get("full_name", ""),
        "email": user["email"]
    }


@router.post("/google-login")
async def google_login(auth_request: GoogleAuthRequest):
    """
    Login/Register user with Google OAuth
    Args:
        auth_request: Google OAuth token
    Returns:
        Access token and user data
    """
    try:
        # Verify Google token
        # Note: In production, replace with your actual Google Client ID from Google Cloud Console
        GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id.apps.googleusercontent.com")

        idinfo = id_token.verify_oauth2_token(
            auth_request.token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        # Get user info from Google token
        google_user_id = idinfo.get("sub")
        email = idinfo.get("email")
        full_name = idinfo.get("name", "")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )

        db = get_database()
        users_collection = db["users"]

        # Check if user exists
        user = users_collection.find_one({"email": email})

        if not user:
            # Create new user account with Google auth
            user_id = str(uuid.uuid4())
            user_dict = {
                "_id": user_id,
                "email": email,
                "full_name": full_name,
                "hashed_password": "",  # No password for Google OAuth users
                "google_id": google_user_id,
                "auth_provider": "google",
                "is_active": True,
                "created_at": datetime.utcnow()
            }
            users_collection.insert_one(user_dict)
            user = user_dict

        # Create access token
        access_token = create_access_token(
            data={"sub": user["email"], "user_id": user["_id"]},
            expires_delta=timedelta(minutes=30)
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user["_id"],
            "full_name": user.get("full_name", ""),
            "email": user["email"],
            "is_new_user": "google_id" not in user  # False if existing user
        }

    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google authentication failed: {str(e)}"
        )


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Get current authenticated user from JWT token
    Args:
        token: JWT token
    Returns:
        User data
    """
    from utils.token_handler import decode_access_token

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("user_id")
    if user_id is None:
        raise credentials_exception

    db = get_database()
    user = db["users"].find_one({"_id": user_id})

    if user is None:
        raise credentials_exception

    return user


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user's profile
    Args:
        current_user: Authenticated user
    Returns:
        User profile data
    """
    return UserResponse(
        id=current_user["_id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        phone=current_user.get("phone"),
        date_of_birth=current_user.get("date_of_birth"),
        gender=current_user.get("gender"),
        bio=current_user.get("bio"),
        is_active=current_user.get("is_active", True),
        created_at=current_user.get("created_at")
    )


@router.put("/profile")
async def update_profile(
    full_name: str,
    phone: Optional[str] = None,
    date_of_birth: Optional[str] = None,
    gender: Optional[str] = None,
    bio: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Update user profile
    Args:
        full_name: New full name
        phone: Phone number
        date_of_birth: Date of birth
        gender: Gender
        bio: User bio/description
        current_user: Authenticated user
    Returns:
        Updated user data
    """
    db = get_database()
    users_collection = db["users"]

    # Build update dictionary with only provided fields
    update_data = {"full_name": full_name}

    if phone is not None:
        update_data["phone"] = phone
    if date_of_birth is not None:
        update_data["date_of_birth"] = date_of_birth
    if gender is not None:
        update_data["gender"] = gender
    if bio is not None:
        update_data["bio"] = bio

    # Update user
    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )

    # Get updated user
    updated_user = users_collection.find_one({"_id": current_user["_id"]})

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": updated_user["_id"],
            "email": updated_user["email"],
            "full_name": updated_user["full_name"],
            "phone": updated_user.get("phone"),
            "date_of_birth": updated_user.get("date_of_birth"),
            "gender": updated_user.get("gender"),
            "bio": updated_user.get("bio")
        }
    }


@router.put("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Change user password
    Args:
        current_password: Current password
        new_password: New password
        current_user: Authenticated user
    Returns:
        Success message
    """
    db = get_database()
    users_collection = db["users"]

    # Verify current password
    if not verify_password(current_password, current_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Validate new password
    if len(new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long"
        )

    # Update password
    users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"hashed_password": get_password_hash(new_password)}}
    )

    return {
        "message": "Password changed successfully"
    }
