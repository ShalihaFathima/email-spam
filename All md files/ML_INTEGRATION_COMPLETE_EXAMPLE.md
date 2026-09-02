# ML Integration - Complete Example

## Overview

This guide shows how to integrate the ML fallback system with your multi-layer spam detection:

```
Bloom Filter → Hash Table → Trie → Graph → Score
                                            ↓
                    Decision Tree (score based)
                    ├─ score >= 8  → SPAM (no ML)
                    ├─ score <= 3  → NOT SPAM (no ML)
                    └─ 3 < score < 8 → Call ML (use result)
                                            ↓
                                      Final Decision
```

---

## Part 1: Backend Integration

### Step 1: Set up Express Route

```javascript
const express = require('express');
const { analyzeEmail } = require('./ML_INTEGRATION_BACKEND');

const app = express();
app.use(express.json());

// ==========================================
// Endpoint: POST /api/check-spam
// Input: { email: string, score?: number }
// Output: Complete analysis with UI data
// ==========================================

app.post('/api/check-spam', async (req, res) => {
  try {
    const { email, score } = req.body;

    // Validate
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid email' });
    }

    // Get analysis (includes ML if needed)
    const analysis = await analyzeEmail(email);

    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3001, () => {
  console.log('✅ Server running on port 3001');
  console.log('📡 Flask ML API expected at: http://localhost:5000');
});
```

### Step 2: Update Your Detection Layer

Get score from your existing system:

```javascript
// YOUR CURRENT CODE (example):
const { checkEmail } = require('./spamDetectionEngine');

function getDetectionScore(email) {
  // Your multi-layer detection:
  // 1. Bloom Filter check
  const bloomFilterResult = spamFilter.check(email);
  
  // 2. Hash Table lookup
  const hashTableResult = knownSpamTable.lookup(email);
  
  // 3. Trie prefix matching
  const trieResult = spamTrieIndex.search(email);
  
  // 4. Graph relationship analysis
  const graphResult = spamGraph.analyze(email);
  
  // 5. Calculate combined score
  const score = calculateCombinedScore({
    bloomFilterResult,
    hashTableResult,
    trieResult,
    graphResult
  });

  return {
    score: score,  // 0-10
    layers: {
      bloomFilter: bloomFilterResult,
      hashTable: hashTableResult,
      trie: trieResult,
      graph: graphResult
    }
  };
}
```

### Step 3: Complete Backend Example

```javascript
// ================================================
// COMPLETE BACKEND SETUP (server.js)
// ================================================

const express = require('express');
const {
  callMLAPI,
  makeSpamDecision,
  analyzeEmail
} = require('./ML_INTEGRATION_BACKEND');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// ============ Decision Endpoint ============
app.post('/api/check-spam', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email text required'
      });
    }

    // Analyze through ALL layers
    const analysis = await analyzeEmail(email);

    console.log(`
    📧 Email Analysis:
    └─ Final: ${analysis.finalDecision}
    └─ Confidence: ${(analysis.confidence * 100).toFixed(1)}%
    └─ ML Used: ${analysis.mlAnalysis?.used || false}
    `);

    res.json({
      success: true,
      email: email,
      detectionScore: analysis.detectionScore,
      finalDecision: analysis.finalDecision,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      uiSteps: analysis.uiSteps,
      mlAnalysis: analysis.mlAnalysis
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============ Health Check ============
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mlApiUrl: 'http://localhost:5000',
    lastCheck: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
  ✅ Spam Detection Server Started
  
  📍 Server: http://localhost:${PORT}
  🤖 ML API: http://localhost:5000
  
  Available Endpoints:
  POST /api/check-spam    - Analyze email
  GET  /api/health        - Check server status
  `);
});
```

---

## Part 2: Frontend Integration

### Step 1: Use React Component

```jsx
import React from 'react';
import SpamDetectionAnalysis from './ML_INTEGRATION_FRONTEND';

