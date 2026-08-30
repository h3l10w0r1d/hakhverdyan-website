from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Location, SiteSettings
from ..schemas import LocationOut, SiteSettingsOut

router = APIRouter(tags=["settings"])


@router.get("/api/settings", response_model=SiteSettingsOut)
def get_settings(db: Session = Depends(get_db)):
    return db.get(SiteSettings, 1)


@router.get("/api/locations", response_model=List[LocationOut])
def list_locations(db: Session = Depends(get_db)):
    return db.execute(select(Location).order_by(Location.sort_order)).scalars().all()
