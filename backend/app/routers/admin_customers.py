from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import AdminUser, ContactMessage, Customer, QuoteRequest
from ..schemas import CustomerAdminOut, CustomerDetailOut
from .admin_quotes import _with_confirmation_email

router = APIRouter(prefix="/api/admin/customers", tags=["admin-customers"])


@router.get("", response_model=List[CustomerAdminOut])
def list_customers(db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    customers = db.execute(select(Customer).order_by(Customer.created_at.desc())).scalars().all()
    # Count bookings/messages per customer with two lightweight aggregate queries.
    booking_counts = dict(
        db.query(QuoteRequest.customer_id, func.count(QuoteRequest.id))
        .filter(QuoteRequest.customer_id.isnot(None))
        .group_by(QuoteRequest.customer_id)
        .all()
    )
    message_counts = dict(
        db.query(ContactMessage.customer_id, func.count(ContactMessage.id))
        .filter(ContactMessage.customer_id.isnot(None))
        .group_by(ContactMessage.customer_id)
        .all()
    )
    return [
        CustomerAdminOut(
            id=c.id, email=c.email, name=c.name, phone=c.phone, created_at=c.created_at,
            bookings_count=booking_counts.get(c.id, 0), messages_count=message_counts.get(c.id, 0),
        )
        for c in customers
    ]


@router.get("/{customer_id}", response_model=CustomerDetailOut)
def get_customer(customer_id: int, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    quotes = db.execute(
        select(QuoteRequest).where(QuoteRequest.customer_id == customer_id).order_by(QuoteRequest.created_at.desc())
    ).scalars().all()
    messages = db.execute(
        select(ContactMessage).where(ContactMessage.customer_id == customer_id).order_by(ContactMessage.created_at.desc())
    ).scalars().all()
    return CustomerDetailOut(
        id=customer.id, email=customer.email, name=customer.name, phone=customer.phone,
        created_at=customer.created_at, bookings_count=len(quotes), messages_count=len(messages),
        quotes=[_with_confirmation_email(db, q) for q in quotes], messages=messages,
    )
