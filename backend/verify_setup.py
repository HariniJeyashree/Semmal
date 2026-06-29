import sys

# Try to force UTF-8 encoding on stdout for Windows compatibility
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass


def check_import(module_name, pip_name=None):
    try:
        __import__(module_name)
        print(f"✅ {module_name} is successfully installed and importable.")
    except ImportError as e:
        install_name = pip_name if pip_name else module_name
        print(f"❌ ERROR: Missing '{module_name}'. Install via: pip install {install_name}")
        print(f"   Detailed error: {e}")

if __name__ == "__main__":
    print("--- Running AI Recruiter Startup Dependency Check ---")
    
    # Core framework
    check_import("fastapi")
    check_import("uvicorn")
    
    # Database and ORM
    check_import("sqlmodel")
    check_import("sqlalchemy")
    
    # DB Drivers - we check the one configured for the engine
    # Our core/db.py uses create_engine with postgresql:// which requires psycopg2
    check_import("psycopg2", pip_name="psycopg2-binary")
    
    # AI and Vector DB
    check_import("chromadb")
    check_import("google.genai", pip_name="google-genai")
    
    # Utilities
    check_import("dotenv", pip_name="python-dotenv")
    check_import("pydantic")
    check_import("pypdf")
    check_import("multipart", pip_name="python-multipart")

    print("---------------------------------------------------")
    print("If all are ✅, you are safe to run `uvicorn main:app --reload`.")
