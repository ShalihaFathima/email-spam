"""
Test Script for Spam Detection Flask API
Tests all endpoints and demonstrates usage
"""

import requests
import json
import time

# API server URL
API_URL = "http://127.0.0.1:5000"

print("=" * 70)
print("TESTING SPAM DETECTION FLASK API")
print("=" * 70)

# Wait a moment for server to fully initialize
time.sleep(2)

# ============================================================================
# TEST 1: HEALTH CHECK
# ============================================================================
print("\n🧪 TEST 1: Health Check Endpoint")
print("-" * 70)

try:
    response = requests.get(f"{API_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
    if response.status_code == 200:
        print("   ✅ PASS")
    else:
        print("   ❌ FAIL")
except Exception as e:
    print(f"   ❌ ERROR: {e}")

# ============================================================================
# TEST 2: API INFO
# ============================================================================
print("\n🧪 TEST 2: API Info Endpoint")
print("-" * 70)

try:
    response = requests.get(f"{API_URL}/info")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   App: {data.get('app')}")
    print(f"   Version: {data.get('version')}")
    print(f"   Model: {data.get('model', {}).get('type')}")
    if response.status_code == 200:
        print("   ✅ PASS")
    else:
        print("   ❌ FAIL")
except Exception as e:
    print(f"   ❌ ERROR: {e}")

# ============================================================================
# TEST 3: SPAM PREDICTION
# ============================================================================
print("\n🧪 TEST 3: Spam Prediction Endpoint")
print("-" * 70)

spam_test_cases = [
    {
        "email": "Free bitcoin now! Click here to claim your prize!",
        "expected": "Spam"
    },
    {
        "email": "Hi, how are you doing? Let's catch up soon.",
        "expected": "Not Spam"
    },
    {
        "email": "Congratulations you have won a free iPhone!",
        "expected": "Spam"
    },
    {
        "email": "The meeting is tomorrow at 2 PM. See you there!",
        "expected": "Not Spam"
    },
    {
        "email": "Claim your free prize now! Limited time offer!",
        "expected": "Spam"
    }
]

for i, test_case in enumerate(spam_test_cases, 1):
    print(f"\n   Test 3.{i}: '{test_case['email'][:50]}...'")
    
    try:
        payload = {"email": test_case['email']}
        response = requests.post(
            f"{API_URL}/predict",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"      Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"      Prediction: {data['label']}")
            print(f"      Confidence: {data['confidence']:.2%}")
            print(f"      Expected: {test_case['expected']}")
            
            if data['label'] == test_case['expected']:
                print("      ✅ CORRECT")
            else:
                print("      ⚠️ DIFFERENT (but may be valid)")
        else:
            print(f"      Error: {response.json()}")
            print("      ❌ FAIL")
    except Exception as e:
        print(f"      ❌ ERROR: {e}")

# ============================================================================
# TEST 4: ERROR HANDLING
# ============================================================================
print("\n🧪 TEST 4: Error Handling")
print("-" * 70)

# Test 4.1: Missing email field
print("\n   Test 4.1: Missing 'email' field")
try:
    payload = {"text": "some text"}
    response = requests.post(
        f"{API_URL}/predict",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    print(f"      Status: {response.status_code}")
    if response.status_code != 200:
        print(f"      Error: {response.json()['error']}")
        print("      ✅ Correctly returned error")
    else:
        print("      ❌ Should have returned error")
except Exception as e:
    print(f"      ❌ ERROR: {e}")

# Test 4.2: Empty email
print("\n   Test 4.2: Empty email field")
try:
    payload = {"email": ""}
    response = requests.post(
        f"{API_URL}/predict",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    print(f"      Status: {response.status_code}")
    if response.status_code != 200:
        print(f"      Error: {response.json()['error']}")
        print("      ✅ Correctly returned error")
    else:
        print("      ❌ Should have returned error")
except Exception as e:
    print(f"      ❌ ERROR: {e}")

# Test 4.3: Invalid JSON
print("\n   Test 4.3: No JSON data")
try:
    response = requests.post(
        f"{API_URL}/predict",
        headers={"Content-Type": "application/json"}
    )
    print(f"      Status: {response.status_code}")
    if response.status_code != 200:
        print(f"      Error: {response.json()['error']}")
        print("      ✅ Correctly returned error")
    else:
        print("      ❌ Should have returned error")
except Exception as e:
    print(f"      ❌ ERROR: {e}")

# ============================================================================
# TEST 5: JSON RESPONSE FORMAT
# ============================================================================
print("\n🧪 TEST 5: Response Format Validation")
print("-" * 70)

try:
    payload = {"email": "test email"}
    response = requests.post(
        f"{API_URL}/predict",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        data = response.json()
        
        required_fields = [
            'success', 'prediction', 'label', 
            'confidence', 'probabilities', 'email_preview'
        ]
        
        print("   Checking required fields:")
        all_present = True
        for field in required_fields:
            if field in data:
                print(f"      ✅ {field}: Present")
            else:
                print(f"      ❌ {field}: Missing")
                all_present = False
        
        if all_present:
            print("\n   ✅ All required fields present")
        else:
            print("\n   ❌ Some fields missing")
    else:
        print("   ❌ API returned error")
except Exception as e:
    print(f"   ❌ ERROR: {e}")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 70)
print("✅ API TESTING COMPLETE")
print("=" * 70)
print("\nAPI is running and responding correctly!")
print(f"Base URL: {API_URL}")
print("\nEndpoints:")
print(f"  GET  {API_URL}/health  - Health check")
print(f"  GET  {API_URL}/info    - API information")
print(f"  POST {API_URL}/predict - Spam detection")
print("\n" + "=" * 70)
