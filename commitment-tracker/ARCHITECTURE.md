# Commitment Tracker - Architecture & Data Structure Plan

## 🎯 Overview
This folder contains the **Commitment Tracker** system that processes commitment emails and tracks tasks. The system is being rebuilt with a cleaner architecture, keeping frontend + database separated.

---

## 📂 Folder Structure

```
commitment-tracker/
├── utils/                          # Core utilities for processing
│   ├── commitmentDetector.js       # Extract commitment phrases from text
│   ├── taskExtractor.js            # Extract task details from commitments
│   ├── deadlineConverter.js        # Convert time text to dates
│   ├── completionDetector.js       # Detect if task is completed
│   ├── reminderChecker.js          # Check reminder status
│   └── (test files)                # Unit tests for each utility
├── models/                         # Database models
│   └── Task.js                     # Task model from existing DB
├── routes/                         # API endpoints
│   └── commitmentRoutes.js         # API routes for commitment operations
├── services/                       # Business logic layer (TO CREATE)
│   └── TaskDataStructureService.js # Advanced DS orchestration
├── ARCHITECTURE.md                 # This file
└── README.md                       # Quick start guide
```

---

## 🏗️ Data Structure Strategy

### Phase 1: Simple Foundation (Current)
**Current Setup** - Using existing database with direct API calls:
- ✅ Frontend submits emails
- ✅ Backend detects commitments
- ✅ Tasks stored in MongoDB with basic properties
- ✅ Simple queries: deadline, priority, status

**Why this approach:**
- Proven MongoDB integration already exists
- Clear separation of frontend/database
- Can handle basic commitment tracking

---

### Phase 2: Advanced DS Layer (To Build)
When we scale beyond simple queries, we'll add these data structures **in memory during session**:

#### **1. Priority Queue (Min Heap)**
**What it does:** Keeps tasks sorted by urgency (deadline)
- **Why:** O(1) peek at next urgent task, O(log n) insert/extract
- **Use case:** "What should I do first?" queries
- **Example:** Tasks due Today < Due Tomorrow < Due Next Week
- **Complexity:** Insert O(log n), Extract O(log n), Peek O(1)

#### **2. AVL Tree (Self-Balancing BST)**
**What it does:** Keeps tasks sorted by deadline with fast range queries
- **Why:** O(log n + k) find all tasks due THIS WEEK, THIS MONTH
- **Use case:** "Show me all tasks due between Monday and Friday"
- **Example:** Get all tasks in date range for calendar view
- **Complexity:** Insert O(log n), RangeQuery O(log n + k)

#### **3. Task Dependency Graph (DAG)**
**What it does:** Tracks task dependencies and blockers
- **Why:** O(n+m) find critical path, detect circular dependencies
- **Use case:** "What's blocking this task?" / "What's the bottleneck?"
- **Example:** gather_data → analyze → report (must follow order)
- **Complexity:** Add Edge O(n+m), Find Path O(n+m)

#### **4. HashMap (Direct Lookup)**
**What it does:** O(1) access to any task by ID
- **Why:** Instant lookup for updating/deleting tasks
- **Use case:** Mark task complete, update deadline
- **Example:** Get task by taskId in milliseconds
- **Complexity:** Get/Set/Delete O(1)

---

## 🔄 How They Work Together

```
Email → Commit Detector → Task Extractor → Deadline Converter
                                              ↓
                        ┌───────────────────────────┐
                        ↓                           ↓
                    MongoDB              In-Memory DS Layer
              (Persistent Store)     (For Fast Queries)
                        ↓                           ↓
              store tasks forever     ┌─────────────────────┐
              provide full history    │ Priority Queue      │
              enable complex queries  │ AVL Tree            │
                                     │ Dependency Graph    │
                                     │ HashMap             │
                                     └─────────────────────┘
                                              ↓
                                     Real-time insights:
                                     • Next urgent task
                                     • Date range queries
                                     • Critical path
                                     • Blockers/dependencies
```

---

## 📊 Why This Architecture?

| Requirement | Solution | Benefit |
|------------|----------|---------|
| **Fast "what's next?" lookup** | Priority Queue | O(1) peek vs O(n) scan |
| **Show tasks for a week** | AVL Tree | O(log n + k) vs O(n) |
| **Find blockers** | Dependency Graph | Explicit relationships, cycle detection |
| **Persistent storage** | MongoDB | Survive app restart, enable history |
| **Real-time responsiveness** | In-memory DS | No database latency for frequent queries |
| **Handle email scale** | Multi-user sessions | Per-user DS isolation |

