from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..auth import create_access_token, get_current_admin, verify_password
from ..database import get_db
from ..models import AdminUser
from ..ratelimit import enforce_rate_limit, get_client_ip
from ..schemas import AdminLoginIn, AdminOut, TokenOut

router = APIRouter(prefix="/api/admin", tags=["admin-auth"])


@router.post("/login", response_model=TokenOut)
def login(payload: AdminLoginIn, request: Request, db: Session = Depends(get_db)):
    enforce_rate_limit(db, f"login:{get_client_ip(request)}", limit=8, window=timedelta(minutes=15))
    admin = db.query(AdminUser).filter(AdminUser.email == payload.email.lower()).first()
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(admin.id)
    return TokenOut(access_token=token, admin=AdminOut.model_validate(admin))


@router.get("/me", response_model=AdminOut)
def me(admin: AdminUser = Depends(get_current_admin)):
    return admin
