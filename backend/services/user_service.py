"""
User Service for AI Bootcamp Tutor V2
Handles user CRUD operations and authentication logic
"""

from typing import Optional, Dict, Any
from flask import current_app
from db.database import DatabaseService
from services.auth_service import auth_service
import re


class UserService:
    """Service for handling user operations"""
    
    def __init__(self):
        self.db = DatabaseService()
    
    def validate_email(self, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def validate_password(self, password: str) -> tuple[bool, str]:
        """Validate password strength"""
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if not re.search(r'[A-Za-z]', password):
            return False, "Password must contain at least one letter"
        
        if not re.search(r'\d', password):
            return False, "Password must contain at least one number"
        
        return True, "Password is valid"
    
    async def register_user(self, name: str, email: str, password: str, language_pref: str = "english") -> Dict[str, Any]:
        """Register a new user"""
        try:
            # Validate input
            if not name or not name.strip():
                return {"success": False, "error": "Name is required"}
            
            if not self.validate_email(email):
                return {"success": False, "error": "Invalid email format"}
            
            is_valid, password_error = self.validate_password(password)
            if not is_valid:
                return {"success": False, "error": password_error}
            
            # Check if user already exists
            await self.db.connect()
            existing_user = await self.db.client.user.find_unique(
                where={"email": email.lower()}
            )
            
            if existing_user:
                return {"success": False, "error": "User with this email already exists"}
            
            # Hash password
            hashed_password = auth_service.hash_password(password)
            
            # Create user
            user = await self.db.client.user.create(
                data={
                    "name": name.strip(),
                    "email": email.lower(),
                    "password": hashed_password,
                    "languagePref": language_pref
                }
            )
            
            # Generate JWT token
            token = auth_service.generate_token(user.id, user.email)
            
            return {
                "success": True,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "languagePref": user.languagePref,
                    "createdAt": user.createdAt.isoformat()
                },
                "token": token
            }
            
        except Exception as e:
            current_app.logger.error(f"User registration error: {str(e)}")
            return {"success": False, "error": "Registration failed. Please try again."}
        finally:
            await self.db.disconnect()
    
    async def login_user(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user and return token"""
        try:
            if not email or not password:
                return {"success": False, "error": "Email and password are required"}
            
            await self.db.connect()
            user = await self.db.client.user.find_unique(
                where={"email": email.lower()}
            )
            
            if not user:
                return {"success": False, "error": "Invalid email or password"}
            
            # Verify password
            if not auth_service.verify_password(password, user.password):
                return {"success": False, "error": "Invalid email or password"}
            
            # Generate JWT token
            token = auth_service.generate_token(user.id, user.email)
            
            return {
                "success": True,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "languagePref": user.languagePref,
                    "createdAt": user.createdAt.isoformat()
                },
                "token": token
            }
            
        except Exception as e:
            current_app.logger.error(f"User login error: {str(e)}")
            return {"success": False, "error": "Login failed. Please try again."}
        finally:
            await self.db.disconnect()
    
    async def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            await self.db.connect()
            user = await self.db.client.user.find_unique(
                where={"id": user_id},
                include={
                    "sessions": {
                        "orderBy": {"createdAt": "desc"},
                        "take": 10  # Recent sessions only
                    },
                    "collections": {
                        "orderBy": {"updatedAt": "desc"}
                    }
                }
            )
            
            if not user:
                return None
            
            return {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "languagePref": user.languagePref,
                "createdAt": user.createdAt.isoformat(),
                "totalSessions": len(user.sessions) if user.sessions else 0,
                "totalCollections": len(user.collections) if user.collections else 0
            }
            
        except Exception as e:
            current_app.logger.error(f"Get user error: {str(e)}")
            return None
        finally:
            await self.db.disconnect()
    
    async def update_user_language(self, user_id: int, language_pref: str) -> Dict[str, Any]:
        """Update user language preference"""
        try:
            if language_pref not in ["english", "arabic"]:
                return {"success": False, "error": "Invalid language preference"}
            
            await self.db.connect()
            user = await self.db.client.user.update(
                where={"id": user_id},
                data={"languagePref": language_pref}
            )
            
            return {
                "success": True,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "languagePref": user.languagePref
                }
            }
            
        except Exception as e:
            current_app.logger.error(f"Update user language error: {str(e)}")
            return {"success": False, "error": "Failed to update language preference"}
        finally:
            await self.db.disconnect()


# Global instance
user_service = UserService()