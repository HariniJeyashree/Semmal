from fastapi import APIRouter, UploadFile, Form, File, HTTPException, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List
from sqlmodel import Session
from models.schema import RankingResult, User
from agents.orchestrator import run_hiring_pipeline
from core.pdf_parser import extract_text_from_pdf
from core.db import get_session
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/analyze", response_model=List[RankingResult])
async def analyze_candidates(
    job_description: str = Form(...),
    files: List[UploadFile] = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Kicks off the Multi-Agent Hiring Pipeline.
    1. Parse uploaded PDFs to text.
    2. JD Analyzer extracts requirements.
    3. Semantic Ranker evaluates each candidate.
    4. Bias Detector audits the rankings.
    5. Interview Planner generates custom questions.
    """
    candidates_text = []
    for file in files:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
        pdf_bytes = await file.read()
        text = extract_text_from_pdf(pdf_bytes)
        
        if not text:
            # Fallback for unreadable PDFs
            text = f"[Unreadable PDF: {file.filename}]"
            
        candidates_text.append(text)
    if not candidates_text:
        raise HTTPException(status_code=400, detail="Could not extract text from the provided PDFs.")
        
    from models.schema import JobSession
    
    # Create JobSession
    title_snippet = job_description[:50] + "..." if len(job_description) > 50 else job_description
    job_session = JobSession(
        user_id=current_user.id,
        job_title=title_snippet,
        job_description=job_description
    )
    session.add(job_session)
    session.commit()
    session.refresh(job_session)

    results = await run_hiring_pipeline(job_description, candidates_text, session, job_session.id)
    return results
@router.post("/skill-gap")
async def get_skill_gap(
    job_description: str = Form(...),
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    from agents.skill_gap_analyzer import analyze_skill_gap
    
    if not files:
        raise HTTPException(status_code=400, detail="At least one PDF file is required.")
        
    # Analyze only the first resume for skill gap
    file = files[0]
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    pdf_bytes = await file.read()
    text = extract_text_from_pdf(pdf_bytes)
    
    if not text:
        raise HTTPException(status_code=400, detail="Could not read text from PDF.")
        
    result = await analyze_skill_gap(text, job_description)
    return result

@router.post("/optimize")
async def get_resume_optimization(
    job_description: str = Form(...),
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    from agents.resume_optimizer import optimize_resume
    
    if not files:
        raise HTTPException(status_code=400, detail="At least one PDF file is required.")
        
    file = files[0]
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    pdf_bytes = await file.read()
    text = extract_text_from_pdf(pdf_bytes)
    
    if not text:
        raise HTTPException(status_code=400, detail="Could not read text from PDF.")
        
    result = await optimize_resume(text, job_description)
    return result

@router.post("/jobs")
async def get_job_recommendations(
    location: str = Form("Remote"),
    experience_level: str = Form("Mid-Level"),
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    from agents.job_finder import find_jobs
    
    if not files:
        raise HTTPException(status_code=400, detail="At least one PDF file is required.")
        
    file = files[0]
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    pdf_bytes = await file.read()
    text = extract_text_from_pdf(pdf_bytes)
    
    if not text:
        raise HTTPException(status_code=400, detail="Could not read text from PDF.")
        
    result = await find_jobs(text, location, experience_level)
    return result

class PDFRequest(BaseModel):
    markdown: str

@router.post("/export/pdf")
async def export_pdf(request: PDFRequest, current_user: User = Depends(get_current_user)):
    from core.pdf_generator import generate_resume_pdf
    try:
        pdf_bytes = generate_resume_pdf(request.markdown)
        return Response(
            content=pdf_bytes, 
            media_type="application/pdf", 
            headers={"Content-Disposition": 'attachment; filename="Optimized_Resume.pdf"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
