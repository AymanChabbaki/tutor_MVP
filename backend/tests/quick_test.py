#!/usr/bin/env python3
"""
Quick API Test - Simple test for key endpoints
Run this to quickly verify the API is working.
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoint(method: str, endpoint: str, data: dict = None, expected_status: int = 200) -> bool:
    """Test a single endpoint."""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, timeout=10)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, timeout=30)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
        
        success = response.status_code == expected_status
        status_icon = "✅" if success else "❌"
        
        print(f"{status_icon} {method} {endpoint} - Status: {response.status_code}")
        
        if success and response.headers.get('content-type', '').startswith('application/json'):
            try:
                result = response.json()
                if 'summary' in result:
                    print(f"   Summary: {result['summary'][:100]}...")
                elif 'arabic_explanation' in result:
                    print(f"   Arabic: {result['arabic_explanation'][:50]}...")
                    print(f"   English: {result['english_explanation'][:50]}...")
                elif 'exercises' in result:
                    print(f"   Generated {len(result['exercises'])} exercises")
                elif 'user' in result:
                    print(f"   User: {result['user'].get('email')}")
                elif 'sessions' in result:
                    print(f"   Found {len(result['sessions'])} sessions")
            except:
                pass
        
        if not success:
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"   Error: {response.text[:100]}")
        
        return success
    
    except requests.ConnectionError:
        print(f"❌ {method} {endpoint} - Connection failed")
        return False
    except Exception as e:
        print(f"❌ {method} {endpoint} - Error: {e}")
        return False

def main():
    """Run quick tests."""
    print("🚀 Quick API Test for AI Bootcamp Tutor MVP")
    print("=" * 50)
    
    # Sample content for testing
    test_content = "Machine learning is a method of data analysis that automates analytical model building."
    
    tests = [
        ("GET", "/health", None, 200),
        ("GET", "/api/health", None, 200),
        ("POST", "/api/summarize", {"text": test_content}, 200),
        ("POST", "/api/explain", {"text": test_content}, 200),
        ("POST", "/api/generate_exercises", {"text": test_content}, 200),
        ("POST", "/api/users", {"name": "Test User", "email": "quicktest@example.com"}, 201),
        ("GET", "/api/users/quicktest@example.com/sessions", None, 200),
    ]
    
    results = []
    for method, endpoint, data, expected_status in tests:
        success = test_endpoint(method, endpoint, data, expected_status)
        results.append(success)
        print()
    
    # Summary
    total = len(results)
    passed = sum(results)
    
    print("📊 Summary")
    print("=" * 20)
    print(f"Tests passed: {passed}/{total}")
    print(f"Success rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("🎉 All tests passed! Your API is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
