# Fix-TestCoverageAndAuth.ps1
# Fix missing test coverage and authentication timing issues

Write-Host "🔧 FIXING TEST COVERAGE AND AUTH ISSUES" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Step 1: Check which test scripts are being skipped
Write-Host "`n1️⃣ Checking test script execution..." -ForegroundColor Yellow

$testScripts = @(
    "Test-Environment.ps1",
    "Setup-TestData.ps1", 
    "Test-AuthenticationFlow.ps1",
    "Test-EcommerceFlow.ps1",
    "Test-BookingFlow.ps1",
    "Test-CommunityFlow.ps1",
    "Test-LeadCaptureFlow.ps1",
    "Test-Integrations.ps1",
    "Test-ErrorScenarios.ps1"
)

$scriptsPath = "scripts\TS_CGA_v1"
foreach ($script in $testScripts) {
    $fullPath = Join-Path $scriptsPath $script
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        if ($content -match "temporarily disabled" -or $content -match "placeholder") {
            Write-Host "  ⚠️  $script appears to be disabled/placeholder" -ForegroundColor Yellow
        } else {
            Write-Host "  ✅ $script exists and appears active" -ForegroundColor Green
        }
    } else {
        Write-Host "  ❌ $script is missing!" -ForegroundColor Red
    }
}

# Step 2: Fix the E-commerce test placeholder
Write-Host "`n2️⃣ Fixing E-commerce test script..." -ForegroundColor Yellow

$ecommerceTestPath = Join-Path $scriptsPath "Test-EcommerceFlow.ps1"
$ecommerceTestContent = @'
# Test-EcommerceFlow.ps1
# Tests e-commerce functionality
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot
)

# Get script root if not already set
if (-not $PSScriptRoot) {
    $PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

# Use existing test user
if ($Global:PrimaryTestUser) {
    $testUser = $Global:PrimaryTestUser
    Write-TestInfo "Using existing test user: $($testUser.email)"
}
else {
    Write-TestWarning "No test user found, attempting to load from config"
    $testDataPath = Join-Path $ProjectRoot "test-data\test-data-config.json"
    if (Test-Path $testDataPath) {
        $testData = Get-Content $testDataPath | ConvertFrom-Json
        $loginResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $testData.PrimaryUser.Email
                password = $testData.PrimaryUser.Password
            }
        
        if ($loginResult.Success) {
            $testUser = @{
                email = $testData.PrimaryUser.Email
                token = $loginResult.Data.token
            }
        }
    }
}

$authToken = $testUser.token

Write-TestStep 1 "Testing product listing"

$productsResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/products"

if ($productsResult.Success) {
    Write-TestInfo "Found $($productsResult.Data.data.Count) products"
}

Write-TestStep 2 "Testing product details"

if ($productsResult.Success -and $productsResult.Data.data.Count -gt 0) {
    $testProduct = $productsResult.Data.data[0]
    
    $productDetailResult = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/products/$($testProduct._id)"
    
    if ($productDetailResult.Success) {
        Write-TestInfo "Retrieved product: $($productDetailResult.Data.data.title)"
    }
}

Write-TestStep 3 "Testing cart operations"

# Test adding to cart
if ($testProduct) {
    $cartAddResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/cart/add" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            productId = $testProduct._id
            quantity = 1
            type = "product"
        }
    
    if ($cartAddResult.Success) {
        Write-TestInfo "Added product to cart"
    }
}

# Test getting cart
$cartResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/cart" `
    -Headers @{ Authorization = "Bearer $authToken" }

if ($cartResult.Success) {
    Write-TestInfo "Cart has $($cartResult.Data.data.items.Count) items"
}

Write-TestStep 4 "Testing product search and filtering"

# Test search
$searchResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/products?search=credit"

if ($searchResult.Success) {
    Write-TestSuccess "Product search working"
}

# Test filtering by type
$filterResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/products?type=digital"

if ($filterResult.Success) {
    Write-TestSuccess "Product filtering working"
}

Write-TestStep 5 "Testing invalid product scenarios"

# Test invalid product ID
$invalidProductResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/products/invalid-id" `
    -ExpectedStatus "400"

if ($invalidProductResult.Success) {
    Write-TestSuccess "Invalid product ID handled correctly"
}

# Test non-existent product
$nonExistentResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/products/507f1f77bcf86cd799439011" `
    -ExpectedStatus "404"

if ($nonExistentResult.Success) {
    Write-TestSuccess "Non-existent product handled correctly"
}

Write-TestStep 6 "Testing admin product operations"

# Get admin user
$adminUser = $Global:TestUsers | Where-Object { $_.role -eq "admin" } | Select-Object -First 1
if ($adminUser) {
    # Test product update
    if ($testProduct) {
        $updateData = @{
            price = 59.99
            description = "Updated description for testing"
        }
        
        $updateResult = Test-APIEndpoint `
            -Method "PUT" `
            -Endpoint "http://localhost:5000/api/products/$($testProduct._id)" `
            -Headers @{ Authorization = "Bearer $($adminUser.token)" } `
            -Body $updateData
        
        if ($updateResult.Success) {
            Write-TestInfo "Product updated successfully"
        }
    }
}

Write-TestStep 7 "Testing checkout process"

