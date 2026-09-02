# COMMITMENT TRACKING - IMPLEMENTATION CHECKLIST

## Phase 1: Integration (5 minutes)

- [ ] **Step 1.1** - Open server.js in editor
- [ ] **Step 1.2** - Add at the top (after other requires):
  ```javascript
  const commitmentRoutes = require('./routes/commitmentRoutes');
  ```
- [ ] **Step 1.3** - Add after app definition (before other routes):
  ```javascript
  app.use('/api/commitments', commitmentRoutes);
  ```
- [ ] **Step 1.4** - Save server.js
- [ ] **Step 1.5** - Stop running server (Ctrl+C)
- [ ] **Step 1.6** - Start server again: `npm start`
- [ ] **Step 1.7** - Check console for "Express server running" message

---

## Phase 2: Validation (10 minutes)

### Test 2.1: API Endpoints Available

```bash
# Check if commitments route loads
curl http://localhost:3001/api/commitments/test
```

**Expected Response:**
```json
{
  "success": false,
  "error": "User not found (or similar)"
}
```

**Status:** ✅ PASS / ❌ FAIL

- [ ] **Step 2.1** - Run curl command above
- [ ] **Step 2.1 Verify** - Got response (any response = good)

### Test 2.2: Create Commitment

```bash
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"test@company.com","subject":"Test","body":"I will send the report by Friday","userId":"user123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "commitmentDetected": true,
    "tasksCreated": [
      {
        "taskId": "...",
        "action": "Send",
        "object": "report",
        "deadline": "2024-...",
        "status": "pending"
      }
    ]
  }
}
```

**Status:** ✅ PASS / ❌ FAIL

- [ ] **Step 2.2** - Run curl command above
- [ ] **Step 2.2 Verify** - Task created (check success=true, tasksCreated not empty)

### Test 2.3: Get Reminders

```bash
curl http://localhost:3001/api/commitments/user123/reminders
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "reminders": [...],
    "overdue": [...],
    "count": 1
  }
}
```

**Status:** ✅ PASS / ❌ FAIL

- [ ] **Step 2.3** - Run curl command above
- [ ] **Step 2.3 Verify** - Got data back (check count > 0)

### Test 2.4: Completion Detection

```bash
curl -X POST http://localhost:3001/api/commitments/user123/match \
  -H "Content-Type: application/json" \
  -d '{"subject":"RE: Test","body":"Here is the complete report"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "taskId": "...",
        "action": "Send",
        "object": "report",
        "similarity": "100%",
        "matchedKeywords": ["report"]
      }
    ],
    "count": 1
  }
}
```

**Status:** ✅ PASS / ❌ FAIL

- [ ] **Step 2.4** - Run curl command above
- [ ] **Step 2.4 Verify** - Got matches (check count > 0, similarity > 40%)

---

## Phase 3: Database Verification (5 minutes)

### Check MongoDB directly

```bash
# Open MongoDB Compass or use mongo CLI
mongo mongodb://localhost:27017/email-spam-db
```

```javascript
// Check if tasks were created
db.tasks.find({ userId: "user123" }).pretty()

// Expected output:
// [
//   {
//     _id: ObjectId(...),
//     taskId: "...",
//     userId: "user123",
//     action: "Send",
//     object: "report",
//     deadline: ISODate(...),
//     status: "pending",
//     createdAt: ISODate(...),
//     updatedAt: ISODate(...),
//     sourceEmail: { sender: "...", subject: "..." }
//   }
// ]
```

- [ ] **Step 3.1** - Open MongoDB client
- [ ] **Step 3.2** - Run find query above
- [ ] **Step 3.3 Verify** - Tasks exist in database

---

## Phase 4: Feature Testing (15 minutes)

### Test 4.1: Multiple Deadlines

```bash
# Test various deadline formats
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"test@company.com","subject":"Test","body":"I will complete the audit by next Monday","userId":"user456"}'

curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"test@company.com","subject":"Test","body":"Will provide updates by EOD tomorrow","userId":"user456"}'

curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"test@company.com","subject":"Test","body":"Plan to send files by next week","userId":"user456"}'
```

- [ ] **Step 4.1** - Run all 3 commands above
- [ ] **Step 4.1 Verify** - All created successfully (success=true for each)

### Test 4.2: Non-Commitment Emails

```bash
# Email WITHOUT commitment
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"test@company.com","subject":"FYI","body":"The project is going well, thanks for asking!","userId":"user789"}'
```

**Expected:** `commitmentDetected: false`

- [ ] **Step 4.2** - Run command above
- [ ] **Step 4.2 Verify** - commitmentDetected = false (correct behavior)

### Test 4.3: Completion Phrases

