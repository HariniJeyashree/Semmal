from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from sqlmodel import SQLModel, Field as SQLField
from datetime import datetime
import uuid

class User(SQLModel, table=True):
    id: str = SQLField(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = SQLField(unique=True, index=True)
    hashed_password: str
    created_at: datetime = SQLField(default_factory=datetime.utcnow)

class JobSession(SQLModel, table=True):
    id: str = SQLField(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = SQLField(foreign_key="user.id", ondelete="CASCADE", index=True)
    job_title: str
    job_description: str
    created_at: datetime = SQLField(default_factory=datetime.utcnow)

class RankingResult(SQLModel, table=True):
    id: str = SQLField(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    session_id: str = SQLField(foreign_key="jobsession.id", ondelete="CASCADE", index=True, default="")
    created_at: datetime = SQLField(default_factory=datetime.utcnow)
    
    candidate_id: str
    candidate_name: str
    score: float
    reasoning: str
    bias_flag: bool = False
    bias_details: Optional[str] = None
    interview_plan: Optional[str] = None

class InterviewAnswer(SQLModel, table=True):
    id: str = SQLField(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    session_id: str = SQLField(foreign_key="jobsession.id", ondelete="CASCADE", index=True)
    question_text: str
    user_answer_text: str
    ai_feedback: str
    score: int
    created_at: datetime = SQLField(default_factory=datetime.utcnow)

class AnalysisRequest(BaseModel):
    job_description: str
    candidates_text: List[str]
