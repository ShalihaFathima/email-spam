# Backend Setup Guide

Complete setup guide for the Express.js backend server with CSV email dataset.

## 📋 Overview

The backend is a Node.js + Express server that:
- Loads emails from a CSV dataset
- Converts CSV data to JSON format
- Provides REST API endpoints for the frontend
- Filters emails by label (spam vs ham)
- Handles star/favorite functionality

## ⚙️ Installation

### Step 1: Install Backend Dependencies

```bash
npm install express cors csv-parser
```

This installs:
- **express**: Web framework
- **cors**: Cross-origin requests
- **csv-parser**: CSV parsing library

### Step 2: Verify Files

Ensure these files exist in your project root:

```
Email spam/
├── server.js .................. Express server
├── emails.csv ................. Email dataset
├── package.json ............... Dependencies
└── .env ....................... Configuration
```

## 🚀 Running the Server

### Option 1: Run Backend Only

```bash
npm run server
```

Output:
```
🚀 Email Server running on http://localhost:5000
📧 API endpoints:
   GET  /api/emails         - Get all emails
   GET  /api/emails/:id     - Get single email
   PUT  /api/emails/:id/star - Toggle star
   GET  /api/stats          - Get statistics
   GET  /api/health         - Health check

✅ Loaded 18 emails from CSV
```

### Option 2: Run Both Frontend & Backend (Recommended)

First, install `concurrently`:
```bash
npm install concurrently --save-dev
```

Then run:
```bash
npm run dev
```

This starts both the backend server and React frontend simultaneously.

## 📊 Data Format

### CSV Format

**File**: `emails.csv`

**Columns**:
- `sender` - Email sender name
- `subject` - Email subject line
- `body` - Email body/content
- `label` - Classification: `ham` (inbox) or `spam` (spam folder)

**Example**:
```csv
sender,subject,body,label
Sarah Anderson,Project Update,Hi here's the update...,ham
Spam Bot,CLICK HERE,$$$$$,spam
```

### Email Object (JSON)

```javascript
{
  id: 1,
  sender: "Sarah Anderson",
  senderEmail: "sarah.anderson@example.com",
  subject: "Project Update - Q4 Progress Report",
  preview: "Hi! Here's the latest update on our Q4 initiatives...",
  content: "Full email body text...",
  timestamp: "2026-03-18T10:30:00Z",
  isStarred: false,
  hasAttachment: false,
  attachments: [],
  recipient: "you@example.com",
  label: "ham",
  folder: "inbox"
}
```

## 🔌 API Endpoints

### 1. Get All Emails

**Request**:
```http
GET /api/emails?folder=inbox&search=query&limit=50&offset=0
```

**Query Parameters**:
| Parameter | Type | Default | Options |
|-----------|------|---------|---------|
| `folder` | string | inbox | inbox, spam, sent, drafts |
| `search` | string | - | Any text search |
| `limit` | number | 50 | Max 200 |
| `offset` | number | 0 | For pagination |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sender": "Sarah Anderson",
      "subject": "Project Update",
      ...
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0,
  "folder": "inbox"
}
```

**Examples**:

Get inbox emails:
```bash
curl http://localhost:5000/api/emails?folder=inbox
```

Get spam emails:
```bash
curl http://localhost:5000/api/emails?folder=spam
```

Search for emails:
```bash
curl "http://localhost:5000/api/emails?search=project"
```

### 2. Get Single Email

**Request**:
```http
GET /api/emails/:id
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sender": "Sarah Anderson",
    ...
  }
}
```

**Example**:
```bash
curl http://localhost:5000/api/emails/1
```

### 3. Toggle Email Star

**Request**:
```http
PUT /api/emails/:id/star
Content-Type: application/json
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isStarred": true,
    ...
  },
  "message": "Email starred"
}
```

**Example**:
```bash
curl -X PUT http://localhost:5000/api/emails/1/star
```

### 4. Get Email Statistics

**Request**:
```http
GET /api/stats
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 18,
    "inbox": 10,
    "spam": 8,
    "starred": 2
  }
}
```

**Example**:
```bash
curl http://localhost:5000/api/stats
```

### 5. Health Check

**Request**:
```http
GET /api/health
```

**Response**:
```json
{
  "success": true,
  "message": "Server is running",
  "emailsLoaded": 18,
  "timestamp": "2026-03-18T10:30:00Z"
}
```

**Example**:
```bash
curl http://localhost:5000/api/health
```

## 📁 CSV Dataset

### Included Emails

The `emails.csv` file contains:
- **10 legitimate emails** (ham) from various senders
- **8 spam emails** demonstrating common spam patterns

### Email Categories

**Legitimate (HAM)**:
- Project updates
- Meeting schedules
- Feature suggestions
- Code reviews
- Business proposals
- System alerts
- Performance reviews
- Budget discussions

**Spam**:
- Prize/lottery scams
- Pharmaceutical offers
- Nigerian prince schemes
- Cryptocurrency offers
- Account compromise phishing
- Weight loss schemes
- Work-from-home schemes

### Adding Custom Emails

Edit `emails.csv` and add rows:

```csv
Your Name,Your Subject,Your message...,ham
Spammer,SPAM!!!,Click here!!!,spam
```

Then restart the server:
```bash
npm run server
```

## 🔗 Frontend Integration

### API Service

Located at: `src/services/emailService.js`

### Configuration

The frontend connects to backend via `.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### Usage in React

