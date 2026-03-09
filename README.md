# ResearchHub AI

An intelligent, AI-powered research paper management platform built with React, TypeScript, FastAPI, and Groq's Llama 3.3 70B model.

## Features

- **Paper Discovery**: Search academic databases (arXiv) with intelligent filtering
- **Workspace Management**: Organize papers into project-specific workspaces
- **AI Chatbot**: Context-aware research assistant powered by Groq Llama 3.3 70B
- **Vector Search**: Semantic paper retrieval using sentence embeddings
- **Secure Authentication**: JWT-based auth with bcrypt password hashing

## Setup Instructions

### Backend Setup

1. Create Python virtual environment:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

2. Configure environment variables:
```bash
copy .env.example .env
```

Edit `.env` and add:
- `GROQ_API_KEY`: Get from https://console.groq.com
- `SECRET_KEY`: Generate with `openssl rand -hex 32`
- `DATABASE_URL`: PostgreSQL connection string (or use SQLite default)

3. Start backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm start
```

The app will open at http://localhost:3000

## Usage

1. **Register/Login**: Create an account or login
2. **Create Workspace**: Navigate to Workspaces and create a project workspace
3. **Search Papers**: Use the Search tab to find papers from arXiv
4. **Import Papers**: Click "Import to Workspace" to add papers
5. **Chat with AI**: Ask questions about your papers in the AI Chat tab

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy
- **AI**: Groq Llama 3.3 70B (temperature 0.3)
- **Embeddings**: sentence-transformers (all-MiniLM-L6-v2)
- **Database**: PostgreSQL (or SQLite for development)
- **Auth**: JWT tokens with bcrypt hashing

## API Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /papers/search` - Search papers
- `POST /papers/import` - Import paper to workspace
- `POST /chat` - Send message to AI assistant
- `GET /workspaces` - List user workspaces
- `POST /workspaces` - Create new workspace
