from types import SimpleNamespace

from starlette.requests import Request

from app.api.v1.endpoints import admin, auth
from app.schemas.auth import LoginRequest, RegisterRequest


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
        email=email,
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
        "email": "newuser@example.com",
        "role": "CLIENT",
        "verification_status": "PENDING",
    }


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

    assert response["token_type"] == "bearer"
    assert isinstance(response["access_token"], str)
    assert response["access_token"]


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
            "email": "admin@example.com",
            "role": "ADMIN",
            "verification_status": "APPROVED",
        },
        {
            "id": 2,
            "email": "client@example.com",
            "role": "CLIENT",
            "verification_status": "PENDING",
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
            "email": "pending@example.com",
            "role": "CLIENT",
            "verification_status": "PENDING",
        }
    ]
