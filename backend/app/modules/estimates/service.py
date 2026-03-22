from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.service import Service
from app.modules.estimates.schemas import EstimateResponse
from app.modules.geography.models import Zone


def calculate_estimate(
    db: Session,
    service_id: int,
    quantity: float,
    unit_price: float,
    zone_id: int,
    urgency: bool = False,
) -> EstimateResponse:
    service = db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    zone = db.get(Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    base_cost = round(quantity * unit_price, 2)
    zone_multiplier = float(zone.multiplier)
    urgency_multiplier = 1.2 if urgency else 1.0
    subtotal = round(base_cost * zone_multiplier * urgency_multiplier, 2)
    platform_fee = round(subtotal * 0.1, 2)
    total = round(subtotal + platform_fee, 2)

    return EstimateResponse(
        service_id=service.id,
        quantity=quantity,
        unit_price=unit_price,
        zone_id=zone.id,
        urgency=urgency,
        base_cost=base_cost,
        zone_multiplier=zone_multiplier,
        urgency_multiplier=urgency_multiplier,
        platform_fee=platform_fee,
        total=total,
    )
