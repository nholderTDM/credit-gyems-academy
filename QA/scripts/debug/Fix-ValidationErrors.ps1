# Fix-ValidationErrors.ps1
# Fix validation and model issues
# Run from project root

param(
    [string]$ProjectRoot = (Get-Location).Path
)

Write-Host "`n🔧 Fixing Validation and Model Issues..." -ForegroundColor Cyan

# Step 1: Update leadController to show validation errors in development
Write-Host "`n1. Updating leadController for better error reporting..." -ForegroundColor Yellow

$leadControllerPath = Join-Path $ProjectRoot "backend\controllers\leadController.js"
$content = Get-Content $leadControllerPath -Raw

# Find and replace the generic validation error responses
$updatedContent = $content -replace `
    "if \(error\.name === 'ValidationError'\) \{\s*return res\.status\(400\)\.json\(\{\s*success: false,\s*message: 'Invalid input data'\s*\}\);\s*\}", `
    @"
if (error.name === 'ValidationError') {
      // In development, show detailed validation errors
      const errors = Object.values(error.errors).map(e => e.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        ...(process.env.NODE_ENV === 'development' && { errors })
      });
    }
"@

$updatedContent | Out-File -FilePath $leadControllerPath -Encoding UTF8
Write-Host "✅ Updated leadController.js" -ForegroundColor Green

# Step 2: Update contactController similarly
Write-Host "`n2. Updating contactController..." -ForegroundColor Yellow

$contactControllerPath = Join-Path $ProjectRoot "backend\controllers\contactController.js"
if (Test-Path $contactControllerPath) {
    $content = Get-Content $contactControllerPath -Raw
    $updatedContent = $content -replace `
        "if \(error\.name === 'ValidationError'\) \{\s*return res\.status\(400\)\.json\(\{\s*success: false,\s*message: 'Invalid input data'\s*\}\);\s*\}", `
        @"
if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        ...(process.env.NODE_ENV === 'development' && { errors })
      });
    }
"@
    $updatedContent | Out-File -FilePath $contactControllerPath -Encoding UTF8
    Write-Host "✅ Updated contactController.js" -ForegroundColor Green
}

# Step 3: Check Lead model for issues
Write-Host "`n3. Checking Lead model..." -ForegroundColor Yellow

$checkLeadModel = @'
const mongoose = require('mongoose');
require('dotenv').config();

async function checkLeadModel() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const Lead = require('./models/lead');
    
    // Test creating a lead with minimal data
    console.log('\nTesting lead creation with minimal data...');
    const testLead = new Lead({
      email: 'test@example.com'
    });
    
    try {
      await testLead.validate();
      console.log('✅ Lead validates with just email');
    } catch (err) {
      console.log('❌ Lead validation failed:', err.message);
      if (err.errors) {
        Object.keys(err.errors).forEach(field => {
          console.log(`   - ${field}: ${err.errors[field].message}`);
        });
      }
    }
    
    // Check indexes
    const indexes = await Lead.collection.getIndexes();
    console.log('\nLead collection indexes:');
    Object.keys(indexes).forEach(key => {
      console.log(`  - ${key}:`, indexes[key].key);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLeadModel();
'@

$checkModelPath = Join-Path $ProjectRoot "backend\check-lead-model.js"
$checkLeadModel | Out-File -FilePath $checkModelPath -Encoding UTF8

Push-Location (Join-Path $ProjectRoot "backend")
try {
    node check-lead-model.js
    Remove-Item $checkModelPath -Force
}
finally {
    Pop-Location
}

# Step 4: Fix Product creation issues
Write-Host "`n4. Checking Product model and controller..." -ForegroundColor Yellow

$productControllerPath = Join-Path $ProjectRoot "backend\controllers\productController.js"
if (Test-Path $productControllerPath) {
    # Update product controller to show better errors
    $content = Get-Content $productControllerPath -Raw
    if ($content -match "catch \(error\)") {
        Write-Host "   Updating product controller error handling..." -ForegroundColor Gray
        # Add detailed logging
        $updatedContent = $content -replace `
            "console\.error\('Product creation error:', error\);", `
            @"
console.error('Product creation error:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', Object.keys(error.errors).map(k => `${k}: ${error.errors[k].message}`));
    }
"@
        $updatedContent | Out-File -FilePath $productControllerPath -Encoding UTF8
    }
}

# Step 5: Create a test script to identify the exact issues
Write-Host "`n5. Creating detailed test script..." -ForegroundColor Yellow

$detailedTest = @'
const mongoose = require('mongoose');
require('dotenv').config();

async function runDetailedTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    // Test 1: Lead Newsletter
    console.log('=== Testing Newsletter Subscription ===');
    const Lead = require('./models/lead');
    
    const newsletterData = {
      email: 'newsletter@test.com',
      firstName: 'Test',
      lastName: 'User',
      source: 'newsletter',
      interests: ['newsletter'],
      isSubscribedToEmails: true
    };
    
    try {
      const lead = new Lead(newsletterData);
      await lead.validate();
      console.log('✅ Newsletter data validates');
    } catch (err) {
      console.log('❌ Newsletter validation failed:');
      if (err.errors) {
        Object.keys(err.errors).forEach(field => {
          console.log(`   ${field}: ${err.errors[field].message}`);
        });
      } else {
        console.log('   ', err.message);
      }
    }
    
    // Test 2: Product Creation
    console.log('\n=== Testing Product Creation ===');
    try {
      const Product = require('./models/product');
      const productData = {
        type: 'ebook',
        title: 'Test Product',
        price: 49.99,
        description: 'Test description',
        shortDescription: 'Short desc',
        features: ['Feature 1'],
        status: 'published'
      };
      
      const product = new Product(productData);
      await product.validate();
      console.log('✅ Product data validates');
    } catch (err) {
      console.log('❌ Product validation failed:');
      if (err.errors) {
        Object.keys(err.errors).forEach(field => {
          console.log(`   ${field}: ${err.errors[field].message}`);
        });
      } else {
        console.log('   ', err.message);
      }
    }
    
    // Test 3: Check Community Models
    console.log('\n=== Testing Community Models ===');
    try {
      const Discussion = require('./models/discussion');
      console.log('✅ Discussion model loads');
    } catch (err) {
      console.log('❌ Discussion model missing or has errors:', err.message);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Test error:', error);
  }
}

runDetailedTests();
'@

$testPath = Join-Path $ProjectRoot "backend\detailed-model-test.js"
$detailedTest | Out-File -FilePath $testPath -Encoding UTF8

Push-Location (Join-Path $ProjectRoot "backend")
try {
    node detailed-model-test.js
    Remove-Item $testPath -Force
}
finally {
    Pop-Location
}

Write-Host "`n✅ Validation error fixes applied!" -ForegroundColor Green
Write-Host "`n📌 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Restart your backend server to apply changes" -ForegroundColor White
Write-Host "   2. Check the console output above for any model issues" -ForegroundColor White
Write-Host "   3. Run the debug script to test endpoints: .\Debug-QAIssues.ps1" -ForegroundColor White
Write-Host "   4. Re-run the QA tests" -ForegroundColor White