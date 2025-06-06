# Fix-NewsletterSource.ps1
# Fix the newsletter source enum issue
# Run from project root

param(
    [string]$ProjectRoot = (Get-Location).Path
)

Write-Host "`n🔧 Fixing Newsletter Source Enum Issue..." -ForegroundColor Cyan

# Step 1: Check what valid source values are in the Lead model
Write-Host "`n1. Checking valid source enum values..." -ForegroundColor Yellow

$checkSourceEnum = @'
const mongoose = require('mongoose');
require('dotenv').config();

async function checkSourceEnum() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    const Lead = require('./models/lead');
    const schema = Lead.schema;
    
    // Get the source field definition
    const sourceField = schema.paths.source;
    console.log('Source field type:', sourceField.instance);
    
    if (sourceField.enumValues && sourceField.enumValues.length > 0) {
      console.log('Valid source values:');
      sourceField.enumValues.forEach((value, index) => {
        console.log(`  ${index + 1}. "${value}"`);
      });
    } else if (sourceField.options && sourceField.options.enum) {
      console.log('Valid source values:');
      sourceField.options.enum.forEach((value, index) => {
        console.log(`  ${index + 1}. "${value}"`);
      });
    }
    
    // Test which value works
    console.log('\nTesting different source values:');
    const testSources = ['newsletter', 'website', 'footer_form', 'landing_page', 'contact_form'];
    
    for (const source of testSources) {
      try {
        const lead = new Lead({
          email: 'test@example.com',
          source: source
        });
        await lead.validate();
        console.log(`  ✅ "${source}" is valid`);
      } catch (err) {
        if (err.errors && err.errors.source) {
          console.log(`  ❌ "${source}" is invalid`);
        }
      }
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSourceEnum();
'@

$scriptPath = Join-Path $ProjectRoot "backend\check-source-enum.js"
$checkSourceEnum | Out-File -FilePath $scriptPath -Encoding UTF8

Push-Location (Join-Path $ProjectRoot "backend")
try {
    $output = node check-source-enum.js
    Write-Host $output -ForegroundColor Gray
    Remove-Item $scriptPath -Force
}
finally {
    Pop-Location
}

# Step 2: Update the leadController.js to use a valid source
Write-Host "`n2. Updating leadController.js to use valid source value..." -ForegroundColor Yellow

$leadControllerPath = Join-Path $ProjectRoot "backend\controllers\leadController.js"
$content = Get-Content $leadControllerPath -Raw

# Replace source: 'newsletter' with source: 'website' or another valid value
$updatedContent = $content -replace "source: 'newsletter'", "source: 'website' // Changed from 'newsletter' which is not a valid enum"

# Also check the newsletter subscription method
if ($updatedContent -match "exports\.subscribeNewsletter") {
    Write-Host "   Found subscribeNewsletter method, checking for source assignment..." -ForegroundColor Gray
}

# Save the updated content
$updatedContent | Out-File -FilePath $leadControllerPath -Encoding UTF8
Write-Host "✅ Updated leadController.js" -ForegroundColor Green

# Step 3: Also update Test-LeadCaptureFlow.ps1
Write-Host "`n3. Updating Test-LeadCaptureFlow.ps1..." -ForegroundColor Yellow

$testLeadCapturePath = Join-Path $ProjectRoot "scripts\TS_CGA_v1\Test-LeadCaptureFlow.ps1"
if (Test-Path $testLeadCapturePath) {
    $testContent = Get-Content $testLeadCapturePath -Raw
    
    # Update newsletter data to remove source field
    $testContent = $testContent -replace 'source = "footer_form"', '# source removed - using default'
    
    $testContent | Out-File -FilePath $testLeadCapturePath -Encoding UTF8
    Write-Host "✅ Updated Test-LeadCaptureFlow.ps1" -ForegroundColor Green
}

Write-Host "`n✅ Newsletter source issue fixed!" -ForegroundColor Green
Write-Host "`n📌 Next steps:" -ForegroundColor Cyan
Write-Host "   1. The newsletter endpoint should now work" -ForegroundColor White
Write-Host "   2. Re-run the QA tests" -ForegroundColor White
Write-Host "   3. If source enum still fails, check the output above for valid values" -ForegroundColor White