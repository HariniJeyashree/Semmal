from sqlmodel import create_engine, Session, select
from models.schema import JobSession, User

engine = create_engine('sqlite:///recruiter.db')
with Session(engine) as session:
    sessions = session.exec(select(JobSession)).all()
    print('Total sessions:', len(sessions))
    if sessions:
        s = sessions[0]
        print('First session ID:', s.id)
        # Try to get it using db.get
        s_get = session.get(JobSession, s.id)
        print('Got via session.get:', s_get is not None)
