"""
Collection Service for AI Bootcamp Tutor V2
Handles learning collection CRUD operations
"""

from typing import Optional, Dict, Any, List
from flask import current_app
from db.database import DatabaseService


class CollectionService:
    """Service for handling learning collections"""
    
    def __init__(self):
        self.db = DatabaseService()
    
    async def create_collection(self, user_id: int, title: str, description: str = None) -> Dict[str, Any]:
        """Create a new collection"""
        try:
            if not title or not title.strip():
                return {"success": False, "error": "Collection title is required"}
            
            await self.db.connect()
            
            collection = await self.db.client.collection.create(
                data={
                    "userId": user_id,
                    "title": title.strip(),
                    "description": description.strip() if description else None
                }
            )
            
            return {
                "success": True,
                "collection": {
                    "id": collection.id,
                    "title": collection.title,
                    "description": collection.description,
                    "createdAt": collection.createdAt.isoformat(),
                    "updatedAt": collection.updatedAt.isoformat()
                }
            }
            
        except Exception as e:
            current_app.logger.error(f"Create collection error: {str(e)}")
            return {"success": False, "error": "Failed to create collection"}
        finally:
            await self.db.disconnect()
    
    async def get_user_collections(self, user_id: int) -> Dict[str, Any]:
        """Get all collections for a user"""
        try:
            current_app.logger.info(f"Getting collections for user_id: {user_id}")
            await self.db.connect()
            current_app.logger.info("Database connected successfully")
            
            collections = await self.db.client.collection.find_many(
                where={"userId": user_id},
                order={"updatedAt": "desc"},
                include={
                    "sessions": True
                }
            )
            current_app.logger.info(f"Found {len(collections)} collections")
            
            formatted_collections = []
            for collection in collections:
                # Sort sessions by createdAt desc
                sorted_sessions = sorted(
                    collection.sessions if collection.sessions else [],
                    key=lambda s: s.createdAt,
                    reverse=True
                )
                
                formatted_collection = {
                    "id": collection.id,
                    "title": collection.title,
                    "description": collection.description,
                    "createdAt": collection.createdAt.isoformat(),
                    "updatedAt": collection.updatedAt.isoformat(),
                    "sessionCount": len(sorted_sessions),
                    "recentSessions": [
                        {
                            "id": session.id,
                            "sessionType": session.sessionType,
                            "createdAt": session.createdAt.isoformat()
                        } for session in sorted_sessions[:3]
                    ]
                }
                formatted_collections.append(formatted_collection)
            
            current_app.logger.info(f"Formatted {len(formatted_collections)} collections successfully")
            return {
                "success": True,
                "collections": formatted_collections
            }
            
        except Exception as e:
            current_app.logger.error(f"Get user collections error: {str(e)}", exc_info=True)
            return {"success": False, "error": "Failed to fetch collections"}
        finally:
            await self.db.disconnect()
    
    async def get_collection_by_id(self, collection_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific collection with its sessions"""
        try:
            await self.db.connect()
            
            collection = await self.db.client.collection.find_unique(
                where={"id": collection_id},
                include={
                    "sessions": {
                        "order": {"createdAt": "desc"}
                    }
                }
            )
            
            if not collection or collection.userId != user_id:
                return None
            
            formatted_sessions = []
            for session in collection.sessions:
                formatted_session = {
                    "id": session.id,
                    "inputText": session.inputText,
                    "sessionType": session.sessionType,
                    "createdAt": session.createdAt.isoformat()
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
                "id": collection.id,
                "title": collection.title,
                "description": collection.description,
                "createdAt": collection.createdAt.isoformat(),
                "updatedAt": collection.updatedAt.isoformat(),
                "sessions": formatted_sessions
            }
            
        except Exception as e:
            current_app.logger.error(f"Get collection by ID error: {str(e)}")
            return None
        finally:
            await self.db.disconnect()
    
    async def update_collection(self, collection_id: int, user_id: int, title: str = None, description: str = None) -> Dict[str, Any]:
        """Update a collection"""
        try:
            await self.db.connect()
            
            # Check if collection exists and belongs to user
            existing_collection = await self.db.client.collection.find_unique(
                where={"id": collection_id}
            )
            
            if not existing_collection or existing_collection.userId != user_id:
                return {"success": False, "error": "Collection not found"}
            
            # Prepare update data
            update_data = {}
            if title is not None:
                if not title.strip():
                    return {"success": False, "error": "Collection title cannot be empty"}
                update_data["title"] = title.strip()
            
            if description is not None:
                update_data["description"] = description.strip() if description.strip() else None
            
            if not update_data:
                return {"success": False, "error": "No valid fields to update"}
            
            collection = await self.db.client.collection.update(
                where={"id": collection_id},
                data=update_data
            )
            
            return {
                "success": True,
                "collection": {
                    "id": collection.id,
                    "title": collection.title,
                    "description": collection.description,
                    "updatedAt": collection.updatedAt.isoformat()
                }
            }
            
        except Exception as e:
            current_app.logger.error(f"Update collection error: {str(e)}")
            return {"success": False, "error": "Failed to update collection"}
        finally:
            await self.db.disconnect()
    
    async def delete_collection(self, collection_id: int, user_id: int) -> Dict[str, Any]:
        """Delete a collection"""
        try:
            await self.db.connect()
            
            # Check if collection exists and belongs to user
            collection = await self.db.client.collection.find_unique(
                where={"id": collection_id}
            )
            
            if not collection or collection.userId != user_id:
                return {"success": False, "error": "Collection not found"}
            
            await self.db.client.collection.delete(
                where={"id": collection_id}
            )
            
            return {"success": True, "message": "Collection deleted successfully"}
            
        except Exception as e:
            current_app.logger.error(f"Delete collection error: {str(e)}")
            return {"success": False, "error": "Failed to delete collection"}
        finally:
            await self.db.disconnect()
    
    async def add_session_to_collection(self, collection_id: int, session_id: int, user_id: int) -> Dict[str, Any]:
        """Add a session to a collection"""
        try:
            await self.db.connect()
            
            # Check if collection exists and belongs to user
            collection = await self.db.client.collection.find_unique(
                where={"id": collection_id}
            )
            
            if not collection or collection.userId != user_id:
                return {"success": False, "error": "Collection not found"}
            
            # Check if session exists and belongs to user
            session = await self.db.client.session.find_unique(
                where={"id": session_id}
            )
            
            if not session or session.userId != user_id:
                return {"success": False, "error": "Session not found"}
            
            # Update session to add to collection
            updated_session = await self.db.client.session.update(
                where={"id": session_id},
                data={"collectionId": collection_id}
            )
            
            return {
                "success": True,
                "message": "Session added to collection successfully",
                "session": {
                    "id": updated_session.id,
                    "sessionType": updated_session.sessionType,
                    "collectionId": updated_session.collectionId
                }
            }
            
        except Exception as e:
            current_app.logger.error(f"Add session to collection error: {str(e)}")
            return {"success": False, "error": "Failed to add session to collection"}
        finally:
            await self.db.disconnect()
    
    async def remove_session_from_collection(self, session_id: int, user_id: int) -> Dict[str, Any]:
        """Remove a session from its collection"""
        try:
            await self.db.connect()
            
            # Check if session exists and belongs to user
            session = await self.db.client.session.find_unique(
                where={"id": session_id}
            )
            
            if not session or session.userId != user_id:
                return {"success": False, "error": "Session not found"}
            
            # Update session to remove from collection
            updated_session = await self.db.client.session.update(
                where={"id": session_id},
                data={"collectionId": None}
            )
            
            return {
                "success": True,
                "message": "Session removed from collection successfully"
            }
            
        except Exception as e:
            current_app.logger.error(f"Remove session from collection error: {str(e)}")
            return {"success": False, "error": "Failed to remove session from collection"}
        finally:
            await self.db.disconnect()


# Global instance
collection_service = CollectionService()