#!/usr/bin/env python3
"""Test the updated Flask API root endpoint"""

import requests
import json
import time

def test_api():
    """Test Flask API endpoints"""
    print("=" * 70)
    print("🧪 TESTING UPDATED FLASK API")
    print("=" * 70)
    
    # Wait for Flask to be ready
    time.sleep(2)
    
    endpoints = [
        ("Root Endpoint", "GET", "http://localhost:5000/", None),
        ("Health Check", "GET", "http://localhost:5000/health", None),
        ("Info Endpoint", "GET", "http://localhost:5000/info", None),
        ("Spam Prediction", "POST", "http://localhost:5000/predict", {"email": "FREE MONEY NOW!!!"}),
    ]
    
    for name, method, url, data in endpoints:
        try:
            print(f"\n📍 Testing: {name}")
            print(f"   Method: {method} {url}")
            
            if method == "GET":
                response = requests.get(url, timeout=5)
            else:
                response = requests.post(url, json=data, timeout=5)
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Success!")
                if "app" in result:
                    print(f"   App: {result.get('app', 'N/A')}")
                if "status" in result:
                    print(f"   Status: {result.get('status', 'N/A')}")
                if "available_endpoints" in result:
                    print(f"   Endpoints available: {len(result['available_endpoints'])}")
            else:
                print(f"   ❌ Error: {response.text}")
        
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
    
    print("\n" + "=" * 70)
    print("✅ TEST COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    test_api()
