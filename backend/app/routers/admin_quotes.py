from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import AdminUser, EmailLog, QuoteRequest
from ..schemas import AdminNoteIn, EmailLogOut, QuoteRequestOut, StatusUpdateIn

router = APIRouter(prefix="/api/admin/quotes", tags=["admin-quotes"])


def _with_confirmation_email(db: Session, quote: QuoteRequest) -> QuoteRequestOut:
    out = QuoteRequestOut.model_validate(quote)
    log = (
        db.query(EmailLog)
        .filter(EmailLog.quote_request_id == quote.id)
        .order_by(EmailLog.sent_at.desc())
        .first()
    )
    if log:
        out.confirmation_email = EmailLogOut.model_validate(log)
    return out


@router.get("", response_model=List[QuoteRequestOut])
def list_quotes(db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    quotes = db.query(QuoteRequest).order_by(QuoteRequest.created_at.desc()).all()
    return [_with_confirmation_email(db, q) for q in quotes]


@router.patch("/{quote_id}/status", response_model=QuoteRequestOut)
def update_status(
    quote_id: int, payload: StatusUpdateIn,
    db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin),
):
    quote = db.get(QuoteRequest, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote request not found")
    quote.status = payload.status
    db.commit()
    db.refresh(quote)
    return _with_confirmation_email(db, quote)


@router.patch("/{quote_id}/note", response_model=QuoteRequestOut)
def update_note(
    quote_id: int, payload: AdminNoteIn,
    db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin),
):
    quote = db.get(QuoteRequest, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote request not found")
    quote.admin_note = payload.admin_note
    db.commit()
    db.refresh(quote)
    return _with_confirmation_email(db, quote)
