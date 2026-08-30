from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_admin, hash_password, verify_password
from ..database import get_db
from ..models import AdminUser
from ..schemas import AdminCreateIn, AdminOut, AdminUpdateIn, ChangePasswordIn

router = APIRouter(prefix="/api/admin", tags=["admin-admins"])


@router.get("/admins", response_model=List[AdminOut])
def list_admins(db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    return db.execute(select(AdminUser).order_by(AdminUser.created_at)).scalars().all()


@router.post("/admins", response_model=AdminOut, status_code=201)
def create_admin(payload: AdminCreateIn, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    email = payload.email.lower()
    if db.query(AdminUser).filter(AdminUser.email == email).first():
        raise HTTPException(status_code=409, detail="An admin with that email already exists")
    new_admin = AdminUser(email=email, password_hash=hash_password(payload.password), name=payload.name)
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin


@router.delete("/admins/{admin_id}", status_code=204)
def delete_admin(admin_id: int, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    if admin_id == admin.id:
        raise HTTPException(status_code=400, detail="You can't delete your own account")
    target = db.get(AdminUser, admin_id)
    if not target:
        raise HTTPException(status_code=404, detail="Admin not found")
    if db.query(AdminUser).count() <= 1:
        raise HTTPException(status_code=400, detail="Can't delete the last remaining admin")
    db.delete(target)
    db.commit()


@router.put("/me", response_model=AdminOut)
def update_me(payload: AdminUpdateIn, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    updates = payload.model_dump(exclude_unset=True)
    if "email" in updates:
        email = updates["email"].lower()
        existing = db.query(AdminUser).filter(AdminUser.email == email, AdminUser.id != admin.id).first()
        if existing:
            raise HTTPException(status_code=409, detail="An admin with that email already exists")
        updates["email"] = email
    for field, value in updates.items():
        setattr(admin, field, value)
    db.commit()
    db.refresh(admin)
    return admin


@router.put("/me/password", status_code=204)
def change_password(payload: ChangePasswordIn, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    if not verify_password(payload.current_password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    admin.password_hash = hash_password(payload.new_password)
    db.commit()
