from types import SimpleNamespace

from starlette.requests import Request

from app.api.v1.endpoints import admin, auth
from app.core.config import settings
from app.modules.backoffice_contact.router import get_backoffice_contact
from app.modules.esco.backoffice_router import (
    _load_payload_from_bytes,
    list_esco_isco_groups,
    list_esco_occupations,
    list_esco_skills,
)
from app.schemas.backoffice_service_creation import BackofficeServiceCreateRequest
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.backoffice_service_creation import build_service_creation_response


class FakeQuery:
    def __init__(self, db):
        self._db = db
        self._email = None
        self._user_id = None
        self._verification_status = None

    def filter(self, *conditions):
        for condition in conditions:
            left = getattr(condition, "left", None)
            right = getattr(condition, "right", None)
            key = getattr(left, "key", None)
            value = getattr(right, "value", None)

            if key == "email":
                self._email = value
            elif key == "id":
                self._user_id = value
            elif key == "verification_status":
                self._verification_status = value
        return self

    def first(self):
        if self._email is not None:
            return next((user for user in self._db.users if user.email == self._email), None)
        if self._user_id is not None:
            return next((user for user in self._db.users if user.id == self._user_id), None)
        if self._verification_status is not None:
            return next(
                (
                    user
                    for user in self._db.users
                    if user.verification_status == self._verification_status
                ),
                None,
            )
        return self._db.users[0] if self._db.users else None

    def all(self):
        if self._verification_status is not None:
            return [
                user
                for user in self._db.users
                if user.verification_status == self._verification_status
            ]
        return list(self._db.users)


class FakeDB:
    def __init__(self, users=None):
        self.users = list(users or [])
        self._next_id = max((user.id for user in self.users), default=0) + 1

    def query(self, _model):
        return FakeQuery(self)

    def add(self, user):
        if getattr(user, "id", None) is None:
            user.id = self._next_id
            self._next_id += 1
        self.users.append(user)

    def commit(self):
        return None

    def refresh(self, _user):
        return None


class FakeScalarResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows


class FakeExecuteResult:
    def __init__(self, rows):
        self._rows = rows

    def scalars(self):
        return FakeScalarResult(self._rows)


class FakeBrowseDB:
    def __init__(self, rows):
        self._rows = rows

    def execute(self, _statement):
        return FakeExecuteResult(self._rows)


def make_request():
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/tests",
            "headers": [],
            "client": ("127.0.0.1", 12345),
        }
    )


def make_user(*, user_id, email, hashed_password, role, verification_status):
    return SimpleNamespace(
        id=user_id,
        full_name=None,
        email=email,
        phone=None,
        city=None,
        hashed_password=hashed_password,
        role=role,
        verification_status=verification_status,
    )


def test_register_returns_public_user_payload():
    db = FakeDB()

    response = auth.register(
        request=make_request(),
        data=RegisterRequest(email="newuser@example.com", password="StrongPass123"),
        db=db,
    )

    payload = response.model_dump()
    assert payload == {
        "id": 1,
        "full_name": None,
        "email": "newuser@example.com",
        "phone": None,
        "city": None,
        "role": "CLIENT",
        "verification_status": "APPROVED",
        "permissions": ["orders:create", "orders:view_own", "account:update_own", "media:upload_own"],
    }


def test_register_partner_keeps_pending_review():
    db = FakeDB()

    response = auth.register(
        request=make_request(),
        data=RegisterRequest(email="partner@example.com", password="StrongPass123", role="PARTNER"),
        db=db,
    )

    assert response.model_dump()["verification_status"] == "PENDING"
    assert response.model_dump()["role"] == "PARTNER"


def test_login_returns_access_token_for_valid_credentials():
    hashed_password = auth.hash_password("StrongPass123")
    db = FakeDB(
        users=[
            make_user(
                user_id=1,
                email="member@example.com",
                hashed_password=hashed_password,
                role="CLIENT",
                verification_status="PENDING",
            )
        ]
    )

    response = auth.login(
        request=make_request(),
        data=LoginRequest(email="member@example.com", password="StrongPass123"),
        db=db,
    )

    payload = response.model_dump()

    assert payload["token_type"] == "bearer"
    assert isinstance(payload["access_token"], str)
    assert payload["access_token"]
    assert payload["user_id"] == 1
    assert payload["full_name"] is None
    assert payload["email"] == "member@example.com"
    assert payload["phone"] is None
    assert payload["city"] is None
    assert payload["role"] == "CLIENT"
    assert payload["verification_status"] == "PENDING"
    assert payload["permissions"] == ["orders:create", "orders:view_own", "account:update_own", "media:upload_own"]


def test_login_blocks_pending_admin_accounts():
    hashed_password = auth.hash_password("StrongPass123")
    db = FakeDB(
        users=[
            make_user(
                user_id=1,
                email="admin.pending@example.com",
                hashed_password=hashed_password,
                role="ADMIN",
                verification_status="PENDING",
            )
        ]
    )

    try:
        auth.login(
            request=make_request(),
            data=LoginRequest(email="admin.pending@example.com", password="StrongPass123"),
            db=db,
        )
    except Exception as exc:
        assert getattr(exc, "detail", None) == "Account pending approval"
    else:
        raise AssertionError("Pending admin login should be blocked")


