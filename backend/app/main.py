from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from .models import Product, BlogPost
from .seed_data import PRODUCTS, BLOG_POSTS
from .routers import products, quotes, contact, blog


def seed_products():
    db = SessionLocal()
    try:
        if db.query(Product).count() == 0:
            for item in PRODUCTS:
                db.add(Product(**item))
            db.commit()
    finally:
        db.close()


def seed_blog_posts():
    db = SessionLocal()
    try:
        if db.query(BlogPost).count() == 0:
            for item in BLOG_POSTS:
                db.add(BlogPost(**item))
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_products()
    seed_blog_posts()
    yield


app = FastAPI(title="Hakhverdyan API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(quotes.router)
app.include_router(contact.router)
app.include_router(blog.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
