import json
import os
from urllib import request


BASE_URL = "http://127.0.0.1:8000"
ADMIN_EMAIL = os.getenv("TEST_ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.getenv("TEST_ADMIN_PASSWORD", "CHANGE_ME")
GATE_AUTH = os.getenv("BACKEND_GATE_AUTHORIZATION", "Basic CHANGE_ME")


def pretty(title: str, payload) -> None:
    print(f"\n=== {title} ===")
    if isinstance(payload, (dict, list)):
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    else:
        print(payload)


def http_json(method: str, url: str, payload: dict | None = None, token: str | None = None) -> dict:
    body = None
    headers = {
        "Content-Type": "application/json",
        "X-Gate-Authorization": GATE_AUTH,
    }
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = request.Request(url, data=body, headers=headers, method=method)
    with request.urlopen(req, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def smoke() -> None:
    health = http_json("GET", f"{BASE_URL}/health")
    pretty("HEALTH", health)

    login = http_json(
        "POST",
        f"{BASE_URL}/api/v1/auth/login",
        {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    pretty("LOGIN", login)
    token = login["access_token"]

    ai_payload = {
        "service_id": 1,
        "country_id": 1,
        "zone_id": 1,
        "currency": "RON",
        "legislation_code": "RO-STD",
        "message": "Am nevoie urgent de montaj centrala termica pentru un apartament in Bucuresti.",
        "urgency": True,
        "service_level": "STANDARD",
        "resources": [
            {
                "resource_type": "EQUIPMENT",
                "name": "Kit montaj centrala",
                "unit": "set",
                "quantity": 1,
                "unit_cost": 650,
            },
            {
                "resource_type": "LABOR",
                "name": "Manopera instalare",
                "unit": "ora",
                "quantity": 6,
                "unit_cost": 120,
            },
        ],
    }
    ai_response = http_json(
        "POST",
        f"{BASE_URL}/api/v1/ai/interpret",
        ai_payload,
        token,
    )
    pretty("AI INTERPRET", ai_response)

    deviz_payload = {
        "service_id": 1,
        "country_id": 1,
        "zone_id": 1,
        "currency": "RON",
        "legislation_code": "RO-STD",
        "urgency": True,
        "service_level": "STANDARD",
        "source_message": "Test smoke pentru deviz",
        "resources": [
            {
                "resource_type": "EQUIPMENT",
                "name": "Kit montaj centrala",
                "unit": "set",
                "quantity": 1,
                "unit_cost": 650,
            },
            {
                "resource_type": "LABOR",
                "name": "Manopera instalare",
                "unit": "ora",
                "quantity": 6,
                "unit_cost": 120,
            },
        ],
    }
    deviz_response = http_json(
        "POST",
        f"{BASE_URL}/api/v1/deviz/generate",
        deviz_payload,
        token,
    )
    pretty("DEVIZ GENERATE", deviz_response)


if __name__ == "__main__":
    smoke()
