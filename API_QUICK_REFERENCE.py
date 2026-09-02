"""
FLASK API QUICK REFERENCE
Simple examples for testing the spam detection API
"""

# ============================================================================
# PYTHON EXAMPLE - Using requests library
# ============================================================================

import requests

# Start API first:
# python spam_api.py

API_URL = "http://127.0.0.1:5000"

# ---- Example 1: Health Check ----
print("=== TEST 1: Health Check ===")
response = requests.get(f"{API_URL}/health")
print(response.json())

# ---- Example 2: Spam Detection ----
print("\n=== TEST 2: Spam Detection ===")
email = "Free Bitcoin! Click here to claim your prize now!"
response = requests.post(
    f"{API_URL}/predict",
    json={"email": email}
)
result = response.json()
print(f"Email: {email}")
print(f"Label: {result['label']}")
print(f"Confidence: {result['confidence']:.2%}")

# ---- Example 3: Normal Email ----
print("\n=== TEST 3: Normal Email ===")
email = "Hi John, how are you doing? Let's catch up soon."
response = requests.post(
    f"{API_URL}/predict",
    json={"email": email}
)
result = response.json()
print(f"Email: {email}")
print(f"Label: {result['label']}")
print(f"Confidence: {result['confidence']:.2%}")

# ---- Example 4: Error Handling ----
print("\n=== TEST 4: Error Handling ===")
response = requests.post(
    f"{API_URL}/predict",
    json={"text": "missing email field"}
)
print(f"Status: {response.status_code}")
print(f"Error: {response.json()}")

# ============================================================================
# JAVASCRIPT EXAMPLE - Using fetch API
# ============================================================================

"""
// In browser console or Node.js with fetch package

const API_URL = 'http://127.0.0.1:5000';

// Test 1: Health Check
fetch(`${API_URL}/health`)
    .then(res => res.json())
    .then(data => console.log('Health:', data));

// Test 2: Spam Prediction
fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        email: "Free prize! Click here now!" 
    })
})
.then(res => res.json())
.then(data => console.log('Result:', data));

// Test 3: Get API Info
fetch(`${API_URL}/info`)
    .then(res => res.json())
    .then(data => console.log('API Info:', data));
"""

# ============================================================================
# CURL EXAMPLES - Using command line
# ============================================================================

"""
# Health Check
curl -X GET http://127.0.0.1:5000/health

# API Info
curl -X GET http://127.0.0.1:5000/info

# Spam Prediction
curl -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"email":"Free Bitcoin Now Click Here"}'

# Ham Prediction
curl -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"email":"Hi how are you doing"}'

# Error Test - Missing email field
curl -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"text":"wrong field name"}'
"""

# ============================================================================
# RESPONSE EXAMPLES
# ============================================================================

"""
========================= RESPONSE 1: Spam Email =========================
{
    "success": true,
    "prediction": 1,
    "label": "Spam",
    "confidence": 0.9138,
    "probabilities": {
        "ham": 0.0862,
        "spam": 0.9138
    },
    "email_preview": "free bitcoin click here claim your prize now"
}

========================== RESPONSE 2: Ham Email ==========================
{
    "success": true,
    "prediction": 0,
    "label": "Not Spam",
    "confidence": 0.9892,
    "probabilities": {
        "ham": 0.9892,
        "spam": 0.0108
    },
    "email_preview": "hi how are you doing lets catch up soon"
}

======================== RESPONSE 3: Error Response ========================
{
    "error": "Missing 'email' field",
    "message": "Request must include 'email' field"
}
"""

# ============================================================================
# TEST DATA
# ============================================================================

TEST_EMAILS = [
    {
        "text": "Free Bitcoin Now! Click Here to Claim Your Prize!",
        "expected": "Spam"
    },
    {
        "text": "Hi, how are you doing? Let's catch up soon.",
        "expected": "Not Spam"
    },
    {
        "text": "Congratulations! You have won a free iPhone!",
        "expected": "Spam"
    },
    {
        "text": "The meeting is tomorrow at 2 PM. See you there!",
        "expected": "Not Spam"
    },
    {
        "text": "CLAIM YOUR FREE PRIZE NOW! LIMITED TIME OFFER!",
        "expected": "Spam"
    },
    {
        "text": "Thanks for your help yesterday. Really appreciate it.",
        "expected": "Not Spam"
    },
]

# Test with Python
print("=" * 70)
print("TESTING WITH MULTIPLE EMAILS")
print("=" * 70)

for i, test in enumerate(TEST_EMAILS, 1):
    response = requests.post(
        f"{API_URL}/predict",
        json={"email": test["text"]}
    )
    result = response.json()
    is_correct = "✓" if result["label"] == test["expected"] else "✗"
    print(f"\n{i}. {is_correct} {test['text'][:50]}...")
    print(f"   Expected: {test['expected']}")
    print(f"   Got: {result['label']} ({result['confidence']:.2%} confident)")
