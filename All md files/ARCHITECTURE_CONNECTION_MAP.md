# 🏗️ COMMITMENT TRACKER ARCHITECTURE - COMPLETE CONNECTION MAP

## 1️⃣ FOLDER STRUCTURE

```
📁 Email Spam Project Root
│
├── 📄 server.js ───────────────────┐  ENTRY POINT
│                                   │
├── 📁 routes/                       │
│   └── commitmentRoutes.js ◄────────┘  API ENDPOINTS
│
├── 📁 src/
│   └── 📁 utils/                       UTILITY FUNCTIONS
│       ├── commitmentDetector.js      ├─ Detect "I will..." phrases
│       ├── taskExtractor.js           ├─ Extract action, object, deadline
│       ├── deadlineConverter.js       ├─ Convert "tomorrow" → Date
│       ├── completionDetector.js      ├─ Detect task completions
│       ├── reminderChecker.js         ├─ Find tasks due soon
│       └── taskStorageAPI.js          └─ MongoDB API wrapper
│
├── 📁 commitment-tracker/            ⭐ MAIN LOGIC
│   ├── ARCHITECTURE.md
│   ├── README.md
│   ├── 📁 services/
│   │   ├── CommitmentTrackerService.js  ◄─ ORCHESTRATOR
│   │   ├── TaskDataStructureManager.js  ◄─ ALL 4 DS MANAGER
│   │   ├── PriorityQueue.js             ├─ Data Structure #1
│   │   ├── AVLTree.js                   ├─ Data Structure #2
│   │   ├── TaskGraph.js                 └─ Data Structure #3
│   │   └── (HashMap built-in)           └─ Data Structure #4
│   ├── 📁 routes/
│   └── 📁 utils/
│
├── 📁 models/
│   ├── Email.js
│   └── Task.js  ◄─ MongoDB Schema
│
└── 📁 db.js ◄─ MongoDB Connection
```

---

## 2️⃣ CONNECTION FLOW: Request → Response

