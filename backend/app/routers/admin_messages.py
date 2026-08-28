from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import AdminUser, ContactMessage
from ..schemas import ContactMessageOut, StatusUpdateIn

router = APIRouter(prefix="/api/admin/messages", tags=["admin-messages"])


@router.get("", response_model=List[ContactMessageOut])
def list_messages(db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()


@router.patch("/{message_id}/status", response_model=ContactMessageOut)
def update_status(
    message_id: int, payload: StatusUpdateIn,
    db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin),
):
    message = db.get(ContactMessage, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    message.status = payload.status
    db.commit()
    db.refresh(message)
    return message
