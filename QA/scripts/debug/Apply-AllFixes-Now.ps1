# Apply-AllFixes-Now.ps1
# Applies all remaining fixes and starts the server

Write-Host "🚀 APPLYING ALL REMAINING FIXES" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Fix 1: Update MongoDB Pool Configuration
Write-Host "`n1️⃣ Updating MongoDB pool configuration..." -ForegroundColor Yellow

$mongoPoolContent = @'
// fix-mongo-pool.js
// MongoDB connection options compatible with all driver versions

const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: 'majority',
  // Add connection retry logic
  retryReads: true,
  readPreference: 'primaryPreferred',
  // Remove unsupported options: keepAlive, keepAliveInitialDelay
  heartbeatFrequencyMS: 10000
};

module.exports = mongoOptions;
'@

Set-Content -Path "backend\fix-mongo-pool.js" -Value $mongoPoolContent -Encoding UTF8
Write-Host "✅ Updated MongoDB pool configuration (removed unsupported options)" -ForegroundColor Green

# Fix 2: Apply Order Test Fix
Write-Host "`n2️⃣ Fixing order test..." -ForegroundColor Yellow
& .\Fix-OrderTest-Correct.ps1

# Fix 3: Kill existing processes
Write-Host "`n3️⃣ Stopping existing processes..." -ForegroundColor Yellow

# Kill Node processes on port 5000
$netstatOutput = netstat -ano | findstr :5000
if ($netstatOutput) {
    $netstatOutput | ForEach-Object {
        if ($_ -match '\s+(\d+)$') {
            $processId = $Matches[1]
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "  Killed process on port 5000: $processId" -ForegroundColor Green
            } catch {}
        }
    }
}

# Kill all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✅ Cleaned up processes" -ForegroundColor Green

Start-Sleep -Seconds 2

# Fix 4: Start Backend Server
Write-Host "`n4️⃣ Starting backend server..." -ForegroundColor Yellow

Push-Location backend

# Create a visible start script
$startScript = @'
@echo off
title Credit Gyems Backend Server
echo Starting Credit Gyems Academy Backend...
echo.
echo If you see MongoDB connection errors, check:
echo 1. MONGODB_URI in .env
echo 2. Internet connection
echo 3. MongoDB Atlas IP whitelist
echo.
npm start
pause
'@

$startScript | Out-File -FilePath "start-visible.bat" -Encoding ASCII

# Start in new window
$process = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c start-visible.bat" `
    -PassThru

Pop-Location

Write-Host "  Server starting in new window (PID: $($process.Id))..." -ForegroundColor Gray
Write-Host "  Waiting for server to be ready..." -ForegroundColor Yellow

# Wait for server
Start-Sleep -Seconds 5

$maxAttempts = 10
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts -and -not $serverReady) {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" `
            -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        $health = $response.Content | ConvertFrom-Json
        
        if ($health.status -eq "ok" -and $health.mongodb -eq "connected") {
            $serverReady = $true
            Write-Host "`n✅ SERVER IS READY!" -ForegroundColor Green
            Write-Host "   MongoDB: $($health.mongodb)" -ForegroundColor Green
            Write-Host "   Stripe: $($health.stripe)" -ForegroundColor Green
        }
    } catch {
        Write-Host "  Attempt $attempt/$maxAttempts - Waiting..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if ($serverReady) {
    Write-Host "`n✅ ALL FIXES APPLIED SUCCESSFULLY!" -ForegroundColor Green
    
    # Quick verification
    Write-Host "`n5️⃣ Running quick verification..." -ForegroundColor Yellow
    
    # Test registration
    $testEmail = "fix_test_$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
    try {
        $regResponse = Invoke-RestMethod -Method POST `
            -Uri "http://localhost:5000/api/auth/register" `
            -ContentType "application/json" `
            -Body (@{
                email = $testEmail
                password = "Test123!"
                firstName = "Fix"
                lastName = "Test"
            } | ConvertTo-Json) -ErrorAction Stop
        
        if ($regResponse.success) {
            Write-Host "✅ API is working correctly!" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  API test failed, but server is running" -ForegroundColor Yellow
    }
    
    Write-Host "`n📊 NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. Run verification: .\Verify-QAFixes.ps1" -ForegroundColor White
    Write-Host "2. Run full test suite: .\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1" -ForegroundColor White
    
} else {
    Write-Host "`n❌ Server failed to start properly" -ForegroundColor Red
    Write-Host "Check the server window for error messages" -ForegroundColor Yellow
    
    # Common troubleshooting
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check MongoDB connection string in backend\.env" -ForegroundColor Gray
    Write-Host "2. Ensure your IP is whitelisted in MongoDB Atlas" -ForegroundColor Gray
    Write-Host "3. Check if all npm dependencies are installed" -ForegroundColor Gray
    Write-Host "4. Look for syntax errors in the server window" -ForegroundColor Gray
}