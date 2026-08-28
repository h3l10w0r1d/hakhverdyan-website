from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Partner
from ..schemas import PartnerOut

router = APIRouter(prefix="/api/partners", tags=["partners"])


@router.get("", response_model=List[PartnerOut])
def list_partners(db: Session = Depends(get_db)):
    stmt = select(Partner).where(Partner.active == True).order_by(Partner.sort_order)  # noqa: E712
    return db.execute(stmt).scalars().all()
