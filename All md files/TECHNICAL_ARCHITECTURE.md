# COMMITMENT TRACKING SYSTEM - TECHNICAL ARCHITECTURE

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL PROCESSING PIPELINE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Email Arrives                                                   │
│      │                                                            │
│      ▼                                                            │
│  ┌─────────────────────────────────────┐                        │
│  │  POST /api/commitments/process      │                        │
│  │  {sender, subject, body, userId}    │                        │
│  └────────────┬────────────────────────┘                        │
│               │                                                  │
│               ▼                                                  │
│  ┌─────────────────────────────────────┐                        │
│  │ commitmentTracker.js                │                        │
│  │ processEmailForCommitments()         │                        │
│  └─────────┬───────────────────────────┘                        │
│            │                                                     │
│      ┌─────┴──────┐                                              │
│      ▼            ▼                                              │
│  Has          Has                                               │
│  Commitment   Completion                                         │
│  Phrase?      Phrase?                                            │
│      │            │                                              │
│      YES          YES                                            │
│      │            │                                              │
│      ▼            ▼                                              │
│  Extract      Find                                              │
│  Task         Matching                                           │
│  Details      Tasks                                              │
│      │            │                                              │
│      ▼            ▼                                              │
│  Create       Similarity                                         │
│  PENDING      > 40%?                                             │
│  Task           │                                                │
│      │          ├─ YES ─▶ Mark COMPLETED                        │
│      │          │                                                │
│      │          └─ NO ─▶ Skip                                   │
│      │                                                           │
│      └──────┬───────────┘                                        │
│             │                                                    │
│             ▼                                                    │
│    ┌────────────────────┐                                       │
│    │   Save to MongoDB  │                                       │
│    │   (tasks collection)                                       │
│    └────┬───────────────┘                                       │
│         │                                                        │
│         ▼                                                        │
│    ┌─────────────────────────────────┐                         │
│    │ Return Response                 │                         │
│    │ {success, data, error}          │                         │
│    └─────────────────────────────────┘                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Architecture

```
commitmentTracker.js
├── Module: Commitment Detection
│   ├── hasCommitmentPhrase(text)
│   │   └─ Returns: boolean
│   │
│   └── extractCommitment(sender, body)
│       ├─ extractAction(text)
│       ├─ extractObject(text)
│       ├─ extractDeadline(text)
│       └─ Returns: {action, object, deadline, status}
│
├── Module: Deadline Extraction
│   ├── extractDeadline(text)
│   │   ├─ Regex: Day of week → getNextDayOfWeek()
│   │   ├─ Regex: EOD/ASAP → tomorrow
│   │   ├─ Regex: "next week" → +7 days
│   │   ├─ Regex: Date format → parse
│   │   ├─ Regex: "N days" → +N days
│   │   └─ Default: +7 days
│   │
│   └── getNextDayOfWeek(dayName)
│       └─ Returns: Date object for next occurrence
│
├── Module: Reminder System
│   ├── generateTaskStatus(userId)
│   │   ├─ Fetch all tasks for user
│   │   ├─ For each task:
│   │   │   ├─ deadline < now → OVERDUE
│   │   │   ├─ deadline within 24h → REMINDER
│   │   │   ├─ deadline within 3 days → UPCOMING
│   │   │   └─ deadline > 3 days → PENDING
│   │   └─ Returns: {pending, reminders, overdue, completed, summary}
│   │
│   └── calculateReminder(task, hoursLeft)
│       └─ Returns: reminder message string
│
├── Module: Completion Detection
│   ├── hasCompletionPhrase(text)
│   │   └─ Returns: boolean
│   │
│   ├── findMatchingTasks(userId, subject, body)
│   │   ├─ Fetch all PENDING tasks for user
│   │   ├─ For each task:
│   │   │   └─ calculateSimilarity(task.object, body)
│   │   ├─ Filter: similarity > 0.4
│   │   ├─ Sort: by similarity descending
│   │   └─ Returns: [{task, similarity, matchedKeywords}, ...]
│   │
│   ├── calculateSimilarity(taskWords, emailText)
│   │   ├─ Extract keywords from task
│   │   ├─ Count matching words in email
│   │   └─ Returns: (matches / total) as decimal 0-1
│   │
│   └── extractMatchedKeywords(taskWords, emailText)
│       └─ Returns: [words that matched]
│
└── Module: Main Workflow
    ├── processEmailForCommitments(email, userId)
    │   ├─ Validate input
    │   ├─ Check commitment
    │   │   ├─ YES → extractCommitment()
    │   │   │         → createTask()
    │   │   │         → tasksCreated = [...]
    │   │   └─ NO → tasksCreated = []
    │   │
    │   ├─ Check completion
    │   │   ├─ YES → findMatchingTasks()
    │   │   │         → markTaskCompleted()
    │   │   │         → tasksCompleted = [...]
    │   │   └─ NO → tasksCompleted = []
    │   │
    │   └─ Returns: {
    │           email,
    │           commitmentDetected,
    │           completionDetected,
    │           tasksCreated,
    │           tasksCompleted
    │       }
    │
    └── markTaskCompleted(taskId, userId)
        └─ Updates: status → "completed", updatedAt → now
```

