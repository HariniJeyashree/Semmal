import json
import re
import logging
from pydantic import BaseModel, Field
from core.llm_client import generate_completion

logger = logging.getLogger(__name__)

class ValidationCounts(BaseModel):
    original_job_count: int = Field(description="Number of distinct job/experience roles in the original resume")
    original_project_count: int = Field(description="Number of distinct projects in the original resume")
    original_cert_award_count: int = Field(description="Number of distinct certifications, awards, or leadership roles in the original resume")
    generated_job_count: int = Field(description="Number of distinct job/experience roles in the generated rewritten resume")
    generated_project_count: int = Field(description="Number of distinct projects in the generated rewritten resume")
    generated_cert_award_count: int = Field(description="Number of distinct certifications, awards, or leadership roles in the generated rewritten resume")

class ResumeOptimization(BaseModel):
    overall_feedback: str = Field(description="High-level feedback on how well the resume matches the JD")
    validation: ValidationCounts = Field(description="Counts of items to ensure no content was deleted")
    rewritten_resume: str = Field(description="The completely re-written resume, fully optimized and tailored for the JD in markdown format.")

async def optimize_resume(resume_text: str, job_description: str) -> dict:
    """
    Agent: Resume Optimizer
    Uses unified LLM client to completely rewrite the resume tailored to the JD.
    Validates output to ensure no placeholders are present and no content was deleted.
    """
    base_prompt = f"""
    You are an expert Executive Recruiter and Resume Writer.
    Review the candidate's Resume against the provided Job Description.
    Your goal is to COMPLETELY REWRITE the candidate's resume so that it perfectly aligns with the JD.
    
    CRITICAL FORMATTING RULES (ATS-Safe):
    - Strict Section Order: Name/Contact -> Professional Summary -> Skills -> Experience -> Projects -> Education -> Certifications -> Achievements -> Leadership (only include sections that have real content in the source).
    - Consistent formatting: Use standard markdown headings (`## `) for Sections (e.g., `## Experience`).
    - Job Titles & Companies: MUST be formatted with `### ` (e.g., `### AI Intern, Infosys`). This is critical to prevent visual flattening. Do NOT put the next job as a bullet point.
    - Bullet points ONLY for experience/projects/leadership (action verb + quantifiable result). NO paragraph blocks for experience.
    - NO tables, NO columns, NO icons, and NO text boxes. The content must stay linear and parseable.
    - Use ONE consistent date format and ONE consistent heading hierarchy.
    - NO PLACEHOLDERS: If a field (LinkedIn, GitHub, etc.) is not present, omit it entirely. NEVER output bracketed placeholder text like [Your LinkedIn Profile].
    
    CRITICAL LENGTH AND CONTENT RULES:
    - STRICTLY ONE PAGE A4 SIZE: You MUST condense, summarize, or remove less relevant experiences, older roles, or excessive bullet points to ensure the final resume fits perfectly on a single A4 page. 
    - Prioritize highlighting the experiences, skills, and metrics most relevant to the Job Description.
    - ALWAYS INCLUDE certifications, achievements, and leadership qualities if they exist in the original resume. These are highly valued and must not be dropped.
    
    Original Resume:
    {resume_text}
    
    Job Description:
    {job_description}
    """
    
    prompt = base_prompt
    max_retries = 3
    
    for attempt in range(max_retries):
        response = await generate_completion(prompt, ResumeOptimization)
        parsed_data = response["data"]
        
        errors = []
        
        # Validation 1: Check for bracketed placeholders
        if re.search(r'\[.*?\]', parsed_data["rewritten_resume"]):
            errors.append("You included bracketed placeholders (e.g. [Link] or [Company]). NEVER DO THIS.")
            
        # Validation 2: Content Loss Check
        v = parsed_data["validation"]
        if v["generated_cert_award_count"] < v["original_cert_award_count"]:
            errors.append(f"You deleted {v['original_cert_award_count'] - v['generated_cert_award_count']} certifications/awards/leadership roles. You must keep ALL original certifications, achievements, and leadership qualities.")
            
        if errors:
            if attempt < max_retries - 1:
                logger.warning(f"Validation failed on attempt {attempt+1}: {errors}. Retrying...")
                error_msg = " ".join(errors)
                prompt = base_prompt + f"\n\nCRITICAL ERRORS IN PREVIOUS ATTEMPT:\n{error_msg}\n\nFIX THIS IMMEDIATELY. REMEMBER TO STRICTLY OPTIMIZE FOR ONE PAGE A4 SIZE BUT NEVER DROP CERTIFICATIONS, ACHIEVEMENTS, OR LEADERSHIP ROLES."
                continue
            else:
                logger.warning("Validation failed after retries. Proceeding anyway.")
                break
        
        # If valid, break out of loop
        break

    parsed_data["llm_provider"] = response["provider"]
    return parsed_data
