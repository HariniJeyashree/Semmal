import os
from pydantic import BaseModel, Field
from typing import List
from models.schema import RankingResult
from core.llm_client import generate_completion

class InterviewPlanResponse(BaseModel):
    questions: List[str] = Field(description="List of 3 custom interview questions.")

async def generate_interview_plan(ranking: RankingResult) -> RankingResult:
    """
    Agent: Interview Planner
    Generates customized interview questions based on the Semantic Ranker's reasoning.
    """
    prompt = f"""
    You are an expert Technical Interview Planner.
    Based on the following evaluation of a candidate, generate exactly 3 highly targeted interview questions.
    The questions should focus on probing their weaknesses or verifying their strengths mentioned in the evaluation.
    
    CANDIDATE EVALUATION:
    Score: {ranking.score}/100
    Reasoning: "{ranking.reasoning}"
    """
    
    response = await generate_completion(prompt, InterviewPlanResponse)
    data = response["data"]
    
    # Format questions as a nice string
    plan_str = "\n".join([f"{i+1}. {q}" for i, q in enumerate(data["questions"])])
    ranking.interview_plan = plan_str
    
    return ranking
