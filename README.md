# Whitepaper AI

"Turn any whitepaper into an interactive learning course in minutes."

## Overview

Whitepaper AI transforms complex technical whitepapers into structured, interactive learning experiences using Azure AI's gpt-4o model. The platform analyzes academic and technical documents, breaks them into digestible learning modules, and generates interactive educational content including flashcards, quizzes, and progress tracking.

## Features

- **Whitepaper Ingestion**: Upload PDFs, URLs, or paste text directly
- **AI-Powered Content Structuring**: Automatic curriculum generation with 3-7 modules
- **Interactive Learning**: Flashcards, quizzes, and checkpoints with spaced repetition
- **Progress Tracking**: Visual dashboards, achievements, and cross-device sync
- **Export & Sharing**: PDF, PowerPoint, Notion templates, and collaborative features

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS + Headless UI
- PDF.js for document preview
- React Context API for state management

### Backend
- FastAPI (Python)
- PyPDF2 + Tesseract OCR for document processing
- spaCy, NLTK for text processing
- ChromaDB for vector search
- MongoDB for user data
- Firebase Auth for authentication
- AWS S3 for document storage

### AI Integration
- Azure AI gpt-4o model
- Custom processing pipeline for educational content generation

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Azure AI credentials
- MongoDB instance
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd whitepaper-ai
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Create .env file in backend directory
AZURE_AI_TOKEN=your_token_here
AZURE_AI_ENDPOINT=https://models.inference.ai.azure.com
AZURE_AI_MODEL_NAME=gpt-4o
MONGODB_URI=your_mongodb_uri
FIREBASE_CONFIG=your_firebase_config
```

5. Start the applications:
```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Project Structure

```
whitepaper-ai/
├── frontend/               # React application
├── backend/                # FastAPI server
├── config/                 # Configuration files
└── README.md
```

## Development Timeline

- **Phase 1**: Foundation (Weeks 1-2)
- **Phase 2**: Learning Engine (Weeks 3-4)
- **Phase 3**: Polish & Export (Weeks 5-6)
- **Phase 4**: Optimization (Week 7)

## Contributing

Please read the PRD document for detailed requirements and implementation guidelines.

## License

MIT License