---

## Data Flow: Creating Commitment

```
Input Email:
  sender: "john@company.com"
  subject: "Q4 Report"
  body: "I will send the Q4 financial report by Friday EOD"
  userId: "john123"
          │
          ▼
Step 1: hasCommitmentPhrase()
  Keywords: ["i will", "i'll", "i promise", ...]
  Detection: "i will" found ✅
          │
          ▼
Step 2: extractAction()
  Action keywords: ["send", "submit", "share", ...]
  Found: "send" → Action = "Send" ✅
          │
          ▼
Step 3: extractObject()
  Text analysis: "Q4 financial report"
  Object = "Q4 financial report" ✅
          │
          ▼
Step 4: extractDeadline()
  Patterns:
    - "by Friday EOD" → matches day + EOD
    - getNextDayOfWeek("friday") → Date
    - Also check for "EOD" → add 24 hours
  Deadline = Next Friday, 5 PM ✅
          │
          ▼
Step 5: createTask()
  Task object:
    {
      taskId: "unique-id-123",
      userId: "john123",
      action: "Send",
      object: "Q4 financial report",
      deadline: Date(2024, 03, 19, 17, 0),
      status: "pending",
      sourceEmail: {
        sender: "john@company.com",
        subject: "Q4 Report"
      },
      createdAt: now,
      updatedAt: now
    }
          │
          ▼
Step 6: Save to MongoDB
  Collection: tasks
  Result: Task stored with unique _id ✅
          │
          ▼
Response:
  {
    "success": true,
    "data": {
      "commitmentDetected": true,
      "tasksCreated": [
        {
          "taskId": "unique-id-123",
          "action": "Send",
          "object": "Q4 financial report",
          "deadline": "2024-03-19T17:00:00Z",
          "status": "pending"
        }
      ]
    }
  }
```

---

## Data Flow: Reminder Generation

