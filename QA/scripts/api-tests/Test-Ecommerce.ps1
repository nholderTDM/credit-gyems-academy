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
