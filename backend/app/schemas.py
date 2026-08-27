from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ProductOut(BaseModel):
    id: str
    name: str
    category: str
    spec: str
    price: int
    old_price: Optional[int] = None
    unit: str
    badge: str
    is_promo: bool
    icon: str

    class Config:
        from_attributes = True


class QuoteItemIn(BaseModel):
    product_id: str = Field(..., min_length=1)
    qty: int = Field(..., ge=1, le=999)


class QuoteRequestIn(BaseModel):
    items: List[QuoteItemIn]
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    note: Optional[str] = None


class QuoteItemOut(BaseModel):
    product_id: str
    product_name: str
    unit: str
    qty: int
    price_at_time: int

    class Config:
        from_attributes = True


class QuoteRequestOut(BaseModel):
    id: int
    created_at: datetime
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    note: Optional[str] = None
    total: int
    status: str
    items: List[QuoteItemOut]

    class Config:
        from_attributes = True


class BlogPostOut(BaseModel):
    slug: str
    title: str
    excerpt: str
    category: str
    cover_url: str
    published_at: datetime

    class Config:
        from_attributes = True


class BlogPostDetailOut(BlogPostOut):
    content: str


class ContactMessageIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    phone: Optional[str] = None
    email: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=4000)


class ContactMessageOut(BaseModel):
    id: int
    created_at: datetime
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    message: str
    status: str

    class Config:
        from_attributes = True
