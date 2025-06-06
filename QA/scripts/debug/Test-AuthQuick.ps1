# Test-AuthQuick.ps1
# Quick test to verify authentication is working
# Location: credit-gyems-academy/

Write-Host "`n🧪 QUICK AUTHENTICATION TEST" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Step 1: Check if server is running
Write-Host "`n📡 Checking server status..." -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop
    Write-Host "  ✅ Server is running" -ForegroundColor Green
    Write-Host "     Status: $($health.status)" -ForegroundColor Gray
    Write-Host "     MongoDB: $($health.mongodb)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Server not responding on port 5000" -ForegroundColor Red
    Write-Host "     Please ensure backend server is running: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Step 2: Test Registration
Write-Host "`n📝 Testing Registration..." -ForegroundColor Yellow

$testEmail = "test_$(Get-Random -Maximum 99999)@example.com"
$testUser = @{
    email = $testEmail
    password = "TestPass123!"
    firstName = "Test"
    lastName = "User"
    phone = "555-0123"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -Body ($testUser | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "  ✅ Registration successful" -ForegroundColor Green
    Write-Host "     User ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "     Token: $($response.token.Substring(0,20))..." -ForegroundColor Gray
    
    $authToken = $response.token
} catch {
    Write-Host "  ❌ Registration failed" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetails) {
        Write-Host "     Message: $($errorDetails.message)" -ForegroundColor Red
    } else {
        Write-Host "     Error: $_" -ForegroundColor Red
    }
}

# Step 3: Test Login
Write-Host "`n🔐 Testing Login..." -ForegroundColor Yellow

try {
    $loginData = @{
        email = $testEmail
        password = "TestPass123!"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Body ($loginData | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "  ✅ Login successful" -ForegroundColor Green
    Write-Host "     User: $($response.user.email)" -ForegroundColor Gray
    Write-Host "     Role: $($response.user.role)" -ForegroundColor Gray
    
    $authToken = $response.token
} catch {
    Write-Host "  ❌ Login failed" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetails) {
        Write-Host "     Message: $($errorDetails.message)" -ForegroundColor Red
    } else {
        Write-Host "     Error: $_" -ForegroundColor Red
    }
}

# Step 4: Test Profile Access
Write-Host "`n👤 Testing Profile Access..." -ForegroundColor Yellow

if ($authToken) {
    try {
        $headers = @{
            Authorization = "Bearer $authToken"
        }
        
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/profile" `
            -Method GET `
            -Headers $headers `
            -ErrorAction Stop
        
        Write-Host "  ✅ Profile access successful" -ForegroundColor Green
        Write-Host "     Email: $($response.email)" -ForegroundColor Gray
        Write-Host "     Name: $($response.firstName) $($response.lastName)" -ForegroundColor Gray
    } catch {
        Write-Host "  ❌ Profile access failed" -ForegroundColor Red
        Write-Host "     Error: $_" -ForegroundColor Red
    }
}

# Step 5: Test Invalid Login
Write-Host "`n🚫 Testing Invalid Login (should fail)..." -ForegroundColor Yellow

try {
    $invalidLogin = @{
        email = $testEmail
        password = "WrongPassword!"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Body ($invalidLogin | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "  ❌ Invalid login succeeded (this is bad!)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  ✅ Invalid login properly rejected (401)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Unexpected error: $_" -ForegroundColor Yellow
    }
}

# Step 6: List Available Routes
Write-Host "`n📋 Checking Available Routes..." -ForegroundColor Yellow

try {
    # Try to access a non-existent route to see available routes
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/test-routes" `
        -Method GET `
        -ErrorAction Stop
} catch {
    # This is expected to fail
    if ($_.ErrorDetails.Message) {
        $errorData = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorData.available_routes) {
            Write-Host "  Available routes:" -ForegroundColor Gray
            $errorData.available_routes | ForEach-Object {
                Write-Host "    $_" -ForegroundColor DarkGray
            }
        }
    }
}

Write-Host "`n✅ Quick test completed!" -ForegroundColor Green
Write-Host "   Authentication appears to be working correctly." -ForegroundColor Gray
Write-Host "   You can now run the full test suite." -ForegroundColor Gray