```javascript
import * as emailService from './services/emailService';

// Fetch emails
const result = await emailService.fetchEmails('inbox', 'search term');

// Star an email
const updated = await emailService.toggleEmailStar(emailId);

// Get stats
const stats = await emailService.fetchStats();
```

## 🛠️ Troubleshooting

### Issue: "Cannot find module 'express'"

**Solution**: Install dependencies
```bash
npm install express cors csv-parser
```

### Issue: "Port 5000 already in use"

**Solution**: Use different port
```bash
PORT=3001 npm run server
```

Or kill the process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Issue: "CSV file not found"

**Solution**: Ensure `emails.csv` exists in project root:
```bash
ls emails.csv  # Mac/Linux
type emails.csv  # Windows
```

### Issue: "Frontend can't connect to backend"

**Check**:
1. Backend is running on port 5000
2. `.env` has correct API URL
3. No firewall blocking port 5000
4. CORS is enabled (it is in server.js)

**Test connection**:
```bash
curl http://localhost:5000/api/health
```

### Issue: CORS errors in browser

**Solution**: Already handled in server.js
```javascript
app.use(cors());
```

If still issues, check:
1. Backend is running
2. Request headers are correct
3. Frontend URL matches `.env`

## 📈 Performance Tips

### Large Datasets

For datasets with 10,000+ emails:

1. **Add pagination** (already implemented):
   ```
   /api/emails?limit=50&offset=0
   ```

2. **Add indexing** (future enhancement):
   ```javascript
   const emailsIndex = new Map();
   emails.forEach(e => emailsIndex.set(e.id, e));
   ```

3. **Implement caching** (future enhancement):
   ```javascript
   const cache = new Map();
   ```

### Optimized CSV Loading

The current implementation loads full CSV on startup. For large files:

```javascript
// Stream processing (alternative)
fs.createReadStream('emails.csv')
  .pipe(csv())
  .on('data', (row) => processRow(row))
  .on('end', () => console.log('Done'));
```

## 🔒 Security Notes

### Current Implementation

- ✅ CORS enabled for frontend
- ✅ Input validation (basic)
- ✅ Error handling
- ⚠️ No authentication (demo only)

### For Production

Add:
1. **Authentication** - JWT tokens
2. **Rate limiting** - Prevent abuse
3. **Input validation** - Sanitize all inputs
4. **HTTPS** - Encrypt data in transit
5. **CORS restrictions** - Whitelist domains

Example rate limiting:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);
```

## 📚 Advanced Topics

### Database Integration

Replace in-memory storage with database:

```javascript
// Replace SAMPLE_EMAILS with DB query
const emails = await Email.find({ folder: folder });
```

### Real CSV Updates

Watch CSV file for changes:

```javascript
const chokidar = require('chokidar');

chokidar.watch('emails.csv').on('change', () => {
  loadEmails(); // Reload on file change
});
```

### Email API Integration

Connect to real email service:

```javascript
const nodemailer = require('nodemailer');

// Send real emails
await transporter.sendMail({
  from: 'your@email.com',
  to: email,
  subject, body
});
```

## 📞 Support

### Check Server Status

```bash
# Health check
curl http://localhost:5000/api/health

# Get stats
curl http://localhost:5000/api/stats

# Get all emails
curl http://localhost:5000/api/emails
```

### View Logs

The server prints startup logs with:
- Port number
- API endpoints
- Number of emails loaded
- Any errors

### Debug Mode

Add logging:

```javascript
console.log('Loading emails:', emailsDatabase.length);
console.log('Processing:', emailId, email.sender);
```

## 🎯 Next Steps

1. ✅ Start backend: `npm run server`
2. ✅ Start frontend: `npm start`
3. ✅ Visit http://localhost:3000
4. ✅ View emails from CSV dataset
5. ✅ Test search and filters
6. ✅ Try starring emails

---

For component documentation, see [COMPONENT_API_REFERENCE.md](COMPONENT_API_REFERENCE.md)  
For frontend setup, see [README.md](README.md)  
For API details, see [DATABASE_API_REFERENCE.md](DATABASE_API_REFERENCE.md)
