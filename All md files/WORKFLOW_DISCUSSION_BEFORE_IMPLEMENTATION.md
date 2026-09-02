# 📋 COMMITMENT TRACKER - WORKFLOW DISCUSSION

## Your Proposed System Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│              TASK LIFECYCLE & STATE TRANSITIONS                  │
└─────────────────────────────────────────────────────────────────┘

                        TASK CREATED
                             │
                             ▼
                    ┌─────────────────┐
                    │   PENDING       │
                    │ (Not yet due)   │
                    │ Days until due: │
                    │   > 1 day       │
                    └────────┬────────┘
                             │
              (1 day before deadline)
                             │
                             ▼ DELETE from Pending ✅
                    ┌─────────────────┐
                    │   REMINDERS     │
                    │ (Due tomorrow)  │
                    │ Days until due: │
                    │   ≤ 1 day       │
                    └────┬────────┬───┘
                         │        │
        (User completes)  │        │  (Deadline passes)
                         │        │
                    ┌────▼─┐  ┌──▼────────────┐
                    │      │  │               │
                    ▼      ▼  ▼               │
            ┌──────────┐  ┌──────────────┐   │
            │COMPLETED │  │   NOT        │   │
            │          │  │ COMPLETED    │   │
            │(On time) │  │(Overdue)     │   │
            └──────────┘  └──────────────┘   │
                                             │
            DELETE from Reminders ✅         │
                                             │
                                             │
            ┌─────────────────────────────────┘
            │
            ▼ (If user completes later)
        ┌──────────────┐
        │   COMPLETED  │
        │   (Late)     │
        └──────────────┘
        
        DELETE from Not Completed ✅
```

---

## Section Breakdown

### 1️⃣ **PENDING** Section
- **When tasks appear**: Right after commitment detected
- **Condition**: `deadline - today > 1 day`
- **What user sees**: List of upcoming tasks
- **User can do**: Mark as done early, set reminder manually
- **Transitions**: → REMINDERS (automatic, 1 day before)
- **On transition**: DELETE task from Pending ✅

### 2️⃣ **REMINDERS** Section  
- **When tasks appear**: 1 day before deadline
- **Condition**: `deadline - today ≤ 1 day`
- **What user sees**: Urgent tasks to do tomorrow
- **User can do**: Mark as complete, dismiss (moves to Not Completed if past deadline)
- **Transitions**: → COMPLETED (if user clicks completed)
              OR → NOT COMPLETED (if deadline passes without completing)
- **On transition**: DELETE task from Reminders ✅

### 3️⃣ **COMPLETED** Section
- **When tasks appear**: User clicks "Done" on task (at any time)
- **Condition**: `status = "completed"`
- **What user sees**: Finished tasks (on-time or late)
- **User can do**: View history, delete permanently
- **Source**: Can come from PENDING or REMINDERS or NOT COMPLETED

### 4️⃣ **NOT COMPLETED** Section
- **When tasks appear**: Deadline passes without marking complete
- **Condition**: `deadline < today AND status ≠ "completed"`
- **What user sees**: Overdue tasks not finished
- **User can do**: Complete now (moves to COMPLETED), delete
- **Transitions**: → COMPLETED (if user completes it)
- **On transition**: DELETE from Not Completed ✅

---

## UI Layout Suggestion

```
┌──────────────────────────────────────────────────────────────────┐
│                   COMMITMENT TRACKER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📌 PENDING (5 tasks)                                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ □ Submit quarterly report  [May 1]  (1 day away)   [✓Done] │  │
│  │ □ Prepare presentation     [May 3]  (3 days away)  [✓Done] │  │
│  │ □ Review contract          [May 5]  (5 days away)  [✓Done] │  │
│  │ □ Schedule meeting         [May 7]  (7 days away)  [✓Done] │  │
│  │ □ Send proposal            [May 10] (10 days away) [✓Done] │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ⏰ REMINDERS (2 tasks) ← MOVING HERE TOMORROW!                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ⚡ Submit quarterly report  [May 1]  (DUE TOMORROW!)  [✓Done] │  │
│  │ ⚡ Prepare presentation     [May 3]  (Due in 1 day)   [✓Done] │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ✅ COMPLETED (8 tasks)                                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ✓ Send status report       [Apr 25] (Completed on time)    │  │
│  │ ✓ Finish project docs      [Apr 28] (Completed on time)    │  │
│  │ ✓ Update client            [Apr 29] (Completed on time)    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ❌ NOT COMPLETED (2 tasks) ← OVERDUE!                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ✗ Review budget            [Apr 20] (3 days overdue)  [✓Do] │  │
│  │ ✗ Sign agreement           [Apr 25] (5 days overdue)  [✓Do] │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## State Transition Logic

### Automatic Transitions (Backend)

```javascript
// RUN EVERY HOUR or ON-DEMAND:

1. PENDING → REMINDERS
   if (task.deadline - today ≤ 1 day && task.status === 'pending')
     → Move to REMINDERS section
     → DELETE from PENDING
     → Optional: Send notification

2. REMINDERS → NOT COMPLETED
   if (today > task.deadline && task.status !== 'completed')
     → Move to NOT COMPLETED
     → DELETE from REMINDERS
     → Notify user: "Task overdue!"
```

### Manual Transitions (User Click)

