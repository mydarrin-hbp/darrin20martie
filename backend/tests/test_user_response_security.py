from types import SimpleNamespace

from app.api.v1.endpoints import admin
from app.schemas.user import UserResponse


def make_user(
    *,
    user_id: int = 1,
    email: str = "user@example.com",
    role: str = "CLIENT",
    verification_status: str = "PENDING",
    hashed_password: str = "super-secret-hash",
):
    return SimpleNamespace(
        id=user_id,
        email=email,
        role=role,
        verification_status=verification_status,
        hashed_password=hashed_password,
    )


class FakeQuery:
    def __init__(self, users):
        self._users = users

    def all(self):
        return self._users

    def filter(self, *_args, **_kwargs):
        return self

    def first(self):
        return self._users[0] if self._users else None


class FakeDB:
    def __init__(self, users):
        self._users = users
        self.committed = False
        self.refreshed = []

    def query(self, _model):
        return FakeQuery(self._users)

    def commit(self):
        self.committed = True

    def refresh(self, user):
        self.refreshed.append(user)


def test_user_response_from_user_excludes_hashed_password():
    user = make_user()

    response = UserResponse.from_user(user)

    assert response.model_dump() == {
        "id": 1,
        "email": "user@example.com",
        "role": "CLIENT",
        "verification_status": "PENDING",
    }
    assert "hashed_password" not in response.model_dump()


def test_get_all_users_returns_only_public_fields():
    users = [make_user(user_id=1), make_user(user_id=2, email="second@example.com")]
    db = FakeDB(users)

    response = admin.get_all_users(db=db, current_admin=make_user(role="ADMIN"))

    payload = [item.model_dump() for item in response]
    assert payload == [
        {
            "id": 1,
            "email": "user@example.com",
            "role": "CLIENT",
            "verification_status": "PENDING",
        },
        {
            "id": 2,
            "email": "second@example.com",
            "role": "CLIENT",
            "verification_status": "PENDING",
        },
    ]
    assert all("hashed_password" not in item for item in payload)


def test_activate_user_returns_public_fields_and_updates_status():
    user = make_user()
    db = FakeDB([user])

    response = admin.activate_user(user_id=1, db=db, current_admin=make_user(role="ADMIN"))

    assert db.committed is True
    assert db.refreshed == [user]
    assert response.model_dump() == {
        "id": 1,
        "email": "user@example.com",
        "role": "CLIENT",
        "verification_status": "APPROVED",
    }
    assert "hashed_password" not in response.model_dump()
