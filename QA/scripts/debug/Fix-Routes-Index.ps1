# Fix-Routes-Index.ps1
# Fixes the actual problem - missing route imports in routes/index.js
# Location: D:\credit-gyems-academy\

Write-Host "`n🎯 FIXING THE REAL PROBLEM: routes/index.js" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$routesIndexPath = "backend\routes\index.js"

# Check current content
Write-Host "`n1️⃣ Checking current routes/index.js..." -ForegroundColor Yellow
if (Test-Path $routesIndexPath) {
    $currentContent = Get-Content $routesIndexPath -Raw
    Write-Host "Current content:" -ForegroundColor Gray
    Write-Host $currentContent -ForegroundColor DarkGray
} else {
    Write-Host "❌ routes/index.js not found!" -ForegroundColor Red
}

# Backup
$backupPath = "$routesIndexPath.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
Copy-Item $routesIndexPath $backupPath -ErrorAction SilentlyContinue
Write-Host "`n✅ Backup created: $backupPath" -ForegroundColor Green

# Create correct routes/index.js
Write-Host "`n2️⃣ Creating correct routes/index.js..." -ForegroundColor Yellow

$correctRoutesIndex = @'
const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const serviceRoutes = require('./serviceRoutes');
const bookingRoutes = require('./bookingRoutes');
const orderRoutes = require('./orderRoutes');
const communityRoutes = require('./communityRoutes');
const leadRoutes = require('./leadRoutes');
const contactRoutes = require('./contactRoutes');

// Register all routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/orders', orderRoutes);
router.use('/community', communityRoutes);
router.use('/leads', leadRoutes);
router.use('/contact', contactRoutes);

// Debug: Show registered routes
console.log('📍 Routes registered:');
console.log('  - /api/auth');
console.log('  - /api/products');
console.log('  - /api/services');
console.log('  - /api/bookings');
console.log('  - /api/orders');
console.log('  - /api/community');
console.log('  - /api/leads');
console.log('  - /api/contact');

module.exports = router;
'@

Set-Content -Path $routesIndexPath -Value $correctRoutesIndex -Encoding UTF8
Write-Host "✅ Created correct routes/index.js with ALL routes" -ForegroundColor Green

# Verify the route files exist
Write-Host "`n3️⃣ Verifying route files exist..." -ForegroundColor Yellow

$routeFiles = @(
    "authRoutes.js",
    "productRoutes.js", 
    "serviceRoutes.js",
    "bookingRoutes.js",
    "orderRoutes.js",
    "communityRoutes.js",
    "leadRoutes.js",
    "contactRoutes.js"
)

$missingFiles = @()
foreach ($file in $routeFiles) {
    $filePath = "backend\routes\$file"
    if (Test-Path $filePath) {
        Write-Host "  ✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file MISSING!" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`n⚠️ Some route files are missing. They need to be created." -ForegroundColor Yellow
    Write-Host "Missing files: $($missingFiles -join ', ')" -ForegroundColor Red
}

Write-Host "`n4️⃣ Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart the backend server:" -ForegroundColor Gray
Write-Host "   Get-Process node | Stop-Process -Force" -ForegroundColor White
Write-Host "   cd backend && npm run dev" -ForegroundColor White

Write-Host "`n2. Test a route:" -ForegroundColor Gray
Write-Host "   Invoke-RestMethod -Uri 'http://localhost:5000/api/products' -Method GET" -ForegroundColor White
Write-Host "   (Should NOT return 404)" -ForegroundColor Gray

Write-Host "`n3. Run QA suite:" -ForegroundColor Gray
Write-Host "   .\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1" -ForegroundColor White

Write-Host "`n✅ The fix is applied!" -ForegroundColor Green
Write-Host "Expected result: Pass rate should jump back to ~90%" -ForegroundColor Yellow