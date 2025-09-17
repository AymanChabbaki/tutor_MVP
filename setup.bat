@echo off
REM AI Boo# Install depend# Generate Prisma client
echo 🗄️ Setting up database client...
cd backend && prisma generate && cd ..ies
echo 📥 Installing dependencies...
pip install -r backend/requirements.txtmp Tutor MVP - Windows Setup Script

echo 🚀 Setting up AI Bootcamp Tutor MVP...

REM Check Python version
python --version
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.10+ first.
    pause
    exit /b 1
)

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Setup environment file
echo ⚙️ Setting up environment configuration...
if not exist .env (
    copy .env.example .env
    echo ✅ Created .env file from template
    echo ⚠️  Please edit .env file with your actual values
) else (
    echo ✅ .env file already exists
)

REM Generate Prisma client
echo 🗄️ Setting up database client...
prisma generate

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit backend/.env file with your database URL and Gemini API key
echo 2. Start PostgreSQL database
echo 3. Run: cd backend && prisma db push
echo 4. Run: cd backend && python app.py
echo.
echo 🌟 Your AI Tutor backend will be running at http://localhost:5000

pause
