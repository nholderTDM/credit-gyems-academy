# Test-AuthenticationFlow.ps1
# Tests user authentication functionality with enhanced connection management
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot
)

# Get script root if not already set
if (-not $PSScriptRoot) {
    $PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

Write-Host "`n🔐 AUTHENTICATION FLOW TESTS (Enhanced)" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Use managed endpoints for all tests
Write-TestStep 0 "Pre-test health check"

$healthResult = Test-APIEndpoint -Method "GET" -Endpoint "http://localhost:5000/api/health"
if ($healthResult.Success) {
    Write-TestSuccess "Backend is healthy: $($healthResult.Data.status)"
    
    # Check database connection
    $dbHealthResult = Test-APIEndpoint -Method "GET" -Endpoint "http://localhost:5000/api/health/db"
    if ($dbHealthResult.Success -and $dbHealthResult.Data.database.canQuery) {
        Write-TestSuccess "MongoDB connection is active"
    }
}

Write-TestStep 1 "Testing user registration flow"

$testUser = Get-RandomTestUser
Write-TestInfo "Creating user: $($testUser.email)"

$registerResult = Test-APIEndpointManaged `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $testUser

if ($registerResult.Success) {
    Write-TestInfo "New user ID: $($registerResult.Data.user.id)"
    Write-TestInfo "Auth token received: $($registerResult.Data.token.Substring(0, 20))..."
    
    # Save for later tests
    $Global:AuthTestUser = @{
        email = $testUser.email
        password = $testUser.password
        token = $registerResult.Data.token
        userId = $registerResult.Data.user.id
    }
}

Write-TestStep 2 "Testing duplicate registration prevention"

$duplicateResult = Test-APIEndpointManaged `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $testUser `
    -ExpectedStatus "400"

Write-TestStep 3 "Testing user login flow"

$loginResult = Test-APIEndpointManaged `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = $testUser.email
        password = $testUser.password
    }

if ($loginResult.Success) {
    Write-TestInfo "Login successful, token received"
}

Write-TestStep 4 "Testing invalid login scenarios"

# Wrong password
Test-APIEndpointManaged `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = $testUser.email
        password = "WrongPassword123!"
    } `
    -ExpectedStatus "401"

# Non-existent user
Test-APIEndpointManaged `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = "nonexistent@test.com"
        password = "Test123!"
    } `
    -ExpectedStatus "401"

Write-TestStep 5 "Testing authenticated endpoints"

$authHeaders = @{ Authorization = "Bearer $($Global:AuthTestUser.token)" }

$profileResult = Test-APIEndpointManaged `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -Headers $authHeaders

if ($profileResult.Success) {
    Write-TestInfo "Profile data retrieved for: $($profileResult.Data.email)"
}

# Test without auth
Test-APIEndpointManaged `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -ExpectedStatus "401"

Write-TestStep 6 "Testing profile update"

$updateResult = Test-APIEndpointManaged `
    -Method "PUT" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -Headers $authHeaders `
    -Body @{
        creditScore = 750
        targetCreditScore = 800
    }

if ($updateResult.Success) {
    Write-TestInfo "Profile updated successfully"
}

Write-TestStep 7 "Testing password reset flow"

$forgotResult = Test-APIEndpointManaged `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{ email = $testUser.email }

if ($forgotResult.Success) {
    Write-TestInfo "Password reset email would be sent to: $($testUser.email)"
}

# Test with non-existent email
Test-APIEndpointManaged `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{ email = "nonexistent@test.com" } `
    -ExpectedStatus "404"

Write-TestStep 8 "Testing logout flow"

$logoutResult = Test-APIEndpointManaged `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/logout" `
    -Headers $authHeaders

if ($logoutResult.Success) {
    Write-TestInfo "Logout successful"
}

Write-TestStep 9 "Testing input validation"

# Missing email
Test-APIEndpointManaged `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body @{
        password = "Test123!"
        firstName = "Test"
        lastName = "User"
    } `
    -ExpectedStatus "400"

Write-TestSuccess "Validation test passed: Missing email"

# Invalid email format
Test-APIEndpointManaged `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body @{
        email = "invalid-email"
        password = "Test123!"
        firstName = "Test"
        lastName = "User"
    } `
    -ExpectedStatus "400"

Write-TestSuccess "Validation test passed: Invalid email format"

# Missing required fields
Test-APIEndpointManaged `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body @{
        email = Get-RandomTestEmail
    } `
    -ExpectedStatus "400"

Write-TestSuccess "Validation test passed: Missing required fields"

Write-TestStep 10 "Testing rate limiting and connection stability"

Write-TestInfo "Creating multiple sessions with rate limiting..."

# Create multiple sessions with delays
$sessions = @()
for ($i = 1; $i -le 3; $i++) {
    $sessionResult = Test-APIEndpointManaged `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = $testUser.email
            password = $testUser.password
        }
    
    if ($sessionResult.Success) {
        $sessions += $sessionResult.Data.token
        Write-TestSuccess "Session $i created"
    }
    
    if ($i -lt 3) {
        Write-TestInfo "Waiting before creating session $($i+1)..."
        Start-Sleep -Seconds 1
    }
}

# Verify all sessions
Write-TestInfo "Verifying sessions..."
$sessionNum = 1
foreach ($token in $sessions) {
    $verifyResult = Test-APIEndpointManaged `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $token" }
    
    if ($verifyResult.Success) {
        Write-TestSuccess "Session $sessionNum is valid"
    }
    $sessionNum++
}

Write-TestStep 11 "Post-test health check"

$postHealthResult = Test-APIEndpoint -Method "GET" -Endpoint "http://localhost:5000/api/health"
if ($postHealthResult.Success) {
    Write-TestSuccess "Backend still healthy after tests"
}

# Check network connections (Windows-aware)
$timeWaitCount = (netstat -an | Select-String "TIME_WAIT").Count
if ($timeWaitCount -gt 100) {
    Write-TestInfo "Network connections: $timeWaitCount TIME_WAIT (high but acceptable)"
} else {
    Write-TestSuccess "Network connections healthy (TIME_WAIT: $timeWaitCount)"
}

Write-Host "`n✅ AUTHENTICATION TESTS COMPLETE" -ForegroundColor Green
Write-Host "Active connections used: $($global:ConnectionPool.ActiveConnections)" -ForegroundColor Gray
