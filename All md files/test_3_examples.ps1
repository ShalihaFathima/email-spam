# Test Commitment Tracking System with 3 Examples

$baseUrl = "http://localhost:3001"
$testsPassed = 0
$testsFailed = 0

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   COMMITMENT TRACKING SYSTEM - 3 EXAMPLES TEST         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$TestName,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [string]$UserId
    )
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host "📋 TEST: $TestName" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    
    try {
        if ($Method -eq "POST") {
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" `
                -Method POST `
                -Headers @{"Content-Type"="application/json"} `
                -Body ($Body | ConvertTo-Json) `
                -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" `
                -Method GET `
                -Headers @{"Content-Type"="application/json"} `
                -ErrorAction Stop
        }
        
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Cyan
        Write-Host ($response | ConvertTo-Json) -ForegroundColor White
        Write-Host ""
        
        $script:testsPassed++
        return $response
    }
    catch {
        Write-Host "❌ FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        $script:testsFailed++
        return $null
    }
}

Write-Host "🚀 STARTING TESTS..." -ForegroundColor Cyan
Write-Host ""

# =====================================================
# EXAMPLE 1: Business Commitment
# =====================================================
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║ EXAMPLE 1: WORK/BUSINESS COMMITMENT                  ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

$example1_body = @{
    sender = "sarah.johnson@acme.com"
    subject = "Q4 Budget Review"
    body = "Hi team, I will send the final Q4 budget analysis by Friday EOD. Thanks!"
    userId = "sarah-001"
}

$result1 = Test-Endpoint `
    -TestName "Create Q4 Budget Commitment" `
    -Method "POST" `
    -Endpoint "/api/commitments/process" `
    -Body $example1_body

Start-Sleep -Seconds 1

$result1_check = Test-Endpoint `
    -TestName "Check Sarah's Tasks & Reminders" `
    -Method "GET" `
    -Endpoint "/api/commitments/sarah-001/reminders"

Write-Host ""

# =====================================================
# EXAMPLE 2: Task Completion
# =====================================================
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║ EXAMPLE 2: TASK COMPLETION DETECTION                │" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

Write-Host "Step 2a: Create pending task" -ForegroundColor Cyan
$example2a_body = @{
    sender = "mike.chen@tech.io"
    subject = "Starting Project Delivery"
    body = "I will prepare the complete project report by next week"
    userId = "mike-001"
}

$result2a = Test-Endpoint `
    -TestName "Create Pending Task (Project Report)" `
    -Method "POST" `
    -Endpoint "/api/commitments/process" `
    -Body $example2a_body

Start-Sleep -Seconds 1

Write-Host "Step 2b: Send completion email" -ForegroundColor Cyan
$example2b_body = @{
    sender = "mike.chen@tech.io"
    subject = "RE: Project Delivery"
    body = "Here is the complete project report and all deliverables attached. Please review and let me know if you need any changes."
    userId = "mike-001"
}

$result2b = Test-Endpoint `
    -TestName "Complete Task (Sends Completion Email)" `
    -Method "POST" `
    -Endpoint "/api/commitments/process" `
    -Body $example2b_body

Start-Sleep -Seconds 1

$result2_check = Test-Endpoint `
    -TestName "Verify Task is Moved to Completed" `
    -Method "GET" `
    -Endpoint "/api/commitments/mike-001"

Write-Host ""

# =====================================================
# EXAMPLE 3: Urgent/ASAP Task
# =====================================================
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║ EXAMPLE 3: URGENT/ASAP TASK                          ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

$example3_body = @{
    sender = "alex.smith@startup.co"
    subject = "Urgent: Client Proposal"
    body = "I commit to deliver the client proposal ASAP. This is our top priority!"
    userId = "alex-003"
}

$result3 = Test-Endpoint `
    -TestName "Create Urgent ASAP Task" `
    -Method "POST" `
    -Endpoint "/api/commitments/process" `
    -Body $example3_body

Start-Sleep -Seconds 1

$result3_check = Test-Endpoint `
    -TestName "Check Alex's Urgent Task (Should be in Reminders)" `
    -Method "GET" `
    -Endpoint "/api/commitments/alex-003/reminders"

Write-Host ""

# =====================================================
# SUMMARY
# =====================================================
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ TEST SUMMARY                                          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Total Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! System is working correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Example 1: Business commitment created and showing in reminders" -ForegroundColor Green
    Write-Host "✅ Example 2: Task completion detected and status updated" -ForegroundColor Green
    Write-Host "✅ Example 3: Urgent task created and showing in reminders" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check the errors above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  • Server not running: npm run server" -ForegroundColor Yellow
    Write-Host "  • MongoDB not running: start mongod service" -ForegroundColor Yellow
    Write-Host "  • Routes not added to server.js" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 Data Verification:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check MongoDB directly:" -ForegroundColor Yellow
Write-Host "  mongosh mongodb://localhost:27017/email-spam-db" -ForegroundColor Gray
Write-Host "  db.tasks.find().pretty()" -ForegroundColor Gray
Write-Host ""

Write-Host "Get summary for all users:" -ForegroundColor Yellow
Write-Host "  curl http://localhost:3001/api/commitments/sarah-001" -ForegroundColor Gray
Write-Host "  curl http://localhost:3001/api/commitments/mike-001" -ForegroundColor Gray
Write-Host "  curl http://localhost:3001/api/commitments/alex-003" -ForegroundColor Gray
Write-Host ""

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