```javascript
// USER CLICKS "✓ Done" BUTTON:

3. PENDING/REMINDERS/NOT COMPLETED → COMPLETED
   User clicks: [✓ Mark Complete]
     → status = 'completed'
     → Mark timestamp
     → Move to COMPLETED
     → DELETE from previous section
```

---

## Questions to Discuss Before Implementation

### Q1: **Permanent Deletion or Archive?**
- Should users be able to permanently DELETE tasks from COMPLETED section?
- Or should completed tasks stay in history forever?
- **Suggestion**: Keep for history, but allow "Clear History" button to remove

### Q2: **Re-opening Not Completed Tasks?**
- Can user mark a "Not Completed" task as "In Progress" again?
- Or is it final once it hits NOT COMPLETED?
- **Suggestion**: Allow re-opening (edge case: user forgot something)

### Q3: **Completing Before Deadline**
- If user completes task on May 1 but deadline is May 5, should it:
  - A) Go to COMPLETED immediately (my suggestion ✅)
  - B) Stay in PENDING until 1 day before deadline?
- **Suggestion**: Go to COMPLETED immediately (user finished early = success!)

### Q4: **Completing AFTER Deadline**
- If user completes task 5 days late, should it:
  - A) Go to COMPLETED with "Late" badge
  - B) Go to separate "Completed Late" section?
- **Suggestion**: Go to COMPLETED with timestamp showing "completed 5 days late"

### Q5: **Task Editing**
- Can user change deadline after task is created?
- Should it trigger automatic re-categorization?
- **Suggestion**: Yes, allow deadline changes + auto re-categorize

### Q6: **Dependent Tasks**
- If Task B depends on Task A (Graph DS), and deadline A passes:
  - Should Task B also be marked as "at risk"?
  - Should reminders for B appear earlier?
- **Suggestion**: Show "Blocked by overdue task" warning on B

### Q7: **Reminders - Active Notification?**
- Should REMINDERS section:
  - A) Just show in UI (user comes to check)
  - B) Send email/push notification (proactive)
- **Suggestion**: Show in UI first, add email notification in phase 2

### Q8: **Multiple Same-Day Tasks**
- If 3 tasks are due same day, how should REMINDERS section display?
- Sort by: earliest first? By priority? By urgency?
- **Suggestion**: Use Priority Queue! Show most urgent first

---

## Proposed Database Schema Update

```javascript
// Add to Task model:

{
  _id: ObjectId,
  userId: String,
  action: String,
  object: String,
  description: String,
  deadline: Date,
  status: Enum [
    'pending',      // Created but not yet due
    'reminder',     // Within 1 day of deadline
    'completed',    // User marked as done
    'not_completed' // Deadline passed without completion
  ],
  completedAt: Date,    // NEW - When user marked complete
  completedLate: Boolean, // NEW - Was it completed after deadline?
  section: Enum [       // NEW - Current UI section
    'pending',
    'reminders', 
    'completed',
    'not_completed'
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints Needed

```javascript
// 1. GET all tasks grouped by section (for dashboard)
GET /api/commitments/:userId/sections
  Response: {
    pending: [...],
    reminders: [...],
    completed: [...],
    not_completed: [...]
  }

// 2. MARK task as complete
POST /api/commitments/:userId/complete/:taskId
  Response: {
    success: true,
    task: {...},
    movedTo: 'completed',
    movedFrom: 'reminders'
  }

// 3. MOVE task manually
POST /api/commitments/:userId/move/:taskId
  Body: { targetSection: 'completed' }
  Response: {...}

// 4. AUTO-TRANSITION tasks (run periodically)
POST /api/commitments/:userId/sync-sections
  Response: {
    movedToPending: [],
    movedToReminders: [...],
    movedToNotCompleted: [...]
  }
```

---

## Implementation Roadmap

### Phase 1: Backend Logic ✅ (Most important)
- [ ] Update Task model with status + section fields
- [ ] Create transition logic (PENDING → REMINDERS)
- [ ] Create transition logic (REMINDERS → NOT COMPLETED)
- [ ] Create mark-complete endpoint
- [ ] Update TaskDataStructureManager to handle sections

### Phase 2: Frontend Display
- [ ] Create 4-section layout (Pending, Reminders, Completed, Not Completed)
- [ ] Add "Mark Complete" buttons
- [ ] Auto-refresh to show transitions
- [ ] Add visual badges (time remaining, overdue, late completion)

### Phase 3: Notifications
- [ ] Send email when task moves to REMINDERS
- [ ] Send email when task becomes overdue
- [ ] Optional: Browser push notifications

### Phase 4: Advanced Features
- [ ] Task re-opening
- [ ] Deadline editing with re-categorization
- [ ] History/archive management
- [ ] Bulk actions (mark all complete, delete completed)

---

## Summary: Is This Good? ✅ YES!

Your workflow is **excellent**! It's:
- ✅ **Clear**: User always knows what's urgent
- ✅ **Intuitive**: Like Gmail inbox → Archive
- ✅ **Complete**: Every task has final state
- ✅ **Actionable**: Shows what to do today (Reminders section)
- ✅ **Historical**: Tracks what got done vs overdue

---

## Recommendation Before Implementation

**Discuss answers to these 8 questions above**, then I'll:
1. Design database schema
2. Build transition logic
3. Create API endpoints
4. Build frontend UI with 4 sections

**Should we go ahead with this approach?**
