# backend/app/modules/activities/models.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, UniqueConstraint, Index
from sqlalchemy.orm import relationship

from app.db.base import Base


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True)
    code = Column(String(20), nullable=False, unique=True)  # mp, mc, kg, tona, ml, ora
    name = Column(String(80), nullable=False)              # metru patrat, metru cub, kilogram...
    is_active = Column(Boolean, default=True, nullable=False)


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True)

    # Activitatea se leagă de o subcategorie (sau categorie) din catalog.
    # În schema ta curentă ai "subcategories" ca tabel separat, deci legăm aici.
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"), nullable=False, index=True)

    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=True, index=True)  # cod intern / CAEN mapping ulterior
    esco_concept_uri = Column(String(255), nullable=True, index=True)

    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False, index=True)

    is_active = Column(Boolean, default=True, nullable=False)

    unit = relationship("Unit")


class ServiceActivity(Base):
    """
    Pivot: un Service are mai multe Activities.
    Aici modelăm regula ta: activitatea poate exista de sine stătător, dar și compune servicii.
    """
    __tablename__ = "service_activities"

    id = Column(Integer, primary_key=True)

    service_id = Column(Integer, ForeignKey("services.id"), nullable=False, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False, index=True)

    sort_order = Column(Integer, default=0, nullable=False)
    is_required = Column(Boolean, default=True, nullable=False)

    __table_args__ = (
        UniqueConstraint("service_id", "activity_id", name="uq_service_activity"),
        Index("ix_service_activities_service_activity", "service_id", "activity_id"),
    )
