# Diagnose-AuthenticationIssues.ps1
# Quick diagnostic tool for authentication issues
# Location: D:\credit-gyems-academy\

Write-Host "`n🔍 DIAGNOSING AUTHENTICATION ISSUES" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Check 1: Server Process
Write-Host "`n1️⃣ Checking server processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "  Found $($nodeProcesses.Count) Node processes:" -ForegroundColor Green
    foreach ($proc in $nodeProcesses) {
        Write-Host "    PID: $($proc.Id), Memory: $([math]::Round($proc.WS/1MB, 2))MB" -ForegroundColor Gray
    }
} else {
    Write-Host "  ❌ No Node processes found!" -ForegroundColor Red
}

# Check 2: Port Status
Write-Host "`n2️⃣ Checking port 5000 status..." -ForegroundColor Yellow
$portCheck = netstat -an | Select-String ":5000"
$listening = $portCheck | Where-Object { $_ -match "LISTENING" }
$established = $portCheck | Where-Object { $_ -match "ESTABLISHED" }
$timeWait = $portCheck | Where-Object { $_ -match "TIME_WAIT" }

if ($listening) {
    Write-Host "  ✅ Port 5000 is LISTENING" -ForegroundColor Green
    Write-Host "  Active connections: $($established.Count)" -ForegroundColor Gray
    Write-Host "  TIME_WAIT connections: $($timeWait.Count)" -ForegroundColor $(if($timeWait.Count -gt 20){'Red'}else{'Gray'})
} else {
    Write-Host "  ❌ Port 5000 is NOT listening!" -ForegroundColor Red
}

# Check 3: Backend Health
Write-Host "`n3️⃣ Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 5
    Write-Host "  ✅ Backend status: $($health.status)" -ForegroundColor Green
    Write-Host "  MongoDB: $($health.mongodb)" -ForegroundColor $(if($health.mongodb -eq 'connected'){'Green'}else{'Red'})
    Write-Host "  Stripe: $($health.stripe)" -ForegroundColor Gray
    Write-Host "  Firebase: $($health.firebase)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Backend health check failed: $_" -ForegroundColor Red
}

# Check 4: Database Connection
Write-Host "`n4️⃣ Checking database connection..." -ForegroundColor Yellow
try {
    $dbHealth = Invoke-RestMethod -Uri "http://localhost:5000/api/health/db" -TimeoutSec 5
    Write-Host "  ✅ Database status: $($dbHealth.database.status)" -ForegroundColor Green
    Write-Host "  Can query: $($dbHealth.database.canQuery)" -ForegroundColor $(if($dbHealth.database.canQuery){'Green'}else{'Red'})
    Write-Host "  Host: $($dbHealth.database.host)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Database health check failed: $_" -ForegroundColor Red
}

# Check 5: Environment Variables
Write-Host "`n5️⃣ Checking environment variables..." -ForegroundColor Yellow
$envPath = "backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    $requiredVars = @('JWT_SECRET', 'MONGODB_URI', 'FIREBASE_PROJECT_ID')
    
    foreach ($var in $requiredVars) {
        if ($envContent -match "^$var=.+") {
            Write-Host "  ✅ $var is set" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $var is MISSING!" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ❌ Backend .env file not found!" -ForegroundColor Red
}

# Check 6: Quick Authentication Test
Write-Host "`n6️⃣ Running quick authentication test..." -ForegroundColor Yellow
$testEmail = "test_$(Get-Random -Maximum 999999)@test.com"
$testPassword = "Test123!"

# Test registration
try {
    $registerBody = @{
        email = $testEmail
        password = $testPassword
        firstName = "Test"
        lastName = "User"
    } | ConvertTo-Json

    Invoke-RestMethod `
        -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -Body $registerBody `
        -ContentType "application/json" `
        -TimeoutSec 10

    Write-Host "  ✅ Registration successful" -ForegroundColor Green
    
    # Test login
    Start-Sleep -Seconds 1
    $loginBody = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod `
        -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -TimeoutSec 10

    Write-Host "  ✅ Login successful" -ForegroundColor Green
    
    # Test profile access
    $headers = @{ Authorization = "Bearer $($loginResponse.token)" }
    $profileResponse = Invoke-RestMethod `
        -Uri "http://localhost:5000/api/auth/profile" `
        -Method GET `
        -Headers $headers `
        -TimeoutSec 10

    Write-Host "  ✅ Profile access successful. User ID: $($profileResponse.userId)" -ForegroundColor Green
    
} catch {
    Write-Host "  ❌ Authentication test failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "  Error details: $errorBody" -ForegroundColor Gray
    }
}

# Check 7: Route Availability
Write-Host "`n7️⃣ Checking route availability..." -ForegroundColor Yellow
try {
    $routes = Invoke-RestMethod -Uri "http://localhost:5000/api/routes" -TimeoutSec 5
    $authRoutes = $routes.routes | Where-Object { $_.path -like "*auth*" }
    Write-Host "  Found $($authRoutes.Count) auth routes:" -ForegroundColor Green
    foreach ($route in $authRoutes) {
        Write-Host "    $($route.method) $($route.path)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️ Could not retrieve routes" -ForegroundColor Yellow
}

# Summary and Recommendations
Write-Host "`n📊 DIAGNOSIS SUMMARY" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

$issues = @()

if ($timeWait.Count -gt 20) {
    $issues += "High TIME_WAIT connections ($($timeWait.Count))"
}

if ($nodeProcesses.Count -gt 2) {
    $issues += "Multiple Node processes running"
}

if (-not $listening) {
    $issues += "Backend server not listening on port 5000"
}

if ($issues.Count -eq 0) {
    Write-Host "✅ No critical issues detected" -ForegroundColor Green
} else {
    Write-Host "❌ Issues detected:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor Red
    }
}

Write-Host "`n💡 RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

if ($timeWait.Count -gt 20) {
    Write-Host "1. High TIME_WAIT connections indicate rapid connection cycling" -ForegroundColor Yellow
    Write-Host "   Run: .\Fix-AuthenticationIssues.ps1" -ForegroundColor Gray
}

if ($nodeProcesses.Count -gt 2) {
    Write-Host "2. Multiple Node processes may cause conflicts" -ForegroundColor Yellow
    Write-Host "   Run: Get-Process node | Stop-Process -Force" -ForegroundColor Gray
}

if (-not $listening) {
    Write-Host "3. Backend server needs to be started" -ForegroundColor Yellow
    Write-Host "   Run: cd backend && npm run dev" -ForegroundColor Gray
}

Write-Host "`n4. For comprehensive fix:" -ForegroundColor Yellow
Write-Host "   Run: .\Fix-AuthenticationIssues.ps1 -RestartServers -RunTests" -ForegroundColor Gray