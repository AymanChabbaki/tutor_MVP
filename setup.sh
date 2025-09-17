#!/bin/bash

# AI Bootcamp Tutor MVP - Quick Setup Script

echo "🚀 Setting up AI Bootcamp Tutor MVP..."

# Check Python version
python_version=$(python --version 2>&1)
echo "Python version: $python_version"

# Create virtual environment
echo "📦 Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate  # Linux/Mac
# For Windows: venv\Scripts\activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r backend/requirements.txt

# Setup environment file
echo "⚙️ Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please edit .env file with your actual values"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo "🗄️ Setting up database client..."
cd backend && prisma generate && cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env file with your database URL and Gemini API key"
echo "2. Start PostgreSQL database"
echo "3. Run: cd backend && prisma db push"
echo "4. Run: cd backend && python app.py"
echo ""
echo "🌟 Your AI Tutor backend will be running at http://localhost:5000"