def test_me_returns_public_user_payload():
    user = make_user(
        user_id=7,
        email="admin@example.com",
        hashed_password="secret-hash",
        role="ADMIN",
        verification_status="APPROVED",
    )

    response = auth.me(current_user=user)

    assert response.model_dump() == {
        "id": 7,
        "full_name": None,
        "email": "admin@example.com",
        "phone": None,
        "city": None,
        "role": "ADMIN",
        "verification_status": "APPROVED",
        "permissions": ["backoffice:access", "catalog:manage", "site_content:manage", "users:review"],
    }


def test_get_all_users_returns_list_without_hashed_password():
    db = FakeDB(
        users=[
            make_user(
                user_id=1,
                email="admin@example.com",
                hashed_password="hash-1",
                role="ADMIN",
                verification_status="APPROVED",
            ),
            make_user(
                user_id=2,
                email="client@example.com",
                hashed_password="hash-2",
                role="CLIENT",
                verification_status="PENDING",
            ),
        ]
    )

    response = admin.get_all_users(db=db, current_admin=db.users[0])
    payload = [item.model_dump() for item in response]

    assert payload == [
        {
            "id": 1,
            "full_name": None,
            "email": "admin@example.com",
            "phone": None,
            "city": None,
            "role": "ADMIN",
            "verification_status": "APPROVED",
            "permissions": ["backoffice:access", "catalog:manage", "site_content:manage", "users:review"],
        },
        {
            "id": 2,
            "full_name": None,
            "email": "client@example.com",
            "phone": None,
            "city": None,
            "role": "CLIENT",
            "verification_status": "PENDING",
            "permissions": ["orders:create", "orders:view_own", "account:update_own", "media:upload_own"],
        },
    ]


def test_get_pending_users_filters_only_pending_entries():
    db = FakeDB(
        users=[
            make_user(
                user_id=1,
                email="admin@example.com",
                hashed_password="hash-1",
                role="ADMIN",
                verification_status="APPROVED",
            ),
            make_user(
                user_id=2,
                email="pending@example.com",
                hashed_password="hash-2",
                role="CLIENT",
                verification_status="PENDING",
            ),
        ]
    )

    response = admin.get_pending_users(db=db, current_admin=db.users[0])
    payload = [item.model_dump() for item in response]

    assert payload == [
        {
            "id": 2,
            "full_name": None,
            "email": "pending@example.com",
            "phone": None,
            "city": None,
            "role": "CLIENT",
            "verification_status": "PENDING",
            "permissions": ["orders:create", "orders:view_own", "account:update_own", "media:upload_own"],
        }
    ]


def test_get_backoffice_contact_returns_configured_contact_data():
    original_values = {
        "name": settings.BACKOFFICE_CONTACT_NAME,
        "email": settings.BACKOFFICE_CONTACT_EMAIL,
        "phone": settings.BACKOFFICE_CONTACT_PHONE,
        "whatsapp": settings.BACKOFFICE_CONTACT_WHATSAPP,
        "note": settings.BACKOFFICE_CONTACT_NOTE,
    }

    settings.BACKOFFICE_CONTACT_NAME = "Suport My Darrin"
    settings.BACKOFFICE_CONTACT_EMAIL = "contact@mydarrin.ro"
    settings.BACKOFFICE_CONTACT_PHONE = "+40 700 000 000"
    settings.BACKOFFICE_CONTACT_WHATSAPP = "+40 700 000 000"
    settings.BACKOFFICE_CONTACT_NOTE = "Disponibil in programul de backoffice."

    try:
        response = get_backoffice_contact()
    finally:
        settings.BACKOFFICE_CONTACT_NAME = original_values["name"]
        settings.BACKOFFICE_CONTACT_EMAIL = original_values["email"]
        settings.BACKOFFICE_CONTACT_PHONE = original_values["phone"]
        settings.BACKOFFICE_CONTACT_WHATSAPP = original_values["whatsapp"]
        settings.BACKOFFICE_CONTACT_NOTE = original_values["note"]

    assert response.model_dump() == {
        "name": "Suport My Darrin",
        "email": "contact@mydarrin.ro",
        "phone": "+40 700 000 000",
        "whatsapp": "+40 700 000 000",
        "note": "Disponibil in programul de backoffice.",
    }


def test_load_esco_payload_from_bytes_parses_json_object():
    payload = _load_payload_from_bytes(
        b'{"uri":"http://data.europa.eu/esco/isco/C21","className":"Occupation","title":"Science and engineering professionals"}'
    )

    assert payload == {
        "uri": "http://data.europa.eu/esco/isco/C21",
        "className": "Occupation",
        "title": "Science and engineering professionals",
    }


