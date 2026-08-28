import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import hash_password
from .database import Base, engine, SessionLocal
from .migrations import run_migrations
from .models import AdminUser, Product, ProductImage, BlogPost, Partner
from .seed_data import PRODUCTS, BLOG_POSTS, PARTNERS
from .routers import (
    products, quotes, contact, blog, partners,
    admin_auth, admin_products, admin_quotes, admin_messages, admin_stats, admin_analytics,
    admin_partners, admin_blog,
)


def seed_products():
    db = SessionLocal()
    try:
        if db.query(Product).count() == 0:
            for index, item in enumerate(PRODUCTS):
                db.add(Product(**item, sort_order=index))
            db.commit()
    finally:
        db.close()


def backfill_product_images():
    # Products created before the multi-image gallery only have a single
    # `image` column. Give each one a matching product_images row so the
    # gallery isn't empty for existing catalog entries.
    db = SessionLocal()
    try:
        has_images = {pid for (pid,) in db.query(ProductImage.product_id).distinct()}
        for product in db.query(Product).filter(Product.image.isnot(None), Product.image != "").all():
            if product.id not in has_images:
                db.add(ProductImage(product_id=product.id, url=product.image, sort_order=0))
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


def seed_partners():
    db = SessionLocal()
    try:
        if db.query(Partner).count() == 0:
            for index, item in enumerate(PARTNERS):
                db.add(Partner(**item, sort_order=index))
            db.commit()
    finally:
        db.close()


def seed_admin():
    # Dev-only fallback credentials — production must set ADMIN_EMAIL/ADMIN_PASSWORD
    # env vars before first boot (the seed only runs once, when the table is empty).
    email = os.environ.get("ADMIN_EMAIL", "admin@hakhverdyan.am").lower()
    password = os.environ.get("ADMIN_PASSWORD", "changeme123")
    db = SessionLocal()
    try:
        if db.query(AdminUser).count() == 0:
            db.add(AdminUser(email=email, password_hash=hash_password(password), name="Admin"))
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_migrations(engine, Base)
    backfill_product_images()
    seed_products()
    seed_blog_posts()
    seed_partners()
    seed_admin()
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
app.include_router(partners.router)
app.include_router(admin_auth.router)
app.include_router(admin_products.router)
app.include_router(admin_partners.router)
app.include_router(admin_blog.router)
app.include_router(admin_quotes.router)
app.include_router(admin_messages.router)
app.include_router(admin_stats.router)
app.include_router(admin_analytics.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
