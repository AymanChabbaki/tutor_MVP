"""
Authentication Service for AI Bootcamp Tutor V2
Handles JWT token generation, validation, and password hashing
"""

import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
from flask import current_app


class AuthService:
    """Service for handling user authentication and JWT tokens"""
    
    def __init__(self):
        self.jwt_secret = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
        self.jwt_expiry = os.getenv('JWT_EXPIRY', '1d')
        self.algorithm = 'HS256'
    
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        try:
            # Generate salt and hash password
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            return hashed.decode('utf-8')
        except Exception as e:
            current_app.logger.error(f"Password hashing error: {str(e)}")
            raise Exception("Failed to hash password")
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception as e:
            current_app.logger.error(f"Password verification error: {str(e)}")
            return False
    
    def generate_token(self, user_id: int, email: str) -> str:
        """Generate a JWT token for a user"""
        try:
            # Calculate expiration time
            expiry_hours = self._parse_expiry(self.jwt_expiry)
            expiration = datetime.utcnow() + timedelta(hours=expiry_hours)
            
            payload = {
                'user_id': user_id,
                'email': email,
                'exp': expiration,
                'iat': datetime.utcnow()
            }
            
            token = jwt.encode(payload, self.jwt_secret, algorithm=self.algorithm)
            return token
        except Exception as e:
            current_app.logger.error(f"Token generation error: {str(e)}")
            raise Exception("Failed to generate token")
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            current_app.logger.warning("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            current_app.logger.warning(f"Invalid token: {str(e)}")
            return None
        except Exception as e:
            current_app.logger.error(f"Token verification error: {str(e)}")
            return None
    
    def _parse_expiry(self, expiry_str: str) -> int:
        """Parse expiry string (e.g., '1d', '24h', '1440m') to hours"""
        try:
            if expiry_str.endswith('d'):
                return int(expiry_str[:-1]) * 24
            elif expiry_str.endswith('h'):
                return int(expiry_str[:-1])
            elif expiry_str.endswith('m'):
                return int(expiry_str[:-1]) / 60
            else:
                # Default to hours if no unit specified
                return int(expiry_str)
        except ValueError:
            current_app.logger.warning(f"Invalid expiry format: {expiry_str}, defaulting to 24 hours")
            return 24
    
    def extract_token_from_header(self, auth_header: str) -> Optional[str]:
        """Extract token from Authorization header"""
        if not auth_header:
            return None
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None
        
        return parts[1]


# Global instance
auth_service = AuthService()