#!/bin/bash

# Whitepaper AI Setup Script
echo "🚀 Setting up Whitepaper AI Project"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check Python version
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
if [ "$(echo "$PYTHON_VERSION < 3.9" | bc -l)" -eq 1 ]; then
    echo "❌ Python 3.9 or higher is required. Current version: $(python3 --version)"
    exit 1
fi

echo "✅ Python $(python3 --version) detected"

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating frontend .env file..."
    cp .env.example .env
    echo "⚠️  Please edit frontend/.env with your Firebase configuration"
fi

cd ..

# Setup Backend
echo ""
echo "🐍 Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your configuration"
fi

# Download NLTK data
echo "Downloading NLTK data..."
python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True)"

# Download spaCy model
echo "Downloading spaCy model..."
python -m spacy download en_core_web_sm

cd ..

# Create start scripts
echo ""
echo "📝 Creating start scripts..."

# Create start-frontend.sh
cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🌐 Starting Whitepaper AI Frontend..."
cd frontend
npm run dev
EOF

# Create start-backend.sh
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🔧 Starting Whitepaper AI Backend..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
EOF

# Create start-all.sh
cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Whitepaper AI (Frontend + Backend)..."

# Start backend in background
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for Ctrl+C
echo "✅ Both servers are running!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo "Press Ctrl+C to stop both servers"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
EOF

# Make scripts executable
chmod +x start-frontend.sh start-backend.sh start-all.sh

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo "1. Configure your environment variables:"
echo "   - Edit backend/.env with Azure AI and MongoDB credentials"
echo "   - Edit frontend/.env with Firebase configuration"
echo ""
echo "2. Start the application:"
echo "   ./start-all.sh     # Start both frontend and backend"
echo "   ./start-frontend.sh # Start only frontend"
echo "   ./start-backend.sh  # Start only backend"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📚 For detailed setup instructions, see README.md"