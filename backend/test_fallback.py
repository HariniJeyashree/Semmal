import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agents.jd_analyzer import analyze_jd
from core.llm_client import GeminiAPIError
import core.llm_client

async def main():
    print("--- Testing Normal Gemini Flow (if keys exist) ---")
    try:
        res = await analyze_jd("Looking for a Senior Python backend engineer with FastAPI, PostgreSQL, and Docker experience. Must have 5+ years of experience and excellent communication skills.")
        print("Success! Response from:", res.get("llm_provider", "unknown"))
        print(res)
    except Exception as e:
        print("Error:", e)

    print("\n--- Simulating Gemini 429 Rate Limit ---")
    
    # Mock the Gemini call to throw a 429
    original_generate_content = core.llm_client.gemini_client.aio.models.generate_content if core.llm_client.gemini_client else None
    
    async def mock_generate_content(*args, **kwargs):
        raise GeminiAPIError("Simulated 429 Too Many Requests - Quota Exceeded", code=429, status="RESOURCE_EXHAUSTED")
        
    if core.llm_client.gemini_client:
        core.llm_client.gemini_client.aio.models.generate_content = mock_generate_content
    else:
        print("Gemini client not initialized (missing API key?)")

    try:
        res = await analyze_jd("Looking for a React developer with TypeScript and Next.js experience. 3+ years experience required.")
        print("Success! Fallback response from:", res.get("llm_provider", "unknown"))
        print(res)
    except Exception as e:
        print("Error during fallback:", e)

if __name__ == "__main__":
    asyncio.run(main())
