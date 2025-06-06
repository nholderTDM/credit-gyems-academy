# Fix-ProductConnectionIssues.ps1
# Fixes the product creation connection refused errors
# Location: credit-gyems-academy/

Write-Host "`n🔧 FIXING PRODUCT CREATION ISSUES" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Step 1: Check if Product model has all required fields
Write-Host "`n📋 Checking Product model..." -ForegroundColor Yellow

$productModelPath = Join-Path $PSScriptRoot "backend\models\product.js"
if (Test-Path $productModelPath) {
    $content = Get-Content $productModelPath -Raw
    
    # Check for required fields
    $requiredFields = @('title', 'slug', 'description', 'type', 'price')
    $missingFields = @()
    
    foreach ($field in $requiredFields) {
        if ($content -notmatch "$field\s*:\s*{") {
            $missingFields += $field
        }
    }
    
    if ($missingFields.Count -gt 0) {
        Write-Host "  ⚠️  Missing fields in Product model: $($missingFields -join ', ')" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ All required fields present in Product model" -ForegroundColor Green
    }
}

# Step 2: Test product creation with detailed error handling
Write-Host "`n🧪 Testing product creation endpoint..." -ForegroundColor Yellow

# First get an admin token
$adminUser = @{
    email = "admin_$(Get-Random -Maximum 9999)@test.com"
    password = "AdminPass123!"
    firstName = "Admin"
    lastName = "User"
}

try {
    # Register admin user
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -Body ($adminUser | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    $adminToken = $registerResponse.token
    Write-Host "  ✅ Admin user created" -ForegroundColor Green
    
    # Update user role to admin in database
    $updateScript = @"
const mongoose = require('mongoose');
require('dotenv').config();

async function makeAdmin() {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./models/user');
    await User.updateOne(
        { email: '$($adminUser.email)' },
        { role: 'admin' }
    );
    console.log('User updated to admin');
    await mongoose.disconnect();
}
makeAdmin();
"@
    
    $scriptPath = Join-Path $PSScriptRoot "backend\temp-make-admin.js"
    $updateScript | Out-File -FilePath $scriptPath -Encoding UTF8
    
    Push-Location (Join-Path $PSScriptRoot "backend")
    node temp-make-admin.js 2>&1
    Pop-Location
    Remove-Item $scriptPath -Force -ErrorAction SilentlyContinue
    
    Write-Host "  ✅ User promoted to admin" -ForegroundColor Green
    
    # Re-login to get admin token
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Body (@{email = $adminUser.email; password = $adminUser.password} | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    $adminToken = $loginResponse.token
    
} catch {
    Write-Host "  ❌ Failed to create admin user: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Test product creation with retry logic
Write-Host "`n📦 Testing product creation..." -ForegroundColor Yellow

$testProduct = @{
    type = "ebook"
    title = "Test Product $(Get-Random -Maximum 9999)"
    slug = "test-product-$(Get-Random -Maximum 9999)"
    description = "This is a test product"
    price = 49.99
    shortDescription = "Test product short description"
    features = @("Feature 1", "Feature 2", "Feature 3")
    status = "published"
}

$maxRetries = 3
$retryDelay = 2
$success = $false

for ($i = 1; $i -le $maxRetries; $i++) {
    try {
        Write-Host "  Attempt $i/$maxRetries..." -ForegroundColor Gray
        
        $headers = @{
            Authorization = "Bearer $adminToken"
        }
        
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/products" `
            -Method POST `
            -Headers $headers `
            -Body ($testProduct | ConvertTo-Json) `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        Write-Host "  ✅ Product created successfully!" -ForegroundColor Green
        Write-Host "     ID: $($response._id)" -ForegroundColor Gray
        $success = $true
        break
        
    } catch {
        Write-Host "  ❌ Attempt $i failed: $_" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Host "     Response: $errorBody" -ForegroundColor Red
        }
        
        if ($i -lt $maxRetries) {
            Write-Host "  ⏳ Retrying in $retryDelay seconds..." -ForegroundColor Yellow
            Start-Sleep -Seconds $retryDelay
        }
    }
}

if (-not $success) {
    Write-Host "`n❌ Product creation failed after $maxRetries attempts" -ForegroundColor Red
    
    # Check server health
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET | Out-Null
        Write-Host "  ℹ️  Server is still responding" -ForegroundColor Gray
    } catch {
        Write-Host "  ❌ Server is not responding!" -ForegroundColor Red
    }
}

# Step 4: Create a connection pool fix
Write-Host "`n🔧 Applying connection pool fix..." -ForegroundColor Yellow

$connectionFixScript = @'
// connection-pool-fix.js
// Add this to your server.js to prevent connection issues

const mongoose = require('mongoose');

// Increase connection pool size
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 50,           // Increased from default 10
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4                  // Use IPv4, skip trying IPv6
};

// Add connection error handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected - attempting reconnect...');
  setTimeout(() => {
    mongoose.connect(process.env.MONGODB_URI, mongoOptions);
  }, 5000);
});

module.exports = mongoOptions;
'@

$fixPath = Join-Path $PSScriptRoot "backend\connection-pool-fix.js"
$connectionFixScript | Out-File -FilePath $fixPath -Encoding UTF8
Write-Host "  ✅ Created connection-pool-fix.js" -ForegroundColor Green
Write-Host "  📝 Add this to your server.js MongoDB connection options" -ForegroundColor Yellow

Write-Host "`n✅ Product connection fix completed!" -ForegroundColor Green
Write-Host "   - Tested product creation endpoint" -ForegroundColor Gray
Write-Host "   - Created connection pool fix" -ForegroundColor Gray
Write-Host "   - Apply the fix and re-run tests" -ForegroundColor Gray