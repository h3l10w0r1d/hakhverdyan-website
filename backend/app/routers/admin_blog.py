from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import AdminUser, BlogPost, BlogPostTag
from ..schemas import BlogPostDetailOut, BlogPostIn, BlogPostUpdate

router = APIRouter(prefix="/api/admin/posts", tags=["admin-blog"])


def _set_tags(post: BlogPost, tags: List[str]):
    post.post_tags.clear()
    for index, tag in enumerate(tags):
        post.post_tags.append(BlogPostTag(tag=tag, sort_order=index))


@router.get("", response_model=List[BlogPostDetailOut])
def list_posts(db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    return db.execute(select(BlogPost).order_by(BlogPost.published_at.desc())).scalars().all()


@router.post("", response_model=BlogPostDetailOut, status_code=201)
def create_post(payload: BlogPostIn, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    if db.get(BlogPost, payload.slug):
        raise HTTPException(status_code=409, detail=f"Post '{payload.slug}' already exists")
    data = payload.model_dump(exclude={"tags"})
    post = BlogPost(**data)
    _set_tags(post, payload.tags)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{slug}", response_model=BlogPostDetailOut)
def update_post(
    slug: str, payload: BlogPostUpdate,
    db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin),
):
    post = db.get(BlogPost, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    updates = payload.model_dump(exclude_unset=True, exclude={"tags"})
    for field, value in updates.items():
        setattr(post, field, value)
    if payload.tags is not None:
        _set_tags(post, payload.tags)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{slug}", status_code=204)
def delete_post(slug: str, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    post = db.get(BlogPost, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
