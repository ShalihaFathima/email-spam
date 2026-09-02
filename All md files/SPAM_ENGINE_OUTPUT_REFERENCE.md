# Spam Detection Engine - API & Output Reference

## Output Format Specification

This document defines the exact output format for spam detection results.

---

## 1. Engine Result Object

### Standard Output Format
```json
{
  "classification": "spam" | "normal",
  "spam_score": 0-15+,
  "detected_words": ["word1", "word2", ...],
  "confidence": 0-100,
  "scoreBreakdown": {
    "spamWords": {
      "count": 5,
      "score": 10,
      "words": ["free", "click", "win", "prize", "claim"]
    },
    "senderDomain": {
      "domain": "gmail.com",
      "isSuspicious": true,
      "reason": "known_suspicious_domain" | "ip_address" | "unusually_long" | "unknown",
      "score": 2 | 0
    },
    "links": {
      "hasLinks": true | false,
      "linkCount": 0-N,
      "links": ["https://example.com", ...],
      "score": 1 | 0
    },
    "patterns": {
      "detected": ["urgency", "excitement", ...],
      "hasPatterns": true | false,
      "score": 1 | 0
    }
  }
}
```

### Real World Example
```json
{
  "classification": "spam",
  "spam_score": 13,
  "detected_words": ["click", "free", "won", "prize", "claim"],
  "confidence": 95,
  "scoreBreakdown": {
    "spamWords": {
      "count": 5,
      "score": 10,
      "words": ["click", "free", "won", "prize", "claim"]
    },
    "senderDomain": {
      "domain": "gmail.com",
      "isSuspicious": true,
      "reason": "known_suspicious_domain",
      "score": 2
    },
    "links": {
      "hasLinks": false,
      "linkCount": 0,
      "links": [],
      "score": 0
    },
    "patterns": {
      "detected": ["urgency", "excitement"],
      "hasPatterns": true,
      "score": 1
    }
  }
}
```

---

## 2. API Endpoint Responses

### Endpoint 1: GET /api/spam-engine/analyze/:id

**Request:**
```bash
curl http://localhost:5000/api/spam-engine/analyze/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "subject": "You WON a FREE LOTTERY!",
    "sender": "Crazy Lottery",
    "senderEmail": "lottery@gmail.com",
    "classification": "spam",
    "spam_score": 13,
    "engineConfidence": 95,
    "detected_words": ["won", "free", "claim", "click", "prize"],
    "scoreBreakdown": {
      "spamWords": {
        "count": 5,
        "score": 10,
        "words": ["won", "free", "claim", "click", "prize"]
      },
      "senderDomain": {
        "domain": "gmail.com",
        "isSuspicious": true,
        "reason": "known_suspicious_domain",
        "score": 2
      },
      "links": {
        "hasLinks": false,
        "linkCount": 0,
        "links": [],
        "score": 0
      },
      "patterns": {
        "detected": ["urgency", "excitement"],
        "hasPatterns": true,
        "score": 1
      }
    }
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Email not found"
}
```

---

### Endpoint 2: POST /api/spam-engine/test

**Request:**
```bash
curl -X POST http://localhost:5000/api/spam-engine/test \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Claim Your Prize!",
    "body": "Click here to win free money now!",
    "senderEmail": "spam@example.com",
    "from": "Spammer"
  }'
```

