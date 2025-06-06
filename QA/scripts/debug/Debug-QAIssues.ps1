# Debug-QAIssues.ps1
# Diagnose issues with QA tests
# Run from project root

param(
    [string]$ProjectRoot = (Get-Location).Path
)

Write-Host "`n🔍 Debugging QA Test Issues..." -ForegroundColor Cyan

# Step 1: Check if server is running
Write-Host "`n1. Checking server status..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
    Write-Host "✅ Server is running" -ForegroundColor Green
    Write-Host "   MongoDB: $($healthCheck.mongodb)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Server is not responding!" -ForegroundColor Red
    Write-Host "   Please start the backend server: cd backend && npm start" -ForegroundColor Yellow
    exit 1
}

# Step 2: Check database models
Write-Host "`n2. Checking database models..." -ForegroundColor Yellow

$checkModelsScript = @'
const mongoose = require('mongoose');
require('dotenv').config();

async function checkModels() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if Lead model has proper validation
    const Lead = require('./models/lead');
    const leadSchema = Lead.schema;
    console.log('\nLead model required fields:');
    Object.keys(leadSchema.paths).forEach(path => {
      const field = leadSchema.paths[path];
      if (field.isRequired) {
        console.log(`  - ${path}: required`);
      }
    });
    
    // Check Product model
    try {
      const Product = require('./models/product');
      console.log('\nProduct model loaded successfully');
    } catch (err) {
      console.log('\n❌ Product model error:', err.message);
    }
    
    // Check Discussion model
    try {
      const Discussion = require('./models/discussion');
      console.log('Discussion model loaded successfully');
    } catch (err) {
      console.log('❌ Discussion model error:', err.message);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkModels();
'@

$modelCheckPath = Join-Path $ProjectRoot "backend\check-models-temp.js"
$checkModelsScript | Out-File -FilePath $modelCheckPath -Encoding UTF8

Push-Location (Join-Path $ProjectRoot "backend")
try {
    Write-Host "Checking models..." -ForegroundColor Gray
    node check-models-temp.js
    Remove-Item $modelCheckPath -Force
}
finally {
    Pop-Location
}

# Step 3: Test specific endpoints with detailed error info
Write-Host "`n3. Testing specific endpoints..." -ForegroundColor Yellow

# Test lead creation with different data
$testData = @{
    newsletter = @{
        email = "test_debug_$(Get-Random)@example.com"
        firstName = "Debug"
        lastName = "Test"
    }
    lead = @{
        email = "test_lead_$(Get-Random)@example.com"
        firstName = "Lead"
        lastName = "Debug"
        phone = "555-1234"
        source = "debug_test"
        interests = @("credit_repair")
    }
    contact = @{
        email = "test_contact_$(Get-Random)@example.com"
        firstName = "Contact"
        lastName = "Debug"
        phone = "555-5678"
        subject = "Debug Test"
        message = "This is a debug test message to check validation"
    }
}

# Test newsletter endpoint
Write-Host "`n   Testing newsletter endpoint..." -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/leads/newsletter" `
        -ContentType "application/json" `
        -Body ($testData.newsletter | ConvertTo-Json)
    Write-Host "   ✅ Newsletter endpoint working" -ForegroundColor Green
    Write-Host "      Response: $($response | ConvertTo-Json -Depth 10)" -ForegroundColor Gray
}
catch {
    Write-Host "   ❌ Newsletter endpoint failed" -ForegroundColor Red
    $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "      Error: $($errorDetail.message)" -ForegroundColor Red
    
    # Try with minimal data to find required fields
    Write-Host "      Testing with only email..." -ForegroundColor Gray
    try {
        $minimalTest = @{ email = "minimal@test.com" } | ConvertTo-Json
        $response = Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/leads/newsletter" `
            -ContentType "application/json" -Body $minimalTest
        Write-Host "      ✅ Works with just email" -ForegroundColor Green
    }
    catch {
        Write-Host "      ❌ Still fails with just email" -ForegroundColor Red
    }
}

# Test lead endpoint
Write-Host "`n   Testing lead endpoint..." -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/leads" `
        -ContentType "application/json" `
        -Body ($testData.lead | ConvertTo-Json)
    Write-Host "   ✅ Lead endpoint working" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Lead endpoint failed" -ForegroundColor Red
    $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "      Error: $($errorDetail.message)" -ForegroundColor Red
}

# Test contact endpoint
Write-Host "`n   Testing contact endpoint..." -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:5000/api/leads" `
        -ContentType "application/json" `
        -Body ($testData.contact | ConvertTo-Json)
    Write-Host "   ✅ Contact endpoint working" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Contact endpoint failed" -ForegroundColor Red
    $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "      Error: $($errorDetail.message)" -ForegroundColor Red
}

# Step 4: Check for MongoDB validation errors in logs
Write-Host "`n4. Common issues to check:" -ForegroundColor Yellow
Write-Host "   - Ensure MongoDB is running" -ForegroundColor White
Write-Host "   - Check if Lead model has unexpected required fields" -ForegroundColor White
Write-Host "   - Verify email validation is not too strict" -ForegroundColor White
Write-Host "   - Check server logs for detailed validation errors" -ForegroundColor White

Write-Host "`n💡 Recommendation: Check the server console for detailed error messages" -ForegroundColor Cyan