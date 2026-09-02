# 📧 JavaScript ML Integration Guide

## ✅ Files Created

1. **checkML.js** - Main JavaScript module with async function
2. **ml_demo.html** - Interactive browser demo

---

## 🚀 Quick Start

### 1. Make Sure Flask API is Running

```bash
cd "c:\Users\BAVISHYA\Desktop\Email spam"
python spam_api.py
```

### 2. Open the HTML Demo

```bash
# Open ml_demo.html in your browser
start ml_demo.html
```

Or open directly: `file:///c:/Users/BAVISHYA/Desktop/Email%20spam/ml_demo.html`

---

## 📝 Function Reference

### `checkML(email)`

**Async function to classify email as spam or ham**

```javascript
// Simple usage
const result = await checkML("Free bitcoin now!");
```

**Parameters:**
- `email` (string) - Email/SMS text to classify

**Returns:** Promise<Object>
```javascript
{
  success: true,
  prediction: 1,           // 0 = Ham, 1 = Spam
  label: "Spam",          // "Spam" or "Not Spam"
  confidence: 0.9138,     // 0.0 - 1.0
  probabilities: {
    ham: 0.0862,
    spam: 0.9138
  }
}
```

**Error Response:**
```javascript
{
  success: false,
  error: "Error message",
  prediction: null,
  label: "Error"
}
```

---

## 💻 Code Examples

### Example 1: Single Email Check

```javascript
async function checkEmail(email) {
  const result = await checkML(email);
  
  if (result.success) {
    console.log(`Result: ${result.label}`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(2)}%`);
  }
}

// Usage
checkEmail("Free bitcoin now click here!");
```

### Example 2: Spam Filter Integration

```javascript
async function processIncomingEmail(email) {
  // First, do basic checks
  if (email.includes("viagra") || email.includes("winner")) {
    return "BLOCK"; // Obvious spam
  }

  // If uncertain, use ML
  const result = await checkML(email);
  
  if (!result.success) {
    return "MANUAL_REVIEW"; // API unavailable
  }

  if (result.prediction === 1 && result.confidence > 0.9) {
    return "BLOCK"; // High confidence spam
  } else if (result.prediction === 1) {
    return "QUARANTINE"; // Likely spam, review
  } else {
    return "ALLOW"; // Legitimate
  }
}

// Usage
const action = await processIncomingEmail(emailText);
```

### Example 3: Batch Processing

```javascript
async function checkMultipleEmails(emails) {
  // Check all emails in parallel
  const results = await checkMLBatch(emails);
  
  // Process results
  const spamEmails = results.filter(r => r.prediction === 1);
  const legit = results.filter(r => r.prediction === 0);
  
  console.log(`Spam: ${spamEmails.length}, Legitimate: ${legit.length}`);
  
  return {spamEmails, legit};
}

// Usage
const emailList = [
  "Free prize!",
  "Hi John",
  "Claim now!"
];
await checkMultipleEmails(emailList);
```

### Example 4: In React Component

```javascript
import { checkML } from './checkML.js';

