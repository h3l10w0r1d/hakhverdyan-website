from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class AdminLoginIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class AdminOut(BaseModel):
    id: int
    email: str
    name: str

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminOut


class ProductIn(BaseModel):
    id: str = Field(..., min_length=1, max_length=60)
    name: str = Field(..., min_length=1, max_length=200)
    name_hy: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=60)
    spec: str = Field(..., min_length=1, max_length=300)
    spec_hy: Optional[str] = None
    price: int = Field(..., ge=0)
    old_price: Optional[int] = Field(None, ge=0)
    unit: str = Field(..., min_length=1, max_length=20)
    badge: str = "In stock"
    badge_hy: Optional[str] = None
    is_promo: bool = False
    icon: str = "box"
    image: Optional[str] = Field(None, max_length=2_000_000)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    name_hy: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=60)
    spec: Optional[str] = Field(None, min_length=1, max_length=300)
    spec_hy: Optional[str] = None
    price: Optional[int] = Field(None, ge=0)
    old_price: Optional[int] = Field(None, ge=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=20)
    badge: Optional[str] = None
    badge_hy: Optional[str] = None
    is_promo: Optional[bool] = None
    icon: Optional[str] = None
    image: Optional[str] = Field(None, max_length=2_000_000)


class StatusUpdateIn(BaseModel):
    status: str = Field(..., min_length=1, max_length=30)


class AdminNoteIn(BaseModel):
    admin_note: Optional[str] = Field(None, max_length=2000)


class ProductOut(BaseModel):
    id: str
    name: str
    name_hy: Optional[str] = None
    category: str
    spec: str
    spec_hy: Optional[str] = None
    price: int
    old_price: Optional[int] = None
    unit: str
    badge: str
    badge_hy: Optional[str] = None
    is_promo: bool
    icon: str
    image: Optional[str] = None
    sort_order: int = 0

    class Config:
        from_attributes = True


class ReorderIn(BaseModel):
    ids: List[str] = Field(..., min_length=1)


class PartnerReorderIn(BaseModel):
    ids: List[int] = Field(..., min_length=1)


class QuoteItemIn(BaseModel):
    product_id: str = Field(..., min_length=1)
    qty: int = Field(..., ge=1, le=999)


class QuoteRequestIn(BaseModel):
    items: List[QuoteItemIn]
    name: str = Field(..., min_length=1, max_length=120)
    phone: str = Field(..., min_length=4, max_length=40)
    email: EmailStr
    note: Optional[str] = Field(None, max_length=2000)
    lang: Optional[str] = "en"


class QuoteItemOut(BaseModel):
    product_id: str
    product_name: str
    unit: str
    qty: int
    price_at_time: int

    class Config:
        from_attributes = True


class EmailLogOut(BaseModel):
    to_email: str
    subject: str
    body: str
    sent_at: datetime

    class Config:
        from_attributes = True


class QuoteRequestOut(BaseModel):
    id: int
    created_at: datetime
    name: str
    phone: str
    email: str
    note: Optional[str] = None
    total: int
    status: str
    admin_note: Optional[str] = None
    items: List[QuoteItemOut]
    confirmation_email: Optional[EmailLogOut] = None

    class Config:
        from_attributes = True


class BlogPostOut(BaseModel):
    slug: str
    title: str
    title_hy: Optional[str] = None
    excerpt: str
    excerpt_hy: Optional[str] = None
    category: str
    category_hy: Optional[str] = None
    cover_url: str
    published_at: datetime

    class Config:
        from_attributes = True


class BlogPostDetailOut(BlogPostOut):
    content: str
    content_hy: Optional[str] = None


class BlogPostIn(BaseModel):
    slug: str = Field(..., min_length=1, max_length=120, pattern=r"^[a-z0-9\-]+$")
    title: str = Field(..., min_length=1, max_length=300)
    title_hy: Optional[str] = None
    excerpt: str = Field(..., min_length=1, max_length=500)
    excerpt_hy: Optional[str] = None
    content: str = Field(..., min_length=1)
    content_hy: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=60)
    category_hy: Optional[str] = None
    cover_url: str = Field(..., max_length=2_000_000)
    published_at: datetime


class BlogPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    title_hy: Optional[str] = None
    excerpt: Optional[str] = Field(None, min_length=1, max_length=500)
    excerpt_hy: Optional[str] = None
    content: Optional[str] = Field(None, min_length=1)
    content_hy: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=60)
    category_hy: Optional[str] = None
    cover_url: Optional[str] = Field(None, max_length=2_000_000)
    published_at: Optional[datetime] = None


class PartnerOut(BaseModel):
    id: int
    name: str
    logo: str
    url: Optional[str] = None
    sort_order: int
    active: bool

    class Config:
        from_attributes = True


class PartnerIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    logo: str = Field(..., min_length=1, max_length=2_000_000)
    url: Optional[str] = Field(None, max_length=500)
    active: bool = True


class PartnerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    logo: Optional[str] = Field(None, min_length=1, max_length=2_000_000)
    url: Optional[str] = Field(None, max_length=500)
    active: Optional[bool] = None


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