```
┌────────────────────────────────────────────────────────────────────┐
│                      CLIENT SENDS REQUEST                           │
│         (Email with commitment "I will submit report")              │
│  POST /api/commitments/process { sender, subject, body, userId }  │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
        ┌────────────────────────────────────────┐
        │        server.js (PORT 3001)           │
        │  • Express app initialization          │
        │  • CORS + JSON middleware              │
        │  • Routes mounted:                     │
        │    - /api/tasks → taskRoutes           │
        │    - /api/commitments → commitmentRoutes │
        └────────────────┬─────────────────────┘
                         │
                         ▼ Routes to /api/commitments
        ┌────────────────────────────────────────┐
        │    routes/commitmentRoutes.js           │
        │  • Defines POST /process endpoint      │
        │  • Validates input fields              │
        │  • Calls CommitmentTrackerService      │
        └────────────────┬─────────────────────┘
                         │
                         ▼ Calls processEmailForCommitments()
        ┌─────────────────────────────────────────────────────┐
        │  commitment-tracker/services/                       │
        │  CommitmentTrackerService.js                        │
        │                                                     │
        │  ORCHESTRATOR - Manages entire workflow:            │
        │  ✅ STEP 1: detectCommitments()                     │
        │      └─ Uses: src/utils/commitmentDetector.js       │
        │                                                     │
        │  ✅ STEP 2: extractTask()                           │
        │      └─ Uses: src/utils/taskExtractor.js            │
        │                                                     │
        │  ✅ STEP 3: convertToDeadline()                     │
        │      └─ Uses: src/utils/deadlineConverter.js        │
        │                                                     │
        │  ✅ STEP 4: addTaskAPI()                            │
        │      └─ Uses: src/utils/taskStorageAPI.js           │
        │          └─ Saves to MongoDB via Task model         │
        │                                                     │
        │  ✅ STEP 5: generateTaskStatus()                    │
        │      └─ Loads tasks from MongoDB                    │
        │          └─ Calls getOverviewAPI()                  │
        │                                                     │
        │  ✅ STEP 6: Load into ALL 4 Data Structures         │
        │      └─ Gets TaskDataStructureManager:              │
        │          • addTask() to all 4 DS                    │
        │          • dsManager.getMostUrgent()                │
        │          • dsManager.getTasksForWeek()              │
        │          • dsManager.getCriticalPath()              │
        │          • dsManager.getInsights()                  │
        │                                                     │
        │  ✅ STEP 7: Return Results with Insights            │
        └────────────────┬─────────────────────────────────┘
                         │
                         ▼ Passes dsManager instance
        ┌──────────────────────────────────────────────────────┐
        │  commitment-tracker/services/                        │
        │  TaskDataStructureManager.js                         │
        │                                                      │
        │  MASTER ORCHESTRATOR FOR 4 DATA STRUCTURES:          │
        │  ┌─────────────────────────────────────────────┐    │
        │  │ Constructor (line 14-17):                  │    │
        │  │  ✅ this.taskMap = new Map()               │    │
        │  │  ✅ this.priorityQueue = new PriorityQueue()│   │
        │  │  ✅ this.deadlineTree = new AVLTree()      │    │
        │  │  ✅ this.dependencyGraph = new TaskGraph() │    │
        │  └─────────────────────────────────────────────┘    │
        │                                                      │
        │  Public Query Methods:                              │
        │  • getMostUrgent()          ─ Priority Queue O(1)   │
        │  • getTasksForWeek()        ─ AVL Tree O(log n+k)  │
        │  • getReadyTasks()          ─ Graph O(n)           │
        │  • findCriticalPath()       ─ Graph O(n+m)         │
        │  • getTaskBlockers()        ─ Graph O(k)           │
        │  • getSmartRecommendations()─ All 4 combined       │
        │  • getInsights()            ─ All 4 combined       │
        └────────────────┬─────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬──────────────┐
         │               │               │              │
         ▼               ▼               ▼              ▼
    ┌────────┐      ┌────────┐      ┌────────┐    ┌────────┐
    │ Data   │      │  AVL   │      │ Dep    │    │ Hash   │
    │ Struct │      │ Tree   │      │ Graph  │    │ Map    │
    │ #1: PQ│      │ #2     │      │ #3     │    │ #4     │
    └────────┘      └────────┘      └────────┘    └────────┘
         │               │               │              │
         └───────────────┼───────────────┴──────────────┘
                         │
                         ▼ Returns Insights
        ┌────────────────────────────────────────┐
        │    routes/commitmentRoutes.js           │
        │  Returns JSON response with:            │
        │  ✅ success: true                       │
        │  ✅ newTasks: [task array]              │
        │  ✅ overview: {pending, completed, ...}│
        │  ✅ insights: {mostUrgent, nextReady...}│
        └────────────────┬─────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │      CLIENT RECEIVES RESPONSE           │
        │   (Full task data + AI recommendations)│
        └────────────────────────────────────────┘
```

---

## 3️⃣ KEY INTEGRATION POINTS

### Point 1: server.js Mounts Routes

```javascript
// FILE: server.js (line 10-11, 22-23)

const commitmentRoutes = require('./routes/commitmentRoutes');
// ↑ Imports the router

app.use('/api/commitments', commitmentRoutes);
// ↑ Mounts at /api/commitments endpoint
// Now all POST /api/commitments/* requests go to commitmentRoutes
```

### Point 2: commitmentRoutes Calls Service

```javascript
// FILE: routes/commitmentRoutes.js (line 1-14)

const {
  processEmailForCommitments,      ← Imported
  generateTaskStatus,
  findMatchingTasks,
  markTaskCompleted,
  deleteTask
} = require('../commitment-tracker/services/CommitmentTrackerService');

// LINE: 28-32
router.post('/process', async (req, res) => {
  const result = await processEmailForCommitments(
    { sender, subject, body },
    userId
  );
  // ↑ Calls the main orchestrator
});
```

### Point 3: CommitmentTrackerService Uses All Utilities

```javascript
// FILE: commitment-tracker/services/CommitmentTrackerService.js
// Lines 16-21

const detectCommitments = require('../../src/utils/commitmentDetector');
const extractTask = require('../../src/utils/taskExtractor');
const convertToDeadline = require('../../src/utils/deadlineConverter');
const detectCompletion = require('../../src/utils/completionDetector');
const checkReminders = require('../../src/utils/reminderChecker');
const { addTaskAPI, getOverviewAPI, updateTaskStatusAPI, deleteTaskAPI } = 
  require('../../src/utils/taskStorageAPI');

// ↑ All utility functions imported and used in pipeline
```

