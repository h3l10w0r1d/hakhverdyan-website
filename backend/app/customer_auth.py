from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .auth import JWT_ALGORITHM, JWT_SECRET
from .database import get_db
from .models import Customer

# A distinct claim name ("customer_id" instead of admin.py's "sub") so a
# customer token can never be mistaken for an admin token even if the two
# tables happen to share a numeric id.
TOKEN_TTL = timedelta(days=30)

customer_bearer_scheme = HTTPBearer(auto_error=False)


def create_customer_token(customer_id: int) -> str:
    payload = {
        "customer_id": customer_id,
        "exp": datetime.now(timezone.utc) + TOKEN_TTL,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_customer_id(credentials: Optional[HTTPAuthorizationCredentials]) -> Optional[int]:
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return int(payload["customer_id"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None


def get_current_customer(
    credentials: HTTPAuthorizationCredentials = Depends(customer_bearer_scheme),
    db: Session = Depends(get_db),
) -> Customer:
    unauthorized = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    customer_id = _decode_customer_id(credentials)
    if customer_id is None:
        raise unauthorized
    customer = db.get(Customer, customer_id)
    if not customer:
        raise unauthorized
    return customer


def get_current_customer_optional(
    credentials: HTTPAuthorizationCredentials = Depends(customer_bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[Customer]:
    """Like get_current_customer, but returns None instead of raising — for
    endpoints (like quote submission) that work for guests and customers alike,
    attaching the account only when a valid token is present."""
    customer_id = _decode_customer_id(credentials)
    if customer_id is None:
        return None
    return db.get(Customer, customer_id)
