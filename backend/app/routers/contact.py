from datetime import timedelta

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ContactMessage
from ..ratelimit import enforce_rate_limit, get_client_ip
from ..schemas import ContactMessageIn, ContactMessageOut

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("", response_model=ContactMessageOut, status_code=201)
def create_contact_message(payload: ContactMessageIn, request: Request, db: Session = Depends(get_db)):
    enforce_rate_limit(db, f"contact:{get_client_ip(request)}", limit=5, window=timedelta(hours=1))
    msg = ContactMessage(name=payload.name, phone=payload.phone, email=payload.email, message=payload.message)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
