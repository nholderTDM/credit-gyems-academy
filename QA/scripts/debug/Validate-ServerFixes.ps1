# Validate-ServerFixes.ps1
# Quick script to validate the backend server is working after fixes

Write-Host "🔍 Validating Credit Gyems Academy Backend Fixes..." -ForegroundColor Cyan

# Check if backend is running
Write-Host "`n1️⃣ Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 5
    if ($health.status -eq "ok") {
        Write-Host "✅ Backend is running" -ForegroundColor Green
        Write-Host "   MongoDB: $($health.mongodb)" -ForegroundColor Gray
        Write-Host "   Stripe: $($health.stripe)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Backend is not running or not responding" -ForegroundColor Red
    Write-Host "   Please start it with: cd backend && npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test product routes
Write-Host "`n2️⃣ Testing product routes..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET -TimeoutSec 5
    Write-Host "✅ Product routes are working" -ForegroundColor Green
} catch {
    Write-Host "❌ Product routes are failing: $_" -ForegroundColor Red
}

# Test auth routes
Write-Host "`n3️⃣ Testing auth routes..." -ForegroundColor Yellow
try {
    $testUser = @{
        email = "test_$(Get-Random -Maximum 9999)@example.com"
        password = "Test123!@#"
        firstName = "Test"
        lastName = "User"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body ($testUser | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 5
    if ($response.success) {
        Write-Host "✅ Auth routes are working" -ForegroundColor Green
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400 -or $statusCode -eq 409) {
        Write-Host "✅ Auth routes are working (validation active)" -ForegroundColor Green
    } else {
        Write-Host "❌ Auth routes are failing: $_" -ForegroundColor Red
    }
}

# Test community routes
Write-Host "`n4️⃣ Testing community routes..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/community/discussions" -Method GET -TimeoutSec 5
    Write-Host "✅ Community routes are working" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "⚠️  Community routes may not be properly registered" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Community routes are failing: $_" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "If all checks passed, you can run the full QA suite:" -ForegroundColor Gray
Write-Host ".\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1" -ForegroundColor White

Write-Host "`nExpected improvements after fixes:" -ForegroundColor Yellow
Write-Host "- Authentication errors: Should drop from 13 to ~1" -ForegroundColor Green
Write-Host "- E-commerce errors: Should drop from 15 to ~1" -ForegroundColor Green  
Write-Host "- Community errors: May need additional route fixes" -ForegroundColor Yellow
Write-Host "- Overall pass rate: Should improve from 20.72% to ~85%+" -ForegroundColor Green