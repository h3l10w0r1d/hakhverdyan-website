import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..auth import hash_password, verify_password
from ..customer_auth import (
    EMAIL_VERIFICATION_TTL, create_customer_token, generate_verification_token,
    get_current_customer, hash_verification_token,
)
from ..database import get_db
from ..email_service import build_verification_email, send_email_real_with_retry
from ..models import Customer, EmailVerificationToken, QuoteRequest
from ..ratelimit import enforce_rate_limit, get_client_ip
from ..schemas import (
    CustomerLoginIn, CustomerOut, CustomerRegisterIn, CustomerTokenOut, CustomerUpdateIn,
    EmailVerifyIn, QuoteRequestOut,
)

router = APIRouter(prefix="/api/customers", tags=["customers"])

APP_BASE_URL = os.environ.get("APP_BASE_URL", "http://localhost:5173")


def _issue_verification_email(background_tasks: BackgroundTasks, db: Session, customer: Customer, lang: str = "en"):
    raw_token, token_hash = generate_verification_token()
    db.add(EmailVerificationToken(
        customer_id=customer.id, token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + EMAIL_VERIFICATION_TTL,
    ))
    db.commit()
    link = f"{APP_BASE_URL}/verify-email?token={raw_token}"
    subject, text_body, html_body = build_verification_email(customer.name, link, lang)
    background_tasks.add_task(send_email_real_with_retry, customer.email, subject, text_body, html_body)


@router.post("/register", response_model=CustomerTokenOut, status_code=201)
def register(payload: CustomerRegisterIn, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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
    _issue_verification_email(background_tasks, db, customer, payload.lang or "en")
    token = create_customer_token(customer.id)
    return CustomerTokenOut(access_token=token, customer=CustomerOut.model_validate(customer))


@router.post("/verify-email", response_model=CustomerOut)
def verify_email(payload: EmailVerifyIn, db: Session = Depends(get_db)):
    invalid = HTTPException(status_code=400, detail="This verification link is invalid or has expired.")
    token_hash = hash_verification_token(payload.token)
    record = db.query(EmailVerificationToken).filter(EmailVerificationToken.token_hash == token_hash).first()
    now = datetime.now(timezone.utc)
    if not record or record.used_at is not None or record.expires_at.replace(tzinfo=timezone.utc) < now:
        raise invalid
    customer = db.get(Customer, record.customer_id)
    if not customer:
        raise invalid
    record.used_at = now
    customer.email_verified = True
    db.commit()
    db.refresh(customer)
    return customer


@router.post("/resend-verification", response_model=CustomerOut)
def resend_verification(
    background_tasks: BackgroundTasks,
    customer: Customer = Depends(get_current_customer), db: Session = Depends(get_db),
):
    if customer.email_verified:
        raise HTTPException(status_code=400, detail="This email is already verified.")
    enforce_rate_limit(db, f"verify-resend-min:{customer.id}", limit=1, window=timedelta(minutes=1))
    enforce_rate_limit(db, f"verify-resend-day:{customer.id}", limit=5, window=timedelta(hours=24))
    # Invalidate any still-outstanding tokens so only the newest link works.
    db.query(EmailVerificationToken).filter(
        EmailVerificationToken.customer_id == customer.id, EmailVerificationToken.used_at.is_(None),
    ).update({"used_at": datetime.now(timezone.utc)})
    _issue_verification_email(background_tasks, db, customer)
    return customer


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
