from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from .database import get_db, Chat, Workspace, Paper
from .auth import get_current_user, User
from .utils import get_groq_response, generate_embedding
import numpy as np

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    workspace_id: int
    message: str

class ChatResponse(BaseModel):
    response: str

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"Chat request for workspace {request.workspace_id}: {request.message}")
    
    workspace = db.query(Workspace).filter(Workspace.id == request.workspace_id, Workspace.user_id == current_user.id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Get papers from workspace
    papers = workspace.papers
    print(f"Found {len(papers)} papers in workspace")
    
    if len(papers) == 0:
        return {"response": "I don't have any papers to analyze in this workspace yet. Please import some papers first by going to 'Search Papers' and clicking 'Import to Workspace' on papers you're interested in."}
    
    # Generate embedding for user query
    query_embedding = generate_embedding(request.message)
    
    # Find relevant papers using vector similarity
    relevant_papers = []
    for paper in papers:
        # Use full_text if available, otherwise fall back to abstract
        paper_content = paper.full_text if paper.full_text else paper.abstract
        paper_embedding = generate_embedding(paper_content[:1000])  # Use first 1000 chars for embedding
        similarity = cosine_similarity(query_embedding, paper_embedding)
        print(f"Similarity for '{paper.title[:50]}...': {similarity:.3f}")
        if similarity > 0.2:  # Lower threshold for better results
            relevant_papers.append((paper, similarity))
    
    # Sort by similarity
    relevant_papers.sort(key=lambda x: x[1], reverse=True)
    print(f"Found {len(relevant_papers)} relevant papers")
    
    if len(relevant_papers) == 0:
        # If no relevant papers, use all papers
        relevant_papers = [(p, 0) for p in papers[:3]]
        print("No relevant papers found, using all papers")
    
    # Build context from relevant papers - use full text if available
    context_parts = []
    for i, (paper, sim) in enumerate(relevant_papers[:3]):  # Top 3 papers
        # Use full_text if available, otherwise use abstract
        if paper.full_text and len(paper.full_text) > 100:
            # Use first 3000 characters of full text to stay within token limits
            content = paper.full_text[:3000]
            context_parts.append(f"Paper {i+1}:\nTitle: {paper.title}\nAuthors: {paper.authors}\nContent: {content}...")
        else:
            context_parts.append(f"Paper {i+1}:\nTitle: {paper.title}\nAuthors: {paper.authors}\nAbstract: {paper.abstract}")
    
    context = "\n\n".join(context_parts)
    
    print(f"Context length: {len(context)} characters")
    
    # Create messages for Groq
    messages = [
        {"role": "system", "content": "You are a research assistant helping analyze academic papers. Provide precise, evidence-based answers based on the full paper content provided. Cite specific sections or findings when possible. If the content doesn't contain enough information to answer the question, say so clearly."},
        {"role": "user", "content": f"I have the following research papers:\n\n{context}\n\nBased on these papers, please answer: {request.message}"}
    ]
    
    try:
        # Get response from Groq
        print("Calling Groq API...")
        response = get_groq_response(messages)
        print(f"Got response: {response[:100]}...")
        
        # Save chat history
        chat_entry = Chat(message=request.message, response=response, workspace_id=request.workspace_id)
        db.add(chat_entry)
        db.commit()
        
        return {"response": response}
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@router.get("/history/{workspace_id}")
def get_chat_history(workspace_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id, Workspace.user_id == current_user.id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    return workspace.chats

@router.delete("/history/{workspace_id}")
def clear_chat_history(workspace_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id, Workspace.user_id == current_user.id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Delete all chats for this workspace
    db.query(Chat).filter(Chat.workspace_id == workspace_id).delete()
    db.commit()
    
    return {"message": "Chat history cleared successfully"}
