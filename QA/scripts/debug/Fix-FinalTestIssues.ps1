# Test-FinalIssues-Simple.ps1
# Simple test for the 3 failing components

Write-Host "`n🎯 TESTING FINAL 3 FAILING COMPONENTS" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check server
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 5
    Write-Host "✅ Server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Server not running!" -ForegroundColor Red
    return
}

# Test 1: Simple Authentication Test
Write-Host "`n1️⃣ Testing Authentication" -ForegroundColor Yellow

$testEmail = "test_$(Get-Random -Maximum 999999)@test.com"
$testPass = "Test123!"

try {
    # Register
    $regBody = @{
        email = $testEmail
        password = $testPass
        firstName = "Test"
        lastName = "User"
    } | ConvertTo-Json
    
    $reg = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method POST -Body $regBody -ContentType "application/json"
    
    Write-Host "  ✅ Registration successful" -ForegroundColor Green
    
    # Wait before login
    Start-Sleep -Seconds 3
    
    # Login
    $loginBody = @{
        email = $testEmail
        password = $testPass
    } | ConvertTo-Json
    
    $login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($login.token) {
        Write-Host "  ✅ Login successful with token" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ Login successful but no token received" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "  ❌ Auth test failed: $_" -ForegroundColor Red
}

# Test 2: Product Endpoint Check
Write-Host "`n2️⃣ Testing Product Endpoint" -ForegroundColor Yellow

try {
    $products = Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET
    Write-Host "  ✅ Product endpoint working" -ForegroundColor Green
    
    # Check if data property exists
    if ($products.data) {
        Write-Host "  Products found: $($products.data.Count)" -ForegroundColor Gray
    } else {
        Write-Host "  Response received (check structure)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ❌ Product endpoint error: $_" -ForegroundColor Red
}

# Test 3: Community Basic Test
Write-Host "`n3️⃣ Testing Community Creation" -ForegroundColor Yellow

try {
    # Create user and get token
    $userEmail = "comm_$(Get-Random -Maximum 999999)@test.com"
    $regBody = @{
        email = $userEmail
        password = "Test123!"
        firstName = "Comm"
        lastName = "Test"
    } | ConvertTo-Json
    
    $reg = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method POST -Body $regBody -ContentType "application/json"
    
    $token = $reg.token
    $headers = @{ Authorization = "Bearer $token" }
    
    # Create discussion
    $discBody = @{
        title = "Test Discussion"
        content = "Test content"
        category = "general"
    } | ConvertTo-Json
    
    $disc = Invoke-RestMethod -Uri "http://localhost:5000/api/community/discussions" `
        -Method POST -Body $discBody -ContentType "application/json" -Headers $headers
    
    Write-Host "  ✅ Discussion created with ID: $($disc.id)" -ForegroundColor Green
    
} catch {
    Write-Host "  ❌ Community test failed: $_" -ForegroundColor Red
}

Write-Host "`n✅ Simple test complete" -ForegroundColor Green
Write-Host "Check results above to see which components need attention" -ForegroundColor Yellow