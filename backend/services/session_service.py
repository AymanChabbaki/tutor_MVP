"""
Session Service for AI Bootcamp Tutor V2
Handles learning session CRUD operations and AI integration
"""

from typing import Optional, Dict, Any, List
from flask import current_app
from db.database import DatabaseService
from services.gemini_service import GeminiService
import json


class SessionService:
    """Service for handling learning sessions"""
    
    def __init__(self):
        self.db = DatabaseService()
        self.gemini = GeminiService()
    
    async def create_summary_session(self, user_id: int, text: str, language: str = "english") -> Dict[str, Any]:
        """Create a new summary session"""
        try:
            await self.db.connect()
            
            # Generate summary using Gemini
            summary_result = await self.gemini.summarize_content(text, language)
            
            # Save session to database
            session = await self.db.client.session.create(
                data={
                    "userId": user_id,
                    "inputText": text,
                    "outputSummary": summary_result,
                    "sessionType": "summary"
                }
            )
            
            return {
                "success": True,
                "session": {
                    "id": session.id,
                    "inputText": session.inputText,
                    "outputSummary": session.outputSummary,
                    "sessionType": session.sessionType,
                    "createdAt": session.createdAt.isoformat()
                },
                "data": summary_result["data"]
            }
            
        except Exception as e:
            current_app.logger.error(f"Create summary session error: {str(e)}")
            return {"success": False, "error": "Failed to create summary session"}
        finally:
            await self.db.disconnect()
    
    async def create_explanation_session(self, user_id: int, text: str, language: str = "english") -> Dict[str, Any]:
        """Create a new explanation session"""
        try:
            await self.db.connect()
            
            # Generate explanation using Gemini
            explanation_result = await self.gemini.explain_content(text, language)
            
            # Save session to database with explanation stored as JSON
            session = await self.db.client.session.create(
                data={
                    "userId": user_id,
                    "inputText": text,
                    "outputExplanation": {"content": explanation_result},  # Wrap in JSON object
                    "sessionType": "explanation"
                }
            )
            
            return {
                "success": True,
                "session": {
                    "id": session.id,
                    "inputText": session.inputText,
                    "outputExplanation": session.outputExplanation,
                    "sessionType": session.sessionType,
                    "createdAt": session.createdAt.isoformat()
                },
                "data": explanation_result  # Return the actual explanation string
            }
            
        except Exception as e:
            current_app.logger.error(f"Create explanation session error: {str(e)}")
            return {"success": False, "error": "Failed to create explanation session"}
        finally:
            await self.db.disconnect()
    
    async def create_exercises_session(self, user_id: int, text: str, language: str = "english") -> Dict[str, Any]:
        """Create a new exercises session"""
        try:
            await self.db.connect()
            
            # Generate exercises using Gemini
            exercises_result = await self.gemini.generate_exercises(text, language)
            
            # Save session to database
            session = await self.db.client.session.create(
                data={
                    "userId": user_id,
                    "inputText": text,
                    "outputExercises": {"exercises": exercises_result, "language": language},
                    "sessionType": "exercises"
                }
            )
            
            return {
                "success": True,
                "session": {
                    "id": session.id,
                    "inputText": session.inputText,
                    "outputExercises": session.outputExercises,
                    "sessionType": session.sessionType,
                    "createdAt": session.createdAt.isoformat()
                },
                "data": exercises_result
            }
            
        except Exception as e:
            current_app.logger.error(f"Create exercises session error: {str(e)}")
            return {"success": False, "error": "Failed to create exercises session"}
        finally:
            await self.db.disconnect()
    
    async def get_user_sessions(self, user_id: int, limit: int = 50, offset: int = 0, collection_id: int = None) -> Dict[str, Any]:
        """Get user's sessions with pagination"""
        try:
            await self.db.connect()
            
            # Build where clause
            where_clause = {"userId": user_id}
            if collection_id:
                where_clause["collectionId"] = collection_id
            
            sessions = await self.db.client.session.find_many(
                where=where_clause,
                order={"createdAt": "desc"},
                take=limit,
                skip=offset,
                include={"collection": True}
            )
            
            total_count = await self.db.client.session.count(
                where=where_clause
            )
            
            formatted_sessions = []
            for session in sessions:
                formatted_session = {
                    "id": session.id,
                    "inputText": session.inputText,
                    "sessionType": session.sessionType,
                    "createdAt": session.createdAt.isoformat(),
                    "collection": {
                        "id": session.collection.id,
                        "title": session.collection.title
                    } if session.collection else None
                }
                
                # Add appropriate output based on session type
                if session.sessionType == "summary":
                    formatted_session["outputSummary"] = session.outputSummary
                elif session.sessionType == "explanation":
                    formatted_session["outputExplanation"] = session.outputExplanation
                elif session.sessionType == "exercises":
                    formatted_session["outputExercises"] = session.outputExercises
                
                formatted_sessions.append(formatted_session)
            
            return {
                "success": True,
                "sessions": formatted_sessions,
                "pagination": {
                    "total": total_count,
                    "limit": limit,
                    "offset": offset,
                    "hasMore": (offset + limit) < total_count
                }
            }
            
        except Exception as e:
            current_app.logger.error(f"Get user sessions error: {str(e)}")
            return {"success": False, "error": "Failed to fetch sessions"}
        finally:
            await self.db.disconnect()
    
    async def get_session_by_id(self, session_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific session by ID"""
        try:
            await self.db.connect()
            
            session = await self.db.client.session.find_unique(
                where={"id": session_id},
                include={"collection": True}
            )
            
            if not session or session.userId != user_id:
                return None
            
            formatted_session = {
                "id": session.id,
                "inputText": session.inputText,
                "sessionType": session.sessionType,
                "createdAt": session.createdAt.isoformat(),
                "updatedAt": session.updatedAt.isoformat(),
                "collection": {
                    "id": session.collection.id,
                    "title": session.collection.title
                } if session.collection else None
            }
            
            # Add appropriate output based on session type
            if session.sessionType == "summary":
                formatted_session["outputSummary"] = session.outputSummary
            elif session.sessionType == "explanation":
                formatted_session["outputExplanation"] = session.outputExplanation
            elif session.sessionType == "exercises":
                formatted_session["outputExercises"] = session.outputExercises
            
            return formatted_session
            
        except Exception as e:
            current_app.logger.error(f"Get session by ID error: {str(e)}")
            return None
        finally:
            await self.db.disconnect()
    
    async def delete_session(self, session_id: int, user_id: int) -> Dict[str, Any]:
        """Delete a session"""
        try:
            await self.db.connect()
            
            # Check if session exists and belongs to user
            session = await self.db.client.session.find_unique(
                where={"id": session_id}
            )
            
            if not session or session.userId != user_id:
                return {"success": False, "error": "Session not found"}
            
            await self.db.client.session.delete(
                where={"id": session_id}
            )
            
            return {"success": True, "message": "Session deleted successfully"}
            
        except Exception as e:
            current_app.logger.error(f"Delete session error: {str(e)}")
            return {"success": False, "error": "Failed to delete session"}
        finally:
            await self.db.disconnect()

# Global instance
session_service = SessionService()