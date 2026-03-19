# Admin Authentication System - Implementation Guide

## Overview

A production-ready JWT-based authentication system for the My Darrin FastAPI backend with:
- ✅ Password hashing using bcrypt
- ✅ JWT token generation and validation  
- ✅ Admin role-based access control
- ✅ Protected endpoints with dependency injection
- ✅ Pydantic schemas for validation

## Architecture

### Components

```
backend/app/
├── core/
│   ├── auth.py              # Password hashing, JWT operations, dependencies
│   ├── config.py            # JWT configuration settings
│   ├── database.py          # Database session management
│   └── dependencies.py      # Dependency injection utilities
├── api/
│   ├── router.py            # Main API router combining all routes
│   └── v1/
│       └── endpoints/
│           ├── auth.py      # Login and profile endpoints
│           └── admin.py     # Protected admin endpoints
├── schemas/
│   ├── auth.py              # Login, token, admin user schemas
│   └── user.py              # User schemas
└── models/
    └── user.py              # User model with roles enumeration
```

## Key Features

### 1. Password Hashing (bcrypt)

**File:** `app/core/auth.py`

```python
# Hash a password
hashed = hash_password("user_password")

# Verify a password
is_valid = verify_password("user_password", hashed)
```

- Uses bcrypt with automatic salt generation
- Secure by default with hardened configurations
- OWASP compliant

### 2. JWT Token Management

**File:** `app/core/auth.py`

```python
# Create token
token = create_access_token(user_id=1)

# Decode and validate token
user_id = decode_token(token)  # Returns user_id or raises HTTPException
```

**Configuration** (`app/core/config.py`):
- `JWT_SECRET`: Secret key (from `.env`)
- `JWT_ALGORITHM`: Always "HS256"
- `JWT_EXPIRATION_HOURS`: Default 24 hours

### 3. Authentication Endpoints

#### Login - POST `/api/v1/auth/login`

Request:
```json
{
  "email": "admin@mydarrin.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 1,
  "email": "admin@mydarrin.com"
}
```

#### Get Current Admin - GET `/api/v1/auth/me`

Request Header:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "id": 1,
  "email": "admin@mydarrin.com",
  "role": "admin",
  "is_active": true
}
```

### 4. Protected Admin Routes

All admin endpoints now require authentication:

- `GET /api/v1/admin/users/pending` - List pending users (requires ADMIN)
- `PATCH /api/v1/admin/users/{user_id}/verify` - Verify user (requires ADMIN)

The `@Depends(get_current_admin_user)` dependency ensures:
- ✅ Valid JWT token in Authorization header
- ✅ User exists and is active
- ✅ User has ADMIN role
- ✅ Token hasn't expired

Returns `403 Forbidden` if not admin, `401 Unauthorized` if invalid token.

## Setup Instructions

### 1. Install Dependencies

Required packages (already in `requirements.txt`):
```
PyJWT>=2.8.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
```

Verify with:
```bash
pip list | grep -E "PyJWT|passlib|python-multipart"
```

### 2. Environment Configuration

Create/update `.env`:
```
DATABASE_URL=postgresql+psycopg://mydarrin:mydarrin@localhost:5432/mydarrin
JWT_SECRET=your-super-secret-key-change-this-in-production
```

⚠️ **IMPORTANT**: Change `JWT_SECRET` to a secure random value in production!

Generate a secure key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Create Admin User

Run the helper script:
```bash
# Interactive mode
python backend/create_admin.py

# With arguments
python backend/create_admin.py --email admin@mydarrin.com --password "YourSecurePassword123"
```

Output:
```
✅ Admin user created successfully!
   Email: admin@mydarrin.com
   ID: 1
   Role: admin
   Active: true
```

### 4. Start the Server

```bash
cd backend
uvicorn app.main:app --reload
```

Access API docs: `http://localhost:8000/docs`

## Usage Examples

### cURL Examples

#### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mydarrin.com",
    "password": "YourSecurePassword123"
  }'
```

#### Get Current Admin Profile
```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### List Pending Users (Protected)
```bash
curl -X GET "http://localhost:8000/api/v1/admin/users/pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Python / Requests Examples

```python
import requests

# 1. Login
response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    json={
        "email": "admin@mydarrin.com",
        "password": "YourSecurePassword123"
    }
)
data = response.json()
token = data["access_token"]

