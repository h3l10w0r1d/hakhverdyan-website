from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..auth import hash_password, verify_password
from ..customer_auth import create_customer_token, get_current_customer
from ..database import get_db
from ..models import Customer, QuoteRequest
from ..ratelimit import enforce_rate_limit, get_client_ip
from ..schemas import (
    CustomerLoginIn, CustomerOut, CustomerRegisterIn, CustomerTokenOut, CustomerUpdateIn, QuoteRequestOut,
)

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.post("/register", response_model=CustomerTokenOut, status_code=201)
def register(payload: CustomerRegisterIn, request: Request, db: Session = Depends(get_db)):
    enforce_rate_limit(db, f"register:{get_client_ip(request)}", limit=5, window=timedelta(hours=1))
    email = payload.email.lower()
    if db.query(Customer).filter(Customer.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    customer = Customer(
        email=email,
        password_hash=hash_password(payload.password),
        name=payload.name,
        phone=payload.phone,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    token = create_customer_token(customer.id)
    return CustomerTokenOut(access_token=token, customer=CustomerOut.model_validate(customer))


@router.post("/login", response_model=CustomerTokenOut)
def login(payload: CustomerLoginIn, request: Request, db: Session = Depends(get_db)):
    enforce_rate_limit(db, f"login:{get_client_ip(request)}", limit=8, window=timedelta(minutes=15))
    customer = db.query(Customer).filter(Customer.email == payload.email.lower()).first()
    if not customer or not verify_password(payload.password, customer.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_customer_token(customer.id)
    return CustomerTokenOut(access_token=token, customer=CustomerOut.model_validate(customer))


@router.get("/me", response_model=CustomerOut)
def me(customer: Customer = Depends(get_current_customer)):
    return customer


@router.patch("/me", response_model=CustomerOut)
def update_me(payload: CustomerUpdateIn, customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)):
    if payload.name is not None:
        customer.name = payload.name
    if payload.phone is not None:
        customer.phone = payload.phone
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/me/quotes", response_model=list[QuoteRequestOut])
def my_quotes(customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db)):
    return (
        db.query(QuoteRequest)
        .filter(QuoteRequest.customer_id == customer.id)
        .order_by(QuoteRequest.created_at.desc())
        .all()
    )
