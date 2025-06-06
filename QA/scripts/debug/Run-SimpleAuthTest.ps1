# Run-SimpleAuthTest.ps1
# Simple authentication test without complex retry logic
# Location: credit-gyems-academy/

Write-Host "`n🔧 SIMPLE AUTHENTICATION TEST" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# First, make sure we're using the Test-Utilities
$scriptPath = Join-Path $PSScriptRoot "scripts\TS_CGA_v1\Test-Utilities.ps1"
if (Test-Path $scriptPath) {
    . $scriptPath
} else {
    Write-Host "⚠️  Test utilities not found, using basic functions" -ForegroundColor Yellow
    
    # Basic test function
    function Test-APIEndpoint {
        param(
            [string]$Method,
            [string]$Endpoint,
            [hashtable]$Body = @{},
            [hashtable]$Headers = @{},
            [string]$ExpectedStatus = "200"
        )
        
        try {
            $params = @{
                Uri = $Endpoint
                Method = $Method
                ContentType = "application/json"
                ErrorAction = "Stop"
            }
            
            if ($Body.Count -gt 0) {
                $params.Body = ($Body | ConvertTo-Json)
            }
            
            if ($Headers.Count -gt 0) {
                $params.Headers = $Headers
            }
            
            $response = Invoke-RestMethod @params
            
            return @{
                Success = $true
                Data = $response
                StatusCode = 200
            }
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            return @{
                Success = ($statusCode -eq [int]$ExpectedStatus)
                Error = $_.ErrorDetails.Message
                StatusCode = $statusCode
            }
        }
    }
}

# Test 1: Server Health Check
Write-Host "`n1️⃣ Server Health Check" -ForegroundColor Yellow

$healthResult = Test-APIEndpoint -Method "GET" -Endpoint "http://localhost:5000/api/health"
if ($healthResult.Success) {
    Write-Host "  ✅ Server is healthy" -ForegroundColor Green
    Write-Host "     MongoDB: $($healthResult.Data.mongodb)" -ForegroundColor Gray
} else {
    Write-Host "  ❌ Server not responding!" -ForegroundColor Red
    Write-Host "     Make sure backend is running: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test 2: User Registration
Write-Host "`n2️⃣ Testing User Registration" -ForegroundColor Yellow

$testUser = @{
    email = "test_$(Get-Random -Maximum 99999)@example.com"
    password = "TestPass123!"
    firstName = "Test"
    lastName = "User"
    phone = "555-0123"
}

Write-Host "  📧 Email: $($testUser.email)" -ForegroundColor Gray

$registerResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $testUser

if ($registerResult.Success) {
    Write-Host "  ✅ Registration successful" -ForegroundColor Green
    $userId = $registerResult.Data.user.id
    $authToken = $registerResult.Data.token
    Write-Host "     User ID: $userId" -ForegroundColor Gray
} else {
    Write-Host "  ❌ Registration failed" -ForegroundColor Red
    Write-Host "     Error: $($registerResult.Error)" -ForegroundColor Red
}

# Test 3: User Login
Write-Host "`n3️⃣ Testing User Login" -ForegroundColor Yellow

$loginResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = $testUser.email
        password = $testUser.password
    }

if ($loginResult.Success) {
    Write-Host "  ✅ Login successful" -ForegroundColor Green
    $authToken = $loginResult.Data.token
} else {
    Write-Host "  ❌ Login failed" -ForegroundColor Red
    Write-Host "     Error: $($loginResult.Error)" -ForegroundColor Red
}

# Test 4: Get Profile (Authenticated)
Write-Host "`n4️⃣ Testing Profile Access" -ForegroundColor Yellow

if ($authToken) {
    $profileResult = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" }
    
    if ($profileResult.Success) {
        Write-Host "  ✅ Profile retrieved" -ForegroundColor Green
        Write-Host "     Email: $($profileResult.Data.email)" -ForegroundColor Gray
        Write-Host "     Role: $($profileResult.Data.role)" -ForegroundColor Gray
    } else {
        Write-Host "  ❌ Profile access failed" -ForegroundColor Red
    }
}

# Test 5: Invalid Login (Should Fail)
Write-Host "`n5️⃣ Testing Invalid Login (should fail)" -ForegroundColor Yellow

$invalidResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = "nonexistent@example.com"
        password = "wrongpass"
    } `
    -ExpectedStatus "401"

if ($invalidResult.Success) {
    Write-Host "  ✅ Invalid login properly rejected (401)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Unexpected response for invalid login" -ForegroundColor Red
}

# Test 6: Unauthenticated Access (Should Fail)
Write-Host "`n6️⃣ Testing Unauthenticated Access (should fail)" -ForegroundColor Yellow

$unauthResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -ExpectedStatus "401"

if ($unauthResult.Success) {
    Write-Host "  ✅ Unauthenticated access properly blocked (401)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Unexpected response for unauthenticated access" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 SUMMARY" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan

$tests = @(
    "Server Health" 
    "User Registration"
    "User Login"
    "Profile Access"
    "Invalid Login Rejection"
    "Unauthenticated Access Block"
)

$results = @(
    $healthResult.Success
    $registerResult.Success
    $loginResult.Success
    $profileResult.Success
    $invalidResult.Success
    $unauthResult.Success
)

$passed = ($results | Where-Object { $_ -eq $true }).Count
$total = $results.Count

for ($i = 0; $i -lt $tests.Count; $i++) {
    $icon = if ($results[$i]) { "✅" } else { "❌" }
    Write-Host "  $icon $($tests[$i])" -ForegroundColor $(if ($results[$i]) { "Green" } else { "Red" })
}

Write-Host "`n  Total: $passed/$total tests passed" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

if ($passed -eq $total) {
    Write-Host "`n✅ All authentication tests passed!" -ForegroundColor Green
    Write-Host "   You can now run the full QA suite." -ForegroundColor Gray
} else {
    Write-Host "`n⚠️  Some tests failed. Please check the errors above." -ForegroundColor Yellow
}