# 3 TEST EXAMPLES FOR COMMITMENT TRACKING

## Before you start:
1. Make sure server is running: `npm run server` (or `npm run dev`)
2. Check MongoDB is running locally
3. db.js shows connection to mongodb://localhost:27017/email-spam-db ✅

---

## EXAMPLE 1: Work/Business Commitment

### Email Details:
- **From:** sarah.johnson@acme.com
- **Subject:** Q4 Budget Review
- **Content:** "Hi team, I will send the final Q4 budget analysis by Friday EOD. Thanks!"
- **User ID:** sarah-001

### Test Command:
```bash
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "sarah.johnson@acme.com",
    "subject": "Q4 Budget Review",
    "body": "Hi team, I will send the final Q4 budget analysis by Friday EOD. Thanks!",
    "userId": "sarah-001"
  }'
```

### Expected Result:
```json
{
  "success": true,
  "data": {
    "commitmentDetected": true,
    "tasksCreated": [
      {
        "taskId": "...",
        "action": "Send",
        "object": "final Q4 budget analysis",
        "deadline": "2026-04-10T17:00:00Z",
        "status": "pending"
      }
    ]
  }
}
```

### Then Check Reminders:
```bash
curl http://localhost:3001/api/commitments/sarah-001/reminders
```

**Expected:** Shows the newly created task in `reminders` (since it's due in a few days)

---

## EXAMPLE 2: Project Completion

### Email Details:
- **From:** mike.chen@tech.io
- **Subject:** RE: Project Delivery
- **Content:** "Here is the complete project report and all deliverables attached. Please review and let me know if you need any changes."
- **User ID:** mike-001

### Step 2a: First, create a pending task (simulate earlier commitment)
```bash
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "mike.chen@tech.io",
    "subject": "Starting Project Delivery",
    "body": "I will prepare the complete project report by next week",
    "userId": "mike-001"
  }'
```

**Expected:** Task created with status "pending" ✅

### Step 2b: Now send completion email (this one detects completion)
```bash
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "mike.chen@tech.io",
    "subject": "RE: Project Delivery",
    "body": "Here is the complete project report and all deliverables attached. Please review and let me know if you need any changes.",
    "userId": "mike-001"
  }'
```

### Expected Result:
```json
{
  "success": true,
  "data": {
    "completionDetected": true,
    "tasksCompleted": [
      {
        "taskId": "...",
        "action": "Prepare",
        "object": "project report"
      }
    ]
  }
}
```

### Then Verify Task is Completed:
```bash
curl http://localhost:3001/api/commitments/mike-001
```

**Expected:** Task moved from `pending` to `completed` section ✅

---

## EXAMPLE 3: Urgent/ASAP Task

### Email Details:
- **From:** alex.smith@startup.co
- **Subject:** Urgent: Client Proposal
- **Content:** "I commit to deliver the client proposal ASAP. This is our top priority!"
- **User ID:** alex-003

### Test Command:
```bash
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "alex.smith@startup.co",
    "subject": "Urgent: Client Proposal",
    "body": "I commit to deliver the client proposal ASAP. This is our top priority!",
    "userId": "alex-003"
  }'
```

### Expected Result:
```json
{
  "success": true,
  "data": {
    "commitmentDetected": true,
    "tasksCreated": [
      {
        "taskId": "...",
        "action": "Deliver",
        "object": "client proposal",
        "deadline": "2026-04-04T17:00:00Z",
        "status": "pending"
      }
    ]
  }
}
```

### Check That It Shows as REMINDER (due tomorrow):
```bash
curl http://localhost:3001/api/commitments/alex-003/reminders
```

**Expected:** Task appears in `reminders` section with message like:
```
"🔔 Reminder: Deliver client proposal - DUE TODAY or SOON!"
```

---

## VERIFICATION STEPS (Run After Each Example)

### Step 1: Check Task Was Created
```bash
# For sarah-001:
curl http://localhost:3001/api/commitments/sarah-001

# For mike-001:
curl http://localhost:3001/api/commitments/mike-001

# For alex-003:
curl http://localhost:3001/api/commitments/alex-003
```

**What to look for:**
- ✅ `success: true`
- ✅ `pending` array not empty (for new tasks)
- ✅ `completed` array not empty (for example 2)
- ✅ `summary.total` increases

### Step 2: Check MongoDB directly

```bash
# Open MongoDB compass or use mongosh
mongosh mongodb://localhost:27017/email-spam-db

# View all tasks
db.tasks.find().pretty()

# View specific user's tasks
db.tasks.find({ userId: "sarah-001" }).pretty()
```

**Expected output:**
```javascript
[
  {
    "_id": ObjectId("..."),
    "taskId": "...",
    "userId": "sarah-001",
    "action": "Send",
    "object": "final Q4 budget analysis",
    "status": "pending",
    "deadline": ISODate("2026-04-10T17:00:00Z"),
    "createdAt": ISODate("2026-04-03T..."),
    "updatedAt": ISODate("2026-04-03T..."),
    "sourceEmail": {
      "sender": "sarah.johnson@acme.com",
      "subject": "Q4 Budget Review"
    }
  }
]
```

### Step 3: Verify Reminders are Generated

```bash
curl http://localhost:3001/api/commitments/sarah-001
```

**Expected:**
- If deadline > 3 days away → appears in `pending`
- If deadline < 3 days away → appears in `reminders`
- If deadline passed → appears in `overdue`
- Shows `summary` with counts

---

## COMPLETE TEST SEQUENCE (Copy & Paste)

Run these in order:

```bash
# Test 1: Create first commitment (sarah)
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"sarah.johnson@acme.com","subject":"Q4 Budget Review","body":"Hi team, I will send the final Q4 budget analysis by Friday EOD. Thanks!","userId":"sarah-001"}'

# Check sarah's tasks
curl http://localhost:3001/api/commitments/sarah-001/reminders

# Test 2a: Create mike's pending task
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"mike.chen@tech.io","subject":"Starting Project Delivery","body":"I will prepare the complete project report by next week","userId":"mike-001"}'

# Check mike has pending task
curl http://localhost:3001/api/commitments/mike-001

# Test 2b: Complete mike's task
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"mike.chen@tech.io","subject":"RE: Project Delivery","body":"Here is the complete project report and all deliverables attached. Please review and let me know if you need any changes.","userId":"mike-001"}'

# Verify mike's task is completed
curl http://localhost:3001/api/commitments/mike-001

# Test 3: Create urgent task (alex)
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"alex.smith@startup.co","subject":"Urgent: Client Proposal","body":"I commit to deliver the client proposal ASAP. This is our top priority!","userId":"alex-003"}'

# Check alex's urgent task (should show as REMINDER)
curl http://localhost:3001/api/commitments/alex-003/reminders

# Summary: Get all stats for all users
echo "=== Summary ===" && \
curl http://localhost:3001/api/commitments/sarah-001 && \
echo "" && \
curl http://localhost:3001/api/commitments/mike-001 && \
echo "" && \
curl http://localhost:3001/api/commitments/alex-003
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot POST /api/commitments/process" | Server not running or routes not added to server.js |
| "MongoDB connection error" | Check MongoDB is running: `mongosh` |
| Task created but no reminders | Deadline might be >3 days away, check `pending` instead |
| Completion not detected | Email must contain completion phrase + task object keywords |

---

## What Success Looks Like

✅ **Example 1 Success:**
- POST returns success=true
- GET /reminders shows the task
- MongoDB shows task with status "pending"

✅ **Example 2 Success:**
- First POST creates pending task
- Second POST detects completion
- GET shows task moved to "completed" section
- MongoDB shows status "completed"

✅ **Example 3 Success:**
- POST creates task with ASAP deadline (tomorrow)
- GET /reminders shows it in "reminders" (not pending)
- System treats ASAP as urgent

---

## Next Steps After Verification

Once all 3 examples work:

1. ✅ System is working correctly
2. 🔄 Add real emails to test
3. 🔄 Integrate with your email processing pipeline
4. 🔄 Create frontend dashboard to show reminders

---

**Status: READY TO TEST** 🚀
