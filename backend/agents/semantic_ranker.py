import os
import chromadb
from pydantic import BaseModel, Field
from models.schema import RankingResult
from core.llm_client import generate_completion

# Setup Local ChromaDB for Semantic Search
chroma_client = chromadb.Client()
# Create an in-memory collection for the current job session
# In production, this would persist to disk
collection = chroma_client.get_or_create_collection(name="job_candidates")

class RankerResponse(BaseModel):
    score: float = Field(description="A score from 0 to 100 indicating semantic match.")
    reasoning: str = Field(description="Detailed explanation of why the candidate matches or falls short based on the JD.")

async def rank_candidate(extracted_jd: dict, candidate_text: str, candidate_id: str) -> RankingResult:
    """
    Agent: Semantic Ranker
    Uses ChromaDB to embed the candidate resume and unified LLM client to rank them.
    """
    # 1. Add candidate to Vector Database
    collection.upsert(
        documents=[candidate_text],
        metadatas=[{"candidate_id": candidate_id}],
        ids=[candidate_id]
    )
    
    # 2. Prompt LLM to evaluate the match
    prompt = f"""
    You are an expert technical recruiter. 
    Evaluate the following candidate's resume text against these extracted Job Requirements:
    
    JOB REQUIREMENTS:
    Skills: {', '.join(extracted_jd.get('extracted_skills', []))}
    Soft Skills: {', '.join(extracted_jd.get('soft_skills', []))}
    
    CANDIDATE RESUME:
    {candidate_text}
    
    Analyze the semantic match between the candidate's experience and the job requirements.
    Provide a score (0-100) and a detailed reasoning.
    """
    
    response = await generate_completion(prompt, RankerResponse)
    parsed_data = response["data"]
    
    score = parsed_data.get("score", 0.0)
    reasoning = parsed_data.get("reasoning", "Analysis failed.")
    
    # In a real app, you would look up the candidate's name
    candidate_name = f"Candidate {candidate_id.split('_')[-1] if '_' in candidate_id else candidate_id}"
    
    return RankingResult(
        candidate_id=candidate_id,
        candidate_name=candidate_name,
        score=score,
        reasoning=reasoning,
        bias_flag=False,
        bias_details=None,
        interview_plan=None,
        llm_provider=response["provider"]
    )
