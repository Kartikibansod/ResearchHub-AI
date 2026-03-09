from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import httpx
from .database import get_db, Paper, Workspace
from .auth import get_current_user, User
import io
import PyPDF2

router = APIRouter(prefix="/papers", tags=["papers"])

class PaperCreate(BaseModel):
    title: str
    authors: str
    abstract: str
    date: str
    url: str
    workspace_id: int

async def extract_pdf_text(pdf_url: str) -> str:
    """Download and extract text from arXiv PDF"""
    try:
        # Convert abstract URL to PDF URL
        # Example: https://arxiv.org/abs/2301.12345 -> https://arxiv.org/pdf/2301.12345.pdf
        if 'arxiv.org/abs/' in pdf_url:
            pdf_url = pdf_url.replace('/abs/', '/pdf/') + '.pdf'
        
        print(f"Downloading PDF from: {pdf_url}")
        
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            response = await client.get(pdf_url)
            
            if response.status_code != 200:
                print(f"Failed to download PDF: {response.status_code}")
                return ""
            
            # Extract text from PDF
            pdf_file = io.BytesIO(response.content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            # Extract text from all pages (limit to first 50 pages to avoid huge texts)
            max_pages = min(len(pdf_reader.pages), 50)
            for page_num in range(max_pages):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
            
            print(f"Extracted {len(text)} characters from {max_pages} pages")
            return text.strip()
            
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

class PaperResponse(BaseModel):
    id: int
    title: str
    authors: str
    abstract: str
    date: str
    url: str

    class Config:
        from_attributes = True

@router.get("/search")
async def search_papers(query: str, current_user: User = Depends(get_current_user)):
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            # ArXiv API - Use HTTPS
            arxiv_url = f"https://export.arxiv.org/api/query?search_query=all:{query}&max_results=10"
            print(f"Searching arXiv: {arxiv_url}")
            response = await client.get(arxiv_url)
            
            print(f"Response status: {response.status_code}")
            
            # Parse XML response
            papers = []
            if response.status_code == 200:
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.content)
                
                # Namespace for Atom feed
                ns = {'atom': 'http://www.w3.org/2005/Atom'}
                
                entries = root.findall('atom:entry', ns)
                print(f"Found {len(entries)} entries")
                
                for entry in entries:
                    try:
                        title_elem = entry.find('atom:title', ns)
                        title = title_elem.text.strip().replace('\n', ' ') if title_elem is not None else "No title"
                        
                        author_elems = entry.findall('atom:author', ns)
                        authors = ', '.join([
                            author.find('atom:name', ns).text 
                            for author in author_elems 
                            if author.find('atom:name', ns) is not None
                        ]) or "Unknown"
                        
                        summary_elem = entry.find('atom:summary', ns)
                        abstract = summary_elem.text.strip().replace('\n', ' ') if summary_elem is not None else "No abstract"
                        
                        published_elem = entry.find('atom:published', ns)
                        date = published_elem.text[:10] if published_elem is not None else "Unknown"
                        
                        id_elem = entry.find('atom:id', ns)
                        url = id_elem.text if id_elem is not None else ""
                        
                        papers.append({
                            "title": title,
                            "authors": authors,
                            "abstract": abstract,
                            "date": date,
                            "url": url
                        })
                    except Exception as e:
                        print(f"Error parsing entry: {e}")
                        continue
                
                print(f"Successfully parsed {len(papers)} papers")
            
            return papers
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/import", response_model=PaperResponse)
async def import_paper(paper: PaperCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    workspace = db.query(Workspace).filter(Workspace.id == paper.workspace_id, Workspace.user_id == current_user.id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Extract full text from PDF
    full_text = await extract_pdf_text(paper.url)
    
    # Create paper with full text
    paper_dict = paper.dict()
    paper_dict['full_text'] = full_text
    
    new_paper = Paper(**paper_dict)
    db.add(new_paper)
    db.commit()
    db.refresh(new_paper)
    return new_paper

@router.get("/workspace/{workspace_id}", response_model=List[PaperResponse])
def get_workspace_papers(workspace_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id, Workspace.user_id == current_user.id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    return workspace.papers

@router.post("/upload", response_model=PaperResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    workspace_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a PDF file and extract its content"""
    
    # Verify workspace belongs to user
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id, 
        Workspace.user_id == current_user.id
    ).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Check if file is PDF
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Read PDF content
        pdf_content = await file.read()
        pdf_file = io.BytesIO(pdf_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from all pages
        full_text = ""
        max_pages = min(len(pdf_reader.pages), 50)  # Limit to 50 pages
        for page_num in range(max_pages):
            page = pdf_reader.pages[page_num]
            full_text += page.extract_text() + "\n"
        
        # Extract title from filename (remove .pdf extension)
        title = file.filename.rsplit('.', 1)[0]
        
        # Create abstract from first 500 characters
        abstract = full_text[:500].strip() + "..." if len(full_text) > 500 else full_text.strip()
        
        # Create paper entry
        new_paper = Paper(
            title=title,
            authors="Uploaded by user",
            abstract=abstract,
            full_text=full_text.strip(),
            date="",
            url="",
            workspace_id=workspace_id
        )
        
        db.add(new_paper)
        db.commit()
        db.refresh(new_paper)
        
        return new_paper
        
    except Exception as e:
        print(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")
