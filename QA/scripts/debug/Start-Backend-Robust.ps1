# Start-Backend-Robust.ps1
# Robust backend server startup with error handling

Write-Host "🚀 STARTING BACKEND SERVER (ROBUST MODE)" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"

# Step 1: Kill existing processes
Write-Host "`n1️⃣ Cleaning up existing processes..." -ForegroundColor Yellow

# Kill Node processes on port 5000
$netstatOutput = netstat -ano | findstr :5000
if ($netstatOutput) {
    Write-Host "  Found process on port 5000, killing..." -ForegroundColor Yellow
    $netstatOutput | ForEach-Object {
        if ($_ -match '\s+(\d+)$') {
            $processId = $Matches[1]
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "  Killed process: $processId" -ForegroundColor Green
            } catch {
                Write-Host "  Could not kill process: $pid" -ForegroundColor Gray
            }
        }
    }
}

# Kill all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✅ Cleaned up processes" -ForegroundColor Green

Start-Sleep -Seconds 2

# Step 2: Check dependencies
Write-Host "`n2️⃣ Checking dependencies..." -ForegroundColor Yellow

Push-Location $backendPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check .env file
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file missing in backend!" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Verify critical env vars
$envContent = Get-Content ".env" -Raw
$requiredVars = @("MONGODB_URI", "JWT_SECRET", "PORT")
$missingVars = @()

foreach ($var in $requiredVars) {
    if ($envContent -notmatch "$var=") {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ Missing required environment variables:" -ForegroundColor Red
    $missingVars | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Pop-Location
    exit 1
}

Write-Host "✅ Dependencies checked" -ForegroundColor Green

# Step 3: Test MongoDB connection
Write-Host "`n3️⃣ Testing MongoDB connection..." -ForegroundColor Yellow

$testMongoScript = @'
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('SUCCESS: MongoDB connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR: MongoDB connection failed:', err.message);
    process.exit(1);
  });
'@

$testMongoScript | Out-File -FilePath "test-mongo-connection.js" -Encoding UTF8
$mongoTest = node test-mongo-connection.js 2>&1
Remove-Item "test-mongo-connection.js" -Force

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ MongoDB connection failed!" -ForegroundColor Red
    Write-Host "   $mongoTest" -ForegroundColor Red
    Write-Host "`n   Possible fixes:" -ForegroundColor Yellow
    Write-Host "   1. Check MONGODB_URI in .env" -ForegroundColor Gray
    Write-Host "   2. Ensure MongoDB Atlas whitelist includes your IP" -ForegroundColor Gray
    Write-Host "   3. Check internet connection" -ForegroundColor Gray
    Pop-Location
    exit 1
}

Write-Host "✅ MongoDB connection successful" -ForegroundColor Green

# Step 4: Start server
Write-Host "`n4️⃣ Starting backend server..." -ForegroundColor Yellow

# Create a start script that shows output
$startScript = @'
@echo off
echo Starting Credit Gyems Academy Backend...
echo.
npm start
pause
'@

$startScript | Out-File -FilePath "start-server.bat" -Encoding ASCII

# Start in new window so we can see logs
$process = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c start-server.bat" `
    -WorkingDirectory $backendPath `
    -PassThru

Write-Host "  Server starting (PID: $($process.Id))..." -ForegroundColor Gray

Pop-Location

# Step 5: Wait for server to be ready
Write-Host "`n5️⃣ Waiting for server to be ready..." -ForegroundColor Yellow

$maxAttempts = 10
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts -and -not $serverReady) {
    $attempt++
    Start-Sleep -Seconds 3
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" `
            -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        $health = $response.Content | ConvertFrom-Json
        
        if ($health.status -eq "ok") {
            $serverReady = $true
            Write-Host "`n✅ SERVER IS READY!" -ForegroundColor Green
            Write-Host "   Status: $($health.status)" -ForegroundColor Gray
            Write-Host "   MongoDB: $($health.mongodb)" -ForegroundColor Gray
            Write-Host "   Environment: $($health.environment)" -ForegroundColor Gray
            Write-Host "   URL: http://localhost:5000/api" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "  Attempt $attempt/$maxAttempts - Waiting..." -ForegroundColor Yellow
    }
}

if (-not $serverReady) {
    Write-Host "`n❌ Server failed to start!" -ForegroundColor Red
    Write-Host "   Check the server window for error messages" -ForegroundColor Yellow
    Write-Host "`n   Common issues:" -ForegroundColor Yellow
    Write-Host "   1. Port 5000 might still be in use" -ForegroundColor Gray
    Write-Host "   2. Missing dependencies (run: npm install)" -ForegroundColor Gray
    Write-Host "   3. MongoDB connection issues" -ForegroundColor Gray
    Write-Host "   4. Syntax errors in server.js" -ForegroundColor Gray
} else {
    # Quick API test
    Write-Host "`n6️⃣ Running quick API test..." -ForegroundColor Yellow
    
    try {
        $products = Invoke-RestMethod -Uri "http://localhost:5000/api/products" `
            -Method GET -ErrorAction Stop
        Write-Host "✅ API is responding correctly" -ForegroundColor Green
        Write-Host "   Found $($products.count) products" -ForegroundColor Gray
    } catch {
        Write-Host "⚠️  API test failed: $_" -ForegroundColor Yellow
    }
}

Write-Host "`n📝 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Run: .\Diagnose-OrderTest.ps1 (to see the order test issue)" -ForegroundColor White
Write-Host "2. Run: .\Direct-Fix-OrderTest.ps1 (to fix it)" -ForegroundColor White
Write-Host "3. Run: .\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1 (to run tests)" -ForegroundColor White