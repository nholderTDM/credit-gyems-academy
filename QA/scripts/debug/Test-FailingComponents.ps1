# Test-FailingComponents.ps1
# Tests only the components that were failing
# Location: credit-gyems-academy/

Write-Host "`n🧪 TESTING PREVIOUSLY FAILING COMPONENTS" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Import test utilities
$utilPath = Join-Path $PSScriptRoot "scripts\TS_CGA_v1\Test-Utilities.ps1"
if (Test-Path $utilPath) {
    . $utilPath
}

$results = @{
    Passed = 0
    Failed = 0
}

# Test 1: Authentication Connection Issue
Write-Host "`n1️⃣ Testing Authentication (Connection Issue)" -ForegroundColor Yellow

$testUser = @{
    email = "conntest_$(Get-Random -Maximum 9999)@test.com"
    password = "TestPass123!"
    firstName = "Connection"
    lastName = "Test"
}

# Try multiple times to catch connection drops
$connectionTestPassed = $true
for ($i = 1; $i -le 5; $i++) {
    Write-Host "  Attempt $i/5..." -ForegroundColor Gray
    
    try {
        # Register
        $regResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
            -Method POST `
            -Body ($testUser | ConvertTo-Json) `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        # Login
        Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
            -Method POST `
            -Body (@{email = $testUser.email; password = $testUser.password} | ConvertTo-Json) `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        Write-Host "    ✅ Success" -ForegroundColor Green
    } catch {
        Write-Host "    ❌ Failed: $_" -ForegroundColor Red
        $connectionTestPassed = $false
        break
    }
    
    Start-Sleep -Milliseconds 500
}

if ($connectionTestPassed) {
    $results.Passed++
    Write-Host "  ✅ Authentication connection test PASSED" -ForegroundColor Green
} else {
    $results.Failed++
    Write-Host "  ❌ Authentication connection test FAILED" -ForegroundColor Red
}

# Test 2: Product Creation
Write-Host "`n2️⃣ Testing Product Creation" -ForegroundColor Yellow

# Get admin token
$adminUser = @{
    email = "admin_prod_$(Get-Random -Maximum 9999)@test.com"
    password = "AdminPass123!"
    firstName = "Admin"
    lastName = "Product"
}

try {
    $regResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -Body ($adminUser | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    # Make admin (simplified - in real scenario this would be done properly)
    $adminToken = $regResponse.token
    
    # Create products
    $productsPassed = $true
    $products = @(
        @{
            type = "ebook"
            title = "Test Credit Guide $(Get-Random)"
            slug = "test-credit-guide-$(Get-Random)"
            description = "Test description"
            price = 49.99
            shortDescription = "Short desc"
            features = @("Feature 1", "Feature 2")
            status = "published"
        },
        @{
            type = "masterclass"
            title = "Test Masterclass $(Get-Random)"
            slug = "test-masterclass-$(Get-Random)"
            description = "Test masterclass"
            price = 299.99
            eventDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
            duration = 120
            capacity = 50
            status = "published"
        }
    )
    
    foreach ($product in $products) {
        try {
            Invoke-RestMethod -Uri "http://localhost:5000/api/products" `
                -Method POST `
                -Headers @{Authorization = "Bearer $adminToken"} `
                -Body ($product | ConvertTo-Json) `
                -ContentType "application/json" `
                -ErrorAction Stop
            
            Write-Host "  ✅ Created: $($product.title)" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Failed to create: $($product.title)" -ForegroundColor Red
            Write-Host "     Error: $_" -ForegroundColor Red
            $productsPassed = $false
        }
    }
    
    if ($productsPassed) {
        $results.Passed++
    } else {
        $results.Failed++
    }
    
} catch {
    Write-Host "  ❌ Product test setup failed: $_" -ForegroundColor Red
    $results.Failed++
}

# Test 3: Community Discussion Creation
Write-Host "`n3️⃣ Testing Community Discussion Creation" -ForegroundColor Yellow

try {
    # Create user for community test
    $communityUser = @{
        email = "community_$(Get-Random -Maximum 9999)@test.com"
        password = "CommPass123!"
        firstName = "Community"
        lastName = "Tester"
    }
    
    $regResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -Body ($communityUser | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    $userToken = $regResponse.token
    
    # Create discussion
    $discussion = @{
        title = "Test Discussion $(Get-Random)"
        content = "This is a test discussion content"
        category = "general"
        tags = @("test", "qa")
    }
    
    $discResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/community/discussions" `
        -Method POST `
        -Headers @{Authorization = "Bearer $userToken"} `
        -Body ($discussion | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    $discussionId = $discResponse._id ?? $discResponse.data._id
    
    if ($discussionId) {
        Write-Host "  ✅ Discussion created with ID: $discussionId" -ForegroundColor Green
        
        # Test adding post (this was failing with double slash)
        $post = @{
            content = "This is a test post"
        }
        
        Invoke-RestMethod -Uri "http://localhost:5000/api/community/discussions/$discussionId/posts" `
            -Method POST `
            -Headers @{Authorization = "Bearer $userToken"} `
            -Body ($post | ConvertTo-Json) `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        Write-Host "  ✅ Post added to discussion" -ForegroundColor Green
        $results.Passed++
    } else {
        Write-Host "  ❌ Discussion created but no ID returned" -ForegroundColor Red
        $results.Failed++
    }
    
} catch {
    Write-Host "  ❌ Community test failed: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "     Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    $results.Failed++
}

# Test 4: Order Access (401 vs 404)
Write-Host "`n4️⃣ Testing Order Access Error Codes" -ForegroundColor Yellow

try {
    # Test without auth (should be 401)
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/orders/fake-order" `
            -Method GET `
            -ErrorAction Stop
        
        Write-Host "  ❌ Unauthenticated access allowed (should be blocked)" -ForegroundColor Red
        $results.Failed++
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 401) {
            Write-Host "  ✅ Unauthenticated access properly blocked (401)" -ForegroundColor Green
            $results.Passed++
        } else {
            Write-Host "  ❌ Wrong status code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
            $results.Failed++
        }
    }
} catch {
    Write-Host "  ❌ Order test failed: $_" -ForegroundColor Red
    $results.Failed++
}

# Summary
Write-Host "`n📊 COMPONENT TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$total = $results.Passed + $results.Failed
$percentage = if ($total -gt 0) { [math]::Round(($results.Passed / $total) * 100, 2) } else { 0 }

Write-Host "  Passed: $($results.Passed)" -ForegroundColor Green
Write-Host "  Failed: $($results.Failed)" -ForegroundColor Red
Write-Host "  Total: $total" -ForegroundColor Gray
Write-Host "  Success Rate: $percentage%" -ForegroundColor $(if ($percentage -ge 90) { "Green" } elseif ($percentage -ge 70) { "Yellow" } else { "Red" })

if ($results.Failed -eq 0) {
    Write-Host "`n✅ All previously failing components are now working!" -ForegroundColor Green
    Write-Host "   Run the full test suite to verify complete functionality." -ForegroundColor Gray
} else {
    Write-Host "`n⚠️  Some components are still failing." -ForegroundColor Yellow
    Write-Host "   Check the backend logs for detailed error messages." -ForegroundColor Gray
}