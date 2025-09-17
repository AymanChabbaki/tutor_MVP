#!/usr/bin/env python3
"""
Manual API Test Script for AI Bootcamp Tutor MVP
This script tests all endpoints with real API calls.
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:5000"
API_BASE = f"{BASE_URL}/api"

# Test data
SAMPLE_CONTENT = """
Machine Learning is a subset of artificial intelligence (AI) that focuses on algorithms 
and statistical models that enable computer systems to improve their performance on a 
specific task through experience without being explicitly programmed. It involves 
training algorithms on data to make predictions or decisions.

Key concepts include:
1. Supervised Learning - Learning with labeled data
2. Unsupervised Learning - Finding patterns in unlabeled data  
3. Neural Networks - Computing systems inspired by biological neural networks
4. Deep Learning - Machine learning using deep neural networks
"""

TEST_USER = {
    "name": "Test Student",
    "email": "test.student@example.com",
    "language_pref": "english"
}

class APITester:
    """Class to test all API endpoints."""
    
    def __init__(self, base_url: str = API_BASE):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
    
    def log_test(self, name: str, success: bool, response: requests.Response = None, error: str = None):
        """Log test results."""
        result = {
            'test': name,
            'success': success,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        if response:
            result['status_code'] = response.status_code
            result['response_time'] = f"{response.elapsed.total_seconds():.2f}s"
            
            try:
                result['response_data'] = response.json()
            except:
                result['response_data'] = response.text[:200]
        
        if error:
            result['error'] = error
        
        self.test_results.append(result)
        
        # Print result
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if response:
            print(f"   Status: {response.status_code}, Time: {response.elapsed.total_seconds():.2f}s")
        if error:
            print(f"   Error: {error}")
        print()
    
    def test_health_endpoints(self):
        """Test health check endpoints."""
        print("🏥 Testing Health Endpoints...")
        
        # Test main health endpoint
        try:
            response = self.session.get(f"{BASE_URL}/health")
            success = response.status_code == 200 and 'status' in response.json()
            self.log_test("Health Check - Main", success, response)
        except Exception as e:
            self.log_test("Health Check - Main", False, error=str(e))
        
        # Test API health endpoint
        try:
            response = self.session.get(f"{self.base_url}/health")
            success = response.status_code == 200 and 'status' in response.json()
            self.log_test("Health Check - API", success, response)
        except Exception as e:
            self.log_test("Health Check - API", False, error=str(e))
    
    def test_summarize_endpoint(self):
        """Test content summarization endpoint."""
        print("📝 Testing Summarize Endpoint...")
        
        # Test valid request
        try:
            payload = {"text": SAMPLE_CONTENT}
            response = self.session.post(f"{self.base_url}/summarize", json=payload)
            success = response.status_code == 200 and 'summary' in response.json()
            self.log_test("Summarize - Valid Content", success, response)
        except Exception as e:
            self.log_test("Summarize - Valid Content", False, error=str(e))
        
        # Test with user_id
        try:
            payload = {"text": SAMPLE_CONTENT, "user_id": 1}
            response = self.session.post(f"{self.base_url}/summarize", json=payload)
            success = response.status_code == 200 and 'summary' in response.json()
            self.log_test("Summarize - With User ID", success, response)
        except Exception as e:
            self.log_test("Summarize - With User ID", False, error=str(e))
        
        # Test empty text
        try:
            payload = {"text": ""}
            response = self.session.post(f"{self.base_url}/summarize", json=payload)
            success = response.status_code == 400
            self.log_test("Summarize - Empty Text", success, response)
        except Exception as e:
            self.log_test("Summarize - Empty Text", False, error=str(e))
        
        # Test missing text field
        try:
            payload = {}
            response = self.session.post(f"{self.base_url}/summarize", json=payload)
            success = response.status_code == 400
            self.log_test("Summarize - Missing Text", success, response)
        except Exception as e:
            self.log_test("Summarize - Missing Text", False, error=str(e))
    
    def test_explain_endpoint(self):
        """Test content explanation endpoint."""
        print("🗣️ Testing Explain Endpoint...")
        
        # Test valid request
        try:
            payload = {"text": SAMPLE_CONTENT}
            response = self.session.post(f"{self.base_url}/explain", json=payload)
            success = (response.status_code == 200 and 
                      'arabic_explanation' in response.json() and 
                      'english_explanation' in response.json())
            self.log_test("Explain - Valid Content", success, response)
        except Exception as e:
            self.log_test("Explain - Valid Content", False, error=str(e))
        
        # Test with user_id
        try:
            payload = {"text": SAMPLE_CONTENT, "user_id": 1}
            response = self.session.post(f"{self.base_url}/explain", json=payload)
            success = (response.status_code == 200 and 
                      'arabic_explanation' in response.json() and 
                      'english_explanation' in response.json())
            self.log_test("Explain - With User ID", success, response)
        except Exception as e:
            self.log_test("Explain - With User ID", False, error=str(e))
        
        # Test empty text
        try:
            payload = {"text": ""}
            response = self.session.post(f"{self.base_url}/explain", json=payload)
            success = response.status_code == 400
            self.log_test("Explain - Empty Text", success, response)
        except Exception as e:
            self.log_test("Explain - Empty Text", False, error=str(e))
    
    def test_exercises_endpoint(self):
        """Test exercise generation endpoint."""
        print("🎯 Testing Generate Exercises Endpoint...")
        
        # Test valid request
        try:
            payload = {"text": SAMPLE_CONTENT}
            response = self.session.post(f"{self.base_url}/generate_exercises", json=payload)
            success = (response.status_code == 200 and 
                      'exercises' in response.json() and
                      len(response.json()['exercises']) > 0)
            self.log_test("Generate Exercises - Valid Content", success, response)
        except Exception as e:
            self.log_test("Generate Exercises - Valid Content", False, error=str(e))
        
        # Test with user_id
        try:
            payload = {"text": SAMPLE_CONTENT, "user_id": 1}
            response = self.session.post(f"{self.base_url}/generate_exercises", json=payload)
            success = (response.status_code == 200 and 
                      'exercises' in response.json())
            self.log_test("Generate Exercises - With User ID", success, response)
        except Exception as e:
            self.log_test("Generate Exercises - With User ID", False, error=str(e))
        
        # Test empty text
        try:
            payload = {"text": ""}
            response = self.session.post(f"{self.base_url}/generate_exercises", json=payload)
            success = response.status_code == 400
            self.log_test("Generate Exercises - Empty Text", success, response)
        except Exception as e:
            self.log_test("Generate Exercises - Empty Text", False, error=str(e))
    
    def test_user_endpoints(self):
        """Test user management endpoints."""
        print("👤 Testing User Management Endpoints...")
        
        # Test create user
        try:
            response = self.session.post(f"{self.base_url}/users", json=TEST_USER)
            success = response.status_code in [201, 409]  # 201 for new user, 409 if exists
            self.log_test("Create User", success, response)
            
            if response.status_code == 201:
                user_data = response.json()
                print(f"   Created user: {user_data.get('user', {}).get('email')}")
        except Exception as e:
            self.log_test("Create User", False, error=str(e))
        
        # Test get user sessions
        try:
            email = TEST_USER['email']
            response = self.session.get(f"{self.base_url}/users/{email}/sessions")
            success = response.status_code in [200, 404]  # 200 if user exists, 404 if not
            self.log_test("Get User Sessions", success, response)
            
            if response.status_code == 200:
                sessions = response.json().get('sessions', [])
                print(f"   Found {len(sessions)} sessions for user")
        except Exception as e:
            self.log_test("Get User Sessions", False, error=str(e))
        
        # Test create user with missing fields
        try:
            payload = {"name": "Incomplete User"}  # Missing email
            response = self.session.post(f"{self.base_url}/users", json=payload)
            success = response.status_code == 400
            self.log_test("Create User - Missing Fields", success, response)
        except Exception as e:
            self.log_test("Create User - Missing Fields", False, error=str(e))
    
    def test_error_handling(self):
        """Test error handling."""
        print("⚠️ Testing Error Handling...")
        
        # Test 404 endpoint
        try:
            response = self.session.get(f"{self.base_url}/nonexistent")
            success = response.status_code == 404
            self.log_test("404 Error Handling", success, response)
        except Exception as e:
            self.log_test("404 Error Handling", False, error=str(e))
        
        # Test method not allowed
        try:
            response = self.session.get(f"{self.base_url}/summarize")  # Should be POST
            success = response.status_code == 405
            self.log_test("405 Method Not Allowed", success, response)
        except Exception as e:
            self.log_test("405 Method Not Allowed", False, error=str(e))
        
        # Test invalid JSON
        try:
            response = requests.post(f"{self.base_url}/summarize", 
                                   data="invalid json",
                                   headers={'Content-Type': 'application/json'})
            success = response.status_code == 400
            self.log_test("Invalid JSON Handling", success, response)
        except Exception as e:
            self.log_test("Invalid JSON Handling", False, error=str(e))
    
    def run_all_tests(self):
        """Run all tests."""
        print("🚀 Starting API Tests for AI Bootcamp Tutor MVP")
        print("=" * 60)
        
        start_time = time.time()
        
        self.test_health_endpoints()
        self.test_summarize_endpoint()
        self.test_explain_endpoint()
        self.test_exercises_endpoint()
        self.test_user_endpoints()
        self.test_error_handling()
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Summary
        print("📊 Test Summary")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print(f"Total Time: {total_time:.2f}s")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   - {result['test']}")
                    if 'error' in result:
                        print(f"     Error: {result['error']}")
        
        return passed_tests == total_tests
    
    def save_results(self, filename: str = "test_results.json"):
        """Save test results to file."""
        with open(filename, 'w') as f:
            json.dump(self.test_results, f, indent=2)
        print(f"\n💾 Test results saved to {filename}")

def main():
    """Main function to run tests."""
    print("AI Bootcamp Tutor MVP - API Test Suite")
    print("Make sure your Flask application is running on http://localhost:5000")
    print()
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ Server is not responding correctly. Please start the Flask app.")
            return False
    except requests.ConnectionError:
        print("❌ Cannot connect to server. Please start the Flask app on localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")
        return False
    
    print("✅ Server is running. Starting tests...")
    print()
    
    # Run tests
    tester = APITester()
    success = tester.run_all_tests()
    tester.save_results()
    
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