### Point 4: CommitmentTrackerService Gets DS Manager

```javascript
// FILE: commitment-tracker/services/CommitmentTrackerService.js
// Lines 34-38

function getUserDataStructureManager(userId) {
  if (!userDataStructures.has(userId)) {
    userDataStructures.set(userId, new TaskDataStructureManager());
    // ↑ Creates NEW manager for each user
  }
  return userDataStructures.get(userId);
}

// LINE: 115 (in processEmailForCommitments)
const dsManager = getUserDataStructureManager(userId);
// ↑ Gets user's data structure manager
```

### Point 5: DS Manager Organizes 4 Data Structures

```javascript
// FILE: commitment-tracker/services/TaskDataStructureManager.js
// Lines 14-17

this.taskMap = new Map();                    // DS #4
this.priorityQueue = new PriorityQueue();   // DS #1
this.deadlineTree = new AVLTree();          // DS #2
this.dependencyGraph = new TaskGraph();     // DS #3

// ↑ All 4 instantiated once per user
```

---

## 4️⃣ DATA FLOW EXAMPLE

```
USER SENDS EMAIL:
  "I will submit the quarterly report tomorrow"
  From: boss@example.com
  UserId: user123

         ↓

server.js RECEIVES:
  POST /api/commitments/process
  {
    sender: "boss@example.com",
    subject: "Task",
    body: "I will submit the quarterly report tomorrow",
    userId: "user123"
  }

         ↓

commitmentRoutes.js ROUTES TO:
  processEmailForCommitments(email, userId)

         ↓

CommitmentTrackerService.js EXECUTES:
  
  STEP 1: detectCommitments(body)
    → "i will submit the quarterly report tomorrow"
  
  STEP 2: extractTask(commitment)
    → { action: "submit", object: "quarterly report", timeText: "tomorrow" }
  
  STEP 3: convertToDeadline("tomorrow")
    → Date object: 2026-05-01
  
  STEP 4: addTaskAPI(userId, task)
    → Saves to MongoDB ✅
    → Returns: { _id: "task-123", deadline: 2026-05-01, ... }
  
  STEP 5: generateTaskStatus(userId)
    → Loads all user tasks from MongoDB
  
  STEP 6: dsManager.addTask(task)
    → Adds to ALL 4 simultaneously:
      • priorityQueue.insert(task)
      • deadlineTree.insert(task)
      • dependencyGraph.addTask(task)
      • taskMap.set(taskId, task)
  
  STEP 7: Get insights:
    • mostUrgent = dsManager.getMostUrgent()
    • weekTasks = dsManager.getTasksForWeek()
    • criticalPath = dsManager.findCriticalPath()
    • insights = dsManager.getInsights()

         ↓

commitmentRoutes.js RETURNS:
  {
    success: true,
    newTasks: [{ _id, action, object, deadline, ... }],
    overview: {
      pending: [...],
      completed: [...],
      reminders: [...]
    },
    insights: {
      totalTasks: 1,
      mostUrgent: { action: "submit", ... },
      nextReady: { action: "submit", ... },
      criticalPath: [...],
      recommendations: [...]
    }
  }

         ↓

USER RECEIVES: Complete task info + AI insights!
```

---

## 5️⃣ MODULE DEPENDENCIES MAP

```
┌─────────────────────────────────────────────────────────┐
│                      server.js                          │
│                   (Entry Point)                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ require()
                       ▼
        ┌──────────────────────────────┐
        │  routes/commitmentRoutes.js   │
        └──────────────┬────────────────┘
                       │
                       │ require()
                       ▼
        ┌──────────────────────────────────────────┐
        │ commitment-tracker/services/              │
        │ CommitmentTrackerService.js               │
        └──────────┬─────────────────────────────┘
                   │
        ┌──────────┴──────────────────────────────────┐
        │ require() all utility functions:            │
        │                                             │
        ├─ commitmentDetector.js                      │
        ├─ taskExtractor.js                          │
        ├─ deadlineConverter.js                      │
        ├─ completionDetector.js                     │
        ├─ reminderChecker.js                        │
        ├─ taskStorageAPI.js                         │
        │    │                                       │
        │    └─ Connects to MongoDB via Task model  │
        │                                             │
        └─ TaskDataStructureManager                  │
           │                                         │
           ├─ PriorityQueue.js                      │
           ├─ AVLTree.js                           │
           ├─ TaskGraph.js                         │
           └─ HashMap (built-in)                   │
```

