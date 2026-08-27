from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import BlogPost
from ..schemas import BlogPostOut, BlogPostDetailOut

router = APIRouter(prefix="/api/posts", tags=["blog"])


@router.get("", response_model=List[BlogPostOut])
def list_posts(category: Optional[str] = None, db: Session = Depends(get_db)):
    stmt = select(BlogPost).order_by(BlogPost.published_at.desc())
    if category and category != "all":
        stmt = stmt.where(BlogPost.category == category)
    return db.execute(stmt).scalars().all()


@router.get("/{slug}", response_model=BlogPostDetailOut)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = db.get(BlogPost, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post
