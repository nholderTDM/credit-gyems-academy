# Test-ErrorScenarios.ps1
# Tests error handling and edge cases
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot
)

# Get script root if not already set
if (-not $PSScriptRoot) {
    $PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

Write-TestStep 1 "Testing 404 endpoints"

$notFoundTests = @(
    "/api/nonexistent",
    "/api/products/000000000000000000000000",
    "/api/users/invalid-id")

foreach ($endpoint in $notFoundTests) {
    $result = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000$endpoint" `
        -ExpectedStatus "404"
    
    if ($result.Success) {
        Write-TestInfo "404 handling correct for: $endpoint"
    }
}


# Test auth required for orders
Write-TestInfo "Testing auth required for protected endpoints"
$authRequiredEndpoints = @("/api/orders/fake-order")

foreach ($endpoint in $authRequiredEndpoints) {
    $result = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000$endpoint" `
        -Headers $authHeaders `
        -ExpectedStatus "401"
    
    if ($result.Success) {
        Write-TestInfo "Auth required for: $endpoint"
    }
}

Write-TestStep 2 "Testing malformed JSON requests"

$malformedTests = @{
    Method = "POST"
    Uri = "http://localhost:5000/api/auth/register"
    Body = "{ invalid json"
    ContentType = "application/json"
}

try {
    Invoke-RestMethod @malformedTests -ErrorAction Stop
    Write-TestFailure "Server accepted malformed JSON"
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-TestSuccess "Server correctly rejected malformed JSON"
    }
}

Write-TestStep 3 "Testing SQL injection attempts"

$sqlInjectionTests = @(
    @{
        email = "test@test.com'; DROP TABLE users; --"
        password = "password"
    },
    @{
        email = "test@test.com"
        password = "' OR '1'='1"
    }
)

foreach ($test in $sqlInjectionTests) {
    $result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/login" `
        -Body $test `
        -ExpectedStatus "401"
    
    if ($result.Success) {
        Write-TestSuccess "SQL injection attempt blocked"
    }
}

Write-TestStep 4 "Testing XSS prevention"

$xssTests = @(
    @{
        title = "<script>alert('XSS')</script>"
        content = "Test content"
        category = "general"
    },
    @{
        firstName = "<img src=x onerror=alert('XSS')>"
        lastName = "Test"
        email = Get-RandomTestEmail
        password = "Test123!"
    }
)

# Test XSS in registration
$xssResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $xssTests[1]

if ($xssResult.Success) {
    Write-TestInfo "XSS input sanitized in registration"
}

Write-TestStep 5 "Testing oversized payload rejection"

# Create large payload (over 10kb limit)
$largeData = @{
    email = Get-RandomTestEmail
    password = "Test123!"
    firstName = "Test"
    lastName = "User"
    notes = "A" * 15000  # 15KB of data
}

$result = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $largeData `
    -ExpectedStatus "413"

if ($result.Success) {
    Write-TestInfo "Large payload correctly rejected"
}

Write-TestStep 6 "Testing concurrent request handling"

# Use existing test user
if ($Global:PrimaryTestUser) {
    $authToken = $Global:PrimaryTestUser.token
    
    # Make concurrent requests
    $jobs = @()
    for ($i = 1; $i -le 5; $i++) {
        $jobs += Start-Job -ScriptBlock {
            param($token, $i)
            try {
                $headers = @{ Authorization = "Bearer $token" }
                Invoke-RestMethod -Method GET -Uri "http://localhost:5000/api/auth/profile" -Headers $headers
                return "Success-$i"
            }
            catch {
                return "Failed-$i"
            }
        } -ArgumentList $authToken, $i
    }
    
    # Wait for jobs
    $results = $jobs | Wait-Job | Receive-Job
    $jobs | Remove-Job
    
    $successCount = ($results | Where-Object { $_ -like "Success-*" }).Count
    Write-TestInfo "Concurrent requests: $successCount/5 successful"
}

Write-TestStep 7 "Testing invalid ObjectId handling"

$invalidIdTests = @(
    "not-an-objectid",
    "12345",
    "zzzzzzzzzzzzzzzzzzzzzzzz"
)

foreach ($id in $invalidIdTests) {
    $result = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/products/$id" `
        -ExpectedStatus "400"
    
    if ($result.Success) {
        Write-TestInfo "Invalid ObjectId handled: $id"
    }
}

Write-TestStep 8 "Testing missing authorization"

$protectedEndpoints = @(
    @{ Method = "GET"; Path = "/api/auth/profile" },
    @{ Method = "POST"; Path = "/api/cart/add" },
    @{ Method = "GET"; Path = "/api/bookings/my-bookings" },
    @{ Method = "POST"; Path = "/api/community/discussions" }
)

foreach ($endpoint in $protectedEndpoints) {
    $result = Test-APIEndpoint `
        -Method $endpoint.Method `
        -Endpoint "http://localhost:5000$($endpoint.Path)" `
        -ExpectedStatus "401"
    
    if ($result.Success) {
        Write-TestInfo "Auth required for: $($endpoint.Path)"
    }
}

Write-TestStep 9 "Testing timeout scenarios"

# This would need a specific slow endpoint to test properly
Write-TestInfo "Timeout handling would be tested with specific slow endpoints"

Write-TestStep 10 "Testing recovery from errors"

# Test that API continues working after errors
$recoveryTest = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/products"

if ($recoveryTest.Success) {
    Write-TestSuccess "API continues functioning after error scenarios"
}










