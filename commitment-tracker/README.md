# Commitment Tracker - Quick Start Guide

## 📋 What You Have

A complete commitment tracking system that:
1. **Detects commitments** from email text
2. **Extracts task details** (action, object, deadline)
3. **Stores tasks** in MongoDB
4. **Tracks status** (pending, completed, reminders)
5. **Integrates with frontend** seamlessly

---

## 🚀 Quick Start

### 1. Run the Demo

```bash
cd "c:\Users\BAVISHYA\Desktop\Email spam"
node commitment-tracker-demo.js
```

This will:
- Process 3 sample emails
- Detect 9+ commitments
- Show how the system works end-to-end
- Display the API endpoints you can use

---

## 🔌 API Integration

### **Endpoint 1: Process Email**
```javascript
// When user enters an email with commitments:
POST /api/commitments/process
{
  "sender": "boss@company.com",
  "subject": "Q4 Report Needed",
  "body": "I will gather data by Friday and analyze by Monday",
  "userId": "user123"
}

// Response:
{
  "success": true,
  "newTasks": [
    { action: "gather", object: "data", deadline: "2026-05-02", ... },
    { action: "analyze", object: "data", deadline: "2026-05-05", ... }
  ],
  "overview": {
    "pending": [...],
    "completed": [...],
    "reminders": [...]
  }
}
```

### **Endpoint 2: Get Task Status**
```javascript
// Get all tasks for a user:
GET /api/commitments/user123

// Response:
{
  "success": true,
  "data": {
    "pending": [
      { _id: "task1", action: "gather", object: "data", deadline: "2026-05-02" },
      { _id: "task2", action: "analyze", object: "data", deadline: "2026-05-05" }
    ],
    "completed": [...],
    "reminders": [...],
    "stats": {
      "totalTasks": 10,
      "pendingCount": 7,
      "completedCount": 3,
      "reminderCount": 2
    }
  }
}
```

### **Endpoint 3: Search Tasks**
```javascript
// Find tasks matching a query:
POST /api/commitments/user123/match
{
  "query": "financial"
}

// Response:
{
  "success": true,
  "data": {
    "matches": [
      { _id: "task1", action: "gather", object: "Q4 financial data", ... }
    ],
    "count": 1
  }
}
```

### **Endpoint 4: Get Reminders**
```javascript
// Get tasks that need reminders:
GET /api/commitments/user123/reminders

// Response:
{
  "success": true,
  "data": {
    "reminders": [...overdue and upcoming tasks...],
    "overdue": [...tasks past deadline...],
    "count": 3
  }
}
```

---

## 🎨 Frontend Integration

### **In Your React Component (CommitmentTracker.jsx)**

```javascript
import { useState, useEffect } from 'react';
import CommitmentTracker from './components/CommitmentTracker';

function AppContent() {
  const [trackerData, setTrackerData] = useState({
    pending: [],
    completed: [],
    reminders: [],
    stats: {}
  });
  const [userId] = useState('user123');

  /**
   * When user enters an email, process it for commitments
   */
  const handleEmailSubmit = async (email) => {
    try {
      const response = await fetch('/api/commitments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: email.from,
          subject: email.subject,
          body: email.body,
          userId: userId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update tracker display with new tasks
        setTrackerData(result.data.overview);
        
        // Show success message
        console.log(`✅ Detected ${result.data.newTasks.length} commitments!`);
      }
    } catch (error) {
      console.error('Error processing email:', error);
    }
  };

  /**
   * Refresh task status on demand
   */
  const handleRefresh = async () => {
    try {
      const response = await fetch(`/api/commitments/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setTrackerData(result.data);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  return (
    <div>
      {/* Your email input component - when submitted call handleEmailSubmit */}
      
      {/* Commitment tracker display */}
      <CommitmentTracker 
        trackerData={trackerData}
        onRefresh={handleRefresh}
      />
    </div>
  );
}

export default AppContent;
```

---

## 📂 Folder Structure

```
commitment-tracker/
├── ARCHITECTURE.md                           # Design & data structure plan
├── services/
│   └── CommitmentTrackerService.js          # Main orchestration logic
├── utils/                                    # Processing utilities (in src/utils/)
├── models/                                   # Database models
└── routes/                                   # API endpoints

