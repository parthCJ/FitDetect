from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings
from app.core.security import create_access_token, get_current_user
from app.db.mongodb import get_collection
from app.models.user import User, UserCreate
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class GoogleAuthRequest(BaseModel):
    token: str

@router.post("/google", response_model=dict)
async def google_auth(auth_request: GoogleAuthRequest):
    """
    Authenticate user with Google OAuth token
    """
    try:
        logger.info(f"Attempting to verify Google token (length: {len(auth_request.token)})")
        
        # Verify the Google token with clock skew tolerance
        idinfo = id_token.verify_oauth2_token(
            auth_request.token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10  # Allow 10 seconds clock skew
        )
        
        logger.info(f"Token verified successfully for user: {idinfo.get('email')}")
        
        # Get user info from token
        user_id = f"google_{idinfo['sub']}"
        email = idinfo.get('email')
        name = idinfo.get('name')
        picture = idinfo.get('picture')
        
        # Check if user exists
        users_collection = await get_collection("users")
        existing_user = await users_collection.find_one({"user_id": user_id})
        
        if not existing_user:
            logger.info(f"Creating new user: {email}")
            # Create new user
            new_user = UserCreate(
                user_id=user_id,
                name=name,
                email=email,
                picture=picture
            )
            user_dict = new_user.model_dump()
            user_dict['created_at'] = datetime.utcnow()
            user_dict['last_login'] = datetime.utcnow()
            
            result = await users_collection.insert_one(user_dict)
            user_dict['_id'] = result.inserted_id
        else:
            logger.info(f"User exists, updating last login: {email}")
            # Update last login
            await users_collection.update_one(
                {"user_id": user_id},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            user_dict = existing_user
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_id, "email": email},
            expires_delta=access_token_expires
        )
        
        logger.info(f"Access token created successfully for: {email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "user_id": user_id,
                "name": name,
                "email": email,
                "picture": picture
            }
        }
        
    except ValueError as e:
        # Invalid token
        logger.error(f"Token verification failed (ValueError): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    except Exception as e:
        logger.error(f"Authentication failed (Exception): {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )

@router.get("/me")
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """
    Get current authenticated user
    """
    users_collection = await get_collection("users")
    user_data = await users_collection.find_one({"user_id": user["id"]})
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "user_id": user_data["user_id"],
        "name": user_data["name"],
        "email": user_data["email"],
        "picture": user_data.get("picture")
    }
