import asyncio
import logging
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager
from prisma import Prisma
from config.settings import get_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseService:
    """Database service for managing Prisma client and database operations."""
    
    def __init__(self):
        self.client: Optional[Prisma] = None
        self.config = get_config()
    
    async def connect(self) -> None:
        """Connect to the database."""
        try:
            if not self.client:
                self.client = Prisma()
            
            if not self.client.is_connected():
                await self.client.connect()
                logger.info("Successfully connected to database")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    async def disconnect(self) -> None:
        """Disconnect from the database."""
        try:
            if self.client and self.client.is_connected():
                await self.client.disconnect()
                logger.info("Successfully disconnected from database")
        except Exception as e:
            logger.error(f"Failed to disconnect from database: {e}")
            raise
    
    @asynccontextmanager
    async def get_client(self):
        """Get database client with automatic connection management."""
        try:
            await self.connect()
            yield self.client
        finally:
            # Keep connection alive for performance, only disconnect on app shutdown
            pass
    
    async def create_user(self, name: str, email: str, language_pref: str = "english") -> Dict[str, Any]:
        """Create a new user."""
        async with self.get_client() as client:
            try:
                user = await client.user.create(
                    data={
                        'name': name,
                        'email': email,
                        'languagePref': language_pref
                    }
                )
                logger.info(f"Created user: {user.email}")
                return user.dict()
            except Exception as e:
                logger.error(f"Failed to create user: {e}")
                raise
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email."""
        async with self.get_client() as client:
            try:
                user = await client.user.find_unique(
                    where={'email': email},
                    include={'sessions': True}
                )
                return user.dict() if user else None
            except Exception as e:
                logger.error(f"Failed to get user by email: {e}")
                raise
    
    async def create_session(
        self, 
        user_id: int, 
        input_text: str, 
        output_summary: Optional[str] = None,
        output_explanation: Optional[str] = None,
        output_exercises: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """Create a new session record."""
        async with self.get_client() as client:
            try:
                session = await client.session.create(
                    data={
                        'userId': user_id,
                        'inputText': input_text,
                        'outputSummary': output_summary,
                        'outputExplanation': output_explanation,
                        'outputExercises': output_exercises
                    }
                )
                logger.info(f"Created session: {session.id}")
                return session.dict()
            except Exception as e:
                logger.error(f"Failed to create session: {e}")
                raise
    
    async def update_session(
        self, 
        session_id: int, 
        output_summary: Optional[str] = None,
        output_explanation: Optional[str] = None,
        output_exercises: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """Update session with outputs."""
        async with self.get_client() as client:
            try:
                update_data = {}
                if output_summary is not None:
                    update_data['outputSummary'] = output_summary
                if output_explanation is not None:
                    update_data['outputExplanation'] = output_explanation
                if output_exercises is not None:
                    update_data['outputExercises'] = output_exercises
                
                session = await client.session.update(
                    where={'id': session_id},
                    data=update_data
                )
                logger.info(f"Updated session: {session_id}")
                return session.dict()
            except Exception as e:
                logger.error(f"Failed to update session: {e}")
                raise
    
    async def get_user_sessions(self, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Get user's recent sessions."""
        async with self.get_client() as client:
            try:
                sessions = await client.session.find_many(
                    where={'userId': user_id},
                    order={'createdAt': 'desc'},
                    take=limit,
                    include={'user': True}
                )
                return [session.dict() for session in sessions]
            except Exception as e:
                logger.error(f"Failed to get user sessions: {e}")
                raise

# Global database service instance
db_service = DatabaseService()
