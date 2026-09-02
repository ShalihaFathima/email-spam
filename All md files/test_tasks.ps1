# Test Commitments/Tasks API
# Two examples to verify the task tracker is working

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "TESTING COMMITMENTS/TASKS API" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Example 1: CREATE TASK
Write-Host "EXAMPLE 1: CREATE NEW TASK" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

$task1 = @{
    taskId = "task_review_001"
    userId = "manager_john"
    action = "Review"
    object = "Q4 Financial Report"
    deadline = "2024-04-30"
} | ConvertTo-Json

Write-Host "REQUEST: POST /api/tasks" -ForegroundColor Yellow
Write-Host "Body: $task1"
Write-Host ""
Write-Host "RESPONSE:" -ForegroundColor Yellow

$response1 = Invoke-WebRequest -Uri "http://localhost:3001/api/tasks" `
    -Method POST `
    -UseBasicParsing `
    -Headers @{"Content-Type"="application/json"} `
    -Body $task1

$result1 = $response1.Content | ConvertFrom-Json
$result1 | ConvertTo-Json -Depth 3

Write-Host ""
Write-Host "STATUS: $(if($result1.success) {'✅ SUCCESS'} else {'❌ FAILED'})" -ForegroundColor $(if($result1.success) {'Green'} else {'Red'})
if ($result1.success) {
    Write-Host "Task created with ID: $($result1.task._id)" -ForegroundColor Green
    Write-Host "Status: $($result1.task.status)" -ForegroundColor Green
    Write-Host "Deadline: $($result1.task.deadline)" -ForegroundColor Green
}
Write-Host ""
Write-Host ""

# Example 2: GET TASKS OVERVIEW
Write-Host "EXAMPLE 2: GET USER TASKS OVERVIEW" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

Write-Host "REQUEST: GET /api/tasks/manager_john/overview" -ForegroundColor Yellow
Write-Host ""
Write-Host "RESPONSE:" -ForegroundColor Yellow

$response2 = Invoke-WebRequest -Uri "http://localhost:3001/api/tasks/manager_john/overview" `
    -Method GET `
    -UseBasicParsing

$result2 = $response2.Content | ConvertFrom-Json
$result2 | ConvertTo-Json -Depth 3

Write-Host ""
Write-Host "STATUS: $(if($result2.success) {'✅ SUCCESS'} else {'❌ FAILED'})" -ForegroundColor $(if($result2.success) {'Green'} else {'Red'})
if ($result2.success) {
    Write-Host "Total Tasks: $($result2.stats.totalTasks)" -ForegroundColor Green
    Write-Host "Pending: $($result2.stats.pendingCount)" -ForegroundColor Green
    Write-Host "Completed: $($result2.stats.completedCount)" -ForegroundColor Green
    Write-Host "Completion Rate: $($result2.stats.completionRate)" -ForegroundColor Green
}
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ TEST COMPLETE!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
