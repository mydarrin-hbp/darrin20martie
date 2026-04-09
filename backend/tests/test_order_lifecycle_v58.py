from __future__ import annotations

from datetime import UTC, datetime
from types import SimpleNamespace

import app.models.admin_rbac  # noqa: F401
from app.modules.orders.allocation_service import claim_order_broadcast
import app.modules.orders.allocation_service as allocation_service_module
import app.modules.orders.document_service as document_service_module
from app.modules.orders.models import OrderBroadcast, OrderDocument
from app.modules.orders.schemas import PublicOrderCreateRequest
from app.modules.orders.service import create_public_order
from app.modules.orders.document_service import handle_proforma_paid


def _utcnow() -> datetime:
    return datetime.now(UTC)


class FakeScalarResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return list(self._rows)

    def scalar_one_or_none(self):
        return self._rows[0] if self._rows else None

    def scalar_one(self):
        return self._rows[0]


class FakeExecuteResult:
    def __init__(self, rows):
        self._rows = rows

    def scalars(self):
        return FakeScalarResult(self._rows)

    def scalar_one_or_none(self):
        return self._rows[0] if self._rows else None

    def scalar_one(self):
        return self._rows[0]

    def one(self):
        if len(self._rows) == 1 and isinstance(self._rows[0], tuple):
            return self._rows[0]
        raise AssertionError("Unexpected .one() call for fake result")


def _extract_value(expression):
    right = getattr(expression, "right", None)
    return getattr(right, "value", None)


def _matches(item, expression) -> bool:
    left = getattr(expression, "left", None)
    key = getattr(left, "key", None)
    if not key:
        return True
    current_value = getattr(item, key, None)
    operator_name = getattr(getattr(expression, "operator", None), "__name__", "")
    expected = _extract_value(expression)

    if operator_name == "eq":
        return current_value == expected
    if operator_name == "ne":
        return current_value != expected
    if operator_name == "gt":
        return current_value is not None and expected is not None and current_value > expected
    if operator_name == "in_op":
        return current_value in (expected or [])
    if operator_name == "is_":
        return current_value is expected
    if operator_name == "is_not":
        return current_value is not expected
    return True


class FakeDB:
    def __init__(self, *, service, supplier):
        self.services = {service.id: service}
        self.orders = {}
        self.suppliers = {supplier.id: supplier}
        self.documents = {}
        self.broadcasts = {}
        self.work_packages = {}
        self._counters = {
            "order": 1,
            "document": 1,
            "broadcast": 1,
        }

    def add(self, item):
        cls_name = item.__class__.__name__
        if cls_name == "Order":
            if getattr(item, "id", None) is None:
                item.id = self._counters["order"]
                self._counters["order"] += 1
            if getattr(item, "created_at", None) is None:
                item.created_at = _utcnow()
            self.orders[item.id] = item
            return
        if cls_name == "OrderDocument":
            if getattr(item, "id", None) is None:
                item.id = self._counters["document"]
                self._counters["document"] += 1
            if getattr(item, "generated_at", None) is None:
                item.generated_at = _utcnow()
            self.documents[item.id] = item
            return
        if cls_name == "OrderBroadcast":
            if getattr(item, "id", None) is None:
                item.id = self._counters["broadcast"]
                self._counters["broadcast"] += 1
            if getattr(item, "created_at", None) is None:
                item.created_at = _utcnow()
            self.broadcasts[item.id] = item
            return
        raise AssertionError(f"Unsupported add for {cls_name}")

    def commit(self):
        return None

    def refresh(self, item):
        if getattr(item, "created_at", None) is None:
            item.created_at = _utcnow()
        return None

    def get(self, model, item_id):
        model_name = getattr(model, "__name__", "")
        if model_name == "Order":
            return self.orders.get(item_id)
        if model_name == "Service":
            return self.services.get(item_id)
        if model_name == "Supplier":
            return self.suppliers.get(item_id)
        if model_name == "OrderBroadcast":
            return self.broadcasts.get(item_id)
        return None

    def execute(self, statement):
        entity = statement.column_descriptions[0].get("entity")
        entity_name = getattr(entity, "__name__", "")
        if entity_name == "OrderDocument":
            rows = list(self.documents.values())
        elif entity_name == "Supplier":
            rows = [row for row in self.suppliers.values() if getattr(row, "is_active", False)]
        elif entity_name == "OrderBroadcast":
            rows = list(self.broadcasts.values())
        else:
            return FakeExecuteResult([])

        for expression in statement._where_criteria:
            rows = [row for row in rows if _matches(row, expression)]
        return FakeExecuteResult(rows)


