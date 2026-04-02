from __future__ import annotations

import secrets

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.assets import ProviderAvailabilitySlot
from app.models.price_analysis import CatalogResource, Supplier
from app.modules.cost_engine.models import FinancialConfig
from app.modules.concrete_dispatch.schemas import ConcreteDispatchRequest, ConcreteDispatchResponse
from app.modules.orders.models import Order, WorkPackage


def _round_amount(value: float) -> float:
    return round(value, 2)


class ConcreteDispatchService:
    STANDARD_TRUCK_CAPACITY_MC = 9.0

    @staticmethod
    async def create_work_package(db: Session, payload: ConcreteDispatchRequest) -> ConcreteDispatchResponse | str:
        order = db.get(Order, payload.order_id) if payload.order_id else None
        material_supplier = await ConcreteDispatchService.match_supplier(
            db,
            task="READY_MIX_SUPPLY",
            locality_slug=payload.locality_slug,
            scheduled_slot=payload.scheduled_slot,
            supplier_id=payload.material_supplier_id,
        )
        if material_supplier is None:
            return "material_supplier_unavailable"

        equipment_supplier = None
        if payload.pump_required:
            equipment_supplier = await ConcreteDispatchService.match_supplier(
                db,
                task="CONCRETE_PUMPING",
                locality_slug=payload.locality_slug,
                scheduled_slot=payload.scheduled_slot,
                supplier_id=payload.equipment_supplier_id,
            )
            if equipment_supplier is None:
                return "equipment_supplier_unavailable"

        financial_config = ConcreteDispatchService._resolve_financial_config(db, locality_slug=payload.locality_slug)
        pricing = ConcreteDispatchService.calculate_general_contractor_price(
            db,
            supplier_plant=material_supplier,
            supplier_pump=equipment_supplier,
            volume=payload.volume,
            config=financial_config,
            pump_required=payload.pump_required,
        )

        package_ref = f"WPK-{secrets.token_hex(4).upper()}"
        work_package = WorkPackage(
            package_ref=package_ref,
            package_type="CONCRETE_DELIVERY",
            status="READY_FOR_EXECUTION",
            target_address=payload.target_address,
            locality_slug=payload.locality_slug,
            scheduled_slot=payload.scheduled_slot,
            material_supplier_id=material_supplier.id,
            equipment_supplier_id=equipment_supplier.id if equipment_supplier else None,
            umbrella_owner="MY_DARRIN",
        )
        db.add(work_package)
        db.flush()
        if order is not None:
            order.work_package_id = work_package.id
        db.commit()
        db.refresh(work_package)
        return ConcreteDispatchResponse(
            package_ref=work_package.package_ref,
            status=work_package.status,
            locality_slug=work_package.locality_slug or payload.locality_slug,
            scheduled_slot=work_package.scheduled_slot,
            material_supplier_id=material_supplier.id,
            equipment_supplier_id=equipment_supplier.id if equipment_supplier else None,
            volume=_round_amount(payload.volume),
            incomplete_load_fee=_round_amount(pricing["incomplete_load_fee"]),
            financial_breakdown=pricing,
            message="WorkPackage beton generat sub umbrela My Darrin cu statie si pompa sincronizate.",
        )

    @staticmethod
    async def match_supplier(
        db: Session,
        *,
        task: str,
        locality_slug: str,
        scheduled_slot: str,
        supplier_id: int | None = None,
    ) -> Supplier | None:
        slot_role = "MATERIAL" if task == "READY_MIX_SUPPLY" else "EQUIPMENT"
        slot_query = select(ProviderAvailabilitySlot).where(
            ProviderAvailabilitySlot.scheduled_slot == scheduled_slot,
            ProviderAvailabilitySlot.slot_role == slot_role,
            ProviderAvailabilitySlot.is_available.is_(True),
        )
        if supplier_id is not None:
            slot_query = slot_query.where(ProviderAvailabilitySlot.supplier_id == supplier_id)
        else:
            slot_query = slot_query.where(
                (ProviderAvailabilitySlot.locality_slug == locality_slug)
                | (ProviderAvailabilitySlot.locality_slug.is_(None))
            )
        slot = db.execute(slot_query.order_by(ProviderAvailabilitySlot.locality_slug.is_(None), ProviderAvailabilitySlot.id)).scalars().first()
        if slot is None:
            return None
        return db.get(Supplier, slot.supplier_id)

    @staticmethod
    def _resolve_financial_config(db: Session, *, locality_slug: str) -> FinancialConfig | None:
        return db.execute(
            select(FinancialConfig)
            .where(FinancialConfig.is_active.is_(True))
            .where(or_(FinancialConfig.locality_id.is_(None), FinancialConfig.service_family == "CONCRETE"))
            .order_by(FinancialConfig.service_family.is_(None), FinancialConfig.id.desc())
        ).scalars().first()

    @staticmethod
    def _find_resource_by_supplier(db: Session, *, supplier_id: int, resource_type: str, name_hint: str | None = None) -> CatalogResource | None:
        query = select(CatalogResource).where(
            CatalogResource.supplier_id == supplier_id,
            CatalogResource.resource_type == resource_type,
            CatalogResource.is_active.is_(True),
        )
        resources = db.execute(query.order_by(CatalogResource.id.asc())).scalars().all()
        if not name_hint:
            return resources[0] if resources else None
        lowered_hint = name_hint.lower()
        for resource in resources:
            if lowered_hint in resource.name_ro.lower() or lowered_hint in resource.name_en.lower():
                return resource
        return resources[0] if resources else None

    @staticmethod
    def calculate_general_contractor_price(
        db: Session,
        *,
        supplier_plant: Supplier,
        supplier_pump: Supplier | None,
        volume: float,
        config: FinancialConfig | None,
        pump_required: bool,
    ) -> dict:
        plant_material = ConcreteDispatchService._find_resource_by_supplier(
            db,
            supplier_id=supplier_plant.id,
            resource_type="MATERIAL",
            name_hint="beton",
        )
        plant_transport = ConcreteDispatchService._find_resource_by_supplier(
            db,
            supplier_id=supplier_plant.id,
            resource_type="TRANSPORT",
        )
        pump_equipment = None
        if pump_required and supplier_pump is not None:
            pump_equipment = ConcreteDispatchService._find_resource_by_supplier(
                db,
                supplier_id=supplier_pump.id,
                resource_type="EQUIPMENT",
                name_hint="pompa",
            )

        price_per_mc = float(plant_material.base_price if plant_material else 0.0)
        transport_fee = float(plant_transport.base_price if plant_transport else 0.0)
        pump_price_per_mc = float(pump_equipment.base_price if pump_equipment else 0.0)
        pump_fixed_mobilization = float((config.pump_mobilization_fee if config else 0.0))
        transport_empty_rate = float((config.incomplete_load_fee if config else 0.0)) / ConcreteDispatchService.STANDARD_TRUCK_CAPACITY_MC if config else 0.0

        incomplete_load_fee = 0.0
        if volume < ConcreteDispatchService.STANDARD_TRUCK_CAPACITY_MC:
            incomplete_load_fee = (ConcreteDispatchService.STANDARD_TRUCK_CAPACITY_MC - volume) * transport_empty_rate

        material_total = volume * price_per_mc
        transport_total = transport_fee + incomplete_load_fee
        pumping_total = 0.0
        if pump_required and supplier_pump is not None:
            configured_pump_per_mc = float(config.pump_price_per_m3 if config else 0.0)
            pumping_total = pump_fixed_mobilization + (volume * (configured_pump_per_mc or pump_price_per_mc))

        direct_costs = material_total + transport_total + pumping_total
        indirecte = direct_costs * float(config.indirect_cost_percentage if config else 0.0)
        management_fee = direct_costs * float(config.mydarrin_commission_percentage if config else 0.10)
        platform_fee_base = direct_costs + indirecte + management_fee
        platform_fee = platform_fee_base * float(config.platform_fee_percentage if config else 0.03)
        insurance = direct_costs * float(config.insurance_percentage if config else 0.0)
        escrow_warranty = direct_costs * float(config.escrow_guarantee_percentage if config else 0.05)
        total = platform_fee_base + platform_fee + insurance + escrow_warranty

        return {
            "material": _round_amount(material_total),
            "transport": _round_amount(transport_total),
            "pumping": _round_amount(pumping_total),
            "direct_costs": _round_amount(direct_costs),
            "indirecte": _round_amount(indirecte),
            "management_fee": _round_amount(management_fee),
            "platform_fee": _round_amount(platform_fee),
            "insurance": _round_amount(insurance),
            "escrow_warranty": _round_amount(escrow_warranty),
            "incomplete_load_fee": _round_amount(incomplete_load_fee),
            "total": _round_amount(total),
            "supplier_plant_id": supplier_plant.id,
            "supplier_pump_id": supplier_pump.id if supplier_pump else None,
            "price_per_mc": _round_amount(price_per_mc),
        }
