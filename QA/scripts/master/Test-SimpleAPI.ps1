# Test-SimpleAPI.ps1
# Simple test to bypass the setup issue and test API directly
# Run from QA\scripts\master

Write-Host "Simple API Test - Bypassing Setup Issues" -ForegroundColor Cyan

# Load configuration
. .\Test-Config.ps1

# Get environment
$env = Get-TestEnvironment -Environment "local"
$baseUrl = $env.BackendUrl

Write-Host "Testing API at: $baseUrl" -ForegroundColor Gray

# Test 1: Health check
Write-Host "`nTest 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "✓ Health check passed" -ForegroundColor Green
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
}

# Test 2: Simple user registration
Write-Host "`nTest 2: User Registration" -ForegroundColor Yellow
$testUser = @{
    email = "simple_test_$(Get-Random -Maximum 9999)@test.com"
    password = "Test123!@#"
    firstName = "Simple"
    lastName = "Test"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -Body ($testUser | ConvertTo-Json) `
        -ContentType "application/json"
    
    Write-Host "✓ User registration successful" -ForegroundColor Green
    Write-Host "  Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "✗ User registration failed: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`nSimple test complete." -ForegroundColor Cyan