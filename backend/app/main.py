from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from .auth import router as auth_router, get_current_user, User
from .papers import router as papers_router
from .chat import router as chat_router
from .database import get_db, Workspace

app = FastAPI(title="ResearchHub AI")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(papers_router)
app.include_router(chat_router)

class WorkspaceCreate(BaseModel):
    name: str

class WorkspaceResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

@app.get("/")
def root():
    return {"message": "ResearchHub AI API"}

@app.post("/workspaces", response_model=WorkspaceResponse)
def create_workspace(workspace: WorkspaceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_workspace = Workspace(name=workspace.name, user_id=current_user.id)
    db.add(new_workspace)
    db.commit()
    db.refresh(new_workspace)
    return new_workspace

@app.get("/workspaces", response_model=List[WorkspaceResponse])
def get_workspaces(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return current_user.workspaces
