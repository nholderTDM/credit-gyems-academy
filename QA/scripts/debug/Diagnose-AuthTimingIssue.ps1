# Diagnose-AuthTimingIssue.ps1
# Script to diagnose the authentication connection refused error

Write-Host "🔍 Diagnosing Authentication Timing Issue..." -ForegroundColor Cyan
Write-Host ""

# Function to check if port is in use
function Test-Port {
    param($Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# 1. Check if backend server is currently running
Write-Host "1. Checking Backend Server Status..." -ForegroundColor Yellow
$port5000InUse = Test-Port -Port 5000

if ($port5000InUse) {
    Write-Host "   ✅ Port 5000 is in use (server likely running)" -ForegroundColor Green
    
    # Test health endpoint
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop
        Write-Host "   ✅ Health endpoint responding" -ForegroundColor Green
        Write-Host "   MongoDB: $($health.mongodb)" -ForegroundColor Gray
    } catch {
        Write-Host "   ❌ Health endpoint not responding" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Port 5000 is not in use (server not running)" -ForegroundColor Red
}

# 2. Check for Node processes
Write-Host "`n2. Checking Node Processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Found $($nodeProcesses.Count) Node process(es):" -ForegroundColor Blue
    $nodeProcesses | ForEach-Object {
        Write-Host "   - PID: $($_.Id), CPU: $($_.CPU), Memory: $([math]::Round($_.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ No Node processes found" -ForegroundColor Red
}

# 3. Check MongoDB connection
Write-Host "`n3. Testing MongoDB Connection..." -ForegroundColor Yellow
try {
    $dbHealth = Invoke-RestMethod -Uri "http://localhost:5000/api/health/db" -Method GET -ErrorAction Stop
    Write-Host "   ✅ MongoDB Status: $($dbHealth.database.status)" -ForegroundColor Green
    Write-Host "   Can Query: $($dbHealth.database.canQuery)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Cannot check MongoDB status" -ForegroundColor Red
}

# 4. Test authentication endpoints specifically
Write-Host "`n4. Testing Authentication Endpoints..." -ForegroundColor Yellow

# Test registration
$testUser = @{
    email = "timing_test_$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
    password = "TestPass123!"
    firstName = "Timing"
    lastName = "Test"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $testUser -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ Registration endpoint working" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test login
$loginData = @{
    email = "test_20250603131224_7618@creditgyemstest.com"
    password = "TestPass123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ Login endpoint working" -ForegroundColor Green
    Write-Host "   Login Response: $($loginResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Check for port conflicts
Write-Host "`n5. Checking for Port Conflicts..." -ForegroundColor Yellow
$tcpConnections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($tcpConnections) {
    Write-Host "   Processes using port 5000:" -ForegroundColor Blue
    $tcpConnections | ForEach-Object {
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        Write-Host "   - Process: $($process.Name) (PID: $($_.OwningProcess))" -ForegroundColor Gray
    }
}

# 6. Analyze timing
Write-Host "`n6. Analyzing Test Timing..." -ForegroundColor Yellow
Write-Host "   The authentication test failed at 13:46:44" -ForegroundColor Blue
Write-Host "   This was early in the test run (authentication tests run first)" -ForegroundColor Blue
Write-Host "   Possible causes:" -ForegroundColor Yellow
Write-Host "   - Server not fully started when tests began" -ForegroundColor Gray
Write-Host "   - Server crashed during startup" -ForegroundColor Gray
Write-Host "   - Port conflict preventing server start" -ForegroundColor Gray

# 7. Recommendations
Write-Host "`n📌 Recommendations:" -ForegroundColor Cyan
Write-Host "1. Add a server startup wait in Test-Environment.ps1"
Write-Host "2. Add retry logic to authentication tests"
Write-Host "3. Check server logs for startup errors"
Write-Host "4. Ensure MongoDB is running before starting tests"

# Create a server monitor script
Write-Host "`n7. Creating Server Monitor Script..." -ForegroundColor Yellow
$monitorScript = @'
# Monitor-BackendServer.ps1
# Run this in a separate terminal to monitor the backend server

Write-Host "Monitoring Backend Server..." -ForegroundColor Cyan
while ($true) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop -TimeoutSec 2
        Write-Host "[$timestamp] ✅ Server OK - MongoDB: $($health.mongodb)" -ForegroundColor Green
    } catch {
        Write-Host "[$timestamp] ❌ Server Down - $($_.Exception.Message)" -ForegroundColor Red
    }
    Start-Sleep -Seconds 5
}
'@

Set-Content -Path "Monitor-BackendServer.ps1" -Value $monitorScript
Write-Host "   ✅ Created Monitor-BackendServer.ps1" -ForegroundColor Green
Write-Host "   Run this in a separate terminal while running tests" -ForegroundColor Blue