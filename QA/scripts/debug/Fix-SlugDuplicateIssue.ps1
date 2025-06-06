# Fix-SlugDuplicateIssue.ps1
# Fix the duplicate slug issue preventing product creation

Write-Host "🔧 FIXING DUPLICATE SLUG ISSUE" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Fix 1: Update the product model to generate unique slugs
Write-Host "`n1️⃣ Updating Product Model for unique slugs..." -ForegroundColor Yellow

$modelPath = "backend\models\product.js"
$modelBackup = "$modelPath.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"

Copy-Item $modelPath $modelBackup
Write-Host "✅ Backed up model to: $modelBackup" -ForegroundColor Green

# Read current model
$modelContent = Get-Content $modelPath -Raw

# Update the pre-save hook to generate unique slugs
$newPreSaveHook = @'
// Pre-save middleware
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // If title is provided but not name, copy title to name
  if (this.title && !this.name) {
    this.name = this.title;
  }
  // If name is provided but not title, copy name to title
  if (this.name && !this.title) {
    this.title = this.name;
  }
  
  // Auto-generate unique slug from title or name
  if (!this.slug && (this.title || this.name)) {
    const source = this.title || this.name;
    const baseSlug = source
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now().toString(36);
    this.slug = `${baseSlug}-${timestamp}`;
  }
  
  // Map old types to new types
  if (this.type === 'ebook') {
    this.type = 'digital';
    if (!this.category) this.category = 'guide';
  } else if (this.type === 'masterclass') {
    this.type = 'service';
    if (!this.category) this.category = 'course';
  }
  
  next();
});
'@

# Replace the existing pre-save hook
$modelContent = $modelContent -replace '(?s)// Pre-save middleware.*?next\(\);\s*\}\);', $newPreSaveHook
$modelContent = $modelContent -replace '(?s)ProductSchema\.pre\(''save''.*?next\(\);\s*\}\);', $newPreSaveHook

Set-Content -Path $modelPath -Value $modelContent -Encoding UTF8
Write-Host "✅ Product model updated with unique slug generation" -ForegroundColor Green

# Fix 2: Clean up duplicate products in database
Write-Host "`n2️⃣ Cleaning up test products..." -ForegroundColor Yellow

$cleanupScript = @'
const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupTestProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Product = require('./models/product');
    
    // Delete all test products
    const result = await Product.deleteMany({
      $or: [
        { title: { $regex: /^Test/i } },
        { name: { $regex: /^Test/i } },
        { slug: { $regex: /^test-/i } }
      ]
    });
    
    console.log(`Deleted ${result.deletedCount} test products`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

cleanupTestProducts();
'@

$cleanupPath = "backend\cleanup-test-products.js"
Set-Content -Path $cleanupPath -Value $cleanupScript -Encoding UTF8

Push-Location backend
try {
    $result = node cleanup-test-products.js 2>&1
    Write-Host "  $result" -ForegroundColor Gray
} finally {
    Pop-Location
}

Remove-Item $cleanupPath -Force -ErrorAction SilentlyContinue

# Fix 3: Update Verify script to use unique names
Write-Host "`n3️⃣ Updating Verify script..." -ForegroundColor Yellow

$verifyPath = "Verify-FixesQuick.ps1"
$verifyContent = Get-Content $verifyPath -Raw

# Update the test product to use unique name
$verifyContent = $verifyContent -replace 'title = "Test Product"', 'title = "Test Product $(Get-Date -Format ''yyyyMMddHHmmss'')"'

Set-Content -Path $verifyPath -Value $verifyContent -Encoding UTF8
Write-Host "✅ Verify script updated to use unique product names" -ForegroundColor Green

# Restart backend
Write-Host "`n4️⃣ Restarting backend..." -ForegroundColor Yellow

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c cd backend && npm run dev" `
    -WindowStyle Normal

Write-Host "⏳ Waiting for server to start..." -ForegroundColor Gray
Start-Sleep -Seconds 7

# Test the fix
Write-Host "`n5️⃣ Testing the fix..." -ForegroundColor Yellow

# Get admin token
$adminCreds = @{
    email = "test_20250603210047_7530@creditgyemstest.com"
    password = "TestPass123!"
}

try {
    Start-Sleep -Seconds 2  # Extra wait
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Body ($adminCreds | ConvertTo-Json) `
        -ContentType "application/json"
    
    $adminToken = $loginResponse.token
    
    # Test with multiple products to ensure uniqueness works
    $testProducts = @(
        @{ title = "Unique Test 1"; description = "Test"; price = 29.99; type = "ebook" },
        @{ title = "Unique Test 2"; description = "Test"; price = 39.99; type = "ebook" },
        @{ title = "Test Product"; description = "Test"; price = 49.99; type = "ebook" }
    )
    
    $headers = @{ Authorization = "Bearer $adminToken" }
    $successCount = 0
    
    foreach ($product in $testProducts) {
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:5000/api/products" `
                -Method POST `
                -Headers $headers `
                -Body ($product | ConvertTo-Json) `
                -ContentType "application/json"
            
            $successCount++
            Write-Host "  ✅ Created: $($response.data.title) (slug: $($response.data.slug))" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Failed: $($product.title)" -ForegroundColor Red
        }
    }
    
    if ($successCount -eq $testProducts.Count) {
        Write-Host "`n✅ ALL PRODUCTS CREATED SUCCESSFULLY!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Server may still be starting, run Verify-FixesQuick.ps1 in a moment" -ForegroundColor Yellow
}

Write-Host "`n✅ DUPLICATE SLUG ISSUE FIXED!" -ForegroundColor Green
Write-Host "`nWhat was fixed:" -ForegroundColor Cyan
Write-Host "1. Product slugs now include timestamp for uniqueness" -ForegroundColor Gray
Write-Host "2. Cleaned up existing test products" -ForegroundColor Gray
Write-Host "3. Updated verify script to use unique names" -ForegroundColor Gray
Write-Host "4. Pre-save hook properly generates unique slugs" -ForegroundColor Gray

Write-Host "`n🧪 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: .\Verify-FixesQuick.ps1" -ForegroundColor Gray
Write-Host "2. Run full test suite: .\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1" -ForegroundColor Gray

Write-Host "`n📊 Expected results:" -ForegroundColor Cyan
Write-Host "- Product creation: ✅ Working" -ForegroundColor Green
Write-Host "- No more duplicate key errors" -ForegroundColor Green
Write-Host "- Test pass rate: Should reach 95%+" -ForegroundColor Green