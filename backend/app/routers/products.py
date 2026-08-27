from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product
from ..schemas import ProductOut

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=List[ProductOut])
def list_products(category: Optional[str] = None, q: Optional[str] = None, db: Session = Depends(get_db)):
    stmt = select(Product)
    if category and category != "all":
        stmt = stmt.where(Product.category == category)
    products = db.execute(stmt).scalars().all()
    if q:
        needle = q.lower()
        products = [p for p in products if needle in p.name.lower() or needle in p.spec.lower()]
    return products


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")
    return product
