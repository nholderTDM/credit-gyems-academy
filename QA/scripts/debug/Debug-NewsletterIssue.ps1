# Debug-NewsletterIssue.ps1
# Debug why newsletter subscription is failing
# Run from project root

param(
    [string]$ProjectRoot = (Get-Location).Path
)

Write-Host "`n🔍 Debugging Newsletter Subscription Issue..." -ForegroundColor Cyan

# Step 1: Check Lead model validation
Write-Host "`n1. Checking Lead model validation..." -ForegroundColor Yellow

$checkLeadValidation = @'
const mongoose = require('mongoose');
require('dotenv').config();

async function debugNewsletter() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    const Lead = require('./models/lead');
    
    // Check required fields
    console.log('Lead Model Required Fields:');
    const schema = Lead.schema;
    const requiredFields = [];
    Object.keys(schema.paths).forEach(path => {
      if (schema.paths[path].isRequired) {
        requiredFields.push(path);
        console.log(`  - ${path}: ${schema.paths[path].instance}`);
      }
    });
    
    // Test newsletter subscription data
    console.log('\nTesting newsletter subscription data:');
    const newsletterData = {
      email: 'newsletter@test.com',
      firstName: '',
      lastName: '',
      source: 'newsletter',
      interests: ['newsletter'],
      isSubscribedToEmails: true
    };
    
    try {
      const lead = new Lead(newsletterData);
      await lead.validate();
      console.log('✅ Newsletter data validates successfully');
    } catch (err) {
      console.log('❌ Newsletter validation failed:');
      if (err.errors) {
        Object.keys(err.errors).forEach(field => {
          console.log(`   ${field}: ${err.errors[field].message}`);
        });
      } else {
        console.log('   ', err.message);
      }
      
      // Try with different combinations
      console.log('\nTrying with only email:');
      try {
        const minimalLead = new Lead({ email: 'minimal@test.com' });
        await minimalLead.validate();
        console.log('✅ Validates with just email');
      } catch (minErr) {
        console.log('❌ Fails with just email:', minErr.errors ? Object.keys(minErr.errors) : minErr.message);
      }
    }
    
    // Check for unique indexes that might cause issues
    console.log('\nChecking indexes:');
    const indexes = await Lead.collection.getIndexes();
    Object.keys(indexes).forEach(key => {
      if (indexes[key].unique) {
        console.log(`  - ${key}: UNIQUE index on`, indexes[key].key);
      }
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugNewsletter();
'@

$scriptPath = Join-Path $ProjectRoot "backend\debug-newsletter.js"
$checkLeadValidation | Out-File -FilePath $scriptPath -Encoding UTF8

Push-Location (Join-Path $ProjectRoot "backend")
try {
    node debug-newsletter.js
    Remove-Item $scriptPath -Force
}
finally {
    Pop-Location
}

# Step 2: Test newsletter endpoint with verbose error handling
Write-Host "`n2. Testing newsletter endpoint directly..." -ForegroundColor Yellow

# Temporarily update the controller to show detailed errors
# Removed unused $updateController variable assignment

# Test various newsletter data combinations
$testCases = @(
    @{
        Name = "With all fields"
        Data = @{
            email = "test_all_fields@example.com"
            firstName = "Test"
            lastName = "User"
        }
    },
    @{
        Name = "Email only"
        Data = @{
            email = "test_email_only@example.com"
        }
    },
    @{
        Name = "With source field"
        Data = @{
            email = "test_with_source@example.com"
            source = "newsletter"
        }
    }
)

Write-Host "`nTesting different data combinations:" -ForegroundColor Gray
foreach ($test in $testCases) {
    Write-Host "`n   Testing: $($test.Name)" -ForegroundColor Gray
    try {
        $response = Invoke-RestMethod -Method POST `
            -Uri "http://localhost:5000/api/leads/newsletter" `
            -ContentType "application/json" `
            -Body ($test.Data | ConvertTo-Json)
        Write-Host "      Response: $($response | ConvertTo-Json -Depth 10)" -ForegroundColor Green
        Write-Host "   ✅ Success" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Failed" -ForegroundColor Red
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorDetails) {
            Write-Host "      Message: $($errorDetails.message)" -ForegroundColor Red
            if ($errorDetails.errors) {
                Write-Host "      Errors: $($errorDetails.errors -join ', ')" -ForegroundColor Red
            }
        }
    }
}

# Step 3: Check server logs
Write-Host "`n3. Check your server console for detailed error messages" -ForegroundColor Yellow
Write-Host "   Look for 'Validation errors:' messages" -ForegroundColor Gray

# Step 4: Provide fix suggestions
Write-Host "`n💡 Possible fixes:" -ForegroundColor Cyan
Write-Host "   1. The Lead model might have additional required fields not shown in the controller" -ForegroundColor White
Write-Host "   2. There might be a unique index constraint causing issues" -ForegroundColor White
Write-Host "   3. The email validation might be too strict" -ForegroundColor White

Write-Host "`n📌 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Check the output above for required fields" -ForegroundColor White
Write-Host "   2. Look at your server console for validation errors" -ForegroundColor White
Write-Host "   3. If there are extra required fields, update the leadController.js" -ForegroundColor White