---

## 6️⃣ COMPLETE REQUEST LIFECYCLE

```
1. HTTP REQUEST
   POST /api/commitments/process
   Body: { sender, subject, body, userId }
   └─→ Hits server.js:23

2. ROUTING
   app.use('/api/commitments', commitmentRoutes)
   └─→ Routes to commitmentRoutes.js:23

3. VALIDATION
   Check for required fields
   └─→ commitmentRoutes.js:24-30

4. ORCHESTRATION
   Call processEmailForCommitments(email, userId)
   └─→ CommitmentTrackerService.js:61

5. EMAIL PROCESSING
   ├─ Detect commitments (Step 1)
   ├─ Extract tasks (Step 2)
   ├─ Convert deadlines (Step 3)
   ├─ Store in MongoDB (Step 4)
   ├─ Generate status (Step 5)
   └─ Create insights (Step 6)

6. DATA STRUCTURE MANAGEMENT
   Get/create user's TaskDataStructureManager
   └─ Add task to all 4 DS simultaneously
   └─ Run query methods for insights

7. RESPONSE GENERATION
   Return organized data:
   ├─ success flag
   ├─ newTasks array
   ├─ overview object
   └─ insights object

8. HTTP RESPONSE
   Send JSON back to client
   └─→ commitmentRoutes.js:42-46
```

---

## 7️⃣ INTEGRATION SUMMARY

| Component | File | Purpose | Connects To |
|-----------|------|---------|-------------|
| **Server** | server.js | Express app, middleware | commitmentRoutes |
| **Routes** | routes/commitmentRoutes.js | HTTP endpoints | CommitmentTrackerService |
| **Orchestrator** | CommitmentTrackerService.js | Main workflow | All utilities + TaskDataStructureManager |
| **Detector** | commitmentDetector.js | Find "I will..." | CommitmentTrackerService |
| **Extractor** | taskExtractor.js | Parse action/object/date | CommitmentTrackerService |
| **Converter** | deadlineConverter.js | "tomorrow" → Date | CommitmentTrackerService |
| **Completion** | completionDetector.js | Find task completions | CommitmentTrackerService |
| **Reminder** | reminderChecker.js | Find tasks due soon | CommitmentTrackerService |
| **Storage API** | taskStorageAPI.js | MongoDB wrapper | CommitmentTrackerService |
| **DS Manager** | TaskDataStructureManager.js | 4 DS orchestrator | CommitmentTrackerService |
| **Priority Queue** | PriorityQueue.js | DS #1 (Urgency) | TaskDataStructureManager |
| **AVL Tree** | AVLTree.js | DS #2 (Dates) | TaskDataStructureManager |
| **Graph** | TaskGraph.js | DS #3 (Dependencies) | TaskDataStructureManager |
| **HashMap** | Built-in Map | DS #4 (Access) | TaskDataStructureManager |
| **Database** | MongoDB + Task model | Persistent storage | taskStorageAPI.js |

---

## 🎯 TL;DR - THE CONNECTION

```
User Request
    ↓
server.js (mounts routes)
    ↓
commitmentRoutes.js (HTTP endpoint)
    ↓
CommitmentTrackerService.js (main orchestrator)
    ├─ Uses all 6 utility functions (detect→extract→convert→store)
    ├─ Gets TaskDataStructureManager for user
    │   └─ Inserts task into 4 Data Structures simultaneously
    │   └─ Queries all 4 for insights
    └─ Returns rich response with insights
    ↓
User Receives Task + Recommendations
```

**The commitment-tracker folder is the HEART of the system:**
- ✅ CommitmentTrackerService = Main orchestrator
- ✅ TaskDataStructureManager = DS coordinator
- ✅ 4 Data Structures = Fast query engines
- ✅ All work together for intelligent task management