---

## 🚀 Implementation Plan

### Step 1: Stabilize Foundation (Current)
- ✅ Use existing commitment detector, task extractor, deadline converter
- ✅ Store all tasks in MongoDB (Task model)
- ✅ Expose basic API endpoints

### Step 2: Add Advanced DS Layer
- Create `TaskDataStructureService.js` that:
  1. Loads user's tasks from MongoDB on session start
  2. Builds in-memory Priority Queue, AVL Tree, Graph
  3. Keeps them synchronized with MongoDB on updates
  4. Provides fast query methods

### Step 3: Create Advanced API Endpoints
- `GET /api/commitments/:userId/next-task` → Uses Priority Queue
- `GET /api/commitments/:userId/weekly` → Uses AVL Tree range query
- `GET /api/commitments/:userId/critical-path` → Uses Graph analysis
- `GET /api/commitments/:userId/blockers/:taskId` → Uses Graph lookup

### Step 4: Frontend Integration
- Display "Next Task" from Priority Queue
- Show "Weekly View" from AVL Tree query
- Show "Dependency Diagram" from Graph
- Real-time updates when tasks complete

---

## 🎨 Current File Organization

### In `src/utils/` (Existing, Keep Here)
```
commitmentDetector.js      # email text → commitment phrases
taskExtractor.js           # commitment → task details
deadlineConverter.js       # "Friday" → 2026-05-02
completionDetector.js      # email text → completion status
reminderChecker.js         # task → needs reminder?
commitmentSystem.js        # Main orchestrator (uses above)
```

### In `models/` (Existing, Keep in DB)
```
Task.js                    # MongoDB schema for tasks
```

### In `commitment-tracker/` (New, Organized)
```
Will create services, advanced DS implementations, and API routes here
```

---

## 💻 Code Example Flow

```javascript
// User sends email with commitment
const email = {
  from: 'boss@company.com',
  body: 'I will gather Q4 data by Friday and analyze by Monday'
};

// Step 1: Detect commitments
const commitments = detectCommitments(email.body);
// → ["I will gather Q4 data by Friday", "I will analyze by Monday"]

// Step 2: Extract task details
const tasks = commitments.map(commitment => extractTask(commitment));
// → [{action: "gather", object: "Q4 data", timeText: "Friday"}, ...]

// Step 3: Convert to deadline
tasks.forEach(task => {
  task.deadline = convertToDeadline(task.timeText);
  // → Friday → 2026-05-02
});

// Step 4: Store in MongoDB
await Task.insertMany(tasks);
// → Persistent storage

// Step 5: Load into Advanced DS for fast queries (to implement)
const dsService = new TaskDataStructureService(userId);
await dsService.loadFromDatabase();
// → Builds Priority Queue, AVL Tree, Graph in memory

// Step 6: Answer questions instantly
const nextTask = dsService.getNextReadyTask();     // Priority Queue
const weekly = dsService.getTasksForWeek(date);    // AVL Tree
const critical = dsService.getCriticalPath();      // Graph
const blockers = dsService.getTaskBlockers(id);    // Graph lookup
```

---

## ✅ What's Done

- ✅ Commitment detection utility
- ✅ Task extraction utility
- ✅ Deadline conversion utility
- ✅ Completion detection utility
- ✅ MongoDB Task model
- ✅ Basic API routes

## 📋 What's Next

1. Create `TaskDataStructureService.js` in `commitment-tracker/services/`
2. Implement Priority Queue class
3. Implement AVL Tree class
4. Implement Dependency Graph class
5. Create advanced query endpoints
6. Integrate with frontend

---

## 🔗 Related Files

**Core Utilities (in `src/utils/`):**
- `commitmentDetector.js` - Commitment phrase extraction
- `taskExtractor.js` - Task detail parsing
- `deadlineConverter.js` - Time text conversion
- `commitmentSystem.js` - Main orchestrator

**Database (in `models/` or `src/models/`):**
- `Task.js` - MongoDB schema

**To Create (in `commitment-tracker/`):**
- `services/TaskDataStructureService.js`
- `services/PriorityQueue.js`
- `services/AVLTree.js`
- `services/TaskGraph.js`

---

## 📝 Notes

- **Database-first approach:** MongoDB is source of truth for persistence
- **In-memory for performance:** Advanced DS layer is session-based for real-time queries
- **Stateless API:** Each request can rebuild DS from DB if needed
- **Scalable:** Can add caching layer, Redis, etc. later

---

**Last Updated:** April 30, 2026
**Status:** Architecture Planned, Ready for Implementation