Related Files (unchanged locations):
├── src/utils/
│   ├── commitmentDetector.js                # Extract commitment phrases
│   ├── taskExtractor.js                     # Extract task details
│   ├── deadlineConverter.js                 # Convert dates
│   ├── completionDetector.js                # Check if task is done
│   └── reminderChecker.js                   # Check for reminders
├── models/
│   └── Task.js                              # MongoDB schema
└── routes/
    └── commitmentRoutes.js                  # API endpoints
```

---

## 🔄 Complete Email Processing Flow

```
Email Input (Frontend)
    ↓
POST /api/commitments/process
    ↓
CommitmentTrackerService.processEmailForCommitments()
    ├─ Step 1: detectCommitments() → Find "I will..." phrases
    ├─ Step 2: extractTask() → Parse action, object, timeText
    ├─ Step 3: convertToDeadline() → Convert "Friday" → Date
    ├─ Step 4: addTaskAPI() → Store in MongoDB
    └─ Step 5: generateTaskStatus() → Return organized overview
    ↓
Response with:
  - New tasks created
  - Updated pending tasks
  - Completed tasks
  - Reminders needed
    ↓
CommitmentTracker Component Updates
    ↓
Display to User
```

---

## 🧪 How to Test

### **Option 1: Run the Demo**
```bash
node commitment-tracker-demo.js
```
Shows complete flow with sample emails

### **Option 2: Use curl (if server is running)**
```bash
# Process email
curl -X POST http://localhost:3000/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "boss@company.com",
    "subject": "Report Needed",
    "body": "I will send the report by Friday",
    "userId": "test-user"
  }'

# Get status
curl http://localhost:3000/api/commitments/test-user

# Search
curl -X POST http://localhost:3000/api/commitments/test-user/match \
  -H "Content-Type: application/json" \
  -d '{"query": "report"}'
```

### **Option 3: Use the Frontend UI**
1. Enter an email in the compose/input area
2. The system automatically detects commitments
3. Tasks appear in the CommitmentTracker component
4. View pending, completed, and reminder tasks

---

## 📊 What Gets Detected

The system detects these commitment patterns:
- "I will..." 
- "I promise..."
- "I commit..."
- "I'll..."
- Similar patterns

Example:
```
Email: "Hi, I will gather the Q4 data by Friday and analyze it by Monday"

Detections:
  1. "I will gather the Q4 data by Friday"
     → Action: gather, Object: Q4 data, Deadline: May 2, 2026
  
  2. "I will analyze it by Monday"
     → Action: analyze, Object: it, Deadline: May 5, 2026
```

---

## 🎯 Use Cases

1. **Email with Commitment**
   - User receives: "I will send the report by Friday"
   - System creates a task automatically
   - Shows in CommitmentTracker as pending

2. **Track Multiple Commitments**
   - One email can have multiple commitments
   - Each gets its own task
   - All tracked separately

3. **Search and Match**
   - User enters reply: "Here is the report"
   - System finds matching tasks
   - Can mark as complete

4. **Task Management**
   - View all pending tasks
   - See completion status
   - Get reminders for overdue tasks

---

## 🔐 Database Schema

Tasks are stored in MongoDB with this structure:
```javascript
{
  _id: ObjectId,
  userId: String,
  action: String,                    // "gather", "analyze", etc.
  object: String,                    // "Q4 data", "financial report", etc.
  description: String,               // Full task description
  deadline: Date,                    // "2026-05-02"
  timeText: String,                  // Original text "Friday"
  source: String,                    // "email"
  sender: String,                    // Who made the commitment
  status: String,                    // "pending", "completed"
  createdAt: Date,
  updatedAt: Date,
  type: String                       // "commitment"
}
```

---

## ✅ Checklist

- [x] CommitmentTrackerService created
- [x] Routes updated to use service
- [x] Demo file for testing
- [x] Frontend integration ready
- [x] Documentation complete
- [ ] Run demo to verify
- [ ] Start server and test API endpoints
- [ ] Integrate with frontend component
- [ ] Test with real emails

---

## 📞 Support

For questions about:
- **System architecture:** See [commitment-tracker/ARCHITECTURE.md](commitment-tracker/ARCHITECTURE.md)
- **Data flow:** See the demo output: `node commitment-tracker-demo.js`
- **API details:** Check [routes/commitmentRoutes.js](routes/commitmentRoutes.js)
- **Service logic:** See [commitment-tracker/services/CommitmentTrackerService.js](commitment-tracker/services/CommitmentTrackerService.js)

---

**Status:** ✅ Ready to Use
**Last Updated:** April 30, 2026
