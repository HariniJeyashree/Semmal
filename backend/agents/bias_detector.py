import os
from pydantic import BaseModel, Field
from models.schema import RankingResult
from core.llm_client import generate_completion

class BiasAuditResponse(BaseModel):
    bias_detected: bool = Field(description="True if any bias is detected, False otherwise.")
    explanation: str = Field(description="Detailed explanation of the bias found, or why the reasoning is fair.")

async def audit_ranking(ranking: RankingResult) -> RankingResult:
    """
    Agent: Bias Detector
    Audits the Semantic Ranker's reasoning to ensure no demographic, gender, 
    or unfair educational/background bias influenced the score.
    """
    prompt = f"""
    You are a strict HR Ethics & Security Auditor. 
    Review the following reasoning provided by an AI recruiter for evaluating a candidate:
    
    REASONING:
    "{ranking.reasoning}"
    
    Check for ANY signs of bias:
    1. Demographic bias (race, gender, age).
    2. Educational elitism (penalizing non-traditional paths like bootcamps vs. Ivy League).
    3. Unfair assumptions about background.
    
    Did the AI recruiter's reasoning exhibit any bias? 
    """
    
    response = await generate_completion(prompt, BiasAuditResponse)
    data = response["data"]
    
    ranking.bias_flag = data["bias_detected"]
    if ranking.bias_flag:
        ranking.bias_details = data["explanation"]
        
    return ranking
