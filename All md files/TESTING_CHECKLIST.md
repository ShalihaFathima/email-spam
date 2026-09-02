# Testing Checklist - Spam Detection System

## Prerequisites
✅ Ensure you're in: `c:\Users\BAVISHYA\Desktop\Email spam\`
✅ Model files exist: `model.pkl` and `vectorizer.pkl`

---

## Phase 1: Verify Model Files Exist

### Command:
```powershell
dir model.pkl, vectorizer.pkl
```

### Expected Output:
```
Mode    LastWriteTime          Length  Name
----    -----                  ------  ----
-a---   [Date]              160570  model.pkl
-a---   [Date]              181149  vectorizer.pkl
```

---

## Phase 2: Test Flask API

### Step 1: Start the Flask API
```powershell
python spam_api.py
```

### Expected Output:
```
 * Serving Flask app 'spam_api'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

### Step 2: Verify API is Running (Open New Terminal)
```powershell
# Check if API is responsive
$response = Invoke-WebRequest -Uri "http://localhost:5000/health" -ErrorAction SilentlyContinue
$response.StatusCode
```

### Expected Output:
```
200
```

### Step 3: Test /info Endpoint
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:5000/info"
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### Expected Output:
```json
{
  "api_version": "1.0",
  "status": "ready",
  "model_loaded": true,
  "endpoints": [...],
  "timestamp": "..."
}
```

---

## Phase 3: Test Flask API Predictions

### Test Case 1: Spam Email
```powershell
$body = @{ email = "FREE MONEY NOW! Click here to claim your prize!" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:5000/predict" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### Expected Output:
```json
{
  "success": true,
  "prediction": 1,
  "label": "Spam",
  "confidence": 0.95,
  "probabilities": {
    "ham": 0.05,
    "spam": 0.95
  }
}
```

### Test Case 2: Legitimate Email
```powershell
$body = @{ email = "Hi, let's schedule our meeting tomorrow at 3 PM" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:5000/predict" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### Expected Output:
```json
{
  "success": true,
  "prediction": 0,
  "label": "Not Spam",
  "confidence": 0.92,
  "probabilities": {
    "ham": 0.92,
    "spam": 0.08
  }
}
```

---

## Phase 4: Test JavaScript Integration

### Option A: Use Interactive Demo (Easiest)
1. Open `ml_demo.html` in any web browser
2. Enter test emails in the textarea
3. Click "Check Email"
4. **Expected**: Shows classification, confidence, and action (SPAM/LEGITIMATE)

### Option B: Test in Browser Console
1. Open `ml_demo.html` in browser
2. Press `F12` to open Developer Console
3. Run:
```javascript
// Test single email
await checkML("Free bitcoin offer now!");

// Test batch
await checkMLBatch(["Hi there", "CLICK NOW FOR PRIZE"]);
```

### Expected Output:
```javascript
{
  prediction: 1,
  label: "Spam",
  confidence: 0.95,
  probabilities: { ham: 0.05, spam: 0.95 },
  success: true
}
```

---

## Phase 5: Complete End-to-End Test

### Requirements:
- ✅ Flask API running on port 5000
- ✅ Browser open with `ml_demo.html`

### Test Script:
```javascript
// Test 1: Single legitimate email
const test1 = await checkML("Please confirm your appointment tomorrow");
console.log("Test 1 (Should be 0):", test1.prediction === 0 ? "✅ PASS" : "❌ FAIL");

// Test 2: Single spam email
const test2 = await checkML("CLICK HERE TO WIN CASH PRIZE NOW!!!");
console.log("Test 2 (Should be 1):", test2.prediction === 1 ? "✅ PASS" : "❌ FAIL");

// Test 3: Batch processing
const test3 = await checkMLBatch([
  "Meeting at 3 PM tomorrow",
  "CONGRATULATIONS YOU WON!"
]);
console.log("Test 3 (Batch):", test3.length === 2 ? "✅ PASS" : "❌ FAIL");

// Test 4: API status
const test4 = await fetch("http://localhost:5000/health").then(r => r.status);
console.log("Test 4 (API Health):", test4 === 200 ? "✅ PASS" : "❌ FAIL");
```

---

## Troubleshooting

### Issue: "Connection refused" error
**Solution**: Flask API not running. Run `python spam_api.py` in a terminal first.

### Issue: CORS Error in Browser
**Solution**: Flask API has CORS disabled. Check that `CORS(app)` is in spam_api.py

### Issue: "No module named 'flask'"
**Solution**: Install Flask with `pip install flask flask-cors`

### Issue: "model.pkl not found"
**Solution**: Run `python spam_detection.py` to generate model files first

### Issue: Prediction always returns same label
**Solution**: Check that preprocessing in spam_api.py matches training phase (lowercase + regex removal)

---

## Quick Status Check

Run all 4 checks in sequence:

```powershell
# 1. Check model files
Write-Host "1️⃣ Checking model files..."
if ((Test-Path model.pkl) -and (Test-Path vectorizer.pkl)) {
  Write-Host "✅ Model files exist"
} else {
  Write-Host "❌ Model files missing"
}

# 2. Start API (background)
Write-Host "2️⃣ Starting Flask API..."
Start-Process python -ArgumentList "spam_api.py" -NoNewWindow

Start-Sleep -Seconds 3

# 3. Check API health
Write-Host "3️⃣ Checking API status..."
try {
  $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -ErrorAction Stop
  Write-Host "✅ API is running"
} catch {
  Write-Host "❌ API not responding"
}

# 4. Test prediction
Write-Host "4️⃣ Testing prediction..."
$body = @{ email = "CLICK HERE NOW!" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:5000/predict" `
  -Method POST -ContentType "application/json" -Body $body
$result = $response.Content | ConvertFrom-Json
Write-Host "✅ Prediction: $($result.label) (Confidence: $($result.confidence))"
```

---

## Success Criteria

All tests pass when:
- ✅ Model files (model.pkl, vectorizer.pkl) exist
- ✅ Flask API starts without errors
- ✅ `/health` endpoint returns status 200
- ✅ `/predict` endpoint returns correct labels with confidence > 0.7
- ✅ ml_demo.html displays results correctly
- ✅ checkML() JavaScript function returns proper structure
- ✅ No CORS errors in browser console

---

## Summary Table

| Component | Test Method | Expected Result |
|-----------|------------|-----------------|
| **Model Files** | `dir model.pkl` | Both files exist |
| **Flask API** | `python spam_api.py` | Running on port 5000 |
| **API Health** | GET /health | Status 200 |
| **API Info** | GET /info | Returns metadata |
| **Prediction** | POST /predict | Correct classification + confidence |
| **JavaScript** | `checkML("text")` | Returns object with prediction |
| **Demo UI** | Open ml_demo.html | Shows results with styling |
