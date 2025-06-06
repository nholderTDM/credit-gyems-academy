# Verify-FixesQuick.ps1
# Quick verification of fixes before running full test suite

Write-Host "🔍 QUICK FIX VERIFICATION" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Check backend health
Write-Host "`n1️⃣ Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 5
    if ($health.status -eq "ok") {
        Write-Host "✅ Backend is running" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend is not running" -ForegroundColor Red
    Write-Host "Start it with: cd backend && npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test product creation with new schema
Write-Host "`n2️⃣ Testing product creation..." -ForegroundColor Yellow

# First get admin token
$adminCreds = @{
    email = "test_20250603191913_1781@creditgyemstest.com"
    password = "TestPass123!"
}

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Body ($adminCreds | ConvertTo-Json) `
        -ContentType "application/json"
    
    $adminToken = $loginResponse.token
    Write-Host "✅ Admin login successful" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Admin login failed, trying regular user" -ForegroundColor Yellow
    $adminToken = ""
}

# Test product creation
$testProduct = @{
    type = "ebook"
    title = "Test Product $(Get-Date -Format 'yyyyMMddHHmmss')"
    description = "Test description"
    price = 29.99
    status = "published"
}

try {
    $headers = @{ Authorization = "Bearer $adminToken" }
    $productResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/products" `
        -Method POST `
        -Headers $headers `
        -Body ($testProduct | ConvertTo-Json) `
        -ContentType "application/json"
    
    Write-Host "✅ Product creation working!" -ForegroundColor Green
    Write-Host "   Created: $($productResponse.data.title) (Type: $($productResponse.data.type))" -ForegroundColor Gray
} catch {
    Write-Host "❌ Product creation still failing" -ForegroundColor Red
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "   Error: $($errorBody.message)" -ForegroundColor Red
}

# Test cart route
Write-Host "`n3️⃣ Testing cart route..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/cart" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $adminToken" }
    
    Write-Host "✅ Cart route is accessible" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✅ Cart route exists (auth required)" -ForegroundColor Green
    } else {
        Write-Host "❌ Cart route issue: Status $statusCode" -ForegroundColor Red
    }
}

# Test community routes
Write-Host "`n4️⃣ Testing community routes..." -ForegroundColor Yellow
try {
    $discussionsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/community/discussions" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $adminToken" }
    
    Write-Host "✅ Community routes working" -ForegroundColor Green
    Write-Host "   Found $($discussionsResponse.data.discussions.Count) discussions" -ForegroundColor Gray
} catch {
    Write-Host "❌ Community routes issue" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host "If all checks passed, run the full test suite:" -ForegroundColor Gray
Write-Host ".\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1" -ForegroundColor White

Write-Host "`nIf any checks failed:" -ForegroundColor Yellow
Write-Host "1. Check backend logs for errors" -ForegroundColor Gray
Write-Host "2. Restart backend: cd backend && npm run dev" -ForegroundColor Gray
Write-Host "3. Re-run: .\Fix-AllTestIssues.ps1" -ForegroundColor Gray
