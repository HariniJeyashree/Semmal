from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from core.db import get_session
from core.dependencies import get_current_user
from models.schema import JobSession, InterviewAnswer, User
from agents.interview_evaluator import evaluate_answer
from pydantic import BaseModel

router = APIRouter(prefix="/interview", tags=["Interview"])

class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_text: str
    user_answer_text: str

@router.post("/submit")
async def submit_answer(
    request: SubmitAnswerRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Get the job session to get the job description
    statement = select(JobSession).where(
        JobSession.id == request.session_id,
        JobSession.user_id == current_user.id
    )
    job_session = db.exec(statement).first()
    
    if not job_session:
        raise HTTPException(status_code=404, detail="Job Session not found or unauthorized")
        
    # Evaluate the answer
    evaluation = await evaluate_answer(
        job_session.job_description,
        request.question_text,
        request.user_answer_text
    )
    
    # Save the answer
    answer = InterviewAnswer(
        session_id=request.session_id,
        question_text=request.question_text,
        user_answer_text=request.user_answer_text,
        ai_feedback=evaluation.ai_feedback,
        score=evaluation.score
    )
    
    db.add(answer)
    db.commit()
    db.refresh(answer)
    
    return answer

@router.get("/session/{session_id}")
async def get_session_answers(
    session_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Verify the session belongs to the user
    statement = select(JobSession).where(
        JobSession.id == session_id,
        JobSession.user_id == current_user.id
    )
    job_session = db.exec(statement).first()
    
    if not job_session:
        raise HTTPException(status_code=404, detail="Job Session not found or unauthorized")
        
    # Get all answers
    statement = select(InterviewAnswer).where(InterviewAnswer.session_id == session_id).order_by(InterviewAnswer.created_at.desc())
    answers = db.exec(statement).all()
    
    return answers
