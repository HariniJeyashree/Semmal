import asyncio
from sqlmodel import Session
from models.schema import RankingResult
from agents.jd_analyzer import analyze_jd
from agents.semantic_ranker import rank_candidate
from agents.bias_detector import audit_ranking
from agents.interview_planner import generate_interview_plan

async def run_hiring_pipeline(job_description: str, candidates_text: list[str], session: Session, job_session_id: str) -> list[RankingResult]:
    """
    Orchestrates the multi-agent pipeline.
    """
    # 1. JD Analyzer Agent
    extracted_jd = await analyze_jd(job_description)
    
    results = []
    
    # 2. Process each candidate
    for idx, candidate_text in enumerate(candidates_text):
        # Semantic Ranker
        ranking = await rank_candidate(extracted_jd, candidate_text, str(idx))
        
        # Bias Detector
        audited_ranking = await audit_ranking(ranking)
        
        # Interview Planner
        final_ranking = await generate_interview_plan(audited_ranking)
        final_ranking.session_id = job_session_id
        
        # Save to Neon DB Database
        session.add(final_ranking)
        
        results.append(final_ranking)
        
    # Commit all candidate results to the Database with a transient retry
    from sqlalchemy.exc import OperationalError
    from fastapi import HTTPException
    
    try:
        session.commit()
    except OperationalError:
        # Transient DB disconnect, rollback and retry once
        session.rollback()
        try:
            for r in results:
                session.add(r)
            session.commit()
        except Exception as e:
            raise HTTPException(status_code=503, detail="Database connection lost. Please try again.")
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail="Failed to save results to the database.")
        
    # Refresh to get DB assigned IDs
    for r in results:
        session.refresh(r)
        
    return results
