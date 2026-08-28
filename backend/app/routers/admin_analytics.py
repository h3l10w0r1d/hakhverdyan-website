from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import AdminUser, ContactMessage, Product, QuoteRequest, QuoteRequestItem

router = APIRouter(prefix="/api/admin/analytics", tags=["admin-analytics"])

DAYS_WINDOW = 14


def _day_series(rows, date_getter, days=DAYS_WINDOW):
    today = datetime.utcnow().date()
    buckets = {(today - timedelta(days=i)): {"count": 0, "revenue": 0} for i in range(days - 1, -1, -1)}
    cutoff = today - timedelta(days=days - 1)
    for row in rows:
        d = date_getter(row).date()
        if d < cutoff or d not in buckets:
            continue
        buckets[d]["count"] += 1
        if hasattr(row, "total"):
            buckets[d]["revenue"] += row.total
    return [
        {"date": d.isoformat(), "count": v["count"], "revenue": v["revenue"]}
        for d, v in sorted(buckets.items())
    ]


@router.get("")
def get_analytics(db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    quotes = db.query(QuoteRequest).all()
    messages = db.query(ContactMessage).all()

    bookings_by_day = _day_series(quotes, lambda q: q.created_at)
    messages_by_day = _day_series(messages, lambda m: m.created_at)

    status_breakdown = defaultdict(int)
    for q in quotes:
        status_breakdown[q.status] += 1

    product_totals = defaultdict(lambda: {"qty": 0, "revenue": 0})
    for q in quotes:
        for item in q.items:
            t = product_totals[item.product_id]
            t["qty"] += item.qty
            t["revenue"] += item.qty * item.price_at_time

    product_names = {p.id: p.name for p in db.query(Product).all()}
    top_products = sorted(
        (
            {"product_id": pid, "name": product_names.get(pid, pid), "qty": t["qty"], "revenue": t["revenue"]}
            for pid, t in product_totals.items()
        ),
        key=lambda t: t["qty"],
        reverse=True,
    )[:5]

    total_revenue = sum(q.total for q in quotes)
    total_bookings = len(quotes)

    return {
        "bookings_by_day": bookings_by_day,
        "messages_by_day": messages_by_day,
        "status_breakdown": dict(status_breakdown),
        "top_products": top_products,
        "total_revenue": total_revenue,
        "total_bookings": total_bookings,
        "avg_booking_value": round(total_revenue / total_bookings) if total_bookings else 0,
    }
