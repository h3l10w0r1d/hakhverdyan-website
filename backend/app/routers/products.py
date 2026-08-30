from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product
from ..schemas import ProductOut

router = APIRouter(prefix="/api/products", tags=["products"])

# A tracked stock count of 0 hides a product from the public site; a null
# count means stock isn't tracked (e.g. made-to-order) and it always shows.
_IN_STOCK = or_(Product.stock_qty.is_(None), Product.stock_qty > 0)


@router.get("", response_model=List[ProductOut])
def list_products(category: Optional[str] = None, q: Optional[str] = None, db: Session = Depends(get_db)):
    stmt = select(Product).where(_IN_STOCK).order_by(Product.sort_order, Product.name)
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
    if not product or not (product.stock_qty is None or product.stock_qty > 0):
        raise HTTPException(status_code=404, detail="Product not found")
    return product
