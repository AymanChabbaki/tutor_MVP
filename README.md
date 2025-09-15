# AI Bootcamp Tutor MVP Backend

A production-ready backend service for an AI-powered educational tutor that helps students understand course content through summarization, explanation, and exercise generation using Google's Gemini AI.

## 🚀 Features

- **Content Summarization**: Generate concise summaries of course content
- **Multilingual Explanations**: Detailed explanations in both Arabic and English
- **Exercise Generation**: Automatic creation of educational exercises with questions and answers
- **User Management**: Track users and their learning sessions
- **Session History**: Store and retrieve past interactions
- **Production Ready**: Docker support, proper error handling, and logging

## 🛠️ Tech Stack

- **Framework**: Flask (Python 3.10+)
- **Database**: PostgreSQL with Prisma ORM
- **AI Service**: Google Gemini API
- **Authentication**: JWT ready (extendable)
- **Containerization**: Docker & Docker Compose
- **Architecture**: Clean architecture with separation of concerns

## 📁 Project Structure

```
tutor_MVP/
├── app.py                  # Flask application entry point
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Multi-service setup
├── .env.example          # Environment variables template
├── README.md             # Documentation
├── config/
│   ├── __init__.py
│   └── settings.py       # Application configuration
├── routes/
│   ├── __init__.py
│   └── api.py           # API endpoints
├── services/
│   ├── __init__.py
│   └── gemini_service.py # Gemini AI integration
├── db/
│   ├── __init__.py
│   └── database.py      # Database operations
└── prisma/
    └── schema.prisma    # Database schema
```

## 🚦 Quick Start

### Prerequisites

- Python 3.10 or higher
- PostgreSQL 13+ (or use Docker)
- Google Gemini API key
- Docker (optional, for containerized deployment)

### 1. Clone and Setup

```bash
# Navigate to your project directory
cd c:\Users\HP\Desktop\tutor_MVP

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
# Copy environment template
copy .env.example .env
```

Edit `.env` file with your values:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/tutor_db

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=true
SECRET_KEY=your-secret-key-change-in-production
```

### 3. Database Setup

```bash
# Install Prisma CLI
pip install prisma

# Generate Prisma client
prisma generate

# Run database migrations
prisma db push
```

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 5. Run the Application

```bash
# Development mode
python app.py

# Or using Flask CLI
flask run
```

The API will be available at `http://localhost:5000`

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Set environment variables
echo GEMINI_API_KEY=your_api_key_here > .env
echo SECRET_KEY=your_secret_key_here >> .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t tutor-backend .

# Run container
docker run -p 5000:5000 --env-file .env tutor-backend
```

## 📋 API Endpoints

### Health Check
```http
GET /health
```

### Content Summarization
```http
POST /api/summarize
Content-Type: application/json

{
  "text": "Course content to summarize",
  "user_id": 1  // optional
}
```

**Response:**
```json
{
  "summary": "Generated summary of the content",
  "session_id": 123  // if user_id provided
}
```

### Content Explanation
```http
POST /api/explain
Content-Type: application/json

{
  "text": "Course content to explain",
  "user_id": 1  // optional
}
```

**Response:**
```json
{
  "arabic_explanation": "Detailed explanation in Arabic",
  "english_explanation": "Detailed explanation in English",
  "session_id": 123  // if user_id provided
}
```

### Exercise Generation
```http
POST /api/generate_exercises
Content-Type: application/json

{
  "text": "Course content for exercises",
  "user_id": 1  // optional
}
```

**Response:**
```json
{
  "exercises": [
    {
      "question": "What is the main concept?",
      "answer": "The main concept is..."
    },
    {
      "question": "How does this work?",
      "answer": "It works by..."
    },
    {
      "question": "What are the benefits?",
      "answer": "The benefits include..."
    }
  ],
  "session_id": 123  // if user_id provided
}
```

### User Management
```http
POST /api/users
Content-Type: application/json

{
  "name": "Student Name",
  "email": "student@example.com",
  "language_pref": "english"  // optional
}
```

### Get User Sessions
```http
GET /api/users/{email}/sessions?limit=10
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  language_pref VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  output_summary TEXT,
  output_explanation TEXT,
  output_exercises JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | - | ✅ |
| `FLASK_ENV` | Flask environment | `development` | ❌ |
| `FLASK_DEBUG` | Enable debug mode | `false` | ❌ |
| `SECRET_KEY` | Flask secret key | - | ✅ (production) |
| `PORT` | Server port | `5000` | ❌ |
| `GEMINI_MODEL` | Gemini model name | `gemini-1.5-flash` | ❌ |
| `MAX_TOKENS` | Max response tokens | `1000` | ❌ |
| `TEMPERATURE` | AI creativity level | `0.7` | ❌ |
| `CORS_ORIGINS` | Allowed CORS origins | `*` | ❌ |

### Gemini AI Models

Supported models:
- `gemini-1.5-flash` (recommended for speed)
- `gemini-1.5-pro` (for complex tasks)
- `gemini-pro` (legacy)

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-mock

# Run tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_api.py
```

## 📊 Logging

The application uses structured logging:

- **Console**: Real-time logs during development
- **File**: `app.log` for persistent logging
- **Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL

Configure log level via `LOG_LEVEL` environment variable.

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Production environment
FLASK_ENV=production
FLASK_DEBUG=false
SECRET_KEY=strong-secret-key-here
DATABASE_URL=postgresql://user:pass@prod-db:5432/tutor_db
```

### 2. Database Migration
```bash
# Run migrations
prisma db push

# Verify connection
prisma db pull
```

### 3. Performance Tuning
- Use `gunicorn` with multiple workers
- Enable database connection pooling
- Configure proper CORS origins
- Set up monitoring and alerting

### 4. Security Checklist
- [ ] Strong SECRET_KEY set
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] API rate limiting (implement if needed)
- [ ] Input validation enabled
- [ ] Logs don't contain sensitive data

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   pg_isready -h localhost -p 5432
   
   # Verify credentials
   psql -h localhost -U username -d database_name
   ```

2. **Gemini API Error**
   ```bash
   # Test API key
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        "https://generativelanguage.googleapis.com/v1/models"
   ```

3. **Import Errors**
   ```bash
   # Regenerate Prisma client
   prisma generate
   
   # Check Python path
   python -c "import sys; print(sys.path)"
   ```

4. **Port Already in Use**
   ```bash
   # Windows: Find and kill process
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Or use different port
   set PORT=8000
   python app.py
   ```

## 📈 Performance Tips

1. **Database Optimization**
   - Add indexes on frequently queried columns
   - Use connection pooling
   - Implement query pagination

2. **API Response Time**
   - Cache Gemini responses for similar content
   - Implement request queuing for high load
   - Use async processing where possible

3. **Memory Management**
   - Monitor memory usage with large text inputs
   - Implement input size limits
   - Use streaming for large responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review logs in `app.log`
3. Create an issue with detailed error information

---

**Built with ❤️ for educational excellence**
