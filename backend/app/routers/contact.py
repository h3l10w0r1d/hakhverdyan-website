from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ContactMessage
from ..schemas import ContactMessageIn, ContactMessageOut

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("", response_model=ContactMessageOut, status_code=201)
def create_contact_message(payload: ContactMessageIn, db: Session = Depends(get_db)):
    msg = ContactMessage(name=payload.name, phone=payload.phone, email=payload.email, message=payload.message)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