**Request Body Fields:**
| Field | Type | Required | Example |
|-------|------|----------|---------|
| subject | string | Yes | "Claim Your Prize!" |
| body | string | Yes | "Click here to win..." |
| senderEmail | string | Yes | "spam@example.com" |
| from | string | Yes | "Spammer" |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "classification": "spam",
    "spam_score": 10,
    "detected_words": ["click", "free", "win"],
    "confidence": 90,
    "scoreBreakdown": {
      "spamWords": {
        "count": 3,
        "score": 6,
        "words": ["click", "free", "win"]
      },
      "senderDomain": {
        "domain": "example.com",
        "isSuspicious": false,
        "reason": "unknown",
        "score": 0
      },
      "links": {
        "hasLinks": false,
        "linkCount": 0,
        "links": [],
        "score": 0
      },
      "patterns": {
        "detected": ["urgency", "excitement"],
        "hasPatterns": true,
        "score": 1
      }
    }
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: subject, body, senderEmail, from"
}
```

---

### Endpoint 3: GET /api/spam-engine/stats

**Request:**
```bash
curl http://localhost:5000/api/spam-engine/stats
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "analysisMetrics": {
      "totalEmails": 50,
      "spamEmails": 35,
      "normalEmails": 15,
      "spamPercentage": 70,
      "averageSpamScore": 9.8,
      "highestScore": 20,
      "lowestScore": 0
    },
    "topSpamWords": [
      {
        "word": "click",
        "count": 28,
        "percentage": 56
      },
      {
        "word": "free",
        "count": 25,
        "percentage": 50
      },
      {
        "word": "win",
        "count": 18,
        "percentage": 36
      },
      {
        "word": "prize",
        "count": 15,
        "percentage": 30
      },
      {
        "word": "claim",
        "count": 12,
        "percentage": 24
      }
    ],
    "suspiciousDomains": [
      {
        "domain": "gmail.com",
        "count": 22,
        "percentage": 63
      },
      {
        "domain": "yahoo.com",
        "count": 8,
        "percentage": 23
      },
      {
        "domain": "mailinator.com",
        "count": 3,
        "percentage": 9
      }
    ],
    "patternFrequency": {
      "urgency": 28,
      "excitement": 25,
      "personal_info": 12,
      "money_related": 18,
      "threats": 5
    }
  }
}
```

---

### Endpoint 4: GET /api/spam-engine/emails

**Request with Query Parameters:**
```bash
# Get all spam emails
curl "http://localhost:5000/api/spam-engine/emails?classification=spam"

# Get normal emails
curl "http://localhost:5000/api/spam-engine/emails?classification=normal"

# With pagination
curl "http://localhost:5000/api/spam-engine/emails?classification=spam&limit=10&offset=0"
```

**Query Parameters:**
| Parameter | Type | Default | Range |
|-----------|------|---------|-------|
| classification | string | "all" | "spam", "normal", "all" |
| limit | integer | 20 | 1-100 |
| offset | integer | 0 | 0+ |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "subject": "You WON a FREE LOTTERY!",
      "sender": "Crazy Lottery",
      "senderEmail": "lottery@gmail.com",
      "classification": "spam",
      "spam_score": 13,
      "engineConfidence": 95,
      "detected_words": ["won", "free", "claim", "click", "prize"],
      "body_preview": "Congratulations! You have won a fantastic..."
    },
    {
      "id": 2,
      "subject": "URGENT: Verify Your Account",
      "sender": "PayPal Support",
      "senderEmail": "support@paypal.com",
      "classification": "spam",
      "spam_score": 12,
      "engineConfidence": 92,
      "detected_words": ["account", "verify", "urgent", "click"],
      "body_preview": "Your account has been compromised..."
    }
  ],
  "pagination": {
    "total": 35,
    "limit": 20,
    "offset": 0,
    "page": 1,
    "pages": 2
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid classification value. Use: spam, normal, or all"
}
```

---

## 3. Email Object with Engine Results

When an email is loaded and processed by the engine, it contains:

```json
{
  "id": 1,
  "date": "2024-01-15",
  "subject": "You WON a FREE LOTTERY!",
  "sender": "Crazy Lottery",
  "senderEmail": "lottery@gmail.com",
  "from": "Crazy Lottery <lottery@gmail.com>",
  "to": "user@gmail.com",
  "reply": "Re: You WON a FREE LOTTERY!",
  "body": "Congratulations! You have won a fantastic...",
  "category": "spam",
  "body_without_html": "Congratulations! You have won...",
  
  "engineClassification": "spam",
  "engineSpamScore": 13,
  "engineDetectedWords": ["won", "free", "claim", "click", "prize"],
  "engineConfidence": 95,
  "scoreBreakdown": {
    "spamWords": {
      "count": 5,
      "score": 10,
      "words": ["won", "free", "claim", "click", "prize"]
    },
    "senderDomain": {
      "domain": "gmail.com",
      "isSuspicious": true,
      "reason": "known_suspicious_domain",
      "score": 2
    },
    "links": {
      "hasLinks": false,
      "linkCount": 0,
      "links": [],
      "score": 0
    },
    "patterns": {
      "detected": ["urgency", "excitement"],
      "hasPatterns": true,
      "score": 1
    }
  }
}
```

---

## 4. Scoring Reference Table

### Spam Word Scoring
Each detected spam word adds **+2 points**