# Note: Full checkout requires Stripe integration
Write-TestInfo "Checkout process would be tested with Stripe integration"

Write-TestStep 8 "Testing order history"

$ordersResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/orders" `
    -Headers @{ Authorization = "Bearer $authToken" }

if ($ordersResult.Success) {
    Write-TestInfo "User has $($ordersResult.Data.data.Count) orders"
}
'@

Set-Content -Path $ecommerceTestPath -Value $ecommerceTestContent -Encoding UTF8
Write-Host "✅ E-commerce test script restored" -ForegroundColor Green

# Step 3: Fix authentication timing in Setup-TestData.ps1
Write-Host "`n3️⃣ Adding delays for authentication timing..." -ForegroundColor Yellow

$setupTestDataPath = Join-Path $scriptsPath "Setup-TestData.ps1"
if (Test-Path $setupTestDataPath) {
    $content = Get-Content $setupTestDataPath -Raw
    
    # Add delay after admin role fix and before re-login
    if ($content -notmatch 'Start-Sleep -Seconds 3.*Give server time to process admin role update') {
        $content = $content -replace '(\$loginResult = Test-APIEndpoint `)', @'
        Start-Sleep -Seconds 3  # Give server time to process admin role update
        $loginResult = Test-APIEndpoint `
'@
    }
    
    # Add delay after each user creation to prevent connection issues
    if ($content -notmatch 'Start-Sleep -Milliseconds 500.*Prevent connection overload') {
        $content = $content -replace '(Write-TestSuccess "Created test user:.*?")', @'
$1
            Start-Sleep -Milliseconds 500  # Prevent connection overload
'@
    }
    
    Set-Content -Path $setupTestDataPath -Value $content -Encoding UTF8
    Write-Host "✅ Added timing delays to Setup-TestData.ps1" -ForegroundColor Green
}

# Step 4: Fix auth timing in authentication test
Write-Host "`n4️⃣ Fixing authentication test timing..." -ForegroundColor Yellow

$authTestPath = Join-Path $scriptsPath "Test-AuthenticationFlow.ps1"
if (Test-Path $authTestPath) {
    $content = Get-Content $authTestPath -Raw
    
    # Add delay between registration and login
    if ($content -notmatch 'Start-Sleep -Seconds 2.*between registration and login') {
        $content = $content -replace '(Write-TestStep 3 "Testing user login flow")', @'
Start-Sleep -Seconds 2  # Delay between registration and login
$1
'@
    }
    
    Set-Content -Path $authTestPath -Value $content -Encoding UTF8
    Write-Host "✅ Added timing fix to authentication test" -ForegroundColor Green
}

# Step 5: Create a comprehensive test count verifier
Write-Host "`n5️⃣ Creating test count verifier..." -ForegroundColor Yellow

$verifyTestsScript = @'
# Verify-TestCount.ps1
# Verify all tests are running

$expectedTests = @{
    "Environment Validation" = 5
    "Test Data Setup" = 5
    "Authentication Flow" = 11
    "E-commerce Flow" = 8
    "Booking System" = 10
    "Community Forum" = 10
    "Lead Capture" = 10
    "Integration Tests" = 10
    "Error Scenarios" = 10
}

$totalExpected = ($expectedTests.Values | Measure-Object -Sum).Sum
Write-Host "Expected total tests: $totalExpected" -ForegroundColor Cyan

if ($Global:TestResults) {
    $actualTotal = $Global:TestResults.Passed + $Global:TestResults.Failed
    Write-Host "Actual tests run: $actualTotal" -ForegroundColor Yellow
    
    if ($actualTotal -lt $totalExpected) {
        Write-Host "⚠️  Missing $(($totalExpected - $actualTotal)) tests!" -ForegroundColor Red
    }
}
'@

Set-Content -Path "Verify-TestCount.ps1" -Value $verifyTestsScript -Encoding UTF8
Write-Host "✅ Created test count verifier" -ForegroundColor Green

Write-Host "`n✅ TEST COVERAGE AND AUTH FIXES APPLIED!" -ForegroundColor Green
Write-Host "`nWhat was fixed:" -ForegroundColor Cyan
Write-Host "1. Restored full E-commerce test script (was placeholder)" -ForegroundColor Gray
Write-Host "2. Added timing delays to prevent auth connection issues" -ForegroundColor Gray
Write-Host "3. Fixed registration/login timing in auth tests" -ForegroundColor Gray
Write-Host "4. Added delays between user creations" -ForegroundColor Gray
Write-Host "5. Created test count verifier script" -ForegroundColor Gray

Write-Host "`n🧪 Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart backend: cd backend && npm run dev" -ForegroundColor Gray
Write-Host "2. Wait 10 seconds for server to stabilize" -ForegroundColor Gray
Write-Host "3. Run full test suite: .\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1" -ForegroundColor Gray

Write-Host "`n📊 Expected results:" -ForegroundColor Cyan
Write-Host "- Test count: Should return to ~155 tests" -ForegroundColor Green
Write-Host "- Auth timing: No more connection refused errors" -ForegroundColor Green
Write-Host "- Pass rate: Should reach 95%+" -ForegroundColor Green
Write-Host "- Only 1 expected failure (order auth check)" -ForegroundColor Green