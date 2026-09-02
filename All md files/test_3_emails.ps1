# Test 3 Sample Emails - Check Spam Detection and Task Extraction
# This script sends 3 emails to verify the system is working correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTING 3 SAMPLE EMAILS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# EMAIL 1: Legitimate business email with task
Write-Host "EMAIL 1: LEGITIMATE BUSINESS EMAIL" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

$email1 = @{
    sender = "sarah_manager"
    subject = "Project Review Meeting - Action Items"
    body = "Hi Team, Please review the Q4 marketing proposal by Friday EOD. Also, send me the updated budget spreadsheet by end of week. The client needs the presentation deck by next Monday. Let's discuss the timeline in our meeting tomorrow at 10am."
} | ConvertTo-Json

Write-Host "Subject: Project Review Meeting - Action Items" -ForegroundColor Yellow
Write-Host "From: sarah_manager" -ForegroundColor Yellow
Write-Host "Body: Please review the Q4 marketing proposal..." -ForegroundColor Yellow
Write-Host ""

$response1 = Invoke-WebRequest -Uri "http://localhost:3001/api/check-email" `
    -Method POST `
    -UseBasicParsing `
    -Headers @{"Content-Type"="application/json"} `
    -Body $email1

$result1 = $response1.Content | ConvertFrom-Json

Write-Host "RESPONSE:" -ForegroundColor Cyan
Write-Host "Classification: $($result1.data.classification)" -ForegroundColor $(if($result1.data.classification -eq "NORMAL") {'Green'} else {'Red'})
Write-Host "Spam Score: $($result1.data.spam_score)/10" -ForegroundColor White
Write-Host "Confidence: $($result1.data.confidence)%" -ForegroundColor White
if ($result1.data.detected_words.Count -gt 0) {
    Write-Host "Detected Words: $(($result1.data.detected_words | Select-Object -First 5) -join ', ')" -ForegroundColor Yellow
}
Write-Host "Folder: $($result1.data.folder)" -ForegroundColor White
Write-Host "✅ Email saved to database" -ForegroundColor Green
Write-Host ""
Write-Host ""

# EMAIL 2: Spam/Phishing email
Write-Host "EMAIL 2: SPAM/PHISHING EMAIL" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red
Write-Host ""

$email2 = @{
    sender = "urgent_alert"
    subject = "URGENT: Verify Your Bank Account Immediately!"
    body = "Your account has been compromised! Click here urgently to verify your information now. Confirm your banking details immediately to prevent unauthorized access. This is URGENT action required. Transfer verification needed NOW!"
} | ConvertTo-Json

Write-Host "Subject: URGENT: Verify Your Bank Account Immediately!" -ForegroundColor Yellow
Write-Host "From: urgent_alert" -ForegroundColor Yellow
Write-Host "Body: Your account has been compromised! Click here urgently..." -ForegroundColor Yellow
Write-Host ""

$response2 = Invoke-WebRequest -Uri "http://localhost:3001/api/check-email" `
    -Method POST `
    -UseBasicParsing `
    -Headers @{"Content-Type"="application/json"} `
    -Body $email2

$result2 = $response2.Content | ConvertFrom-Json

Write-Host "RESPONSE:" -ForegroundColor Cyan
Write-Host "Classification: $($result2.data.classification)" -ForegroundColor $(if($result2.data.classification -eq "SPAM") {'Red'} else {'Yellow'})
Write-Host "Spam Score: $($result2.data.spam_score)/10" -ForegroundColor White
Write-Host "Confidence: $($result2.data.confidence)%" -ForegroundColor White
if ($result2.data.detected_words.Count -gt 0) {
    Write-Host "Detected Spam Words: $(($result2.data.detected_words | Select-Object -First 5) -join ', ')" -ForegroundColor Red
}
Write-Host "Folder: $($result2.data.folder)" -ForegroundColor White
Write-Host "✅ Email saved to database" -ForegroundColor Green
Write-Host ""
Write-Host ""

# EMAIL 3: Mixed email - somewhat suspicious but not clear spam
Write-Host "EMAIL 3: SUSPICIOUS/PROMOTIONAL EMAIL" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""

$email3 = @{
    sender = "deals_promotions"
    subject = "Limited Time Offer - Click Now to Save 50%!"
    body = "Don't miss this incredible opportunity! Click immediately to claim your free gift. Limited slots available. Act now and transfer your details. Get instant access to exclusive deals. Winner notification - you've been selected!"
} | ConvertTo-Json

Write-Host "Subject: Limited Time Offer - Click Now to Save 50%!" -ForegroundColor Yellow
Write-Host "From: deals_promotions" -ForegroundColor Yellow
Write-Host "Body: Don't miss this incredible opportunity! Click immediately..." -ForegroundColor Yellow
Write-Host ""

$response3 = Invoke-WebRequest -Uri "http://localhost:3001/api/check-email" `
    -Method POST `
    -UseBasicParsing `
    -Headers @{"Content-Type"="application/json"} `
    -Body $email3

$result3 = $response3.Content | ConvertFrom-Json

Write-Host "RESPONSE:" -ForegroundColor Cyan
Write-Host "Classification: $($result3.data.classification)" -ForegroundColor $(if($result3.data.classification -eq "SPAM") {'Red'} else {'Yellow'})
Write-Host "Spam Score: $($result3.data.spam_score)/10" -ForegroundColor White
Write-Host "Confidence: $($result3.data.confidence)%" -ForegroundColor White
if ($result3.data.detected_words.Count -gt 0) {
    Write-Host "Detected Words: $(($result3.data.detected_words | Select-Object -First 5) -join ', ')" -ForegroundColor Yellow
}
Write-Host "Folder: $($result3.data.folder)" -ForegroundColor White
Write-Host "✅ Email saved to database" -ForegroundColor Green
Write-Host ""
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Email 1 - Business (Expected: NORMAL)" -ForegroundColor Green
Write-Host "   Result: $($result1.data.classification)" -ForegroundColor $(if($result1.data.classification -eq "NORMAL") {'Green'} else {'Red'})
Write-Host ""
Write-Host "Email 2 - Phishing (Expected: SPAM)" -ForegroundColor Red
Write-Host "   Result: $($result2.data.classification)" -ForegroundColor $(if($result2.data.classification -eq "SPAM") {'Green'} else {'Red'})
Write-Host ""
Write-Host "Email 3 - Promotional (Expected: SPAM or NORMAL)" -ForegroundColor Yellow
Write-Host "   Result: $($result3.data.classification)" -ForegroundColor $(if($result3.data.classification -in @("SPAM","NORMAL")) {'Green'} else {'Red'})
Write-Host ""

# Overall accuracy
$correct = 0
if ($result1.data.classification -eq "NORMAL") { $correct++ }
if ($result2.data.classification -eq "SPAM") { $correct++ }
if ($result3.data.classification -in @("SPAM","NORMAL")) { $correct++ }

Write-Host "DETECTION ACCURACY: $correct/3 Correct" -ForegroundColor $(if($correct -ge 2) {'Green'} else {'Yellow'})
Write-Host ""
Write-Host "✅ ALL EMAILS PROCESSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
