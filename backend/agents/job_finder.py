import json
import urllib.parse
from pydantic import BaseModel, Field
from typing import List
from core.llm_client import generate_completion

class JobPortalLink(BaseModel):
    portal_name: str = Field(description="Name of the job board (e.g., LinkedIn, Indeed)")
    url: str = Field(description="The pre-filled search URL")
    message: str = Field(description="A message explaining that direct integration is unavailable and they must search manually.")

class TargetRole(BaseModel):
    title: str = Field(description="A specific job title the candidate should apply for")
    search_keywords: str = Field(description="Keywords to use in search bars")
    match_reasoning: str = Field(description="Why this role fits the candidate")
    links: List[JobPortalLink] = Field(default_factory=list, description="Links to search for this role on job boards")

class JobFinderResult(BaseModel):
    market_insights: str = Field(description="Brief insight into the current market for this profile")
    target_roles: List[TargetRole] = Field(description="Top 3 highly targeted job roles based on the resume")

async def find_jobs(resume_text: str, location: str, experience_level: str) -> dict:
    """
    Agent: Job Finder
    Recommends target roles based on user filters and constructs real redirect URLs.
    """
    prompt = f"""
    You are an expert Career Coach and Headhunter.
    Review the candidate's Resume. 
    Target Location: {location}
    Target Experience Level: {experience_level}
    
    Based purely on their experience, suggest the top 3 specific job titles they should apply for.
    For each role, provide specific search keywords (e.g., "Frontend Developer React Next.js").
    Provide a brief insight into the market.
    
    DO NOT GENERATE FAKE JOB OPPORTUNITIES. 
    
    Resume:
    {resume_text}
    """
    
    response = await generate_completion(prompt, JobFinderResult)
    parsed_data = response["data"]
    
    # Post-process to inject real search URLs
    for role in parsed_data["target_roles"]:
        query = urllib.parse.quote(role["search_keywords"])
        loc = urllib.parse.quote(location)
        
        indeed_url = f"https://www.indeed.com/jobs?q={query}&l={loc}"
        linkedin_url = f"https://www.linkedin.com/jobs/search/?keywords={query}&location={loc}"
        
        role["links"] = [
            {
                "portal_name": "Indeed",
                "url": indeed_url,
                "message": "Direct integration unavailable — search manually on Indeed."
            },
            {
                "portal_name": "LinkedIn",
                "url": linkedin_url,
                "message": "Direct integration unavailable — search manually on LinkedIn."
            }
        ]
        
    parsed_data["llm_provider"] = response["provider"]
    return parsed_data