```
Request: GET /api/commitments/john123/reminders

          │
          ▼
Step 1: generateTaskStatus("john123")
  Fetch all tasks where userId = "john123"
  Tasks found: [3 tasks]
          │
          ▼
Step 2: For each task, check deadline
  
  Task 1: "Send Q4 Report" - Deadline: Tomorrow, 5 PM
    hoursLeft = 21 hours
    Condition: 21 < 24 → REMINDER
    Message: "🔔 Reminder: Send Q4 Report - DUE TODAY or SOON!"
    
  Task 2: "Review Budget" - Deadline: 3 days away
    hoursLeft = 72 hours
    Condition: 72 < 72 → UPCOMING
    Message: "📅 Coming up: Review Budget - due in 3 days"
    
  Task 3: "Complete Audit" - Deadline: 10 days away
    hoursLeft = 240 hours
    Condition: 240 > 72 → PENDING
    Category: pending (no reminder)
    
  Task 4: "Prepare Meeting" - Deadline: Yesterday
    hoursLeft = -24 hours
    Condition: negative → OVERDUE
    Message: "⚠️  OVERDUE: Prepare Meeting"
    DaysOverdue: 1
          │
          ▼
Step 3: Categorize results
  {
    pending: [Task 3],
    reminders: [Task 1],
    overdue: [Task 4],
    upcoming: [Task 2],
    completed: []
  }
          │
          ▼
Response:
  {
    "success": true,
    "data": {
      "pending": [
        {
          "taskId": "...",
          "action": "Complete",
          "object": "Audit",
          "status": "pending"
        }
      ],
      "reminders": [
        {
          "taskId": "...",
          "action": "Send",
          "object": "Q4 Report",
          "reminder": "🔔 Reminder: Send Q4 Report - DUE TODAY or SOON!",
          "hoursLeft": 21
        }
      ],
      "overdue": [
        {
          "taskId": "...",
          "action": "Prepare",
          "object": "Meeting",
          "reminder": "⚠️  OVERDUE: Prepare Meeting",
          "daysOverdue": 1
        }
      ],
      "summary": {
        "total": 4,
        "pending": 1,
        "reminders": 1,
        "overdue": 1,
        "completed": 0
      }
    }
  }
```

---

## Data Flow: Completion Matching

```
Input Email:
  subject: "RE: Q4 Report"
  body: "Here is the complete Q4 financial report you requested"
  userId: "john123"
          │
          ▼
Step 1: hasCompletionPhrase()
  Keywords: ["completed", "done", "finished", "here is", ...]
  Found: "complete" ✅ AND "Here is" ✅
  completionDetected = true
          │
          ▼
Step 2: findMatchingTasks(userId, subject, body)
  Fetch all PENDING tasks for john123
  Tasks: [Task 1: "Q4 financial report", Task 3: "Audit", ...]
          │
          ▼
Step 3: For each pending task, calculate similarity
  
  Task 1 - "Q4 financial report":
    taskWords = ["Q4", "financial", "report"] (3 words)
    emailText = "Here is the complete Q4 financial report you requested"
    Matching: "Q4" ✅, "financial" ✅, "report" ✅ (3/3)
    similarity = 3/3 = 1.0 (100%) ✅ MATCH
    matchedKeywords = ["Q4", "financial", "report"]
    
  Task 3 - "Audit":
    taskWords = ["audit"] (1 word)
    emailText = "Here is the complete Q4 financial report you requested"
    Matching: "audit" ❌ (0/1)
    similarity = 0/1 = 0.0 (0%) ❌ NO MATCH
          │
          ▼
Step 4: Filter & Sort
  Filter: similarity > 0.4 (40%)
  Matches: [Task 1 with 100%]
  Sort: by similarity descending
          │
          ▼
Step 5: Mark matched task as completed
  Update Task 1:
    status = "completed"
    updatedAt = now
  Result: ✅ Task 1 marked completed
          │
          ▼
Response:
  {
    "success": true,
    "data": {
      "matches": [
        {
          "taskId": "unique-id-123",
          "action": "Send",
          "object": "Q4 financial report",
          "similarity": "100%",
          "matchedKeywords": ["Q4", "financial", "report"]
        }
      ],
      "count": 1
    }
  }
```

---

## Database Schema

### Task Collection

```javascript
{
  _id: ObjectId,
  
  // Task Identity
  taskId: String,           // Unique identifier
  userId: String,           // Owner
  
  // Task Content
  action: String,           // "Send", "Complete", "Review", etc.
  object: String,           // "Q4 Report", "Budget Proposal", etc.
  status: String,           // "pending", "completed"
  
  // Deadlines & Timing
  deadline: Date,           // Task due date/time
  createdAt: Date,          // When task was created
  updatedAt: Date,          // Last modification
  
  // Source Information
  sourceEmail: {
    sender: String,
    subject: String
  },
  
  // Indexes (for performance)
  // - (userId, status)
  // - (userId, deadline)
  // - taskId (unique)
}
```

