from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import AdminUser, Product
from ..schemas import ProductIn, ProductOut, ProductUpdate

router = APIRouter(prefix="/api/admin/products", tags=["admin-products"])


@router.get("", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    return db.execute(select(Product).order_by(Product.category, Product.name)).scalars().all()


@router.post("", response_model=ProductOut, status_code=201)
def create_product(payload: ProductIn, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    if db.get(Product, payload.id):
        raise HTTPException(status_code=409, detail=f"Product '{payload.id}' already exists")
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: str, payload: ProductUpdate,
    db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: str, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
