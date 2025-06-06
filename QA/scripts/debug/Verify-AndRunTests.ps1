# Verify-AndRunTests.ps1
# Quick verification before running full test suite

Write-Host "🔍 VERIFYING TEST SETUP" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

# Check that the files are in place
Write-Host "`n1️⃣ Checking test files..." -ForegroundColor Yellow

$testFiles = @(
    @{
        Path = "scripts\TS_CGA_v1\Setup-TestData.ps1"
        ShouldContain = "Start-Sleep -Milliseconds 500  # Prevent connection overload"
    },
    @{
        Path = "scripts\TS_CGA_v1\Test-EcommerceFlow.ps1"
        ShouldContain = "Write-TestStep 10"
    }
)

$allGood = $true
foreach ($file in $testFiles) {
    if (Test-Path $file.Path) {
        $content = Get-Content $file.Path -Raw
        if ($content -match [regex]::Escape($file.ShouldContain)) {
            Write-Host "  ✅ $($file.Path) - Updated version found" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $($file.Path) - May not be updated version" -ForegroundColor Yellow
            $allGood = $false
        }
    } else {
        Write-Host "  ❌ $($file.Path) - File not found!" -ForegroundColor Red
        $allGood = $false
    }
}

# Check backend status
Write-Host "`n2️⃣ Checking backend status..." -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 3
    if ($health.status -eq "ok") {
        Write-Host "  ✅ Backend is running" -ForegroundColor Green
        Write-Host "    MongoDB: $($health.mongodb)" -ForegroundColor Gray
        Write-Host "    Environment: $($health.environment)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ❌ Backend is not running!" -ForegroundColor Red
    Write-Host "  Please start it: cd backend && npm run dev" -ForegroundColor Yellow
    $allGood = $false
}

# Quick product check
Write-Host "`n3️⃣ Checking products..." -ForegroundColor Yellow

try {
    $products = Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET -TimeoutSec 3
    Write-Host "  ✅ Found $($products.data.Count) products in database" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Could not check products" -ForegroundColor Yellow
}

if ($allGood) {
    Write-Host "`n✅ EVERYTHING LOOKS GOOD!" -ForegroundColor Green
    Write-Host "`nReady to run full test suite:" -ForegroundColor Cyan
    Write-Host ".\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1" -ForegroundColor White
    
    Write-Host "`nExpected results:" -ForegroundColor Yellow
    Write-Host "- Total tests: ~155 (not 132)" -ForegroundColor Gray
    Write-Host "- Pass rate: 95%+" -ForegroundColor Gray
    Write-Host "- Only 1-2 expected failures" -ForegroundColor Gray
} else {
    Write-Host "`n⚠️  SOME ISSUES FOUND" -ForegroundColor Yellow
    Write-Host "Please address the issues above before running tests." -ForegroundColor Gray
}