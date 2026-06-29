from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from models.schema import JobSession, RankingResult, User
from core.db import get_session
from core.dependencies import get_current_user

router = APIRouter()

@router.get("/")
async def get_sessions(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> List[JobSession]:
    statement = select(JobSession).where(JobSession.user_id == current_user.id).order_by(JobSession.created_at.desc())
    results = session.exec(statement).all()
    return results

@router.get("/{session_id}")
async def get_session_details(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    job_session = db.get(JobSession, session_id)
    if not job_session:
        raise HTTPException(status_code=404, detail="Session not found")
    if job_session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
        
    statement = select(RankingResult).where(RankingResult.session_id == session_id)
    ranking_results = db.exec(statement).all()
    
    return {
        "session": job_session,
        "results": ranking_results
    }

@router.delete("/{session_id}")
async def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    job_session = db.get(JobSession, session_id)
    if not job_session:
        raise HTTPException(status_code=404, detail="Session not found")
    if job_session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this session")
        
    # Delete associated ranking results first
    statement = select(RankingResult).where(RankingResult.session_id == session_id)
    results = db.exec(statement).all()
    for res in results:
        db.delete(res)
        
    db.delete(job_session)
    db.commit()
    
    return {"message": "Session deleted successfully"}
