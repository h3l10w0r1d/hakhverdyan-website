from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import AdminUser, Category, Product
from ..schemas import CategoryIn, CategoryOut, CategoryReorderIn, CategoryUpdate

router = APIRouter(prefix="/api/admin/categories", tags=["admin-categories"])


@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    return db.execute(select(Category).order_by(Category.sort_order)).scalars().all()


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(payload: CategoryIn, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    if db.get(Category, payload.id):
        raise HTTPException(status_code=409, detail=f"Category '{payload.id}' already exists")
    next_order = (db.scalar(select(func.max(Category.sort_order))) or 0) + 1
    category = Category(**payload.model_dump(), sort_order=next_order)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/reorder", response_model=List[CategoryOut])
def reorder_categories(payload: CategoryReorderIn, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    categories = {c.id: c for c in db.query(Category).filter(Category.id.in_(payload.ids)).all()}
    missing = set(payload.ids) - set(categories)
    if missing:
        raise HTTPException(status_code=404, detail=f"Unknown category id(s): {', '.join(missing)}")
    for index, category_id in enumerate(payload.ids):
        categories[category_id].sort_order = index
    db.commit()
    return db.execute(select(Category).order_by(Category.sort_order)).scalars().all()


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: str, payload: CategoryUpdate,
    db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin),
):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: str, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    in_use = db.query(Product).filter(Product.category == category_id).count()
    if in_use:
        raise HTTPException(status_code=409, detail=f"{in_use} product(s) still use this category")
    db.delete(category)
    db.commit()