export default function CheckEmailPage() {
  const [email, setEmail] = React.useState('');

  const handleAnalyze = () => {
    // The component fetches from: POST /api/check-spam
    // Shows all analysis steps including ML Analysis
  };

  return (
    <div className="email-checker">
      <h1>Spam Detection System</h1>
      
      <textarea
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Paste email text here..."
        rows={8}
      />
      
      <button onClick={handleAnalyze}>Analyze</button>

      {/* Component displays entire analysis with ML step */}
      <SpamDetectionAnalysis email={email} />
    </div>
  );
}
```

### Step 2: API Communication Pattern

```javascript
// Frontend → Backend → ML API → Frontend

async function analyzeEmailFlow(emailText) {
  // 1. Send to backend
  const response = await fetch('/api/check-spam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailText })
  });

  const result = await response.json();

  // 2. Result structure:
  return {
    detectionScore: 5,          // From your layers (0-10)
    finalDecision: 'Spam',      // Final result
    confidence: 0.85,           // Confidence level
    uiSteps: [
      { name: 'Bloom Filter', status: 'completed', result: {...} },
      { name: 'Hash Table', status: 'completed', result: {...} },
      { name: 'Trie', status: 'completed', result: {...} },
      { name: 'Graph Analysis', status: 'completed', result: {...} },
      {
        name: 'ML Analysis',
        status: 'completed',  // or 'skipped'
        result: {
          prediction: 1,
          label: 'Spam',
          confidence: 0.77,
          probabilities: { ham: 0.23, spam: 0.77 }
        }
      }
    ],
    mlAnalysis: {
      used: true,               // Was ML called?
      reason: null,             // If not used, why?
      prediction: 1,            // ML output (0=ham, 1=spam)
      label: 'Spam',
      confidence: 0.77,
      probabilities: {
        ham: 0.23,
        spam: 0.77
      }
    }
  };
}
```

---

## Part 3: Decision Flow Diagram

### Scenario 1: High Confidence → No ML

```
Email: "Free money now! Click here!"
       ↓
[Detection Layers]
Bloom Filter: Hit (high risk)
Hash Table: Matches 5 known spam domains
Trie: Prefix matches "free money"
Graph: Connected to spam network
       ↓
Score = 9 (≥ 8)
       ↓
DECISION: SPAM ✓
       ↓
ML Analysis: SKIPPED
Reason: High confidence from detection layers
```

**Response:**

```json
{
  "detectionScore": 9,
  "finalDecision": "Spam",
  "confidence": 0.9,
  "mlAnalysis": {
    "used": false,
    "reason": "High confidence from detection layers"
  },
  "uiSteps": [
    { "name": "Bloom Filter", "status": "completed" },
    { "name": "Hash Table", "status": "completed" },
    { "name": "Trie", "status": "completed" },
    { "name": "Graph Analysis", "status": "completed" },
    { "name": "ML Analysis", "status": "skipped" }
  ]
}
```

### Scenario 2: Uncertain → Call ML

```
Email: "Limited time offer - save 20%"
       ↓
[Detection Layers]
Bloom Filter: No hit (low risk)
Hash Table: 1 match
Trie: 2 prefix matches
Graph: Not in spam network
       ↓
Score = 5 (between 3-8: uncertain)
       ↓
DECISION: UNCERTAIN → Call ML API
       ↓
[ML Analysis]
Prediction: Not Spam (0)
Confidence: 69.34%
       ↓
FINAL DECISION: Not Spam ✓
```

**Response:**

```json
{
  "detectionScore": 5,
  "finalDecision": "Not Spam",
  "confidence": 0.6934,
  "mlAnalysis": {
    "used": true,
    "prediction": 0,
    "label": "Not Spam",
    "confidence": 0.6934,
    "probabilities": { "ham": 0.6934, "spam": 0.3066 }
  },
  "uiSteps": [
    { "name": "Bloom Filter", "status": "completed" },
    { "name": "Hash Table", "status": "completed" },
    { "name": "Trie", "status": "completed" },
    { "name": "Graph Analysis", "status": "completed" },
    { "name": "ML Analysis", "status": "completed" }
  ]
}
```

### Scenario 3: Low Confidence → No ML

```
Email: "Hi, let's schedule our meeting at 3 PM"
       ↓
[Detection Layers]
Bloom Filter: No hit
Hash Table: No match
Trie: No prefix matches
Graph: Normal user
       ↓
Score = 1 (≤ 3)
       ↓
