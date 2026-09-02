import requests
import json

API_URL = "http://localhost:5000"

print("="*70)
print("SPAM DETECTION SYSTEM - VERIFICATION TESTS")
print("="*70)

# Test 1: Health endpoint
print("\n🔍 TEST 1: /health endpoint")
try:
    response = requests.get(f"{API_URL}/health", timeout=5)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ PASS - API is running")
        data = response.json()
        print(f"   Response: {json.dumps(data, indent=6)}")
    else:
        print(f"   ❌ FAIL - Unexpected status: {response.status_code}")
except Exception as e:
    print(f"   ❌ FAIL - {str(e)}")

# Test 2: Info endpoint
print("\n🔍 TEST 2: /info endpoint")
try:
    response = requests.get(f"{API_URL}/info", timeout=5)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ PASS - Info endpoint working")
        data = response.json()
        print(f"   Model loaded: {data.get('model_loaded', 'N/A')}")
        print(f"   API version: {data.get('api_version', 'N/A')}")
    else:
        print(f"   ❌ FAIL - Status: {response.status_code}")
except Exception as e:
    print(f"   ❌ FAIL - {str(e)}")

# Test 3: Prediction - Spam Email
print("\n🔍 TEST 3: /predict endpoint - SPAM EMAIL")
try:
    payload = {"email": "FREE MONEY NOW!!! CLICK HERE TO WIN CASH PRIZE!!!"}
    response = requests.post(f"{API_URL}/predict", json=payload, timeout=5)
    print(f"   Status: {response.status_code}")
    data = response.json()
    if data.get("success"):
        prediction = data.get("prediction")
        label = data.get("label")
        confidence = data.get("confidence")
        print(f"   ✅ PASS - Prediction: {label}")
        print(f"   Confidence: {confidence:.2%}")
        print(f"   Probabilities: {json.dumps(data.get('probabilities', {}), indent=6)}")
        if prediction == 1 and confidence > 0.7:
            print("   ✅ CORRECT CLASSIFICATION (Spam detected)")
        else:
            print("   ⚠️  Unexpected result")
    else:
        print(f"   ❌ FAIL - {data.get('error', 'Unknown error')}")
except Exception as e:
    print(f"   ❌ FAIL - {str(e)}")

# Test 4: Prediction - Legitimate Email
print("\n🔍 TEST 4: /predict endpoint - LEGITIMATE EMAIL")
try:
    payload = {"email": "Hi, let's schedule our meeting tomorrow at 3 PM. Please confirm your availability."}
    response = requests.post(f"{API_URL}/predict", json=payload, timeout=5)
    print(f"   Status: {response.status_code}")
    data = response.json()
    if data.get("success"):
        prediction = data.get("prediction")
        label = data.get("label")
        confidence = data.get("confidence")
        print(f"   ✅ PASS - Prediction: {label}")
        print(f"   Confidence: {confidence:.2%}")
        print(f"   Probabilities: {json.dumps(data.get('probabilities', {}), indent=6)}")
        if prediction == 0 and confidence > 0.7:
            print("   ✅ CORRECT CLASSIFICATION (Not spam)")
        else:
            print("   ⚠️  Unexpected result")
    else:
        print(f"   ❌ FAIL - {data.get('error', 'Unknown error')}")
except Exception as e:
    print(f"   ❌ FAIL - {str(e)}")

# Test 5: Error Handling
print("\n🔍 TEST 5: Error Handling - Missing field")
try:
    payload = {}  # missing email field
    response = requests.post(f"{API_URL}/predict", json=payload, timeout=5)
    print(f"   Status: {response.status_code}")
    data = response.json()
    if response.status_code == 400:
        print(f"   ✅ PASS - Properly rejected invalid input")
        print(f"   Error: {data.get('error', 'N/A')}")
    else:
        print(f"   ⚠️  Unexpected status: {response.status_code}")
except Exception as e:
    print(f"   ❌ FAIL - {str(e)}")

# Test 6: Additional spam test
print("\n🔍 TEST 6: Additional prediction - Borderline case")
try:
    payload = {"email": "Order your pizza now with 50% discount"}
    response = requests.post(f"{API_URL}/predict", json=payload, timeout=5)
    print(f"   Status: {response.status_code}")
    data = response.json()
    if data.get("success"):
        prediction = data.get("prediction")
        label = data.get("label")
        confidence = data.get("confidence")
        print(f"   ✅ PASS - Prediction: {label}")
        print(f"   Confidence: {confidence:.2%}")
    else:
        print(f"   ❌ FAIL - {data.get('error', 'Unknown error')}")
except Exception as e:
    print(f"   ❌ FAIL - {str(e)}")

print("\n" + "="*70)
print("VERIFICATION COMPLETE!")
print("="*70)
