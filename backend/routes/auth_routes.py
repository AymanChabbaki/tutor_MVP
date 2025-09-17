"""
Authentication Routes for AI Bootcamp Tutor V2
Handles user registration, login, and profile management
"""

from flask import Blueprint, request, jsonify
from services.user_service import user_service
from middleware.auth_middleware import auth_required_async, get_current_user
import asyncio


# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Request body is required"
            }), 400
        
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        language_pref = data.get('languagePref', 'english')
        
        if not all([name, email, password]):
            return jsonify({
                "success": False,
                "error": "Name, email, and password are required"
            }), 400
        
        # Run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            user_service.register_user(name, email, password, language_pref)
        )
        loop.close()
        
        if result["success"]:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Registration failed. Please try again."
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return token"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Request body is required"
            }), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not all([email, password]):
            return jsonify({
                "success": False,
                "error": "Email and password are required"
            }), 400
        
        # Run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            user_service.login_user(email, password)
        )
        loop.close()
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 401
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Login failed. Please try again."
        }), 500


@auth_bp.route('/me', methods=['GET'])
@auth_required_async
async def get_profile():
    """Get current user profile"""
    try:
        current_user = get_current_user()
        user_id = current_user['user_id']
        
        user_data = await user_service.get_user_by_id(user_id)
        
        if not user_data:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404
        
        return jsonify({
            "success": True,
            "user": user_data
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to fetch user profile"
        }), 500


@auth_bp.route('/me/language', methods=['PUT'])
@auth_required_async
async def update_language():
    """Update user language preference"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Request body is required"
            }), 400
        
        language_pref = data.get('languagePref')
        if not language_pref:
            return jsonify({
                "success": False,
                "error": "Language preference is required"
            }), 400
        
        current_user = get_current_user()
        user_id = current_user['user_id']
        
        result = await user_service.update_user_language(user_id, language_pref)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to update language preference"
        }), 500


@auth_bp.route('/validate', methods=['GET'])
@auth_required_async
async def validate_token():
    """Validate current token"""
    try:
        current_user = get_current_user()
        
        return jsonify({
            "success": True,
            "valid": True,
            "user_id": current_user['user_id'],
            "email": current_user['email']
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Token validation failed"
        }), 500