from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Category
from ..schemas import CategoryOut

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.execute(select(Category).order_by(Category.sort_order)).scalars().all()
