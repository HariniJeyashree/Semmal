import os
from sqlmodel import create_engine, SQLModel, Session
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Fallback to local sqlite if Neon DB URL is not provided yet
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./ai_recruiter.db"
    
engine = create_engine(
    DATABASE_URL, 
    echo=True,
    pool_pre_ping=True, 
    pool_recycle=300
)

def init_db():
    # Alembic now handles migrations.
    pass

def get_session():
    with Session(engine) as session:
        yield session
