from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .models import RateLimitBucket


def get_client_ip(request: Request) -> str:
    # Vercel terminates TLS in front of the app and forwards the real client
    # IP via X-Forwarded-For; request.client.host would otherwise just be
    # the proxy's address.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def enforce_rate_limit(db: Session, key: str, limit: int, window: timedelta) -> None:
    """Raises 429 once `limit` calls with the same key land inside `window`."""
    now = datetime.now(timezone.utc)
    bucket = db.query(RateLimitBucket).filter(RateLimitBucket.key == key).first()

    if bucket is None:
        try:
            db.add(RateLimitBucket(key=key, window_start=now, count=1))
            db.commit()
        except IntegrityError:
            # Two concurrent requests raced to create the same bucket — the
            # loser just falls through and counts itself against the winner's row.
            db.rollback()
        return

    window_start = bucket.window_start.replace(tzinfo=timezone.utc)
    if now - window_start > window:
        bucket.window_start = now
        bucket.count = 1
        db.commit()
        return

    if bucket.count >= limit:
        retry_after = int((window_start + window - now).total_seconds())
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(max(retry_after, 1))},
        )

    bucket.count += 1
    db.commit()
