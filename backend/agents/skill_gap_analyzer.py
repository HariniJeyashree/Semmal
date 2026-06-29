import json
from pydantic import BaseModel, Field
from typing import List
from core.llm_client import generate_completion

class RawSkillGap(BaseModel):
    skill: str = Field(description="The missing skill")
    importance: str = Field(description="Why this skill is important for the role (High, Medium, Low)")

class RawSkillGapAnalysis(BaseModel):
    missing_skills: List[RawSkillGap] = Field(description="List of skills required by JD but missing in Resume")
    matching_skills: List[str] = Field(description="List of skills present in both JD and Resume")

class Resource(BaseModel):
    title: str = Field(description="Title of the resource (e.g. course name, docs)")
    url: str = Field(description="URL to the free resource")
    type: str = Field(description="Type of resource (e.g. Course, Video, Documentation)")

class SkillGap(BaseModel):
    skill: str = Field(description="The missing skill")
    importance: str = Field(description="Why this skill is important for the role (High, Medium, Low)")
    resources: List[Resource] = Field(description="2-3 free learning resources for this skill")

class SkillGapAnalysis(BaseModel):
    missing_skills: List[SkillGap] = Field(description="List of skills required by JD but missing in Resume")
    matching_skills: List[str] = Field(description="List of skills present in both JD and Resume")
    llm_provider: str = Field(default="", description="The LLM provider used")

async def fetch_resources_for_skill(skill: str) -> List[Resource]:
    import asyncio
    
    def _search():
        resources = []
        try:
            from ddgs import DDGS
            with DDGS() as ddgs:
                # Targeted search against known educational sites
                query = f'"{skill}" tutorial site:freecodecamp.org OR site:developer.mozilla.org OR site:khanacademy.org OR site:youtube.com'
                results = list(ddgs.text(query, max_results=5))
                
                for r in results:
                    title = r.get('title', '')
                    url = r.get('href', '')
                    
                    # Trust the search engine's relevance since we quote the skill
                    res_type = "Video" if "youtube.com" in url else "Course / Docs"
                    resources.append(Resource(title=title, url=url, type=res_type))
                    
                    if len(resources) >= 3:
                        break
        except Exception as e:
            print(f"DDGS search failed for {skill}: {e}")
        return resources

    # Run blocking search in a thread pool
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _search)

async def analyze_skill_gap(resume_text: str, job_description: str) -> dict:
    """
    Agent: Skill Gap Analyzer
    Uses unified LLM client to diff resume against JD, then uses DDGS to fetch real verified learning resources.
    """
    prompt = f"""
    Analyze the following Resume and Job Description.
    Identify technical and soft skills that are required by the JD but missing from the Resume.
    Do NOT generate URLs or resources. Just identify the skills and their importance.
    
    Resume:
    {resume_text}
    
    Job Description:
    {job_description}
    """
    
    response = await generate_completion(prompt, RawSkillGapAnalysis)
    raw_data = response["data"]
    
    # Hydrate with real resources
    hydrated_missing_skills = []
    for missing_skill in raw_data.get("missing_skills", []):
        skill_name = missing_skill.get("skill", "")
        resources = await fetch_resources_for_skill(skill_name) if skill_name else []
        hydrated_missing_skills.append({
            "skill": skill_name,
            "importance": missing_skill.get("importance", "Medium"),
            "resources": [r.dict() for r in resources]
        })
        
    return {
        "missing_skills": hydrated_missing_skills,
        "matching_skills": raw_data.get("matching_skills", []),
        "llm_provider": response["provider"]
    }
