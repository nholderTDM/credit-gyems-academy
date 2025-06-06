# Test-FixAuthentication.ps1
# Script to test and fix authentication issues

Write-Host "🔐 Testing and Fixing Authentication..." -ForegroundColor Yellow
Write-Host ""

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        return @{
            Success = $true
            Response = $response
            StatusCode = 200
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $statusCode
            ErrorBody = $errorBody
        }
    }
}

# 1. Check if server is running
Write-Host "1. Checking Server Status..." -ForegroundColor Cyan
$health = Test-Endpoint -Url "http://localhost:5000/api/health"

if (-not $health.Success) {
    Write-Host "   ❌ Server is not running!" -ForegroundColor Red
    Write-Host "   Starting server..." -ForegroundColor Yellow
    
    # Start server in background
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "backend" -WindowStyle Hidden
    
    # Wait for server to start
    Write-Host "   Waiting for server to start..."
    $attempts = 0
    $maxAttempts = 30
    
    while ($attempts -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        $health = Test-Endpoint -Url "http://localhost:5000/api/health"
        if ($health.Success) {
            Write-Host "   ✅ Server started successfully!" -ForegroundColor Green
            break
        }
        $attempts++
        Write-Host "   ." -NoNewline
    }
    
    if (-not $health.Success) {
        Write-Host "`n   ❌ Server failed to start after 60 seconds" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ✅ Server is running" -ForegroundColor Green
}

# 2. Test Registration
Write-Host "`n2. Testing User Registration..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testUser = @{
    email = "auth_test_$timestamp@test.com"
    password = "TestPass123!"
    firstName = "Auth"
    lastName = "Test"
}

$regResult = Test-Endpoint -Url "http://localhost:5000/api/auth/register" -Method "POST" -Body $testUser

if ($regResult.Success) {
    Write-Host "   ✅ Registration successful" -ForegroundColor Green
    $authToken = $regResult.Response.token
} else {
    Write-Host "   ❌ Registration failed: $($regResult.Error)" -ForegroundColor Red
    if ($regResult.ErrorBody) {
        Write-Host "   Error details: $($regResult.ErrorBody.message)" -ForegroundColor Red
    }
}

# 3. Test Login
Write-Host "`n3. Testing User Login..." -ForegroundColor Cyan
$loginData = @{
    email = $testUser.email
    password = $testUser.password
}

$loginResult = Test-Endpoint -Url "http://localhost:5000/api/auth/login" -Method "POST" -Body $loginData

if ($loginResult.Success) {
    Write-Host "   ✅ Login successful" -ForegroundColor Green
    $authToken = $loginResult.Response.token
} else {
    Write-Host "   ❌ Login failed: $($loginResult.Error)" -ForegroundColor Red
    
    # Try with a known good user
    Write-Host "   Trying with default test user..." -ForegroundColor Yellow
    $defaultUser = @{
        email = "test_20250603131224_7618@creditgyemstest.com"
        password = "TestPass123!"
    }
    
    $defaultLogin = Test-Endpoint -Url "http://localhost:5000/api/auth/login" -Method "POST" -Body $defaultUser
    
    if ($defaultLogin.Success) {
        Write-Host "   ✅ Default user login successful" -ForegroundColor Green
        $authToken = $defaultLogin.Response.token
    } else {
        Write-Host "   ❌ Default user login also failed" -ForegroundColor Red
    }
}

# 4. Test Protected Route
if ($authToken) {
    Write-Host "`n4. Testing Protected Routes..." -ForegroundColor Cyan
    $headers = @{
        "Authorization" = "Bearer $authToken"
    }
    
    # Test profile endpoint
    $profileResult = Test-Endpoint -Url "http://localhost:5000/api/auth/profile" -Headers $headers
    
    if ($profileResult.Success) {
        Write-Host "   ✅ Protected route access successful" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Protected route access failed" -ForegroundColor Red
    }
    
    # Test lead analytics (admin only)
    $analyticsResult = Test-Endpoint -Url "http://localhost:5000/api/leads/analytics" -Headers $headers
    
    if ($analyticsResult.Success) {
        Write-Host "   ✅ Admin route access successful" -ForegroundColor Green
    } elseif ($analyticsResult.StatusCode -eq 403) {
        Write-Host "   ℹ️  Admin route correctly restricted (user is not admin)" -ForegroundColor Blue
    } else {
        Write-Host "   ❌ Admin route test failed: $($analyticsResult.Error)" -ForegroundColor Red
    }
}

# 5. Test Lead Routes
Write-Host "`n5. Testing Lead Routes..." -ForegroundColor Cyan

# Test create lead
$leadData = @{
    email = "lead_test_$timestamp@test.com"
    firstName = "Lead"
    lastName = "Test"
    source = "website"
}

$leadResult = Test-Endpoint -Url "http://localhost:5000/api/leads" -Method "POST" -Body $leadData

if ($leadResult.Success) {
    Write-Host "   ✅ Lead creation successful" -ForegroundColor Green
} else {
    Write-Host "   ❌ Lead creation failed: $($leadResult.Error)" -ForegroundColor Red
    if ($leadResult.ErrorBody) {
        Write-Host "   Available routes: $($leadResult.ErrorBody.available_routes -join ', ')" -ForegroundColor Yellow
    }
}

# Test newsletter
$newsletterData = @{
    email = "newsletter_test_$timestamp@test.com"
    firstName = "Newsletter"
}

$newsletterResult = Test-Endpoint -Url "http://localhost:5000/api/leads/newsletter" -Method "POST" -Body $newsletterData

if ($newsletterResult.Success) {
    Write-Host "   ✅ Newsletter subscription successful" -ForegroundColor Green
} else {
    Write-Host "   ❌ Newsletter subscription failed" -ForegroundColor Red
}

# 6. List all available routes
Write-Host "`n6. Available API Routes..." -ForegroundColor Cyan
$routesResult = Test-Endpoint -Url "http://localhost:5000/api/routes"

if ($routesResult.Success -and $routesResult.Response.routes) {
    $routesResult.Response.routes | ForEach-Object {
        Write-Host "   $($_.method) $($_.path)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️  Could not retrieve routes list" -ForegroundColor Yellow
}

# Summary
Write-Host "`n📊 Authentication Test Summary:" -ForegroundColor Yellow
Write-Host "   - Server Status: $(if ($health.Success) { '✅ Running' } else { '❌ Not Running' })"
Write-Host "   - Registration: $(if ($regResult.Success) { '✅ Working' } else { '❌ Failed' })"
Write-Host "   - Login: $(if ($loginResult.Success -or $defaultLogin.Success) { '✅ Working' } else { '❌ Failed' })"
Write-Host "   - Lead Routes: $(if ($leadResult.Success) { '✅ Working' } else { '❌ Not Found' })"

if (-not $leadResult.Success -and $leadResult.StatusCode -eq 404) {
    Write-Host "`n⚠️  Lead routes are not being registered!" -ForegroundColor Red
    Write-Host "Check the following:" -ForegroundColor Yellow
    Write-Host "   1. Ensure leadRoutes.js exports a valid Express router"
    Write-Host "   2. Check for errors in leadController.js"
    Write-Host "   3. Verify routes/index.js is loading leadRoutes correctly"
    Write-Host "   4. Run: node backend/debug-route-loading.js"
}