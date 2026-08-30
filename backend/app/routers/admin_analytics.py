from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import AdminUser, Category, ContactMessage, Customer, Product, QuoteRequest, QuoteRequestItem

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
    customers = db.query(Customer).all()

    bookings_by_day = _day_series(quotes, lambda q: q.created_at)
    messages_by_day = _day_series(messages, lambda m: m.created_at)
    new_customers_by_day = _day_series(customers, lambda c: c.created_at)

    status_breakdown = defaultdict(int)
    for q in quotes:
        status_breakdown[q.status] += 1

    message_status_breakdown = defaultdict(int)
    for m in messages:
        message_status_breakdown[m.status] += 1

    product_totals = defaultdict(lambda: {"qty": 0, "revenue": 0})
    for q in quotes:
        for item in q.items:
            t = product_totals[item.product_id]
            t["qty"] += item.qty
            t["revenue"] += item.qty * item.price_at_time

    products = db.query(Product).all()
    product_names = {p.id: p.name for p in products}
    product_categories = {p.id: p.category for p in products}
    top_products = sorted(
        (
            {"product_id": pid, "name": product_names.get(pid, pid), "qty": t["qty"], "revenue": t["revenue"]}
            for pid, t in product_totals.items()
        ),
        key=lambda t: t["qty"],
        reverse=True,
    )[:5]

    category_totals = defaultdict(lambda: {"qty": 0, "revenue": 0})
    for pid, t in product_totals.items():
        cat = category_totals[product_categories.get(pid, "other")]
        cat["qty"] += t["qty"]
        cat["revenue"] += t["revenue"]
    category_labels = {c.id: c.label for c in db.query(Category).all()}
    top_categories = sorted(
        (
            {"category_id": cid, "label": category_labels.get(cid, cid), "qty": t["qty"], "revenue": t["revenue"]}
            for cid, t in category_totals.items()
        ),
        key=lambda t: t["qty"],
        reverse=True,
    )

    total_revenue = sum(q.total for q in quotes)
    total_bookings = len(quotes)

    return {
        "bookings_by_day": bookings_by_day,
        "messages_by_day": messages_by_day,
        "new_customers_by_day": new_customers_by_day,
        "status_breakdown": dict(status_breakdown),
        "message_status_breakdown": dict(message_status_breakdown),
        "top_products": top_products,
        "top_categories": top_categories,
        "total_revenue": total_revenue,
        "total_bookings": total_bookings,
        "avg_booking_value": round(total_revenue / total_bookings) if total_bookings else 0,
        "total_customers": len(customers),
        "total_messages": len(messages),
    }