DECISION: NOT SPAM ✓
       ↓
ML Analysis: SKIPPED
Reason: High confidence from detection layers
```

---

## Part 4: Testing the System

### Test 1: Spam Email (Score ≥ 8, No ML)

```bash
# Request
curl -X POST http://localhost:3001/api/check-spam \
  -H "Content-Type: application/json" \
  -d '{"email":"FREE MONEY NOW!!! CLICK HERE!!!"}'

# Expected Response
{
  "success": true,
  "finalDecision": "Spam",
  "confidence": 0.9,
  "mlAnalysis": {
    "used": false,
    "reason": "High confidence from detection layers"
  }
}
```

### Test 2: Legitimate Email (Score ≤ 3, No ML)

```bash
# Request
curl -X POST http://localhost:3001/api/check-spam \
  -H "Content-Type: application/json" \
  -d '{"email":"Hi, lets schedule meeting at 3 PM tomorrow"}'

# Expected Response
{
  "success": true,
  "finalDecision": "Not Spam",
  "confidence": 0.85,
  "mlAnalysis": {
    "used": false,
    "reason": "High confidence from detection layers"
  }
}
```

### Test 3: Uncertain Email (3 < Score < 8, Call ML)

```bash
# Request
curl -X POST http://localhost:3001/api/check-spam \
  -H "Content-Type: application/json" \
  -d '{"email":"Limited time offer - save 20% on products"}'

# Expected Response
{
  "success": true,
  "finalDecision": "Not Spam",  # From ML
  "confidence": 0.6934,         # From ML
  "mlAnalysis": {
    "used": true,               # ML WAS USED
    "prediction": 0,
    "label": "Not Spam",
    "confidence": 0.6934
  }
}
```

---

## Part 5: Configuration

### Prerequisites

1. **Flask ML API** running on `http://localhost:5000`
   ```bash
   # Terminal 1
   python spam_api.py
   ```

2. **Node.js Server** running on `http://localhost:3001`
   ```bash
   # Terminal 2
   npm run dev
   # or
   node server.js
   ```

### Environment Variables (optional)

```javascript
// config.js
module.exports = {
  ML_API_URL: process.env.ML_API_URL || 'http://localhost:5000',
  SERVER_PORT: process.env.PORT || 3001,
  DECISION_THRESHOLDS: {
    SPAM_MIN_SCORE: 8,
    LEGIT_MAX_SCORE: 3
  }
};
```

---

## Part 6: Error Handling

### ML API Unavailable

```javascript
// Backend handles gracefully
if (score >= 4 && score <= 7 && mlResult.error) {
  // ML failed, fallback to score-based decision
  decision.finalDecision = score >= 5 ? 'Spam' : 'Not Spam';
  decision.confidence = 0.5;  // Lower confidence
  decision.reasoning.push('ML unavailable - using score-based decision');
}
```

### Invalid Email

```javascript
// Validation on both sides
if (!email || email.trim().length === 0) {
  return {
    success: false,
    error: 'Email text cannot be empty'
  };
}
```

---

## Summary

| Component | Purpose | Location |
|-----------|---------|----------|
| **Backend Logic** | Decision tree, ML calls, score-based routing | `ML_INTEGRATION_BACKEND.js` |
| **Frontend UI** | Visual pipeline, ML Analysis step, results display | `ML_INTEGRATION_FRONTEND.jsx` |
| **API Endpoint** | POST /api/check-spam - entry point for analysis | `server.js` |
| **ML API** | Flask service for predictions | Python (`spam_api.py`) |

**Flow Summary:**
```
Frontend Email Input
    ↓
POST /api/check-spam
    ↓
Backend: Get Score from Detection Layers
    ↓
Decision Tree:
  ├─ Score ≥ 8  → Spam (done)
  ├─ Score ≤ 3  → Not Spam (done)
  └─ Score 4-7  → Call ML API
    ↓ (if ML called)
Flask ML API
    ↓
Return Prediction + Confidence
    ↓
Frontend: Display Analysis with ML Step
```

All separation of concerns maintained:
- ✅ Backend handles logic
- ✅ Frontend handles display
- ✅ ML API separate service
- ✅ Detection layers independent
