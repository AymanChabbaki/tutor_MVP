import pytest
import asyncio
import json
from unittest.mock import Mock, patch, AsyncMock
from flask import Flask
from app import create_app
from services.gemini_service import GeminiService
from db.database import DatabaseService

@pytest.fixture
def app():
    """Create and configure a test Flask app."""
    app = create_app('testing')
    app.config.update({
        "TESTING": True,
        "DATABASE_URL": "sqlite:///:memory:",
        "GEMINI_API_KEY": "test_api_key"
    })
    return app

@pytest.fixture
def client(app):
    """Create a test client."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Create a test runner."""
    return app.test_cli_runner()

class TestHealthEndpoint:
    """Test health check endpoints."""
    
    def test_health_endpoint(self, client):
        """Test the health endpoint."""
        response = client.get('/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert 'service' in data
        assert 'version' in data

    def test_api_health_endpoint(self, client):
        """Test the API health endpoint."""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'

class TestSummarizeEndpoint:
    """Test the summarize endpoint."""
    
    @patch('services.gemini_service.gemini_service.summarize_content')
    def test_summarize_success(self, mock_summarize, client):
        """Test successful content summarization."""
        # Mock the Gemini service
        mock_summarize.return_value = asyncio.create_task(
            asyncio.coroutine(lambda: "This is a test summary")()
        )
        
        response = client.post('/api/summarize', 
                             json={'text': 'Test content to summarize'},
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'summary' in data

    def test_summarize_missing_text(self, client):
        """Test summarize with missing text field."""
        response = client.post('/api/summarize', 
                             json={},
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'text' in data['error']

    def test_summarize_empty_text(self, client):
        """Test summarize with empty text."""
        response = client.post('/api/summarize', 
                             json={'text': ''},
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_summarize_invalid_json(self, client):
        """Test summarize with invalid JSON."""
        response = client.post('/api/summarize', 
                             data='invalid json',
                             content_type='application/json')
        
        assert response.status_code == 400

    def test_summarize_no_content_type(self, client):
        """Test summarize without JSON content type."""
        response = client.post('/api/summarize', 
                             data=json.dumps({'text': 'test'}))
        
        assert response.status_code == 400

class TestExplainEndpoint:
    """Test the explain endpoint."""
    
    @patch('services.gemini_service.gemini_service.explain_content')
    def test_explain_success(self, mock_explain, client):
        """Test successful content explanation."""
        # Mock the Gemini service
        mock_explain.return_value = asyncio.create_task(
            asyncio.coroutine(lambda: ("Arabic explanation", "English explanation"))()
        )
        
        response = client.post('/api/explain', 
                             json={'text': 'Test content to explain'},
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'arabic_explanation' in data
        assert 'english_explanation' in data

    def test_explain_missing_text(self, client):
        """Test explain with missing text field."""
        response = client.post('/api/explain', 
                             json={},
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_explain_with_user_id(self, client):
        """Test explain with user_id."""
        with patch('services.gemini_service.gemini_service.explain_content') as mock_explain, \
             patch('db.database.db_service.create_session') as mock_create_session:
            
            mock_explain.return_value = asyncio.create_task(
                asyncio.coroutine(lambda: ("Arabic explanation", "English explanation"))()
            )
            mock_create_session.return_value = asyncio.create_task(
                asyncio.coroutine(lambda: {'id': 1})()
            )
            
            response = client.post('/api/explain', 
                                 json={'text': 'Test content', 'user_id': 1},
                                 content_type='application/json')
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert 'arabic_explanation' in data
            assert 'english_explanation' in data

class TestGenerateExercisesEndpoint:
    """Test the generate_exercises endpoint."""
    
    @patch('services.gemini_service.gemini_service.generate_exercises')
    def test_generate_exercises_success(self, mock_generate, client):
        """Test successful exercise generation."""
        # Mock the Gemini service
        mock_exercises = [
            {"question": "What is Python?", "answer": "Python is a programming language"},
            {"question": "What is Flask?", "answer": "Flask is a web framework"},
            {"question": "What is API?", "answer": "API stands for Application Programming Interface"}
        ]
        mock_generate.return_value = asyncio.create_task(
            asyncio.coroutine(lambda: mock_exercises)()
        )
        
        response = client.post('/api/generate_exercises', 
                             json={'text': 'Test content for exercises'},
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'exercises' in data
        assert len(data['exercises']) == 3
        assert all('question' in exercise and 'answer' in exercise 
                  for exercise in data['exercises'])

    def test_generate_exercises_missing_text(self, client):
        """Test generate_exercises with missing text field."""
        response = client.post('/api/generate_exercises', 
                             json={},
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

class TestUserEndpoints:
    """Test user management endpoints."""
    
    @patch('db.database.db_service.get_user_by_email')
    @patch('db.database.db_service.create_user')
    def test_create_user_success(self, mock_create_user, mock_get_user, client):
        """Test successful user creation."""
        # Mock database responses
        mock_get_user.return_value = asyncio.create_task(
            asyncio.coroutine(lambda: None)()  # User doesn't exist
        )
        mock_create_user.return_value = asyncio.create_task(
            asyncio.coroutine(lambda: {
                'id': 1,
                'name': 'Test User',
                'email': 'test@example.com',
                'languagePref': 'english'
            })()
        )
        
        response = client.post('/api/users', 
                             json={
                                 'name': 'Test User',
                                 'email': 'test@example.com',
                                 'language_pref': 'english'
                             },
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'user' in data
        assert data['user']['email'] == 'test@example.com'

    @patch('db.database.db_service.get_user_by_email')
    def test_create_user_already_exists(self, mock_get_user, client):
        """Test creating user that already exists."""
        # Mock user already exists
        mock_get_user.return_value = asyncio.create_task(
            asyncio.coroutine(lambda: {'id': 1, 'email': 'test@example.com'})()
        )
        
        response = client.post('/api/users', 
                             json={
                                 'name': 'Test User',
                                 'email': 'test@example.com'
                             },
                             content_type='application/json')
        
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'error' in data
        assert 'already exists' in data['error']

    def test_create_user_missing_fields(self, client):
        """Test creating user with missing required fields."""
        response = client.post('/api/users', 
                             json={'name': 'Test User'},
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'email' in data['error']

    @patch('db.database.db_service.get_user_by_email')
    @patch('db.database.db_service.get_user_sessions')
    def test_get_user_sessions_success(self, mock_get_sessions, mock_get_user, client):
        """Test getting user sessions successfully."""
        # Mock database responses
        mock_get_user.return_value = asyncio.create_task(
            asyncio.coroutine(lambda: {'id': 1, 'email': 'test@example.com'})()
        )
        mock_get_sessions.return_value = asyncio.create_task(
            asyncio.coroutine(lambda: [
                {
                    'id': 1,
                    'inputText': 'Test input',
                    'outputSummary': 'Test summary',
                    'createdAt': '2023-01-01T00:00:00Z'
                }
            ])()
        )
        
        response = client.get('/api/users/test@example.com/sessions')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'sessions' in data
        assert len(data['sessions']) == 1

    @patch('db.database.db_service.get_user_by_email')
    def test_get_user_sessions_user_not_found(self, mock_get_user, client):
        """Test getting sessions for non-existent user."""
        mock_get_user.return_value = asyncio.create_task(
            asyncio.coroutine(lambda: None)()
        )
        
        response = client.get('/api/users/nonexistent@example.com/sessions')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert 'not found' in data['error']

class TestErrorHandling:
    """Test error handling."""
    
    def test_404_error(self, client):
        """Test 404 error handling."""
        response = client.get('/api/nonexistent')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data

    def test_405_method_not_allowed(self, client):
        """Test 405 error handling."""
        response = client.get('/api/summarize')  # Should be POST
        assert response.status_code == 405
        data = json.loads(response.data)
        assert 'error' in data

class TestGeminiService:
    """Test Gemini service functionality."""
    
    @patch('google.generativeai.configure')
    @patch('google.generativeai.GenerativeModel')
    def test_gemini_service_initialization(self, mock_model, mock_configure):
        """Test Gemini service initialization."""
        mock_model_instance = Mock()
        mock_model.return_value = mock_model_instance
        
        service = GeminiService()
        
        mock_configure.assert_called_once()
        mock_model.assert_called_once()

    @patch('services.gemini_service.GeminiService._generate_content')
    @pytest.mark.asyncio
    async def test_summarize_content(self, mock_generate):
        """Test content summarization."""
        mock_generate.return_value = "Test summary"
        
        service = GeminiService()
        result = await service.summarize_content("Test content")
        
        assert result == "Test summary"
        mock_generate.assert_called_once()

    @pytest.mark.asyncio
    async def test_summarize_empty_content(self):
        """Test summarization with empty content."""
        service = GeminiService()
        
        with pytest.raises(ValueError):
            await service.summarize_content("")

    @patch('services.gemini_service.GeminiService._generate_content')
    @pytest.mark.asyncio
    async def test_explain_content(self, mock_generate):
        """Test content explanation."""
        mock_generate.side_effect = ["Arabic explanation", "English explanation"]
        
        service = GeminiService()
        arabic, english = await service.explain_content("Test content")
        
        assert arabic == "Arabic explanation"
        assert english == "English explanation"
        assert mock_generate.call_count == 2

    @patch('services.gemini_service.GeminiService._generate_content')
    @pytest.mark.asyncio
    async def test_generate_exercises(self, mock_generate):
        """Test exercise generation."""
        mock_response = """
        Exercise 1:
        Question: What is Python?
        Answer: Python is a programming language.
        
        Exercise 2:
        Question: What is Flask?
        Answer: Flask is a web framework.
        
        Exercise 3:
        Question: What is an API?
        Answer: API stands for Application Programming Interface.
        """
        mock_generate.return_value = mock_response
        
        service = GeminiService()
        exercises = await service.generate_exercises("Test content")
        
        assert len(exercises) == 3
        assert all('question' in ex and 'answer' in ex for ex in exercises)

if __name__ == '__main__':
    pytest.main(['-v', __file__])
