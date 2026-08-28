from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import AdminUser, Partner
from ..schemas import PartnerIn, PartnerOut, PartnerReorderIn, PartnerUpdate

router = APIRouter(prefix="/api/admin/partners", tags=["admin-partners"])


@router.get("", response_model=List[PartnerOut])
def list_partners(db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    return db.execute(select(Partner).order_by(Partner.sort_order)).scalars().all()


@router.post("", response_model=PartnerOut, status_code=201)
def create_partner(payload: PartnerIn, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    next_order = (db.scalar(select(func.max(Partner.sort_order))) or 0) + 1
    partner = Partner(**payload.model_dump(), sort_order=next_order)
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner


@router.put("/reorder", response_model=List[PartnerOut])
def reorder_partners(payload: PartnerReorderIn, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    partners = {p.id: p for p in db.query(Partner).filter(Partner.id.in_(payload.ids)).all()}
    missing = set(payload.ids) - set(partners)
    if missing:
        raise HTTPException(status_code=404, detail=f"Unknown partner id(s): {missing}")
    for index, partner_id in enumerate(payload.ids):
        partners[partner_id].sort_order = index
    db.commit()
    return db.execute(select(Partner).order_by(Partner.sort_order)).scalars().all()


@router.put("/{partner_id}", response_model=PartnerOut)
def update_partner(
    partner_id: int, payload: PartnerUpdate,
    db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin),
):
    partner = db.get(Partner, partner_id)
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(partner, field, value)
    db.commit()
    db.refresh(partner)
    return partner


@router.delete("/{partner_id}", status_code=204)
def delete_partner(partner_id: int, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    partner = db.get(Partner, partner_id)
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    db.delete(partner)
    db.commit()
