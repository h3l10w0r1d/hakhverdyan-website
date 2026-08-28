import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Prefer a real, durable Postgres (e.g. the Vercel/Neon integration) when one's
# configured. Without it, Vercel's serverless filesystem is read-only except
# /tmp, and /tmp is wiped between cold starts — every admin-added row would
# vanish on the next deploy or idle recycle.
_pg_url = (
    os.environ.get("DATABASE_URL")
    or os.environ.get("POSTGRES_URL")
    or os.environ.get("POSTGRES_PRISMA_URL")
)

if _pg_url:
    # SQLAlchemy 2.x rejects the legacy "postgres://" scheme some providers hand out.
    if _pg_url.startswith("postgres://"):
        _pg_url = "postgresql://" + _pg_url[len("postgres://"):]
    DATABASE_URL = _pg_url
    connect_args = {}
elif os.environ.get("VERCEL"):
    DATABASE_URL = "sqlite:////tmp/hakhverdyan.db"
    connect_args = {"check_same_thread": False}
else:
    DATABASE_URL = "sqlite:///./hakhverdyan.db"
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
