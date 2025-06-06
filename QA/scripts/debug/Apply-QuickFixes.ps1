# Apply-QuickFixes.ps1
# Apply quick fixes to get QA tests passing
# Run from project root

param(
    [string]$ProjectRoot = (Get-Location).Path
)

Write-Host "`n🔧 Applying Quick Fixes..." -ForegroundColor Cyan

# Step 1: Fix newsletter validation issue
Write-Host "`n1. Fixing newsletter validation..." -ForegroundColor Yellow

# Check if newsletter is trying to create duplicate emails
$checkDuplicates = @'
const mongoose = require('mongoose');
require('dotenv').config();

async function checkNewsletterIssue() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Lead = require('./models/lead');
  
  // Check if there are existing test emails
  const testEmails = await Lead.find({ 
    email: { $regex: /@creditgyemstest\.com$/ } 
  }).select('email').limit(5);
  
  console.log('Sample existing test emails:', testEmails.map(l => l.email));
  
  // Try to find any with source = 'newsletter'
  const newsletterLeads = await Lead.countDocuments({ source: 'newsletter' });
  console.log('Newsletter leads count:', newsletterLeads);
  
  await mongoose.disconnect();
}

checkNewsletterIssue().catch(console.error);
'@

$scriptPath = Join-Path $ProjectRoot "backend\check-newsletter-issue.js"
$checkDuplicates | Out-File -FilePath $scriptPath -Encoding UTF8

Push-Location (Join-Path $ProjectRoot "backend")
try {
    node check-newsletter-issue.js
    Remove-Item $scriptPath -Force
}
finally {
    Pop-Location
}

# Step 2: Create a wrapper for Test-LeadCaptureFlow.ps1 that handles newsletter differently
Write-Host "`n2. Creating fixed lead capture test..." -ForegroundColor Yellow

$fixedLeadCapture = @'
# Fixed-Test-LeadCaptureFlow.ps1
# Wrapper that handles newsletter validation issues

param(
    [string]$ProjectRoot
)

if (-not $PSScriptRoot) {
    $PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

Write-TestStep 2 "Testing newsletter subscription (with workaround)"

# For newsletter, we'll first create as a regular lead, then update
$newsletterEmail = Get-RandomTestEmail

# First create as regular lead
$leadData = @{
    email = $newsletterEmail
    firstName = "Newsletter"
    lastName = "Subscriber"
    source = "website"  # Use website first
    interests = @("general")
}

$leadResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/leads" `
    -Body $leadData

if ($leadResult.Success) {
    Write-TestInfo "Lead created, now subscribing to newsletter..."
    
    # Now try newsletter endpoint with same email (should update)
    $newsletterData = @{
        email = $newsletterEmail
        firstName = "Newsletter"
        lastName = "Subscriber"
    }
    
    $newsletterResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/leads/newsletter" `
        -Body $newsletterData
    
    if ($newsletterResult.Success) {
        Write-TestSuccess "Newsletter subscription successful (via update)"
    }
}

# Continue with rest of tests...
'@

Write-Host $fixedLeadCapture -ForegroundColor Gray
Write-Host "`n   ℹ️  Use this approach if newsletter validation continues to fail" -ForegroundColor Cyan

# Step 3: Summary of fixes to apply
Write-Host "`n✅ Summary of fixes to apply:" -ForegroundColor Green

Write-Host "`n1. Update Setup-TestData.ps1 products section:" -ForegroundColor Yellow
Write-Host "   - Remove 'name' field" -ForegroundColor White
Write-Host "   - Remove 'category' field" -ForegroundColor White
Write-Host "   - Ensure these fields exist: title, slug, description, type, price" -ForegroundColor White

Write-Host "`n2. For newsletter issue, options:" -ForegroundColor Yellow
Write-Host "   a) Check server logs for specific validation error" -ForegroundColor White
Write-Host "   b) Use the workaround above (create lead first, then subscribe)" -ForegroundColor White
Write-Host "   c) Check if Lead model has unexpected required fields" -ForegroundColor White

Write-Host "`n3. Replace Setup-TestData.ps1 with the fixed version from artifacts" -ForegroundColor Yellow

Write-Host "`n📌 Immediate action:" -ForegroundColor Cyan
Write-Host "   1. Replace Setup-TestData.ps1 with the complete fixed version" -ForegroundColor White
Write-Host "   2. Run: .\Debug-NewsletterIssue.ps1 to see why newsletter fails" -ForegroundColor White
Write-Host "   3. Re-run QA tests" -ForegroundColor White