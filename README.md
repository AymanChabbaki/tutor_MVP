# AI Bootcamp Tutor V2 🤖📚

A comprehensive AI-powered educational platform built with Flask + React, featuring JWT authentication, session management, and collection organization for personalized learning experiences.

## 🚀 Features

### 🔐 Authentication System
- **JWT-based Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for secure password storage
- **Protected Routes**: Middleware-based route protection
- **User Registration & Login**: Complete user management system

### 🧠 AI-Powered Learning
- **Content Summarization**: Generate concise summaries using Google Gemini AI
- **Intelligent Explanations**: Get detailed explanations in Arabic, English, or both
- **Exercise Generation**: Create practice exercises from course content
- **Multi-language Support**: Arabic RTL and English LTR text support

### 📊 Session Management
- **Persistent Sessions**: Save all AI interactions with full context
- **Session History**: Track learning progress over time
- **Session Types**: Categorized by summary, explanation, or exercises
- **User-specific Sessions**: Each user's data is isolated and secure

### 📁 Collection System
- **Organize Learning**: Group related sessions into themed collections
- **Collection Management**: Create, update, delete, and organize collections
- **Session Assignment**: Add/remove sessions from collections
- **Learning Paths**: Build structured learning experiences

### 🌐 Modern Frontend
- **React + Vite**: Fast development and build system
- **Arabic RTL Support**: Proper bidirectional text rendering
- **Markdown Rendering**: Beautiful formatting for AI responses
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Flask**: Python web framework
- **PostgreSQL**: Robust relational database
- **Prisma ORM**: Type-safe database client
- **JWT**: JSON Web Token authentication
- **bcrypt**: Password hashing
- **Google Gemini AI**: Large language model integration

### Frontend
- **React 18**: Modern UI library
- **Vite**: Fast build tool
- **React Markdown**: Markdown rendering
- **Tajawal Font**: Arabic typography
- **CSS Modules**: Scoped styling

## 📋 Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL 12+**
- **Google Gemini API Key**

## ⚡ Quick Start

### 1. Clone & Setup
```bash
git clone <repository-url>
cd tutor_MVP
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env

# Edit .env file with your credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/ai_bootcamp_tutor_v2
# GEMINI_API_KEY=your_gemini_api_key_here
# JWT_SECRET=your-super-secret-jwt-key
```

### 3. Database Setup
```bash
# Generate Prisma client
prisma generate

# Run database migrations
prisma db push

# (Optional) Seed sample data
prisma db seed
```

### 4. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Start Backend
```bash
# From project root
python app.py
```

## 🔑 Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ai_bootcamp_tutor_v2

# AI Service
GEMINI_API_KEY=your_gemini_api_key_here

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SECRET_KEY=your-flask-secret-key-change-in-production
```

### Optional Variables
```bash
# JWT Configuration
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Security
BCRYPT_ROUNDS=12

# Application Limits
MAX_SESSIONS_PER_USER=100
MAX_COLLECTIONS_PER_USER=50
MAX_SESSIONS_PER_COLLECTION=1000

# Development
DEBUG=True
FLASK_ENV=development
LOG_LEVEL=INFO
```

## 🔌 API Endpoints

### Authentication
```
POST /auth/register    - User registration
POST /auth/login       - User login  
GET  /auth/me          - Get current user info
```

### AI Services (Optional Auth)
```
POST /api/summarize       - Generate content summary
POST /api/explain         - Generate explanations
POST /api/generate_exercises - Create practice exercises
```

### Session Management (Protected)
```
GET    /api/sessions           - List user sessions
DELETE /api/sessions/{id}      - Delete session
```

### Collections (Protected)  
```
GET    /api/collections        - List user collections
POST   /api/collections        - Create collection
PUT    /api/collections/{id}   - Update collection
DELETE /api/collections/{id}   - Delete collection

POST   /api/collections/{id}/sessions/{sid} - Add session to collection
DELETE /api/collections/{id}/sessions/{sid} - Remove session from collection
```

### Utility
```
GET /api/health    - Service health check
GET /health        - Root health check  
GET /              - API documentation
```

## 📊 Database Schema

### Users
- `id`: Primary key
- `email`: Unique email address
- `name`: User display name
- `password`: bcrypt hashed password
- `languagePref`: Preferred language (en/ar)
- `createdAt`: Registration timestamp

### Sessions
- `id`: Primary key
- `userId`: Foreign key to Users
- `collectionId`: Optional foreign key to Collections
- `inputText`: Original user input
- `outputSummary`: AI-generated summary
- `outputExplanation`: AI-generated explanation
- `outputExercises`: AI-generated exercises (JSON)
- `sessionType`: Type of session (summary/explanation/exercises)
- `createdAt`: Session creation timestamp

### Collections
- `id`: Primary key
- `userId`: Foreign key to Users
- `name`: Collection name
- `description`: Optional description
- `createdAt`: Collection creation timestamp

## 🔒 Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Tokens**: Secure session management
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Prisma ORM protection
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Secure error responses

## 🌍 Multi-language Support

### Arabic Support
- **RTL Text Direction**: Automatic detection and rendering
- **Arabic Typography**: Tajawal font for beautiful Arabic text
- **Bidirectional Text**: Mixed Arabic/English content support

### Language Options
- **Arabic**: Full RTL support with proper typography
- **English**: Standard LTR support
- **Both**: Side-by-side bilingual responses

## 🧪 Testing

```bash
# Run backend tests
python -m pytest tests/

# Run frontend tests
cd frontend
npm test

# Run integration tests
npm run test:integration
```

## 📦 Production Deployment

### Environment Setup
```bash
# Set production environment variables
export FLASK_ENV=production
export DEBUG=False
export JWT_SECRET=your-production-jwt-secret
export SECRET_KEY=your-production-secret-key
```

### Database Migration
```bash
# Run production migrations
prisma migrate deploy
```

### Build Frontend
```bash
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI**: Powering the intelligent features
- **Prisma**: Excellent database toolkit
- **React Community**: Amazing ecosystem and tools
- **Flask Community**: Solid Python web framework

## 📞 Support

For support, email [your-email] or create an issue in the repository.

---

**AI Bootcamp Tutor V2** - Empowering education through intelligent technology 🚀