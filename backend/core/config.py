import os
from dotenv import load_dotenv

load_dotenv()

# Centralized configuration settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