### Example Task Document

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "taskId": "task-abc123def456",
  "userId": "john123",
  "action": "Send",
  "object": "Q4 financial report",
  "status": "pending",
  "deadline": ISODate("2024-03-19T17:00:00Z"),
  "createdAt": ISODate("2024-03-14T10:30:00Z"),
  "updatedAt": ISODate("2024-03-14T10:30:00Z"),
  "sourceEmail": {
    "sender": "john@company.com",
    "subject": "Q4 Report"
  }
}
```

---

## API Endpoint Specifications

### 1. Process Email

```
POST /api/commitments/process

Request Body:
{
  "sender": string,        // Email sender
  "subject": string,       // Email subject
  "body": string,          // Email body
  "userId": string         // User ID
}

Response (Success):
{
  "success": true,
  "data": {
    "email": {sender, subject},
    "commitmentDetected": boolean,
    "completionDetected": boolean,
    "tasksCreated": [
      {taskId, action, object, deadline, status}
    ],
    "tasksCompleted": [
      {taskId, action, object}
    ]
  }
}

Response (Error):
{
  "success": false,
  "error": "Error message"
}

Status Codes:
- 200: Success
- 400: Validation failure
- 500: Server error
```

### 2. Get Task Status

```
GET /api/commitments/:userId

Response:
{
  "success": true,
  "data": {
    "pending": [task objects],
    "reminders": [task objects with reminder field],
    "overdue": [task objects with reminder field],
    "completed": [task objects],
    "summary": {
      "total": number,
      "pending": number,
      "reminders": number,
      "overdue": number,
      "completed": number
    }
  }
}
```

### 3. Get Reminders Only

```
GET /api/commitments/:userId/reminders

Response:
{
  "success": true,
  "data": {
    "reminders": [task objects with reminder field],
    "overdue": [task objects with reminder field],
    "count": number
  }
}
```

### 4. Test Matching

```
POST /api/commitments/:userId/match

Request Body:
{
  "subject": string,
  "body": string
}

Response:
{
  "success": true,
  "data": {
    "matches": [
      {
        taskId: string,
        action: string,
        object: string,
        similarity: string,  // "100%", "75%", etc.
        matchedKeywords: [string]
      }
    ],
    "count": number
  }
}
```

---

## Performance Characteristics

| Operation | Complexity | Time | Notes |
|-----------|-----------|------|-------|
| Has Commitment | O(1) | <1ms | String matching |
| Extract Deadline | O(n) | <5ms | Regex against text |
| Generate Reminders | O(n) | <10ms | Single pass through tasks |
| Find Matches | O(n*m) | <20ms | n=tasks, m=keywords |
| Mark Complete | O(1) | <5ms | Single update |
| Process Email | O(n+m) | <50ms | Combined operations |

---

## Testing Strategy

### Unit Tests
- Test hasCommitmentPhrase() with 10+ variations
- Test extractDeadline() with 8+ formats
- Test calculateSimilarity() with edge cases
- Test hasCompletionPhrase() with 10+ variations

### Integration Tests
- Test full email → task creation flow
- Test task → reminder generation
- Test email → task completion
- Test user isolation

### Performance Tests
- Test with 100, 1000, 10000 tasks
- Measure query times
- Check memory usage

---

## Error Handling

```javascript
// All errors return consistent format:
{
  "success": false,
  "error": "Human-readable error message"
}

// Error types:
- ValidationError: Missing or invalid input
- NotFoundError: User/task not found
- DuplicateError: Task ID already exists
- DatabaseError: MongoDB connection issues
- ProcessingError: Unexpected processing failure
```

---

## Future Enhancements

### V2.0
- [ ] Machine learning for better phrase detection
- [ ] Priority levels extracted from email tone
- [ ] Recurring task support
- [ ] Task dependencies

### V3.0
- [ ] Calendar integration
- [ ] Slack notifications
- [ ] Voice command support
- [ ] Mobile app

---

**Document Status:** ✅ COMPLETE
**Last Updated:** Commitment Tracking System v1.0