def test_list_esco_isco_groups_returns_serialized_items():
    db = FakeBrowseDB(
        [
            SimpleNamespace(
                concept_uri="http://data.europa.eu/esco/isco/C21",
                concept_type="Occupation",
                code="C21",
                preferred_label="Science and engineering professionals",
                alt_labels=["Science professionals"],
                status="released",
                in_scheme="http://data.europa.eu/esco/concept-scheme/isco",
                description="Group description",
            )
        ]
    )

    response = list_esco_isco_groups(db=db)

    assert response.model_dump() == {
        "query": None,
        "count": 1,
        "items": [
            {
                "concept_uri": "http://data.europa.eu/esco/isco/C21",
                "concept_type": "Occupation",
                "code": "C21",
                "preferred_label": "Science and engineering professionals",
                "alt_labels": ["Science professionals"],
                "status": "released",
                "in_scheme": "http://data.europa.eu/esco/concept-scheme/isco",
                "description": "Group description",
            }
        ],
    }


def test_list_esco_skills_returns_serialized_items():
    db = FakeBrowseDB(
        [
            SimpleNamespace(
                concept_uri="http://data.europa.eu/esco/skill/example",
                concept_type="Skill",
                preferred_label="Design calculations",
                alt_labels=["Engineering calculations"],
                status="released",
                reuse_level="cross-sector",
                skill_types=["knowledge"],
                in_scheme="http://data.europa.eu/esco/concept-scheme/skills",
                description="Skill description",
            )
        ]
    )

    response = list_esco_skills(db=db)

    assert response.model_dump() == {
        "query": None,
        "count": 1,
        "items": [
            {
                "concept_uri": "http://data.europa.eu/esco/skill/example",
                "concept_type": "Skill",
                "preferred_label": "Design calculations",
                "alt_labels": ["Engineering calculations"],
                "status": "released",
                "reuse_level": "cross-sector",
                "skill_types": ["knowledge"],
                "in_scheme": "http://data.europa.eu/esco/concept-scheme/skills",
                "description": "Skill description",
            }
        ],
    }


def test_list_esco_occupations_returns_serialized_items():
    db = FakeBrowseDB(
        [
            SimpleNamespace(
                concept_uri="http://data.europa.eu/esco/occupation/example",
                concept_type="Occupation",
                isco_group="http://data.europa.eu/esco/isco/C21",
                code="2141",
                preferred_label="Industrial engineer",
                alt_labels=["Production engineer"],
                status="released",
                in_scheme="http://data.europa.eu/esco/concept-scheme/occupations",
                nace_code="C25",
                research_occupation=False,
                green_share=0.2,
                description="Occupation description",
            )
        ]
    )

    response = list_esco_occupations(db=db)

    assert response.model_dump() == {
        "query": None,
        "count": 1,
        "items": [
            {
                "concept_uri": "http://data.europa.eu/esco/occupation/example",
                "concept_type": "Occupation",
                "isco_group": "http://data.europa.eu/esco/isco/C21",
                "code": "2141",
                "preferred_label": "Industrial engineer",
                "alt_labels": ["Production engineer"],
                "status": "released",
                "in_scheme": "http://data.europa.eu/esco/concept-scheme/occupations",
                "nace_code": "C25",
                "research_occupation": False,
                "green_share": 0.2,
                "description": "Occupation description",
            }
        ],
    }


def test_build_service_creation_response_returns_compound_payload():
    payload = BackofficeServiceCreateRequest(
        domain_id=1,
        category_id=2,
        subcategory_id=3,
        service_name_ro="Serviciu demo",
        service_name_en="Demo service",
        service_slug="serviciu-demo",
        service_code="SRV003001",
        short_description_ro="Descriere scurta",
        short_description_en="Short description",
        is_active=True,
        caen_codes=["4322"],
        uniclass_activity_ids=[11],
        esco_occupations=["http://data.europa.eu/esco/occupation/example"],
        recipe_items=[],
    )
    service = SimpleNamespace(
        id=99,
        name="Serviciu demo",
        slug="serviciu-demo",
        description="Descriere scurta",
        description_extended="Short description",
        is_active=True,
        esco_concept_uri=None,
        images=["/image"],
        documents=["/document"],
        videos=["/video"],
        level_attachments={},
        subcategory_ids=[3],
    )

    response = build_service_creation_response(
        payload=payload,
        service=service,
        service_code="SRV003001",
        hierarchy={"domain_id": 1, "category_id": 2, "subcategory_id": 3},
        classifications={
            "caen_codes": ["4322"],
            "uniclass_activity_ids": [11],
            "esco_occupations": ["http://data.europa.eu/esco/occupation/example"],
        },
        recipes=[],
        attachments=[],
        price_config=SimpleNamespace(id=501),
    )

    dumped = response.model_dump()
    assert dumped["service_id"] == 99
    assert dumped["service_code"] == "SRV003001"
    assert dumped["service"]["slug"] == "serviciu-demo"
    assert dumped["default_costs"]["admin_price_config_id"] == 501