# 2. Use token for protected endpoints
headers = {"Authorization": f"Bearer {token}"}

# Get current admin
admin = requests.get(
    "http://localhost:8000/api/v1/auth/me",
    headers=headers
).json()

# Get pending users
pending = requests.get(
    "http://localhost:8000/api/v1/admin/users/pending",
    headers=headers
).json()
```

## Error Handling

### Authentication Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 401 | Invalid email or password | Wrong credentials |
| 401 | Token has expired | Token older than 24 hours |
| 401 | Invalid authentication credentials | Malformed token |
| 401 | Missing authentication token | No Authorization header |
| 403 | Only admins can access this endpoint | User role is not ADMIN |
| 403 | User account is inactive | User is_active = false |
| 403 | Insufficient permissions. Admin access required. | Non-admin user on /admin route |

### Example Error Response

```json
{
  "detail": "Invalid email or password"
}
```

## Security Best Practices

### ✅ Implemented

- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] JWT tokens with expiration (24 hours default)
- [x] Role-based access control (ADMIN required)
- [x] Constant-time password comparison
- [x] User active status validation
- [x] HTTP Bearer scheme (RFC 7235 compliant)

### ⚠️ Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use HTTPS only (never HTTP for authentication)
- [ ] Set `JWT_EXPIRATION_HOURS` appropriately (consider 1-12 hours)
- [ ] Implement refresh token mechanism for long-lived sessions
- [ ] Add rate limiting to `/auth/login` endpoint
- [ ] Enable CORS properly (don't use `allow_all`)
- [ ] Implement logout/token blacklist (optional)
- [ ] Monitor failed login attempts
- [ ] Rotate JWT_SECRET periodically
- [ ] Use environment-specific settings per deployment

### Example Production Config

```python
# .env.production
DATABASE_URL=postgresql+psycopg://user:pass@prod-db:5432/mydarrin
JWT_SECRET=<generated-random-value>
JWT_EXPIRATION_HOURS=2
```

## Extending the System

### Add New Admin Routes

```python
from app.api.v1.endpoints.admin import router
from app.core.auth import get_current_admin_user

@router.get("/dashboard")
def admin_dashboard(current_admin = Depends(get_current_admin_user)):
    """Only admins can access this"""
    return {"admin_id": current_admin.id}
```

### Add New User Roles

Update `app/models/user.py`:
```python
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    PARTNER = "partner"
    CLIENT = "client"
    MODERATOR = "moderator"  # New role
```

### Customize Token Claims

In `app/core/auth.py`:
```python
def create_access_token(user_id: int, ...):
    to_encode = {
        "sub": str(user_id),
        "exp": expire,
        "role": user.role.value,  # Add custom claims
        "email": user.email
    }
```

## Troubleshooting

### Problem: "ModuleNotFoundError: No module named 'passlib'"

**Solution:**
```bash
pip install passlib[bcrypt]
```

### Problem: "Invalid authentication credentials" after login

- [ ] Check token hasn't been modified
- [ ] Verify `JWT_SECRET` matches between encoding and decoding
- [ ] Check token hasn't expired (24 hours default)

### Problem: "Only admins can access this endpoint"

- [ ] Verify user role is ADMIN: `SELECT role FROM users WHERE id=1;`
- [ ] Verify user is active: `SELECT is_active FROM users WHERE id=1;`
- [ ] Check user was created with correct role

### Problem: Cannot create admin user

- [ ] Ensure database is running: `SELECT 1;`
- [ ] Check database connection in `.env`
- [ ] Verify tables exist: `\dt` (psql) or `SELECT * FROM sqlite_master;`

## Testing

### Unit Tests

Add to `tests/test_auth.py`:
```python
from app.core.auth import hash_password, verify_password

def test_password_hashing():
    pwd = "test123"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed)
    assert not verify_password("wrong", hashed)
```

### Integration Tests

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_success():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@mydarrin.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
```

## References

- [PyJWT Documentation](https://pyjwt.readthedocs.io/)
- [Passlib Documentation](https://passlib.readthedocs.io/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication](https://owasp.org/www-community/attacks/authentication_cheat_sheet)

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review FastAPI security documentation
3. Check application logs for detailed error messages

---

**Last Updated:** March 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
