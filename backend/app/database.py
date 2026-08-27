import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Vercel's serverless filesystem is read-only except /tmp, and /tmp is wiped between
# cold starts — fine here since the DB is fully reseeded from seed_data.py on startup.
if os.environ.get("VERCEL"):
    DATABASE_URL = "sqlite:////tmp/hakhverdyan.db"
else:
    DATABASE_URL = "sqlite:///./hakhverdyan.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
