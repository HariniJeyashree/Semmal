import os
from pydantic import BaseModel, Field
from typing import List
from core.llm_client import generate_completion

class JDAnalysis(BaseModel):
    extracted_skills: List[str] = Field(description="List of technical hard skills required.")
    soft_skills: List[str] = Field(description="List of soft skills and behavioral traits required.")
    years_experience: str = Field(description="Minimum years of experience required, or 'Not Specified'.")
    core_responsibilities: List[str] = Field(description="Brief list of 3-5 main responsibilities.")

async def analyze_jd(job_description: str) -> dict:
    """
    Agent: JD Analyzer
    Uses unified LLM client to extract structured requirements from messy JD text.
    """
    prompt = f"Analyze the following job description and extract the key requirements:\n\n{job_description}"
    
    response = await generate_completion(prompt, JDAnalysis)
    parsed_data = response["data"]
    parsed_data["original_text"] = job_description
    parsed_data["llm_provider"] = response["provider"]

    
    return parsed_data
