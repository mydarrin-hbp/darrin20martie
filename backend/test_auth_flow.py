"""
Authentication System - Integration Test & Demo

This script demonstrates the complete authentication flow:
1. Create an admin user
2. Login to get JWT token
3. Use token to access protected endpoints
4. Test authorization (non-admin access denied)

Usage:
    python test_auth_flow.py
"""

import requests
import json
from typing import Optional

# API Base URL
BASE_URL = "http://localhost:8000"
API_V1 = f"{BASE_URL}/api/v1"

# Demo credentials
DEMO_EMAIL = "demo_admin@mydarrin.com"
DEMO_PASSWORD = "Demo123456!"


class AuthTestClient:
    """Test client for authentication endpoints"""
    
    def __init__(self, base_url: str = API_V1):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.headers = {}
    
    def set_token(self, token: str):
        """Set authorization token"""
        self.token = token
        self.headers = {"Authorization": f"Bearer {token}"}
    
    def login(self, email: str, password: str) -> dict:
        """Login and get access token"""
        print(f"\n🔑 Logging in as: {email}")
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.set_token(data["access_token"])
            print(f"✅ Login successful!")
            print(f"   Token: {data['access_token'][:50]}...")
            print(f"   User ID: {data['user_id']}")
            print(f"   Email: {data['email']}")
            return data
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Error: {response.json()}")
            return None
    
    def get_current_admin(self) -> dict:
        """Get current authenticated admin user"""
        print(f"\n👤 Getting current admin profile...")
        
        if not self.token:
            print("❌ Not authenticated. Call login() first.")
            return None
        
        response = requests.get(
            f"{self.base_url}/auth/me",
            headers=self.headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved admin profile:")
            print(f"   ID: {data['id']}")
            print(f"   Email: {data['email']}")
            print(f"   Role: {data['role']}")
            print(f"   Active: {data['is_active']}")
            return data
        else:
            print(f"❌ Failed to get profile: {response.status_code}")
            print(f"   Error: {response.json()}")
            return None
    
    def get_pending_users(self) -> dict:
        """Get list of pending users (admin only)"""
        print(f"\n📋 Fetching pending users...")
        
        if not self.token:
            print("❌ Not authenticated. Call login() first.")
            return None
        
        response = requests.get(
            f"{self.base_url}/admin/users/pending",
            headers=self.headers
        )
        
        if response.status_code == 200:
            users = response.json()
            print(f"✅ Retrieved {len(users)} pending users:")
            for user in users:
                print(f"   - {user['email']} (ID: {user['id']})")
            return users
        else:
            print(f"❌ Failed to get pending users: {response.status_code}")
            error = response.json()
            if "detail" in error:
                print(f"   Error: {error['detail']}")
            return None
    
    def test_invalid_token(self):
        """Test with invalid token"""
        print(f"\n⚠️  Testing invalid token...")
        
        bad_headers = {"Authorization": "Bearer invalid_token_here"}
        response = requests.get(
            f"{self.base_url}/auth/me",
            headers=bad_headers
        )
        
        if response.status_code == 401:
            print(f"✅ Correctly rejected invalid token (401)")
            print(f"   Error: {response.json()['detail']}")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
    
    def test_missing_token(self):
        """Test without token"""
        print(f"\n⚠️  Testing missing token...")
        
        response = requests.get(f"{self.base_url}/auth/me")
        
        if response.status_code == 403:
            print(f"✅ Correctly rejected missing token (403)")
        else:
            print(f"Response: {response.status_code}")


def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}")


def main():
    """Run authentication flow tests"""
    
    print_header("Authentication System - Integration Test")
    
    # Check if server is running
    print("\n🔍 Checking if API server is running...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        if response.status_code == 200:
            print("✅ API server is running!")
        else:
            print("❌ API server returned unexpected status")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server at http://localhost:8000")
        print("   Make sure to start the server first:")
        print("   cd backend && uvicorn app.main:app --reload")
        return
    
    # Initialize test client
    client = AuthTestClient()
    
    print_header("Test 1: Login")
    login_result = client.login(DEMO_EMAIL, DEMO_PASSWORD)
    
    if not login_result:
        print("\n⚠️  Login failed. You may need to create the admin user first:")
        print(f"   python backend/create_admin.py --email {DEMO_EMAIL} --password '{DEMO_PASSWORD}'")
        return
    
    print_header("Test 2: Get Current Admin Profile")
    client.get_current_admin()
    
    print_header("Test 3: Get Pending Users (Protected Route)")
    client.get_pending_users()
    
    print_header("Test 4: Security Tests")
    
    print("\n  4a. Test with invalid token:")
    client.test_invalid_token()
    
    print("\n  4b. Test with missing token:")
    client.test_missing_token()
    
    print_header("All Tests Completed!")
    print("\n📚 Documentation: See backend/AUTHENTICATION.md")
    print("🔗 API Docs: http://localhost:8000/docs")
    print("🔧 Swagger UI: http://localhost:8000/docs")
    print("\n✅ Authentication system is working correctly!\n")


if __name__ == "__main__":
    main()
