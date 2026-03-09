@echo off
echo Starting ResearchHub AI Backend...
cd backend
call venv\Scripts\activate.bat
uvicorn app.main:app --reload --port 8000
