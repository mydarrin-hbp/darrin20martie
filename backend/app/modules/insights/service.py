from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.service import Service, service_subcategories
from app.models.subcategory import SubCategory
from app.modules.insights.schemas import InsightsResponse, OrdersByCategoryItem, ProviderPerformanceItem
from app.modules.orders.models import Order


PAID_STATUSES = {"PAID", "COMPLETED"}


def get_insights(db: Session) -> InsightsResponse:
    total_gmv = float(
        db.execute(select(func.coalesce(func.sum(Order.total_facturabil), 0.0))).scalar_one() or 0.0
    )
    total_orders = int(db.execute(select(func.count(Order.id))).scalar_one() or 0)
    paid_orders = int(
        db.execute(select(func.count(Order.id)).where(Order.status.in_(PAID_STATUSES))).scalar_one() or 0
    )
    currency = db.execute(select(Order.currency).limit(1)).scalar_one_or_none() or "RON"
    conversion_rate = (paid_orders / total_orders * 100.0) if total_orders else 0.0

    category_rows = db.execute(
        select(Category.name_ro, func.count(Order.id), func.coalesce(func.sum(Order.total_facturabil), 0.0))
        .select_from(Order)
        .join(Service, Service.id == Order.service_id)
        .join(service_subcategories, service_subcategories.c.service_id == Service.id, isouter=True)
        .join(SubCategory, SubCategory.id == service_subcategories.c.subcategory_id, isouter=True)
        .join(Category, Category.id == SubCategory.category_id, isouter=True)
        .group_by(Category.name_ro)
        .order_by(func.count(Order.id).desc())
    ).all()

    orders_by_category = [
        OrdersByCategoryItem(
            category=row[0] or "Necunoscut",
            order_count=int(row[1] or 0),
            gmv=round(float(row[2] or 0.0), 2),
        )
        for row in category_rows
    ]

    provider_rows = db.execute(
        select(
            func.coalesce(Order.provider_name, Order.provider_ref, "Nealocat"),
            func.count(Order.id),
            func.coalesce(func.sum(Order.total_facturabil), 0.0),
        )
        .group_by(func.coalesce(Order.provider_name, Order.provider_ref, "Nealocat"))
        .order_by(func.count(Order.id).desc())
        .limit(10)
    ).all()

    provider_performance = [
        ProviderPerformanceItem(
            provider=row[0],
            order_count=int(row[1] or 0),
            gmv=round(float(row[2] or 0.0), 2),
        )
        for row in provider_rows
    ]

    return InsightsResponse(
        total_gmv=round(total_gmv, 2),
        total_orders=total_orders,
        currency=currency,
        paid_orders=paid_orders,
        payment_conversion_rate=round(conversion_rate, 2),
        orders_by_category=orders_by_category,
        provider_performance=provider_performance,
    )
