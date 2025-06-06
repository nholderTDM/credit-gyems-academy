# Diagnose-ProductIssue.ps1
# Diagnose why product creation is failing

Write-Host "🔍 DIAGNOSING PRODUCT CREATION ISSUE" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Get admin token first
Write-Host "`n1️⃣ Getting admin token..." -ForegroundColor Yellow
$adminCreds = @{
    email = "test_20250603210047_7530@creditgyemstest.com"  # Latest admin from test data
    password = "TestPass123!"
}

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Body ($adminCreds | ConvertTo-Json) `
        -ContentType "application/json"
    
    $adminToken = $loginResponse.token
    Write-Host "✅ Admin login successful" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Using alternate admin credentials..." -ForegroundColor Yellow
    # Try another admin user
    $adminCreds.email = "test_20250603191913_1781@creditgyemstest.com"
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
            -Method POST `
            -Body ($adminCreds | ConvertTo-Json) `
            -ContentType "application/json"
        
        $adminToken = $loginResponse.token
        Write-Host "✅ Alternate admin login successful" -ForegroundColor Green
    } catch {
        Write-Host "❌ Admin login failed" -ForegroundColor Red
        $adminToken = ""
    }
}

# Test different product formats
Write-Host "`n2️⃣ Testing different product formats..." -ForegroundColor Yellow

$testProducts = @(
    @{
        name = "Test 1 - Basic Product"
        testData = @{
            name = "Basic Product"
            description = "Test description"
            price = 29.99
            category = "guide"
            type = "digital"
        }
    },
    @{
        name = "Test 2 - With Title (no name)"
        testData = @{
            title = "Product with Title"
            description = "Test description"
            price = 29.99
            category = "guide"
            type = "digital"
        }
    },
    @{
        name = "Test 3 - Original Test Format"
        testData = @{
            type = "ebook"
            title = "Original Format Product"
            description = "Test description"
            price = 29.99
            status = "published"
        }
    },
    @{
        name = "Test 4 - Controller Expected Format"
        testData = @{
            title = "Controller Format Product"
            description = "Test description"
            shortDescription = "Short desc"
            type = "ebook"
            price = 29.99
            status = "published"
        }
    }
)

$headers = @{ Authorization = "Bearer $adminToken" }

foreach ($test in $testProducts) {
    Write-Host "`n  Testing: $($test.name)" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/products" `
            -Method POST `
            -Headers $headers `
            -Body ($test.testData | ConvertTo-Json) `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        Write-Host "  ✅ SUCCESS! Product created with this format" -ForegroundColor Green
        Write-Host "     ID: $($response.data._id)" -ForegroundColor Gray
        Write-Host "     Type: $($response.data.type)" -ForegroundColor Gray
    } catch {
        Write-Host "  ❌ FAILED" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "     Error: $($errorResponse.message)" -ForegroundColor Red
        }
    }
}

# Check current product model
Write-Host "`n3️⃣ Checking product model schema..." -ForegroundColor Yellow

$modelPath = "backend\models\product.js"
if (Test-Path $modelPath) {
    $modelContent = Get-Content $modelPath -Raw
    
    # Check for key indicators
    $checks = @(
        @{ Name = "Supports 'name' field"; Pattern = "name:\s*\{" },
        @{ Name = "Supports 'title' field"; Pattern = "title:\s*\{" },
        @{ Name = "Has 'ebook' in type enum"; Pattern = "'ebook'" },
        @{ Name = "Has 'digital' in type enum"; Pattern = "'digital'" },
        @{ Name = "Category is required"; Pattern = "category:.*required:\s*true" },
        @{ Name = "Pre-save hook exists"; Pattern = "ProductSchema\.pre\('save'" }
    )
    
    foreach ($check in $checks) {
        if ($modelContent -match $check.Pattern) {
            Write-Host "  ✅ $($check.Name)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($check.Name)" -ForegroundColor Red
        }
    }
}

# Check controller
Write-Host "`n4️⃣ Checking product controller..." -ForegroundColor Yellow

$controllerPath = "backend\controllers\productController.js"
if (Test-Path $controllerPath) {
    $controllerContent = Get-Content $controllerPath -Raw
    
    # Check what fields the controller is using
    if ($controllerContent -match "new Product\(\{([^}]+)\}") {
        $productCreation = $matches[1]
        Write-Host "  Controller creates product with these fields:" -ForegroundColor Gray
        $fields = $productCreation -split ',' | ForEach-Object { $_.Trim() -split ':' | Select-Object -First 1 }
        $fields | ForEach-Object { Write-Host "    - $_" -ForegroundColor Gray }
    }
}

Write-Host "`n📊 DIAGNOSIS SUMMARY" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "Based on the tests above, we can see which format works." -ForegroundColor Gray
Write-Host "Run the fix script below to apply the working solution." -ForegroundColor Gray