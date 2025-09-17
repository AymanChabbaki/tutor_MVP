"""
Authentication Middleware for AI Bootcamp Tutor V2
JWT token validation middleware for protected routes
"""

from functools import wraps
from flask import request, jsonify, g
from services.auth_service import auth_service
from services.user_service import user_service
import asyncio


def auth_required(f):
    """Decorator to require authentication for a route"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        token = auth_service.extract_token_from_header(auth_header)
        
        if not token:
            return jsonify({
                "success": False,
                "error": "Authentication token required"
            }), 401
        
        # Verify token
        payload = auth_service.verify_token(token)
        if not payload:
            return jsonify({
                "success": False,
                "error": "Invalid or expired token"
            }), 401
        
        # Store user info in Flask's g object for use in the route
        g.current_user_id = payload.get('user_id')
        g.current_user_email = payload.get('email')
        
        return f(*args, **kwargs)
    
    return decorated_function


def auth_required_async(f):
    """Decorator to require authentication for async routes"""
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        token = auth_service.extract_token_from_header(auth_header)
        
        if not token:
            return jsonify({
                "success": False,
                "error": "Authentication token required"
            }), 401
        
        # Verify token
        payload = auth_service.verify_token(token)
        if not payload:
            return jsonify({
                "success": False,
                "error": "Invalid or expired token"
            }), 401
        
        # Store user info in Flask's g object for use in the route
        g.current_user_id = payload.get('user_id')
        g.current_user_email = payload.get('email')
        
        return await f(*args, **kwargs)
    
    return decorated_function


def optional_auth(f):
    """Decorator for routes where auth is optional"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        token = auth_service.extract_token_from_header(auth_header)
        
        if token:
            # Verify token if provided
            payload = auth_service.verify_token(token)
            if payload:
                g.current_user_id = payload.get('user_id')
                g.current_user_email = payload.get('email')
            else:
                g.current_user_id = None
                g.current_user_email = None
        else:
            g.current_user_id = None
            g.current_user_email = None
        
        return f(*args, **kwargs)
    
    return decorated_function


def get_current_user():
    """Helper function to get current authenticated user info"""
    return {
        'user_id': getattr(g, 'current_user_id', None),
        'email': getattr(g, 'current_user_email', None)
    }


def is_authenticated():
    """Check if current request is authenticated"""
    return getattr(g, 'current_user_id', None) is not None