# Fix-QA-TestIssues.ps1
# Script to fix the QA test failures

Write-Host "🔧 Fixing QA Test Issues..." -ForegroundColor Yellow
Write-Host ""

# 1. Fix Lead Model Source Enum
Write-Host "1. Fixing Lead Model source enum..." -ForegroundColor Cyan
$leadModelPath = "backend\models\lead.js"

if (Test-Path $leadModelPath) {
    $content = Get-Content $leadModelPath -Raw
    
    # Update the source enum to include 'contact_form'
    $oldEnum = "enum: \['landing_page', 'free_guide', 'blog', 'referral', 'social_media', 'website', 'other'\]"
    $newEnum = "enum: ['landing_page', 'free_guide', 'blog', 'referral', 'social_media', 'website', 'contact_form', 'other']"
    
    if ($content -match [regex]::Escape($oldEnum)) {
        $content = $content -replace [regex]::Escape($oldEnum), $newEnum
        Set-Content -Path $leadModelPath -Value $content
        Write-Host "   ✅ Updated source enum to include 'contact_form'" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Source enum already updated or format different" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Lead model file not found!" -ForegroundColor Red
}

# 2. Create Contact Controller if missing
Write-Host "`n2. Creating Contact Controller..." -ForegroundColor Cyan
$contactControllerPath = "backend\controllers\contactController.js"

if (-not (Test-Path $contactControllerPath)) {
    $contactControllerContent = @'
const Lead = require('../models/lead');
const emailService = require('../services/emailService');
const validator = require('validator');

// Handle contact form submissions
exports.submitContactForm = async (req, res) => {
  try {
    const { email, firstName, lastName, phone, message, subject } = req.body;
    
    // Validate required fields
    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Email and message are required'
      });
    }
    
    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Create or update lead
    const leadData = {
      email: validator.normalizeEmail(email.toLowerCase().trim()),
      firstName: firstName ? validator.escape(firstName.trim()) : '',
      lastName: lastName ? validator.escape(lastName.trim()) : '',
      phone: phone ? phone.replace(/[^\d\s\-\+\(\)]/g, '') : '',
      source: 'contact_form',
      interests: ['contact_inquiry'],
      notes: `Contact Form Submission - Subject: ${subject || 'General Inquiry'}\nMessage: ${message}`
    };
    
    let lead = await Lead.findOne({ email: leadData.email });
    
    if (lead) {
      // Update existing lead
      if (leadData.firstName && !lead.firstName) lead.firstName = leadData.firstName;
      if (leadData.lastName && !lead.lastName) lead.lastName = leadData.lastName;
      if (leadData.phone && !lead.phone) lead.phone = leadData.phone;
      
      // Add interaction
      lead.interactions.push({
        type: 'form_submission',
        description: `Contact form: ${subject || 'General Inquiry'}`,
        date: new Date()
      });
      
      // Append to notes
      lead.notes = lead.notes ? 
        `${lead.notes}\n\n---\n${leadData.notes}` : 
        leadData.notes;
      
      await lead.save();
    } else {
      // Create new lead
      lead = new Lead({
        ...leadData,
        interactions: [{
          type: 'form_submission',
          description: `Contact form: ${subject || 'General Inquiry'}`,
          date: new Date()
        }]
      });
      
      await lead.save();
    }
    
    // Send confirmation email to user (async)
    setImmediate(async () => {
      try {
        await emailService.sendLeadWelcome(lead._id);
      } catch (error) {
        console.error('Error sending contact confirmation:', error);
      }
    });
    
    // Notify admin (async)
    setImmediate(async () => {
      try {
        await emailService.notifyAdminOfNewLead(lead._id);
      } catch (error) {
        console.error('Error notifying admin:', error);
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon!',
      data: {
        email: lead.email
      }
    });
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        ...(process.env.NODE_ENV === 'development' && { errors })
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form'
    });
  }
};
'@
    
    Set-Content -Path $contactControllerPath -Value $contactControllerContent
    Write-Host "   ✅ Created contactController.js" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Contact controller already exists" -ForegroundColor Blue
}

# 3. Create Contact Routes if missing
Write-Host "`n3. Creating Contact Routes..." -ForegroundColor Cyan
$contactRoutesPath = "backend\routes\contactRoutes.js"

if (-not (Test-Path $contactRoutesPath)) {
    $contactRoutesContent = @'
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Public route - no authentication required
router.post('/', contactController.submitContactForm);

module.exports = router;
'@
    
    Set-Content -Path $contactRoutesPath -Value $contactRoutesContent
    Write-Host "   ✅ Created contactRoutes.js" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Contact routes already exist" -ForegroundColor Blue
}

# 4. Check server health
Write-Host "`n4. Checking Backend Server..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop | Out-Null
    Write-Host "   ✅ Backend server is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend server is not running!" -ForegroundColor Red
    Write-Host "   ℹ️  Start the server with: cd backend && npm run dev" -ForegroundColor Yellow
}

# 5. Run route debugging
Write-Host "`n5. Running Route Debug Check..." -ForegroundColor Cyan
Push-Location backend
try {
    node debug-route-loading.js
} catch {
    Write-Host "   ⚠️  Debug script not found or failed" -ForegroundColor Yellow
}
Pop-Location

# 6. Verify MongoDB connection
Write-Host "`n6. Verifying MongoDB Connection..." -ForegroundColor Cyan
try {
    $dbHealth = Invoke-RestMethod -Uri "http://localhost:5000/api/health/db" -Method GET -ErrorAction Stop
    if ($dbHealth.database.status -eq "connected") {
        Write-Host "   ✅ MongoDB is connected" -ForegroundColor Green
    } else {
        Write-Host "   ❌ MongoDB connection issue: $($dbHealth.database.status)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  Could not check database status" -ForegroundColor Yellow
}

# Summary
Write-Host "`n📊 Summary of Fixes Applied:" -ForegroundColor Yellow
Write-Host "   1. Lead Model - Added 'contact_form' to source enum"
Write-Host "   2. Contact Controller - Created if missing"
Write-Host "   3. Contact Routes - Created if missing"
Write-Host ""
Write-Host "📌 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Ensure backend server is running: cd backend && npm run dev"
Write-Host "   2. Wait for server to fully start (check for MongoDB connection)"
Write-Host "   3. Re-run QA tests: cd scripts\TS_CGA_v1 && .\Run-CreditGyemsQA.ps1"
Write-Host ""
Write-Host "🔍 Expected Improvements:" -ForegroundColor Green
Write-Host "   - Contact form should now work (source enum fixed)"
Write-Host "   - Lead routes should be accessible if server is running"
Write-Host "   - Authentication should work if server is running"
Write-Host ""
Write-Host "⚠️  Known Issues Still Present:" -ForegroundColor Yellow
Write-Host "   - Community features (need communityController.js)"
Write-Host "   - Product creation (need to debug product model/controller)"
Write-Host "   - Some routes may still need authentication tokens"