```bash
# Create a task first
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"test@company.com","subject":"Task","body":"I will prepare the agenda by Thursday","userId":"user999"}'

# Now complete it
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"test@company.com","subject":"RE: Task","body":"Here is the complete agenda as requested","userId":"user999"}'
```

- [ ] **Step 4.3a** - First curl creates task
- [ ] **Step 4.3b** - Second curl detects completion
- [ ] **Step 4.3 Verify** - Second response has tasksCompleted with the agenda task

---

## Phase 5: Error Handling (5 minutes)

### Test 5.1: Invalid User ID

```bash
curl http://localhost:3001/api/commitments//reminders
```

**Expected:** Error message (graceful failure)

- [ ] **Step 5.1 Verify** - Got error response (not 500)

### Test 5.2: Missing Required Fields

```bash
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"test@company.com"}'
```

**Expected:** Validation error

- [ ] **Step 5.2 Verify** - Got validation error (missing userId, body, etc.)

### Test 5.3: Malformed JSON

```bash
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"test@company.com"'
```

**Expected:** JSON parse error

- [ ] **Step 5.3 Verify** - Got error message

---

## Phase 6: Console Logging (5 minutes)

### Test 6.1: Verify Console Output

When you run Test 2.2 (Create Commitment), check your server console:

**Expected console output:**
```
[Commitment Tracker] Processing email from test@company.com
[Commitment Tracker] ✅ Commitment detected: "I will send the report by Friday"
[Commitment Tracker] ✅ Task created: Send report by Friday
[Commitment Tracker] Task saved to database
```

- [ ] **Step 6.1** - Create task and check console
- [ ] **Step 6.1 Verify** - See log messages above

### Test 6.2: Verify Reminder Generation

```bash
# Create task with tomorrow deadline
curl -X POST http://localhost:3001/api/commitments/process \
  -H "Content-Type: application/json" \
  -d '{"sender":"test@company.com","subject":"Urgent","body":"I will send files by EOD","userId":"remind-user"}'

# Check reminders
curl http://localhost:3001/api/commitments/remind-user/reminders
```

**Expected console output:**
```
[Reminder Generator] Checking 1 tasks for user remind-user
[Reminder Generator] Task "Send files" - deadline in 24 hours
[Reminder Generator] 🔔 Generated REMINDER: Send files - DUE TODAY!
```

- [ ] **Step 6.2** - Check console for reminder logs

---

## Summary Checklist

### Integration ✅
- [ ] Routes added to server.js
- [ ] Server restarted
- [ ] No errors on startup

### API Tests ✅
- [ ] Test 2.1 - Endpoints available
- [ ] Test 2.2 - Create commitment works
- [ ] Test 2.3 - Get reminders works
- [ ] Test 2.4 - Completion matching works

### Database ✅
- [ ] Tasks stored in MongoDB
- [ ] Tasks retrievable with correct userId
- [ ] Task schema matches expected format

### Feature Tests ✅
- [ ] Multiple deadline formats work
- [ ] Non-commitments handled correctly
- [ ] Completion detection works
- [ ] Error handling is graceful

### Logging ✅
- [ ] Console shows expected messages
- [ ] No unexplained errors in console

---

## Status Report

**Total Tests:** 15
**Passing:** _____ / 15

| Phase | Status | Notes |
|-------|--------|-------|
| Integration | ⬜ | |
| Validation | ⬜ | |
| Database | ⬜ | |
| Features | ⬜ | |
| Errors | ⬜ | |
| Logging | ⬜ | |

---

## Troubleshooting

### Issue: "Cannot find module" error
**Solution:** 
1. Check file path in require() statement
2. Ensure commitmentRoutes.js exists in routes/ folder
3. Check spell ng: `require('./routes/commitmentRoutes')`

### Issue: Routes not working (404)
**Solution:**
1. Restart server (not just save, but full restart)
2. Check console for "Routes loaded" message
3. Verify app.use() call is placed correctly (after app definition)

### Issue: Tasks not appearing in reminders
**Solution:**
1. Check deadline extraction - verify deadline is Date object
2. Check status is "pending" (not "completed")
3. Verify user ID matches between creation and query

### Issue: Completion not matching
**Solution:**
1. Lower similarity threshold in code (currently 0.4)
2. Add more completion keywords if needed
3. Check task object words are in email

---

## Next Steps After Validation

Once all tests pass:

1. **Integration with email pipeline**
   - Add commitment processing to incoming email handler
   - Test with real emails

2. **Frontend display**
   - Create reminders dashboard
   - Show pending/overdue tasks
   - Add completion button

3. **Database optimization**
   - Add indexes for faster queries
   - Archive completed tasks

4. **Notifications**
   - Email reminders for overdue tasks
   - Dashboard alerts

---

**Generated:** Date: ___________
**Completed By:** _______________
**Status:** ⬜ Not Started | 🔄 In Progress | ✅ Complete