export function EmailChecker() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (email) => {
    setLoading(true);
    const result = await checkML(email);
    setResult(result);
    setLoading(false);
  };

  return (
    <div>
      <textarea onChange={(e) => setEmail(e.target.value)} />
      <button onClick={() => handleCheck(email)}>
        Check
      </button>
      {loading && <p>Checking...</p>}
      {result && <p>{result.label}</p>}
    </div>
  );
}
```

### Example 5: Error Handling

```javascript
async function safeEmailCheck(email) {
  try {
    const result = await checkML(email);
    
    if (!result.success) {
      console.warn(`Classification failed: ${result.error}`);
      // Use fallback rules
      return {action: 'MANUAL_REVIEW', reason: 'API error'};
    }

    if (result.prediction === 1) {
      return {action: 'BLOCK', confidence: result.confidence};
    } else {
      return {action: 'ALLOW', confidence: result.confidence};
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return {action: 'ERROR', error: error.message};
  }
}
```

---

## 🔧 Integration Points

### Check if System is Uncertain

```javascript
// In your email handler
if (certainty_score < 0.7) {
  // System is uncertain, use ML
  const mlResult = await checkML(email);
  confidence = mlResult.confidence;
}
```

### Fallback Logic

```javascript
async function classifyEmail(email, systemResult) {
  // If system says "maybe", ask ML
  if (systemResult.uncertain) {
    const mlResult = await checkML(email);
    return mlResult.confidence > 0.8 ? mlResult : systemResult;
  }
  return systemResult;
}
```

### Logging & Analytics

```javascript
async function checkAndLog(email) {
  const result = await checkML(email);
  
  // Log for analytics
  analytics.track('email_classified', {
    prediction: result.label,
    confidence: result.confidence,
    timestamp: new Date()
  });
  
  return result;
}
```

---

## 📊 Response Examples

### Spam Email
```json
{
  "success": true,
  "prediction": 1,
  "label": "Spam",
  "confidence": 0.9138,
  "probabilities": {
    "ham": 0.0862,
    "spam": 0.9138
  }
}
```

### Legitimate Email
```json
{
  "success": true,
  "prediction": 0,
  "label": "Not Spam",
  "confidence": 0.9892,
  "probabilities": {
    "ham": 0.9892,
    "spam": 0.0108
  }
}
```

### Error
```json
{
  "success": false,
  "error": "API Error (500): Internal server error",
  "prediction": null,
  "label": "Error"
}
```

---

## ⚙️ Configuration

### Change API Endpoint (in checkML.js)

```javascript
// Line 11:
const FLASK_API_URL = 'http://localhost:5000/predict';

// Change to:
const FLASK_API_URL = 'http://your-server.com:5000/predict';
```

---

## 🧪 Testing

### Test in Browser Console

```javascript
// Open browser DevTools (F12) in ml_demo.html and run:

// Single email
const result = await checkML("Free bitcoin now!");
console.log(result);

// Multiple emails
const results = await checkMLBatch([
  "Email 1",
  "Email 2",
  "Email 3"
]);
console.log(results);
```

### Test from Node.js

```javascript
// Install node-fetch (if not using Node 18+)
// npm install node-fetch

// Then run:
const {checkML} = require('./checkML.js');

(async () => {
  const result = await checkML("Test email");
  console.log(result);
})();
```

---

## 🔐 CORS & Security

The Flask API has CORS enabled, so no additional headers needed. For production:

1. **Restrict CORS origins** in Flask API
2. **Add API authentication** (tokens/keys)
3. **Use HTTPS** instead of HTTP
4. **Add rate limiting**
5. **Validate input** server-side

---

## 📱 Browser Compatibility

- ✅ Chrome/Brave (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ IE11 (needs polyfills)

---

## 🚀 Deployment

### For Production Use

1. **Move to your server:**
   ```bash
   cp checkML.js /your/project/
   ```

2. **Import in your app:**
   ```html
   <script src="checkML.js"></script>
   ```

3. **Or use as module:**
   ```javascript
   import { checkML } from './checkML.js';
   ```

4. **Update API endpoint** for production server

---

## 📚 API Model Info

| Property | Value |
|----------|-------|
| Type | Multinomial Naive Bayes |
| Accuracy | 96.95% |
| Features | 5000 TF-IDF |
| Training Data | 5,572 SMS |
| False Positive Rate | 1.4% |
| Response Time | < 50ms |

---

## ✅ Checklist

- ✅ Flask API running on http://localhost:5000
- ✅ checkML.js downloaded to project
- ✅ ml_demo.html opened in browser
- ✅ Test with sample emails
- ✅ Integrate checkML() into your system

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Endpoint not found" | Ensure Flask API is running with `python spam_api.py` |
| CORS error | API has CORS enabled - check console for full error |
| Timeout | Flask API may be slow - wait 5+ seconds |
| Wrong prediction | Model can make mistakes - check confidence score |
| API connection refused | Check if port 5000 is correct |

---

** Ready to use!** 🎉

Use `checkML(email)` anywhere to get ML-powered spam predictions in your JavaScript system.
