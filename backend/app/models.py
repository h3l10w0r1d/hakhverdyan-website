from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class RateLimitBucket(Base):
    # Fixed-window request counter, keyed by e.g. "login:203.0.113.4" or
    # "contact:203.0.113.4". Backs check_rate_limit() in app/ratelimit.py —
    # a DB-backed counter since serverless functions share no in-memory state.
    __tablename__ = "rate_limit_buckets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    window_start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    name_hy: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    category: Mapped[str] = mapped_column(String, index=True, nullable=False)
    spec: Mapped[str] = mapped_column(String, nullable=False)
    spec_hy: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description_hy: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    old_price: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    unit: Mapped[str] = mapped_column(String, nullable=False)
    badge: Mapped[str] = mapped_column(String, nullable=False, default="In stock")
    badge_hy: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_promo: Mapped[bool] = mapped_column(Boolean, default=False)
    icon: Mapped[str] = mapped_column(String, nullable=False, default="box")
    image: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    product_images: Mapped[list["ProductImage"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.sort_order"
    )

    @property
    def images(self) -> list[str]:
        return [img.url for img in self.product_images]


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True, nullable=False)
    url: Mapped[str] = mapped_column(String, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    product: Mapped["Product"] = relationship(back_populates="product_images")


class QuoteRequest(Base):
    __tablename__ = "quote_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    customer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("customers.id"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    note: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String, nullable=False, default="new")
    admin_note: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    items: Mapped[list["QuoteRequestItem"]] = relationship(
        back_populates="quote_request", cascade="all, delete-orphan"
    )


class QuoteRequestItem(Base):
    __tablename__ = "quote_request_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    quote_request_id: Mapped[int] = mapped_column(ForeignKey("quote_requests.id"))
    product_id: Mapped[str] = mapped_column(String, nullable=False)
    product_name: Mapped[str] = mapped_column(String, nullable=False)
    unit: Mapped[str] = mapped_column(String, nullable=False)
    qty: Mapped[int] = mapped_column(Integer, nullable=False)
    price_at_time: Mapped[int] = mapped_column(Integer, nullable=False)

    quote_request: Mapped["QuoteRequest"] = relationship(back_populates="items")


class BlogPost(Base):
    __tablename__ = "blog_posts"

    slug: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    title_hy: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    excerpt: Mapped[str] = mapped_column(String, nullable=False)
    excerpt_hy: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    content: Mapped[str] = mapped_column(String, nullable=False)
    content_hy: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    category: Mapped[str] = mapped_column(String, index=True, nullable=False)
    category_hy: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    cover_url: Mapped[str] = mapped_column(String, nullable=False)
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="draft")

    post_tags: Mapped[list["BlogPostTag"]] = relationship(
        back_populates="post", cascade="all, delete-orphan", order_by="BlogPostTag.sort_order"
    )

    @property
    def tags(self) -> list[str]:
        return [t.tag for t in self.post_tags]


class BlogPostTag(Base):
    __tablename__ = "blog_post_tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    post_slug: Mapped[str] = mapped_column(ForeignKey("blog_posts.slug", ondelete="CASCADE"), index=True, nullable=False)
    tag: Mapped[str] = mapped_column(String, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    post: Mapped["BlogPost"] = relationship(back_populates="post_tags")


class EmailLog(Base):
    __tablename__ = "email_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    quote_request_id: Mapped[Optional[int]] = mapped_column(ForeignKey("quote_requests.id"), nullable=True)
    to_email: Mapped[str] = mapped_column(String, nullable=False)
    subject: Mapped[str] = mapped_column(String, nullable=False)
    body: Mapped[str] = mapped_column(String, nullable=False)
    sent_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Partner(Base):
    __tablename__ = "partners"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    logo: Mapped[str] = mapped_column(String, nullable=False)
    url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    message: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="new")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    label: Mapped[str] = mapped_column(String, nullable=False)
    label_hy: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class SiteSettings(Base):
    # Singleton row (id is always 1) holding the contact/social info shown
    # sitewide in the Footer and Contacts page.
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    phone: Mapped[str] = mapped_column(String, nullable=False, default="+374 60 770 700")
    whatsapp: Mapped[str] = mapped_column(String, nullable=False, default="+374 60 770 700")
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    facebook_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    instagram_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    tiktok_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    hours_weekday: Mapped[str] = mapped_column(String, nullable=False, default="Mon–Fri 9:00–18:00")
    hours_weekday_hy: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    hours_saturday: Mapped[str] = mapped_column(String, nullable=False, default="Sat 9:00–16:00")
    hours_saturday_hy: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    name_hy: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    address: Mapped[str] = mapped_column(String, nullable=False)
    address_hy: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
