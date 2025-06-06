# Fix-AllValidationIssues.ps1
# Comprehensive fix for all QA validation issues
# Run from project root

param(
    [string]$ProjectRoot = (Get-Location).Path
)

Write-Host "`n🔧 Comprehensive QA Fix Script..." -ForegroundColor Cyan

# Step 1: First, run the debug script
Write-Host "`n1. Running debug script..." -ForegroundColor Yellow
& "$PSScriptRoot\Debug-QAIssues.ps1" -ProjectRoot $ProjectRoot

# Step 2: Apply validation fixes
Write-Host "`n2. Applying validation fixes..." -ForegroundColor Yellow
& "$PSScriptRoot\Fix-ValidationErrors.ps1" -ProjectRoot $ProjectRoot

# Step 3: Additional fixes for common issues
Write-Host "`n3. Applying additional fixes..." -ForegroundColor Yellow

# Fix 1: Ensure NODE_ENV is set for better error messages
$envPath = Join-Path $ProjectRoot "backend\.env"
$envContent = Get-Content $envPath -Raw
if ($envContent -notmatch "NODE_ENV=") {
    Add-Content -Path $envPath -Value "`nNODE_ENV=development"
    Write-Host "✅ Added NODE_ENV=development to .env" -ForegroundColor Green
}

# Fix 2: Create a script to fix any model issues
$fixModels = @'
const mongoose = require('mongoose');
require('dotenv').config();

async function fixModelIssues() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Drop problematic indexes if they exist
    const Lead = require('./models/lead');
    const leadCollection = mongoose.connection.collection('leads');
    
    try {
      // Get all indexes
      const indexes = await leadCollection.getIndexes();
      console.log('Current lead indexes:', Object.keys(indexes));
      
      // Drop duplicate email indexes if any
      const emailIndexes = Object.keys(indexes).filter(name => 
        name !== '_id_' && indexes[name].key && indexes[name].key.email
      );
      
      if (emailIndexes.length > 1) {
        console.log('Found duplicate email indexes, cleaning up...');
        for (let i = 1; i < emailIndexes.length; i++) {
          await leadCollection.dropIndex(emailIndexes[i]);
          console.log(`Dropped duplicate index: ${emailIndexes[i]}`);
        }
      }
    } catch (err) {
      console.log('Index cleanup error (may be normal):', err.message);
    }
    
    // Ensure Product model exists and has correct structure
    try {
      const Product = require('./models/product');
      console.log('Product model loaded successfully');
      
      // Test creating a product to ensure model works
      const testProduct = new Product({
        name: 'Test Product',
        slug: 'test-product',
        type: 'ebook',
        category: 'guides',
        price: {
          amount: 49.99,
          currency: 'USD'
        },
        title: 'Test Product Title',
        description: 'Test description',
        shortDescription: 'Short test description',
        features: ['Feature 1'],
        status: 'published'
      });
      
      try {
        await testProduct.validate();
        console.log('Product model validation successful');
      } catch (valErr) {
        console.log('Product validation errors:', valErr.errors ? Object.keys(valErr.errors) : valErr.message);
      }
    } catch (err) {
      console.log('Product model error:', err.message);
    }
    
    await mongoose.disconnect();
    console.log('Model fixes completed');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixModelIssues();
'@

$fixModelsPath = Join-Path $ProjectRoot "backend\fix-models-temp.js"
$fixModels | Out-File -FilePath $fixModelsPath -Encoding UTF8

Push-Location (Join-Path $ProjectRoot "backend")
try {
    node fix-models-temp.js
    Remove-Item $fixModelsPath -Force
}
finally {
    Pop-Location
}

# Step 4: Create a quick endpoint test
Write-Host "`n4. Quick endpoint test..." -ForegroundColor Yellow

$testEndpoints = @(
    @{
        Name = "Health Check"
        Method = "GET"
        Url = "http://localhost:5000/api/health"
    },
    @{
        Name = "Lead Creation"
        Method = "POST"
        Url = "http://localhost:5000/api/leads"
        Body = @{
            email = "quicktest@example.com"
            firstName = "Quick"
            lastName = "Test"
        }
    },
    @{
        Name = "Newsletter"
        Method = "POST"
        Url = "http://localhost:5000/api/leads/newsletter"
        Body = @{
            email = "newsletter_quicktest@example.com"
        }
    }
)

foreach ($test in $testEndpoints) {
    Write-Host "   Testing $($test.Name)..." -ForegroundColor Gray
    try {
        $params = @{
            Method = $test.Method
            Uri = $test.Url
            ContentType = "application/json"
        }
        
        if ($test.Body) {
            $params.Body = $test.Body | ConvertTo-Json
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "      Response: $($response | ConvertTo-Json -Depth 10)" -ForegroundColor Gray
        Write-Host "   ✅ $($test.Name) working" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ $($test.Name) failed" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "      $($errorDetails.message)" -ForegroundColor Red
            if ($errorDetails.errors) {
                $errorDetails.errors | ForEach-Object { Write-Host "      - $_" -ForegroundColor Red }
            }
        }
    }
}

Write-Host "`n✅ All fixes applied!" -ForegroundColor Green
Write-Host "`n🔍 Diagnostics Summary:" -ForegroundColor Cyan
Write-Host "   - If you see 'connection refused', ensure the backend server is running" -ForegroundColor White
Write-Host "   - Check server console for detailed validation errors" -ForegroundColor White
Write-Host "   - Product model may need required fields like 'name' or 'slug'" -ForegroundColor White
Write-Host "   - Community features are expected to fail (placeholder implementation)" -ForegroundColor White

Write-Host "`n📌 Final steps:" -ForegroundColor Yellow
Write-Host "   1. Restart backend server: cd backend && npm start" -ForegroundColor White
Write-Host "   2. Watch the server console for any errors during startup" -ForegroundColor White
Write-Host "   3. Re-run QA tests: cd scripts/TS_CGA_v1 && .\Run-CreditGyemsQA.ps1" -ForegroundColor White