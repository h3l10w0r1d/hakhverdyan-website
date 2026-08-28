from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..email_service import build_confirmation_email, send_email_simulated
from ..models import Product, QuoteRequest, QuoteRequestItem
from ..schemas import EmailLogOut, QuoteRequestIn, QuoteRequestOut

router = APIRouter(prefix="/api/quotes", tags=["quotes"])


@router.post("", response_model=QuoteRequestOut, status_code=201)
def create_quote(payload: QuoteRequestIn, db: Session = Depends(get_db)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Quote request must include at least one item")

    quote = QuoteRequest(name=payload.name, phone=payload.phone, email=payload.email, note=payload.note, total=0)
    db.add(quote)
    db.flush()

    total = 0
    email_items = []
    for item in payload.items:
        product = db.get(Product, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product '{item.product_id}' not found")
        line_total = product.price * item.qty
        total += line_total
        db.add(QuoteRequestItem(
            quote_request_id=quote.id,
            product_id=product.id,
            product_name=product.name,
            unit=product.unit,
            qty=item.qty,
            price_at_time=product.price,
        ))
        email_items.append({
            "name": product.name, "name_hy": product.name_hy,
            "unit": product.unit, "qty": item.qty, "price": product.price,
        })

    quote.total = total
    db.commit()
    db.refresh(quote)

    subject, body = build_confirmation_email(quote, email_items, lang=payload.lang or "en")
    email_log = send_email_simulated(db, to_email=quote.email, subject=subject, body=body, quote_request_id=quote.id)

    result = QuoteRequestOut.model_validate(quote)
    result.confirmation_email = EmailLogOut.model_validate(email_log)
    return result
