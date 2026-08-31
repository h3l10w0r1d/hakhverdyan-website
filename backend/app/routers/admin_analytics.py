from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import AdminUser, Category, ContactMessage, Customer, Product, QuoteRequest

router = APIRouter(prefix="/api/admin/analytics", tags=["admin-analytics"])

DEFAULT_DAYS = 14
ALLOWED_DAYS = {7, 14, 30, 90}
MAX_CUSTOM_DAYS = 366


def _day_series(rows, date_getter, start_date, days):
    buckets = {(start_date + timedelta(days=i)): {"count": 0, "revenue": 0} for i in range(days)}
    end_date = start_date + timedelta(days=days - 1)
    for row in rows:
        d = date_getter(row).date()
        if d < start_date or d > end_date:
            continue
        buckets[d]["count"] += 1
        if hasattr(row, "total"):
            buckets[d]["revenue"] += row.total
    return [
        {"date": d.isoformat(), "count": v["count"], "revenue": v["revenue"]}
        for d, v in sorted(buckets.items())
    ]


def _parse_date(value):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


@router.get("")
def get_analytics(
    days: int = Query(DEFAULT_DAYS),
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    today = datetime.utcnow().date()

    start_date = _parse_date(start)
    end_date = _parse_date(end)
    is_custom = start_date is not None and end_date is not None and start_date <= end_date
    if is_custom:
        end_date = min(end_date, today)
        days = min((end_date - start_date).days + 1, MAX_CUSTOM_DAYS)
        start_date = end_date - timedelta(days=days - 1)
    else:
        if days not in ALLOWED_DAYS:
            days = DEFAULT_DAYS
        start_date = today - timedelta(days=days - 1)

    cutoff = datetime.combine(start_date, datetime.min.time())

    # Every metric below is scoped to the selected window, so the whole
    # dashboard moves together when the timeframe changes — except the
    # "registered members" total, which reads as an all-time audience size
    # (the "new members" chart already covers signups within the window).
    all_quotes = db.query(QuoteRequest).filter(QuoteRequest.created_at >= cutoff).all()
    all_messages = db.query(ContactMessage).filter(ContactMessage.created_at >= cutoff).all()
    new_customers = db.query(Customer).filter(Customer.created_at >= cutoff).all()
    total_customers = db.query(Customer).count()

    bookings_by_day = _day_series(all_quotes, lambda q: q.created_at, start_date, days)
    messages_by_day = _day_series(all_messages, lambda m: m.created_at, start_date, days)
    new_customers_by_day = _day_series(new_customers, lambda c: c.created_at, start_date, days)

    status_breakdown = defaultdict(int)
    for q in all_quotes:
        status_breakdown[q.status] += 1

    message_status_breakdown = defaultdict(int)
    for m in all_messages:
        message_status_breakdown[m.status] += 1

    product_totals = defaultdict(lambda: {"qty": 0, "revenue": 0})
    for q in all_quotes:
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

    total_revenue = sum(q.total for q in all_quotes)
    total_bookings = len(all_quotes)

    return {
        "days": days,
        "is_custom": is_custom,
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
        "total_customers": total_customers,
        "total_messages": len(all_messages),
    }
