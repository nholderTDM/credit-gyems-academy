# Verify-QAFixes.ps1
# Verifies that all QA fixes have been applied correctly

Write-Host "🔍 VERIFYING QA FIXES" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

$issues = 0

# Check 1: MongoDB pool configuration
Write-Host "`n1️⃣ Checking MongoDB pool configuration..." -ForegroundColor Yellow
if (Test-Path "backend\fix-mongo-pool.js") {
    Write-Host "✅ MongoDB pool configuration exists" -ForegroundColor Green
    
    # Check if it's imported in server.js
    $serverContent = Get-Content "backend\server.js" -Raw
    if ($serverContent -match "require\('./fix-mongo-pool'\)") {
        Write-Host "✅ MongoDB pool configuration is imported" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB pool configuration not imported in server.js" -ForegroundColor Yellow
        Write-Host "   Add this line after dotenv.config():" -ForegroundColor Gray
        Write-Host "   const mongoOptions = require('./fix-mongo-pool');" -ForegroundColor Gray
        $issues++
    }
} else {
    Write-Host "❌ MongoDB pool configuration missing" -ForegroundColor Red
    $issues++
}

# Check 2: Community Forum Tests
Write-Host "`n2️⃣ Checking Community Forum tests..." -ForegroundColor Yellow
$communityTestPath = "scripts\TS_CGA_v1\Test-CommunityFlow.ps1"
if (Test-Path $communityTestPath) {
    $content = Get-Content $communityTestPath -Raw
    if ($content.Length -gt 100 -and $content -match "COMMUNITY FORUM TESTS") {
        Write-Host "✅ Community Forum tests are complete" -ForegroundColor Green
        
        # Count test steps
        $testSteps = ([regex]::Matches($content, 'Write-TestStep')).Count
        Write-Host "   Found $testSteps test steps" -ForegroundColor Gray
    } else {
        Write-Host "❌ Community Forum tests file is empty or incomplete" -ForegroundColor Red
        $issues++
    }
} else {
    Write-Host "❌ Community Forum tests file missing" -ForegroundColor Red
    $issues++
}

# Check 3: Generate-TestReport.ps1
Write-Host "`n3️⃣ Checking Generate-TestReport.ps1..." -ForegroundColor Yellow
$reportPath = "scripts\TS_CGA_v1\Generate-TestReport.ps1"
if (Test-Path $reportPath) {
    $content = Get-Content $reportPath -Raw
    
    # Check if Get-FixSuggestion is defined before use
    $functionDefPos = $content.IndexOf('function Get-FixSuggestion')
    $functionUsePos = $content.IndexOf('Get-FixSuggestion -Message')
    
    if ($functionDefPos -gt 0 -and $functionDefPos -lt $functionUsePos) {
        Write-Host "✅ Get-FixSuggestion function is properly ordered" -ForegroundColor Green
    } else {
        Write-Host "❌ Get-FixSuggestion function order issue" -ForegroundColor Red
        $issues++
    }
} else {
    Write-Host "❌ Generate-TestReport.ps1 missing" -ForegroundColor Red
    $issues++
}

# Check 4: Test-ErrorScenarios.ps1
Write-Host "`n4️⃣ Checking order test expectation..." -ForegroundColor Yellow
$errorTestPath = "scripts\TS_CGA_v1\Test-ErrorScenarios.ps1"
if (Test-Path $errorTestPath) {
    $content = Get-Content $errorTestPath -Raw
    
    # Check if fake-order is in auth array (expecting 401)
    if ($content -match '\$authRequiredEndpoints.*fake-order|fake-order.*ExpectedStatus.*401') {
        Write-Host "✅ Order test expects 401 (correct)" -ForegroundColor Green
    } else {
        Write-Host "❌ Order test not properly configured for 401" -ForegroundColor Red
        $issues++
    }
} else {
    Write-Host "❌ Test-ErrorScenarios.ps1 missing" -ForegroundColor Red
    $issues++
}
Write-Host "`n5️⃣ Checking backend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    $health = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Backend server is running" -ForegroundColor Green
    Write-Host "   MongoDB: $($health.mongodb)" -ForegroundColor Gray
    Write-Host "   Stripe: $($health.stripe)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Backend server not responding" -ForegroundColor Yellow
    Write-Host "   Run: .\Restart-Backend.ps1" -ForegroundColor Gray
}

# Summary
Write-Host "`n📊 VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

if ($issues -eq 0) {
    Write-Host "✅ All fixes are properly applied!" -ForegroundColor Green
    Write-Host "`nYou can now run the full test suite:" -ForegroundColor White
    Write-Host ".\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Found $issues issues that need attention" -ForegroundColor Yellow
    Write-Host "`nRun the fix script again:" -ForegroundColor White
    Write-Host ".\Fix-AllQAIssues.ps1" -ForegroundColor Cyan
}

# Quick test to verify fixes work
Write-Host "`n🧪 Running quick verification test..." -ForegroundColor Yellow

$testResult = & {
    $ErrorActionPreference = 'SilentlyContinue'
    
    # Test 1: Can we create a user?
    $testEmail = "verify_$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/auth/register" `
        -ContentType "application/json" `
        -Body (@{
            email = $testEmail
            password = "Test123!"
            firstName = "Verify"
            lastName = "Test"
        } | ConvertTo-Json) -ErrorAction SilentlyContinue
    
    if ($response.success) {
        Write-Host "  ✅ User registration working" -ForegroundColor Green
        
        # Test 2: Can we login?
        $loginResponse = Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/auth/login" `
            -ContentType "application/json" `
            -Body (@{
                email = $testEmail
                password = "Test123!"
            } | ConvertTo-Json) -ErrorAction SilentlyContinue
        
        if ($loginResponse.success) {
            Write-Host "  ✅ User login working" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ❌ Login failed" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "  ❌ Registration failed" -ForegroundColor Red
        return $false
    }
}

if ($testResult) {
    Write-Host "`n🎉 Basic functionality verified! Ready for full test suite." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Basic functionality issues detected. Check server logs." -ForegroundColor Yellow
}

