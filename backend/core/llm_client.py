import json
import logging
from typing import Type, TypeVar
from pydantic import BaseModel, ValidationError
from fastapi import HTTPException

# Google Gemini imports
from google import genai
from google.genai import types as genai_types
from google.genai.errors import APIError as GeminiAPIError

# Groq imports
from groq import AsyncGroq
from groq import APIError as GroqAPIError

from core.config import GEMINI_API_KEY, GROQ_API_KEY

T = TypeVar('T', bound=BaseModel)
logger = logging.getLogger(__name__)
import httpx

# Initialize clients if keys are present
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# Disable SSL verification to bypass corporate proxy (Zscaler) errors in local dev
http_client = httpx.AsyncClient(verify=False)
groq_client = AsyncGroq(api_key=GROQ_API_KEY, http_client=http_client) if GROQ_API_KEY else None

async def generate_completion(prompt: str, schema: Type[T]) -> dict:
    """
    Centralized LLM call with primary Gemini and fallback Groq.
    Returns a dict shaped like:
    {
        "provider": "gemini" | "groq",
        "data": dict  # Parsed JSON matching the schema
    }
    """
    # If no API keys are configured, return mock data to match previous local-testing behavior
    if not gemini_client and not groq_client:
        logger.warning("No LLM API keys configured. Returning empty dict as mock fallback.")
        return {"provider": "mock", "data": {}}

    gemini_failed = False
    
    # 1. Try Primary: Gemini
    if gemini_client:
        try:
            response = await gemini_client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=genai_types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=schema,
                ),
            )
            
            # Validate schema
            parsed_data = schema.model_validate_json(response.text)
            return {
                "provider": "gemini",
                "data": parsed_data.model_dump()
            }
            
        except GeminiAPIError as e:
            logger.warning(f"Gemini API failed with status code {getattr(e, 'code', 'unknown')}. Falling back to Groq.")
            gemini_failed = True
        except (json.JSONDecodeError, ValidationError) as e:
            logger.warning(f"Gemini returned malformed or invalid JSON: {e}. Falling back to Groq.")
            gemini_failed = True
        except Exception as e:
            logger.warning(f"Gemini encountered unexpected error: {type(e).__name__}. Falling back to Groq.")
            gemini_failed = True
    else:
        gemini_failed = True

    if gemini_failed:
        # 2. Try Fallback: Groq
        if not groq_client:
            raise HTTPException(
                status_code=503, 
                detail="AI service is currently unavailable. Gemini failed and Groq is not configured."
            )
            
        try:
            # Groq structured JSON outputs work best with a strong prompt injection
            groq_prompt = f"{prompt}\n\nPlease output valid JSON that strictly satisfies this JSON schema. Do not output anything other than JSON.\n{json.dumps(schema.model_json_schema())}"
            
            chat_completion = await groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": groq_prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
            )
            
            content = chat_completion.choices[0].message.content
            # Validate schema
            parsed_data = schema.model_validate_json(content)
            
            return {
                "provider": "groq",
                "data": parsed_data.model_dump()
            }
            
        except GroqAPIError as e:
            logger.error(f"Groq fallback failed with status code {getattr(e, 'status_code', 'unknown')}. Error details: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail=f"AI service is currently unavailable or rate limited. Please wait a moment and try again."
            ) from e
        except (json.JSONDecodeError, ValidationError) as e:
            logger.error(f"Groq returned malformed or invalid JSON: {e}.")
            raise HTTPException(
                status_code=503,
                detail="AI service returned invalid data. Please try again."
            ) from e
        except Exception as e:
            logger.error(f"Groq encountered unexpected error: {type(e).__name__}.")
            raise HTTPException(
                status_code=503,
                detail="An unexpected error occurred while communicating with the AI service."
            ) from e
