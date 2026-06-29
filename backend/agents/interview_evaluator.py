import logging
from pydantic import BaseModel, Field
from core.llm_client import generate_completion

logger = logging.getLogger(__name__)

class InterviewEvaluation(BaseModel):
    score: int = Field(description="Score out of 10 based on how well the candidate answered the question.", ge=1, le=10)
    ai_feedback: str = Field(description="Constructive feedback on the answer, highlighting strengths and areas for improvement.")

async def evaluate_answer(job_description: str, question_text: str, user_answer_text: str) -> InterviewEvaluation:
    """
    Evaluates a user's answer to an interview question against the job description.
    Uses the unified LLM client for Gemini -> Groq fallback.
    """
    prompt = f"""
    You are an expert Technical Interviewer.
    A candidate has provided an answer to an interview question.
    Please evaluate their answer based on the context of the job description.
    
    JOB DESCRIPTION:
    {job_description}
    
    INTERVIEW QUESTION:
    {question_text}
    
    CANDIDATE'S ANSWER:
    {user_answer_text}
    
    Evaluate the candidate's answer and provide a score out of 10, along with constructive feedback.
    """
    
    try:
        response = await generate_completion(prompt, InterviewEvaluation)
        parsed_data = response["data"]
        return InterviewEvaluation(**parsed_data)
    except Exception as e:
        logger.error(f"Error evaluating answer: {e}")
        return InterviewEvaluation(
            score=1,
            ai_feedback="Failed to generate feedback due to an API error."
        )
