from datetime import datetime
from typing import Annotated, List, Optional

from pydantic import BaseModel, EmailStr, Field

ImageUrl = Annotated[str, Field(max_length=2_000_000)]


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


class AdminCreateIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=200)
    name: str = Field(..., min_length=1, max_length=120)


class AdminUpdateIn(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    email: Optional[EmailStr] = None


class ChangePasswordIn(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=200)


class ProductIn(BaseModel):
    id: str = Field(..., min_length=1, max_length=60)
    name: str = Field(..., min_length=1, max_length=200)
    name_hy: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=60)
    spec: str = Field(..., min_length=1, max_length=300)
    spec_hy: Optional[str] = None
    description: Optional[str] = Field(None, max_length=5000)
    description_hy: Optional[str] = Field(None, max_length=5000)
    price: int = Field(..., ge=0)
    old_price: Optional[int] = Field(None, ge=0)
    unit: str = Field(..., min_length=1, max_length=20)
    badge: str = "In stock"
    badge_hy: Optional[str] = None
    is_promo: bool = False
    icon: str = "box"
    stock_qty: Optional[int] = Field(None, ge=0)
    images: List[ImageUrl] = Field(default_factory=list, max_length=20)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    name_hy: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=60)
    spec: Optional[str] = Field(None, min_length=1, max_length=300)
    spec_hy: Optional[str] = None
    description: Optional[str] = Field(None, max_length=5000)
    description_hy: Optional[str] = Field(None, max_length=5000)
    price: Optional[int] = Field(None, ge=0)
    old_price: Optional[int] = Field(None, ge=0)
    unit: Optional[str] = Field(None, min_length=1, max_length=20)
    badge: Optional[str] = None
    badge_hy: Optional[str] = None
    is_promo: Optional[bool] = None
    icon: Optional[str] = None
    stock_qty: Optional[int] = Field(None, ge=0)
    images: Optional[List[ImageUrl]] = Field(None, max_length=20)


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
    description: Optional[str] = None
    description_hy: Optional[str] = None
    price: int
    old_price: Optional[int] = None
    unit: str
    badge: str
    badge_hy: Optional[str] = None
    is_promo: bool
    icon: str
    image: Optional[str] = None
    images: List[str] = []
    sort_order: int = 0
    stock_qty: Optional[int] = None

    class Config:
        from_attributes = True


class ReorderIn(BaseModel):
    ids: List[str] = Field(..., min_length=1)


class ProductBulkCategoryIn(BaseModel):
    ids: List[str] = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=60)


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


class CustomerRegisterIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=200)
    phone: Optional[str] = Field(None, max_length=40)


class CustomerLoginIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class CustomerOut(BaseModel):
    id: int
    email: str
    name: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class CustomerTokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    customer: CustomerOut


class CustomerUpdateIn(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    phone: Optional[str] = Field(None, max_length=40)


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
    status: str = "published"
    tags: List[str] = []

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
    status: str = Field("draft", pattern=r"^(draft|published)$")
    tags: List[str] = Field(default_factory=list, max_length=20)


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
    status: Optional[str] = Field(None, pattern=r"^(draft|published)$")
    tags: Optional[List[str]] = Field(None, max_length=20)


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
    phone: Optional[str] = Field(None, max_length=40)
    email: Optional[EmailStr] = None
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


class CategoryOut(BaseModel):
    id: str
    label: str
    label_hy: Optional[str] = None
    sort_order: int

    class Config:
        from_attributes = True


class CategoryIn(BaseModel):
    id: str = Field(..., min_length=1, max_length=60, pattern=r"^[a-z0-9\-]+$")
    label: str = Field(..., min_length=1, max_length=120)
    label_hy: Optional[str] = None


class CategoryUpdate(BaseModel):
    label: Optional[str] = Field(None, min_length=1, max_length=120)
    label_hy: Optional[str] = None


class CategoryReorderIn(BaseModel):
    ids: List[str] = Field(..., min_length=1)


class LocationOut(BaseModel):
    id: int
    name: str
    name_hy: Optional[str] = None
    address: str
    address_hy: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    sort_order: int

    class Config:
        from_attributes = True


class LocationIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    name_hy: Optional[str] = None
    address: str = Field(..., min_length=1, max_length=300)
    address_hy: Optional[str] = None
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lng: Optional[float] = Field(None, ge=-180, le=180)


class LocationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    name_hy: Optional[str] = None
    address: Optional[str] = Field(None, min_length=1, max_length=300)
    address_hy: Optional[str] = None
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lng: Optional[float] = Field(None, ge=-180, le=180)


class LocationReorderIn(BaseModel):
    ids: List[int] = Field(..., min_length=1)


class SiteSettingsOut(BaseModel):
    phone: str
    whatsapp: str
    email: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    tiktok_url: Optional[str] = None
    hours_weekday: str
    hours_weekday_hy: Optional[str] = None
    hours_saturday: str
    hours_saturday_hy: Optional[str] = None

    class Config:
        from_attributes = True


class SiteSettingsUpdate(BaseModel):
    phone: Optional[str] = Field(None, min_length=1, max_length=40)
    whatsapp: Optional[str] = Field(None, min_length=1, max_length=40)
    email: Optional[EmailStr] = None
    facebook_url: Optional[str] = Field(None, max_length=500)
    instagram_url: Optional[str] = Field(None, max_length=500)
    tiktok_url: Optional[str] = Field(None, max_length=500)
    hours_weekday: Optional[str] = Field(None, min_length=1, max_length=120)
    hours_weekday_hy: Optional[str] = None
    hours_saturday: Optional[str] = Field(None, min_length=1, max_length=120)
    hours_saturday_hy: Optional[str] = None
