from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import AdminUser, Location, SiteSettings
from ..schemas import (
    LocationIn, LocationOut, LocationReorderIn, LocationUpdate,
    SiteSettingsOut, SiteSettingsUpdate,
)

router = APIRouter(prefix="/api/admin", tags=["admin-settings"])


@router.get("/settings", response_model=SiteSettingsOut)
def get_settings(db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    return db.get(SiteSettings, 1)


@router.put("/settings", response_model=SiteSettingsOut)
def update_settings(
    payload: SiteSettingsUpdate, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin),
):
    settings = db.get(SiteSettings, 1)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings


@router.get("/locations", response_model=List[LocationOut])
def list_locations(db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    return db.execute(select(Location).order_by(Location.sort_order)).scalars().all()


@router.post("/locations", response_model=LocationOut, status_code=201)
def create_location(payload: LocationIn, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    next_order = (db.scalar(select(func.max(Location.sort_order))) or 0) + 1
    location = Location(**payload.model_dump(), sort_order=next_order)
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


@router.put("/locations/reorder", response_model=List[LocationOut])
def reorder_locations(payload: LocationReorderIn, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    locations = {l.id: l for l in db.query(Location).filter(Location.id.in_(payload.ids)).all()}
    missing = set(payload.ids) - set(locations)
    if missing:
        raise HTTPException(status_code=404, detail=f"Unknown location id(s): {missing}")
    for index, location_id in enumerate(payload.ids):
        locations[location_id].sort_order = index
    db.commit()
    return db.execute(select(Location).order_by(Location.sort_order)).scalars().all()


@router.put("/locations/{location_id}", response_model=LocationOut)
def update_location(
    location_id: int, payload: LocationUpdate,
    db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin),
):
    location = db.get(Location, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(location, field, value)
    db.commit()
    db.refresh(location)
    return location


@router.delete("/locations/{location_id}", status_code=204)
def delete_location(location_id: int, db: Session = Depends(get_db), admin: AdminUser = Depends(get_current_admin)):
    location = db.get(Location, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(location)
    db.commit()
