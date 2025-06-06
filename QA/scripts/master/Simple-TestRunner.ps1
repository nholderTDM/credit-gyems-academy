# Simple-TestRunner.ps1
# A simplified test runner that avoids common issues

param(
    [string]$TestType = "basic"
)

$baseUrl = "http://localhost:5000"

Write-Host "Simple Test Runner - $TestType tests" -ForegroundColor Cyan

# Basic health check
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "✓ API Health: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ API not accessible: $_" -ForegroundColor Red
    exit 1
}

# Create and login user
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testUser = @{
    email = "test_${timestamp}@test.com"
    password = "Test123!@#"
    firstName = "Test"
    lastName = "User"
}

try {
    $register = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -Body ($testUser | ConvertTo-Json) `
        -ContentType "application/json"
    
    Write-Host "✓ User registered: $($testUser.email)" -ForegroundColor Green
    
    # Test login
    $login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -Body (@{email = $testUser.email; password = $testUser.password} | ConvertTo-Json) `
        -ContentType "application/json"
    
    Write-Host "✓ User logged in successfully" -ForegroundColor Green
    
    # Test authenticated endpoint
    $headers = @{ Authorization = "Bearer $($login.token)" }
    $profile = Invoke-RestMethod -Uri "$baseUrl/api/auth/profile" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✓ Profile retrieved: $($profile.email)" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Test failed: $_" -ForegroundColor Red
}

Write-Host "`nBasic tests completed!" -ForegroundColor Cyan
