# Fix-Routes-Now.ps1
# Direct fix for missing routes issue
# Location: D:\credit-gyems-academy\

Write-Host "`n🚨 CRITICAL: Routes are not loading!" -ForegroundColor Red
Write-Host "=====================================`n" -ForegroundColor Red

# Check what routes ARE available
Write-Host "1️⃣ Checking available routes..." -ForegroundColor Yellow
try {
    $routes = Invoke-RestMethod -Uri "http://localhost:5000/api/routes" -TimeoutSec 2
    Write-Host "Available routes:" -ForegroundColor Cyan
    $routes.routes | ForEach-Object { Write-Host "  $($_.method) $($_.path)" -ForegroundColor Gray }
} catch {
    Write-Host "Could not retrieve routes" -ForegroundColor Red
}

# Check if routes/index.js exists and is correct
Write-Host "`n2️⃣ Checking routes/index.js..." -ForegroundColor Yellow
$routesIndexPath = "backend\routes\index.js"
if (Test-Path $routesIndexPath) {
    Write-Host "✅ routes/index.js exists" -ForegroundColor Green
    
    # Check if it's importing all route files
    $routesContent = Get-Content $routesIndexPath -Raw
    $requiredRoutes = @('auth', 'products', 'bookings', 'community', 'leads', 'services')
    
    foreach ($route in $requiredRoutes) {
        if ($routesContent -match "require.*$route") {
            Write-Host "  ✅ $route routes imported" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $route routes NOT imported!" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ routes/index.js NOT FOUND!" -ForegroundColor Red
    
    # Create it
    Write-Host "`n3️⃣ Creating routes/index.js..." -ForegroundColor Yellow
    $routesIndexContent = @'
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

// Register routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/orders', orderRoutes);
router.use('/community', communityRoutes);
router.use('/leads', leadRoutes);
router.use('/contact', contactRoutes);

module.exports = router;
'@
    Set-Content -Path $routesIndexPath -Value $routesIndexContent -Encoding UTF8
    Write-Host "✅ Created routes/index.js" -ForegroundColor Green
}

# Check server.js is loading routes correctly
Write-Host "`n4️⃣ Checking server.js route loading..." -ForegroundColor Yellow
$serverPath = "backend\server.js"
$serverContent = Get-Content $serverPath -Raw

if ($serverContent -match "app\.use\(`'/api`',\s*routes\)") {
    Write-Host "✅ Server is loading routes at /api" -ForegroundColor Green
} else {
    Write-Host "❌ Server is NOT loading routes properly!" -ForegroundColor Red
    
    # Check what it's doing instead
    if ($serverContent -match "require.*routes.*index") {
        Write-Host "  Found routes import" -ForegroundColor Gray
    } else {
        Write-Host "  ❌ No routes import found!" -ForegroundColor Red
    }
}

Write-Host "`n5️⃣ Quick server.js fix check..." -ForegroundColor Yellow

# Look for the issue
if ($serverContent -match "// Import and use routes - ONLY ONCE") {
    Write-Host "✅ Found routes section" -ForegroundColor Green
    
    # Check if routes are actually being used after import
    if ($serverContent -match "const routes = require\('./routes'\);\s*app\.use\('/api', routes\);") {
        Write-Host "✅ Routes are properly registered" -ForegroundColor Green
    } else {
        Write-Host "❌ Routes imported but not registered!" -ForegroundColor Red
    }
}

# Show the fix
Write-Host "`n🔧 MANUAL FIX REQUIRED:" -ForegroundColor Yellow
Write-Host "In backend\server.js, ensure you have:" -ForegroundColor Gray
Write-Host @'

// Import routes
const routes = require('./routes');

// Use routes (this line is critical!)
app.use('/api', routes);

// This should come BEFORE the 404 handler
'@ -ForegroundColor White

Write-Host "`n⚠️  The issue is that routes are imported but not being used!" -ForegroundColor Red
Write-Host "After fixing, restart the backend server." -ForegroundColor Yellow

# Quick test after fix
Write-Host "`n6️⃣ Test command after fixing:" -ForegroundColor Cyan
Write-Host "Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/register' -Method POST -Body '{}' -ContentType 'application/json'" -ForegroundColor White
Write-Host "Should return an error about missing fields, NOT a 404" -ForegroundColor Gray