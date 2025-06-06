# Simple-Fix-Script.ps1
# Simple targeted fixes for the QA issues
# Run from project root

param(
    [string]$ProjectRoot = (Get-Location).Path
)

Write-Host "`n🔧 Running Simple Targeted Fixes..." -ForegroundColor Cyan

# Step 1: Check server status
Write-Host "`n1. Checking server status..." -ForegroundColor Yellow
$serverRunning = $false
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Server is running" -ForegroundColor Green
    $serverRunning = $true
}
catch {
    Write-Host "❌ Server is not responding!" -ForegroundColor Red
    Write-Host "   Start the server with: cd backend && npm start" -ForegroundColor Yellow
    
    # Try to start server
    $startServer = Read-Host "Would you like to start the server now? (y/n)"
    if ($startServer -eq 'y') {
        Write-Host "Starting server..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\backend'; npm start" -WindowStyle Minimized
        Start-Sleep -Seconds 5
        
        # Check again
        try {
            Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop
            Write-Host "✅ Server started successfully" -ForegroundColor Green
            $serverRunning = $true
        }
        catch {
            Write-Host "❌ Server still not responding" -ForegroundColor Red
        }
    }
}

if (-not $serverRunning) {
    Write-Host "`n⚠️  Cannot proceed without server running" -ForegroundColor Yellow
    exit 1
}

# Step 2: Test and fix Lead validation
Write-Host "`n2. Testing Lead endpoints..." -ForegroundColor Yellow

# Test with minimal data first
$minimalTests = @(
    @{
        Endpoint = "/api/leads"
        Data = @{ email = "minimal_lead@test.com" }
    },
    @{
        Endpoint = "/api/leads/newsletter"
        Data = @{ email = "minimal_newsletter@test.com" }
    }
)

foreach ($test in $minimalTests) {
    Write-Host "   Testing $($test.Endpoint) with minimal data..." -ForegroundColor Gray
    try {
        Invoke-RestMethod -Method POST `
            -Uri "http://localhost:5000$($test.Endpoint)" `
            -ContentType "application/json" `
            -Body ($test.Data | ConvertTo-Json)
        Write-Host "   ✅ Works with minimal data" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Failed with minimal data" -ForegroundColor Red
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorDetails) {
            Write-Host "      Error: $($errorDetails.message)" -ForegroundColor Red
        }
    }
}

# Step 3: Fix Product model issues
Write-Host "`n3. Checking Product model structure..." -ForegroundColor Yellow

$checkProductModel = @'
const mongoose = require('mongoose');
require('dotenv').config();

async function checkProductModel() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
  try {
    const Product = require('./models/product');
    const schema = Product.schema;
    
    console.log('\nProduct Model Required Fields:');
    const requiredFields = [];
    Object.keys(schema.paths).forEach(path => {
      if (schema.paths[path].isRequired) {
        requiredFields.push(path);
        console.log(`  - ${path}: ${schema.paths[path].instance}`);
      }
    });
    
    // Try creating a product with test data
    console.log('\nTesting product creation...');
    const testProduct = {
      type: 'ebook',
      title: 'Test Product',
      price: 49.99,
      description: 'Test description',
      shortDescription: 'Short desc',
      features: ['Feature 1'],
      status: 'published'
    };
    
    // Add any missing required fields
    if (requiredFields.includes('name') && !testProduct.name) {
      testProduct.name = testProduct.title;
    }
    if (requiredFields.includes('slug') && !testProduct.slug) {
      testProduct.slug = testProduct.title.toLowerCase().replace(/\s+/g, '-');
    }
    if (requiredFields.includes('category') && !testProduct.category) {
      testProduct.category = 'guides';
    }
    
    const product = new Product(testProduct);
    await product.validate();
    console.log('✅ Product validates with test data');
    console.log('\nRequired fields for product creation:', requiredFields);
    
  } catch (err) {
    console.error('❌ Product validation failed:', err.message);
    if (err.errors) {
      console.log('Missing fields:');
      Object.keys(err.errors).forEach(field => {
        console.log(`  - ${field}: ${err.errors[field].message}`);
      });
    }
  }
  
  await mongoose.disconnect();
}

checkProductModel().catch(console.error);
'@

$scriptPath = Join-Path $ProjectRoot "backend\check-product-model.js"
$checkProductModel | Out-File -FilePath $scriptPath -Encoding UTF8

Push-Location (Join-Path $ProjectRoot "backend")
try {
    $output = node check-product-model.js 2>&1
    Write-Host $output -ForegroundColor Gray
    
    # Parse output to find required fields
    if ($output -match "Required fields for product creation: (.+)") {
        $requiredFields = $matches[1]
        Write-Host "`n   📝 Product requires these fields: $requiredFields" -ForegroundColor Cyan
    }
    
    Remove-Item $scriptPath -Force
}
finally {
    Pop-Location
}

# Step 4: Update test data to include all required fields
Write-Host "`n4. Creating updated test helpers..." -ForegroundColor Yellow

$updateTestData = @'
# Add to Test-Utilities.ps1 or use directly in Setup-TestData.ps1

function Get-ValidProductData($type = "ebook") {
    $baseProduct = @{
        type = $type
        title = "Test Product $(Get-Random)"
        name = "Test Product $(Get-Random)"  # Add if required
        slug = "test-product-$(Get-Random)"  # Add if required
        category = "guides"                  # Add if required
        price = 49.99
        description = "Complete guide to improving your credit score"
        shortDescription = "Transform your credit score with proven strategies"
        features = @("Feature 1", "Feature 2", "Feature 3")
        status = "published"
    }
    
    # Add type-specific fields
    if ($type -eq "masterclass") {
        $baseProduct.eventDate = (Get-Date).AddDays(14).ToString("yyyy-MM-dd")
        $baseProduct.duration = 120
        $baseProduct.capacity = 50
    }
    
    return $baseProduct
}
'@

Write-Host $updateTestData -ForegroundColor Gray
Write-Host "`n   ℹ️  Use the above function to create valid product data" -ForegroundColor Cyan

# Step 5: Summary and recommendations
Write-Host "`n✅ Analysis Complete!" -ForegroundColor Green
Write-Host "`nRecommendations:" -ForegroundColor Cyan
Write-Host "   1. Check the Product model output above for required fields" -ForegroundColor White
Write-Host "   2. Update Setup-TestData.ps1 to include all required fields for products" -ForegroundColor White
Write-Host "   3. Ensure the Lead model doesn't have unexpected required fields" -ForegroundColor White
Write-Host "   4. Community features will fail (expected - placeholder implementation)" -ForegroundColor White

Write-Host "`n💡 Quick Fix for Product Creation:" -ForegroundColor Yellow
Write-Host "   Add these fields to product test data if missing:" -ForegroundColor White
Write-Host "   - name: 'Product Name'" -ForegroundColor Gray
Write-Host "   - slug: 'product-slug'" -ForegroundColor Gray
Write-Host "   - category: 'guides'" -ForegroundColor Gray

Write-Host "`n📌 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Update your test data based on findings above" -ForegroundColor White
Write-Host "   2. Re-run the QA tests" -ForegroundColor White
Write-Host "   3. Check server console for any detailed errors" -ForegroundColor White