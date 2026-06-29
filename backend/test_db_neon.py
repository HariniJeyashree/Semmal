from sqlmodel import create_engine, Session, select
from models.schema import JobSession
import os
from dotenv import load_dotenv
load_dotenv()

engine = create_engine(os.getenv('DATABASE_URL'))
with Session(engine) as session:
    id_to_check = 'f77932e0-2a91-4259-8cd5-b0cce187372b'
    print(f'Checking if session {id_to_check} exists...')
    
    # Try selecting it via query
    s1 = session.exec(select(JobSession).where(JobSession.id == id_to_check)).first()
    print(f'Select query found: {s1 is not None}')
    
    # Try selecting via db.get
    s2 = session.get(JobSession, id_to_check)
    print(f'db.get found: {s2 is not None}')
    
    # Dump all session IDs just in case
    all_sessions = session.exec(select(JobSession.id)).all()
    print(f'Total sessions in DB: {len(all_sessions)}')