def test_order_lifecycle_v58_replacement_centrala(monkeypatch):
    service = SimpleNamespace(id=101, slug="montaj-centrala-termica", name="Montaj centrala termica")
    capability = SimpleNamespace(
        is_active=True,
        caen_code="4322",
        certification_codes=["GAS_AUTH", "ISCIR_AUTH"],
        can_lead_package=True,
        task_type=SimpleNamespace(slug="echipa-instalare", name_ro="Echipa instalare", name_en="Install team"),
        asset_type=SimpleNamespace(slug="centrala-termica"),
    )
    supplier = SimpleNamespace(
        id=501,
        is_active=True,
        user_id=42,
        contact_email="partner@example.com",
        location_geo={
            "country_codes": ["RO"],
            "zone_slugs": ["bacau"],
            "locality_slugs": ["bacau"],
            "specializations": ["Echipa Instalare", "ISCIR", "Centrale"],
        },
        capabilities=[capability],
        insurance_status="ACTIVE",
        insurance_valid_until=_utcnow().replace(year=_utcnow().year + 1),
        criminal_record_status="VALID",
        criminal_record_valid_until=_utcnow().replace(year=_utcnow().year + 1),
        integrity_declaration_status="VALID",
    )
    db = FakeDB(service=service, supplier=supplier)

    import app.modules.orders.service as orders_service_module

    monkeypatch.setattr(orders_service_module, "_resolve_service", lambda _db, slug: service if slug == service.slug else None)
    monkeypatch.setattr(
        orders_service_module,
        "syncPublicPrices",
        lambda *args, **kwargs: SimpleNamespace(
            availability_status="available",
            country_code="RO",
            zone_slug="bacau",
            locality_slug="bacau",
            currency="RON",
            currency_symbol="RON",
            legislation_code="RO_STANDARD",
            minimum_order_applied=False,
            cost_direct=1000.0,
            cost_regie=100.0,
            mentenanta_platforma=30.0,
            venit_platforma=150.0,
            garantie_buna_executie=50.0,
            taxe_si_garantii=69.0,
            tva=228.0,
            total_facturabil=1347.0,
        ),
    )
    monkeypatch.setattr(
        orders_service_module,
        "_resolve_geo_ids",
        lambda *args, **kwargs: (
            SimpleNamespace(id=1, code="RO"),
            SimpleNamespace(id=2, slug="bacau"),
            SimpleNamespace(id=3, slug="bacau"),
        ),
    )
    monkeypatch.setattr(orders_service_module, "generate_deviz", lambda *args, **kwargs: SimpleNamespace(id=777))

    def fake_generate_proforma_document(fake_db, order):
        document = OrderDocument(
            order_id=order.id,
            document_type="PROFORMA",
            status="GENERATED",
            mime_type="application/pdf",
            storage_key=f"orders/{order.order_ref}/proforma.pdf",
            file_name=f"{order.order_ref}-proforma.pdf",
            placeholder_content="Proforma placeholder",
        )
        fake_db.add(document)
        return document

    monkeypatch.setattr(orders_service_module, "generate_proforma_document", fake_generate_proforma_document)
    monkeypatch.setattr(allocation_service_module, "_supplier_matches_order_requirements", lambda supplier, order: True)

    def fake_broadcast_order_to_eligible_partners(fake_db, order_id):
        broadcast = OrderBroadcast(
            order_id=order_id,
            supplier_id=supplier.id,
            task_scope="HVAC",
            claim_status="PENDING",
            can_cover_full_package=True,
            locality_slug="bacau",
            priority_expires_at=None,
        )
        fake_db.add(broadcast)
        return [broadcast]

    monkeypatch.setattr(document_service_module, "broadcast_order_to_eligible_partners", fake_broadcast_order_to_eligible_partners)

    payload = PublicOrderCreateRequest(
        slug="montaj-centrala-termica",
        target_address="Strada Republicii, Bacau",
        intervention_label="Inlocuire",
        task_label="Demontare unitate veche + montaj nou",
        skill_label="Echipa instalare",
        required_people=2,
        esco_codes=["ESCO-HVAC-REMOVE", "ESCO-HVAC-INSTALL"],
        nace_codes=["4322"],
        required_certification_codes=["GAS_AUTH", "ISCIR_AUTH"],
        escrow_retention=5.0,
    )

    created = create_public_order(db, payload)

    assert created is not None and not isinstance(created, str)
    order = next(iter(db.orders.values()))
    assert order.intervention_label == "Inlocuire"
    assert order.task_label == "Demontare unitate veche + montaj nou"
    assert order.garantie_buna_executie == 50.0

    documents = handle_proforma_paid(db, order.id)
    assert documents is not None
    assert order.status == "PAID"
    assert len(db.broadcasts) == 1

    broadcast = next(iter(db.broadcasts.values()))
    assert broadcast.supplier_id == supplier.id
    assert broadcast.claim_status == "PENDING"
    assert broadcast.can_cover_full_package is True

    claimed = claim_order_broadcast(db, broadcast_id=broadcast.id, supplier_id=supplier.id)
    assert claimed is not None and not isinstance(claimed, str)
    assert order.status == "ASSIGNED"
    assert claimed.claim_status == "CLAIMED"
    assert claimed.claimed_at is not None
