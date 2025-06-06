# Run-QA-Now.ps1
# Quick launcher for the QA test suite
# Location: D:\credit-gyems-academy\

Write-Host "`n🚀 RUNNING FULL QA TEST SUITE" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Quick server check
Write-Host "`nChecking server status..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 2
    if ($health.status -eq "ok") {
        Write-Host "✅ Backend server is running" -ForegroundColor Green
        Write-Host "✅ MongoDB: $($health.mongodb)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend server is not running!" -ForegroundColor Red
    Write-Host "Please start it with: cd backend && npm run dev" -ForegroundColor Yellow
    return
}

# Show what we fixed
Write-Host "`n✅ Recent fixes applied:" -ForegroundColor Green
Write-Host "  - Created Product model (fixes 7 e-commerce tests)" -ForegroundColor Gray
Write-Host "  - Fixed Discussion model enum (success_stories)" -ForegroundColor Gray
Write-Host "  - Added timing delays for authentication" -ForegroundColor Gray

# Launch the QA suite
Write-Host "`n🧪 Starting QA tests..." -ForegroundColor Cyan
Write-Host "This will take about 1-2 minutes" -ForegroundColor Gray
Write-Host "" # Empty line before test output

# Run the test suite
& ".\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1"

# Note about expected results
Write-Host "`n💡 Expected results:" -ForegroundColor Yellow
Write-Host "  - Should see ~149 tests total" -ForegroundColor Gray
Write-Host "  - Target: 100% pass rate (or very close)" -ForegroundColor Gray
Write-Host "  - If you still see failures:" -ForegroundColor Gray
Write-Host "    * Community postId errors need manual fix" -ForegroundColor Gray
Write-Host "    * Auth timing errors may occur under load" -ForegroundColor Gray