| Category | Example Words | Score |
|----------|---|-------|
| Financial | winner, cash, bitcoin, loan, credit | +2 each |
| Urgency | click, now, urgent, act, confirm | +2 each |
| Security | account, password, verify, suspend | +2 each |
| Health | viagra, weight, diet, pill, loss | +2 each |
| General | free, win, prize, claim, offer | +2 each |

### Domain Scoring
- **Suspicious Domain**: +2 points
- **Trusted Domain**: +0 points
- **Unknown Domain**: +0 points

### Link Scoring
- **Links Present**: +1 point total (regardless of link count)
- **No Links**: +0 points

### Pattern Scoring
- **Pattern Detected**: +1 point total
- **No Patterns**: +0 points

### Classification Threshold
```
Score >= 3 → SPAM ⚠️
Score < 3  → NORMAL ✅
```

---

## 5. Confidence Calculation

Confidence percentage is calculated based on:

```
Base confidence = 30% (minimum)

+ 10% per spam word detected (max 50%)
+ 10% if domain is suspicious
+ 5% if email contains links
+ 10% if patterns detected

Examples:
- 3 spam words: 30 + 30 + 10 + 0 + 10 = 80%
- 5+ spam words: 30 + 50 + 10 + 0 + 10 = 100% (capped)
- No indicators: 30% (conservative minimum)
```

---

## 6. Integration Example (JavaScript)

```javascript
// Frontend integration
async function analyzeEmail(emailId) {
  try {
    const response = await fetch(`/api/spam-engine/analyze/${emailId}`);
    const result = await response.json();
    
    if (result.success) {
      const { classification, spam_score, detected_words, confidence } = result.data;
      
      // Display results
      console.log(`Classification: ${classification}`);
      console.log(`Score: ${spam_score}/10`);
      console.log(`Confidence: ${confidence}%`);
      console.log(`Words Found: ${detected_words.join(', ')}`);
      
      // Show UI indicators
      if (classification === 'spam') {
        showSpamWarning(spam_score, confidence);
      }
    }
  } catch (error) {
    console.error('Error analyzing email:', error);
  }
}

// Test custom email
async function testCustomEmail() {
  const emailData = {
    subject: "Click here for FREE money!",
    body: "Congratulations! You have won $1M. Click now.",
    senderEmail: "winner@gmail.com",
    from: "Lucky Lottery"
  };
  
  const response = await fetch('/api/spam-engine/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData)
  });
  
  const result = await response.json();
  console.log('Test Result:', result.data);
}

// Get statistics
async function getSpamStats() {
  const response = await fetch('/api/spam-engine/stats');
  const result = await response.json();
  
  const { totalEmails, spamPercentage, topSpamWords } = result.data.analysisMetrics;
  console.log(`Total Emails: ${totalEmails}`);
  console.log(`Spam Percentage: ${spamPercentage}%`);
  console.log(`Top Words:`, topSpamWords.slice(0, 5));
}
```

---

## 7. Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required field: subject"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Email with id 999 not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error. Please try again later."
}
```

---

## 8. Response Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Email analyzed successfully |
| 400 | Bad Request | Missing required fields |
| 404 | Not Found | Email ID doesn't exist |
| 500 | Server Error | Processing failed |

---

## 9. Data Types Reference

```javascript
// Types used in responses

type Classification = "spam" | "normal";
type Score = number; // 0-15+
type Confidence = number; // 0-100 (percentage)
type Reason = "known_suspicious_domain" | "ip_address" | "unusually_long" | "unknown";
type PatternType = "urgency" | "excitement" | "personal_info" | "money_related" | "threats";

// Main object structure
interface EngineResult {
  classification: Classification;
  spam_score: Score;
  detected_words: string[];
  confidence: Confidence;
  scoreBreakdown: ScoreBreakdown;
}

interface ScoreBreakdown {
  spamWords: {
    count: number;
    score: number;
    words: string[];
  };
  senderDomain: {
    domain: string;
    isSuspicious: boolean;
    reason: Reason;
    score: number;
  };
  links: {
    hasLinks: boolean;
    linkCount: number;
    links: string[];
    score: number;
  };
  patterns: {
    detected: PatternType[];
    hasPatterns: boolean;
    score: number;
  };
}
```

---

## Summary

**Output Format**:✅ Standardized JSON with consistent structure  
**API Endpoints**: ✅ 4 endpoints for analyze, test, stats, and filtering  
**Error Handling**: ✅ Clear error messages with appropriate status codes  
**Documentation**: ✅ All response formats specified with examples  
**Type Safety**: ✅ Data types defined for each field  

