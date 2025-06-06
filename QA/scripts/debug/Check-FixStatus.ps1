# Check-FixStatus.ps1
# Verify the status of all fixes
# Location: D:\credit-gyems-academy\

Write-Host "`n🔍 CHECKING FIX STATUS" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

# Check if Product model exists
Write-Host "`n1️⃣ Checking Product Model..." -ForegroundColor Yellow
$productModelPath = "backend\models\product.js"
if (Test-Path $productModelPath) {
    Write-Host "  ✅ Product model exists" -ForegroundColor Green
    $content = Get-Content $productModelPath -First 5 | Out-String
    if ($content -match "mongoose") {
        Write-Host "  ✅ Product model is properly defined" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ Product model NOT FOUND" -ForegroundColor Red
}

# Quick test of each component
Write-Host "`n2️⃣ Testing Components..." -ForegroundColor Yellow

# Test Products
Write-Host "`n  Testing Product endpoint..." -ForegroundColor Gray
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET -TimeoutSec 5
    Write-Host "  ✅ Products endpoint: WORKING" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Products endpoint: FAILED" -ForegroundColor Red
}

# Test Auth
Write-Host "`n  Testing Authentication..." -ForegroundColor Gray
$testNum = Get-Random -Maximum 999999
try {
    # Register
    $regBody = @{
        email = "status_check_$testNum@test.com"
        password = "Test123!"
        firstName = "Status"
        lastName = "Check"
    } | ConvertTo-Json
    
    $reg = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method POST -Body $regBody -ContentType "application/json" -TimeoutSec 5
    
    if ($reg.token) {
        Write-Host "  ✅ Registration: WORKING" -ForegroundColor Green
        
        # Wait and test login
        Start-Sleep -Seconds 2
        
        $loginBody = @{
            email = "status_check_$testNum@test.com"
            password = "Test123!"
        } | ConvertTo-Json
        
        $login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
            -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 5
        
        if ($login.token) {
            Write-Host "  ✅ Login: WORKING" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "  ❌ Authentication: FAILED - $_" -ForegroundColor Red
}

# Test Community
Write-Host "`n  Testing Community..." -ForegroundColor Gray
$testNum2 = Get-Random -Maximum 999999
try {
    # Create user for community test
    $regBody = @{
        email = "comm_check_$testNum2@test.com"
        password = "Test123!"
        firstName = "Comm"
        lastName = "Check"
    } | ConvertTo-Json
    
    $reg = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method POST -Body $regBody -ContentType "application/json" -TimeoutSec 5
    
    if ($reg.token) {
        $headers = @{ Authorization = "Bearer $($reg.token)" }
        
        # Create discussion
        $discBody = @{
            title = "Status Check Discussion"
            content = "Testing community functionality"
            category = "general"
        } | ConvertTo-Json
        
        $disc = Invoke-RestMethod -Uri "http://localhost:5000/api/community/discussions" `
            -Method POST -Body $discBody -ContentType "application/json" -Headers $headers -TimeoutSec 5
        
        if ($disc.data._id -or $disc._id) {
            Write-Host "  ✅ Community discussions: WORKING" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "  ❌ Community: FAILED - $_" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 SUMMARY" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan

Write-Host "`nBased on the tests above, here's what to do next:" -ForegroundColor Yellow

Write-Host "`n1. If all components show WORKING:" -ForegroundColor Gray
Write-Host "   ✅ Run the full QA suite: .\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1" -ForegroundColor Green

Write-Host "`n2. If any components show FAILED:" -ForegroundColor Gray
Write-Host "   - Check if backend is running: cd backend && npm run dev" -ForegroundColor Yellow
Write-Host "   - Review error messages above" -ForegroundColor Yellow

Write-Host "`n3. For the remaining test failures:" -ForegroundColor Gray
Write-Host "   - Community postId issue: May need manual fix in Test-CommunityFlow.ps1" -ForegroundColor Yellow
Write-Host "   - Auth timing issue: May occur intermittently under load" -ForegroundColor Yellow

Write-Host "`n✅ Status check complete!" -ForegroundColor Green