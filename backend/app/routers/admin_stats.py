from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import AdminUser, BlogPost, ContactMessage, Product, QuoteRequest

router = APIRouter(prefix="/api/admin/stats", tags=["admin-stats"])


@router.get("")
def get_stats(db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    return {
        "new_quotes": db.scalar(select(func.count()).select_from(QuoteRequest).where(QuoteRequest.status == "new")) or 0,
        "total_quotes": db.scalar(select(func.count()).select_from(QuoteRequest)) or 0,
        "new_messages": db.scalar(select(func.count()).select_from(ContactMessage).where(ContactMessage.status == "new")) or 0,
        "total_messages": db.scalar(select(func.count()).select_from(ContactMessage)) or 0,
        "total_products": db.scalar(select(func.count()).select_from(Product)) or 0,
        "total_posts": db.scalar(select(func.count()).select_from(BlogPost)) or 0,
    }
