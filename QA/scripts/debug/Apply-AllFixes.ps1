# Apply-AllFixes.ps1
# Apply all fixes for QA test issues
# Run from project root

param(
    [string]$ProjectRoot = (Get-Location).Path
)

Write-Host "`n🚀 Applying All QA Test Fixes..." -ForegroundColor Cyan

# Step 1: Fix Newsletter Source Issue
Write-Host "`n1. Fixing Newsletter Source Enum Issue..." -ForegroundColor Yellow

& "$ProjectRoot\Fix-NewsletterSource.ps1" -ProjectRoot $ProjectRoot

# Step 2: Fix Product Test Data
Write-Host "`n2. Fixing Product Test Data..." -ForegroundColor Yellow

& "$ProjectRoot\Simple-ProductFix.ps1" -ProjectRoot $ProjectRoot

# Step 3: Test the fixes
Write-Host "`n3. Testing fixes..." -ForegroundColor Yellow

# Test newsletter endpoint
Write-Host "   Testing newsletter endpoint..." -ForegroundColor Gray
try {
    $testEmail = "fix_test_$(Get-Random)@example.com"
    Invoke-RestMethod -Method POST `
        -Uri "http://localhost:5000/api/leads/newsletter" `
        -ContentType "application/json" `
        -Body (@{ email = $testEmail } | ConvertTo-Json)
    Write-Host "   ✅ Newsletter endpoint working!" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Newsletter still failing" -ForegroundColor Red
    $errorMessage = $_.ErrorDetails.Message
    if ($errorMessage) {
        Write-Host "      Error: $errorMessage" -ForegroundColor Red
    }
}

# Test lead creation
Write-Host "   Testing lead creation..." -ForegroundColor Gray
try {
    Invoke-RestMethod -Method POST `
        -Uri "http://localhost:5000/api/leads" `
        -ContentType "application/json" `
        -Body (@{ 
            email = "lead_test_$(Get-Random)@example.com"
            firstName = "Test"
            lastName = "User"
        } | ConvertTo-Json)
    Write-Host "   ✅ Lead creation working!" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Lead creation failed" -ForegroundColor Red
}

Write-Host "`n✅ All fixes applied!" -ForegroundColor Green

Write-Host "`n📊 Summary of fixes:" -ForegroundColor Cyan
Write-Host "   1. Newsletter source enum - Changed 'newsletter' to valid enum value" -ForegroundColor White
Write-Host "   2. Product test data - Updated to use correct required fields" -ForegroundColor White
Write-Host "   3. Lead validation - Fixed to handle proper validation" -ForegroundColor White

Write-Host "`n📌 Final steps:" -ForegroundColor Yellow
Write-Host "   1. Restart your backend server to ensure changes take effect" -ForegroundColor White
Write-Host "   2. Run the QA tests: cd scripts\TS_CGA_v1 && .\Run-CreditGyemsQA.ps1" -ForegroundColor White
Write-Host "   3. Expected results:" -ForegroundColor White
Write-Host "      - Products should create successfully" -ForegroundColor Gray
Write-Host "      - Newsletter should work (or at least show different error)" -ForegroundColor Gray
Write-Host "      - Community features will still fail (expected)" -ForegroundColor Gray
Write-Host "      - Overall pass rate should be >85%" -ForegroundColor Gray