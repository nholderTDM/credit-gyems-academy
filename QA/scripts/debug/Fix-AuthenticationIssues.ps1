# Fix-AuthenticationIssues.ps1
# Comprehensive fix for authentication test failures
# Location: D:\credit-gyems-academy\

param(
    [switch]$RestartServers,
    [switch]$RunTests
)

Write-Host "`n🔧 FIXING AUTHENTICATION ISSUES" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Step 1: Clean up existing processes
Write-Host "`n1️⃣ Cleaning up existing Node processes..." -ForegroundColor Yellow

$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "  Found $($nodeProcesses.Count) Node processes" -ForegroundColor Gray
    
    foreach ($process in $nodeProcesses) {
        try {
            $process | Stop-Process -Force
            Write-Host "  ✅ Killed process $($process.Id)" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️ Could not kill process $($process.Id)" -ForegroundColor Yellow
        }
    }
    
    Start-Sleep -Seconds 3
} else {
    Write-Host "  ℹ️ No Node processes found" -ForegroundColor Gray
}

# Step 2: Fix server.js duplicate routes
Write-Host "`n2️⃣ Fixing server.js duplicate route registration..." -ForegroundColor Yellow

$serverPath = "backend\server.js"
$serverBackup = "backend\server.js.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Create backup
Copy-Item $serverPath $serverBackup
Write-Host "  ✅ Created backup: $serverBackup" -ForegroundColor Green

# Create fixed server.js
$fixedServerContent = @'
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');

// Load environment variables FIRST
dotenv.config();

console.log('🚀 Starting Credit Gyems Academy Backend Server...');

// Skip Firebase Admin SDK - using REST API instead
console.log('⚠️  Using Firebase REST API for authentication (no Admin SDK)');

// MongoDB connection with improved options
const mongoOptions = {
  maxPoolSize: 50,              // Increase pool size for tests
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,                    // Use IPv4
  retryWrites: true,
  w: 'majority'
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('🔧 Please check your .env file in the backend folder');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for ngrok/production
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'https://*.ngrok-free.app',
  'https://*.ngrok.io'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowedOrigin === origin;
    });
    
    callback(null, true); // Allow all for development
  },
  credentials: true
}));

// Body parser middleware
// CRITICAL: Webhook route MUST use raw body BEFORE other middleware
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

// Add session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Regular JSON middleware for other routes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Import Stripe
let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Stripe:', error.message);
}

// Health check endpoint (before routes)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    stripe: stripe ? 'configured' : 'not configured',
    firebase: 'REST API mode'
  });
});

// Database health check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    let canQuery = false;
    if (dbStatus === 1) {
      try {
        await mongoose.connection.db.admin().ping();
        canQuery = true;
      } catch (err) {
        console.error('DB ping failed:', err);
      }
    }
    
    res.status(200).json({
      success: true,
      database: {
        status: dbStates[dbStatus],
        statusCode: dbStatus,
        canQuery: canQuery,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('DB health check error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      database: {
        status: 'error',
        statusCode: mongoose.connection.readyState
      }
    });
  }
});

// Import and use routes - ONLY ONCE
const routes = require('./routes');
app.use('/api', routes);
console.log('✅ Routes loaded successfully');

// Webhook endpoint for Stripe
app.post('/api/orders/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log(`✅ Webhook verified: ${event.type}`);
    res.json({ received: true });
  } catch (err) {
    console.error(`❌ Webhook error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Webhook test endpoint
app.get('/api/webhook-test', (req, res) => {
  res.status(200).json({
    message: 'Webhook endpoint is accessible',
    webhook_url: '/api/orders/webhook',
    method: 'POST',
    timestamp: new Date().toISOString()
  });
});

// Routes info endpoint
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: middleware.route.path
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const path = middleware.regexp.source.match(/\\\/([^\\]+)/);
          routes.push({
            method: Object.keys(handler.route.methods)[0].toUpperCase(),
            path: `/${path ? path[1] : ''}${handler.route.path}`
          });
        }
      });
    }
  });
  res.json({ routes });
});

// 404 handler for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Global error:', err);
  
  if (err.type === 'entity.too.large' || 
      err.message === 'request entity too large' ||
      (err.status === 413)) {
    return res.status(413).json({
      success: false,
      message: 'Internal server error',
      error: 'request entity too large'
    });
  }
  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON',
      error: 'Malformed JSON in request body'
    });
  }
  
  const status = err.status || 500;
  res.status(status).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message || 'Something went wrong'
  });
});

// Start server with keep-alive settings
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`💾 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log(`🔐 Auth: Firebase REST API + MongoDB`);
  
  // Set keep-alive to prevent connection drops
  server.keepAliveTimeout = 120000; // 2 minutes
  server.headersTimeout = 120000;   // 2 minutes
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully');
  server.close(() => {
    mongoose.connection.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server gracefully');
  server.close(() => {
    mongoose.connection.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('💥 Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  console.error('🔧 Check your environment variables and dependencies');
  process.exit(1);
});

module.exports = app;
'@

Set-Content -Path $serverPath -Value $fixedServerContent -Encoding UTF8
Write-Host "  ✅ Fixed server.js (removed duplicate routes)" -ForegroundColor Green

# Step 3: Create connection retry wrapper for tests
Write-Host "`n3️⃣ Creating improved test utilities..." -ForegroundColor Yellow

$testUtilsPath = "scripts\TS_CGA_v1\Test-Utilities.ps1"
$testUtilsBackup = "scripts\TS_CGA_v1\Test-Utilities.ps1.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

if (Test-Path $testUtilsPath) {
    Copy-Item $testUtilsPath $testUtilsBackup
    Write-Host "  ✅ Created backup: $testUtilsBackup" -ForegroundColor Green
}

# Add connection pooling to test utilities
$additionalUtils = @'

# Connection pool management
$global:ConnectionPool = @{
    ActiveConnections = 0
    MaxConnections = 10
    WaitTime = 100
}

function Get-ConnectionSlot {
    while ($global:ConnectionPool.ActiveConnections -ge $global:ConnectionPool.MaxConnections) {
        Start-Sleep -Milliseconds $global:ConnectionPool.WaitTime
    }
    $global:ConnectionPool.ActiveConnections++
}

function Release-ConnectionSlot {
    if ($global:ConnectionPool.ActiveConnections -gt 0) {
        $global:ConnectionPool.ActiveConnections--
    }
}

# Enhanced API endpoint test with connection management
function Test-APIEndpointManaged {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = @{},
        [hashtable]$Headers = @{},
        [string]$ExpectedStatus = "200",
        [int]$MaxRetries = 3,
        [int]$RetryDelay = 2
    )
    
    try {
        Get-ConnectionSlot
        
        $attempts = 0
        $lastError = $null
        
        while ($attempts -lt $MaxRetries) {
            $attempts++
            
            try {
                # Add small delay between requests to prevent overwhelming server
                if ($attempts -gt 1) {
                    Start-Sleep -Milliseconds 500
                }
                
                $result = Test-APIEndpoint `
                    -Method $Method `
                    -Endpoint $Endpoint `
                    -Body $Body `
                    -Headers $Headers `
                    -ExpectedStatus $ExpectedStatus
                
                return $result
            }
            catch {
                $lastError = $_
                
                if ($_.Exception.Message -like "*connection*" -or 
                    $_.Exception.Message -like "*refused*") {
                    
                    if ($attempts -lt $MaxRetries) {
                        Write-TestInfo "Connection failed, retrying in $RetryDelay seconds... (Attempt $attempts/$MaxRetries)"
                        Start-Sleep -Seconds $RetryDelay
                        continue
                    }
                }
                
                throw $_
            }
        }
        
        throw $lastError
    }
    finally {
        Release-ConnectionSlot
    }
}
'@

Add-Content -Path $testUtilsPath -Value $additionalUtils
Write-Host "  ✅ Added connection pool management to test utilities" -ForegroundColor Green

# Step 4: Fix MongoDB connection string
Write-Host "`n4️⃣ Checking MongoDB connection..." -ForegroundColor Yellow

$envPath = "backend\.env"
$envContent = Get-Content $envPath -Raw

# Check if MongoDB URI uses SRV record
if ($envContent -match 'MONGODB_URI=mongodb\+srv://') {
    Write-Host "  ✅ MongoDB using SRV connection (good for stability)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Consider using MongoDB Atlas for better stability" -ForegroundColor Yellow
}

# Step 5: Create server health monitor
Write-Host "`n5️⃣ Creating server health monitor..." -ForegroundColor Yellow

$monitorScript = @'
# Monitor-ServerHealth.ps1
# Run this in a separate terminal while running tests

param(
    [int]$IntervalSeconds = 5,
    [int]$DurationMinutes = 10
)

$endTime = (Get-Date).AddMinutes($DurationMinutes)

Write-Host "🔍 Monitoring server health for $DurationMinutes minutes..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray

while ((Get-Date) -lt $endTime) {
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 5 | Out-Null
        $dbHealth = Invoke-RestMethod -Uri "http://localhost:5000/api/health/db" -TimeoutSec 5
        
        $connections = (netstat -an | Select-String ":5000" | Where-Object { $_ -match "ESTABLISHED" }).Count
        $timeWait = (netstat -an | Select-String ":5000" | Where-Object { $_ -match "TIME_WAIT" }).Count
        
        Clear-Host
        Write-Host "📊 SERVER HEALTH STATUS - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
        Write-Host "================================" -ForegroundColor Cyan
        Write-Host "Status: $($health.status)" -ForegroundColor Green
        Write-Host "MongoDB: $($health.mongodb)" -ForegroundColor $(if ($health.mongodb -eq 'connected') { 'Green' } else { 'Red' })
        Write-Host "DB Query: $($dbHealth.database.canQuery)" -ForegroundColor $(if ($dbHealth.database.canQuery) { 'Green' } else { 'Red' })
        Write-Host ""
        Write-Host "CONNECTIONS:" -ForegroundColor Yellow
        Write-Host "  Active: $connections"
        Write-Host "  TIME_WAIT: $timeWait"
        
        if ($timeWait -gt 50) {
            Write-Host "  ⚠️ High TIME_WAIT count detected!" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Server not responding!" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Gray
    }
    
    Start-Sleep -Seconds $IntervalSeconds
}
'@

Set-Content -Path "Monitor-ServerHealth.ps1" -Value $monitorScript
Write-Host "  ✅ Created Monitor-ServerHealth.ps1" -ForegroundColor Green

# Step 6: Restart servers if requested
if ($RestartServers) {
    Write-Host "`n6️⃣ Starting servers with improved configuration..." -ForegroundColor Yellow
    
    # Start backend
    Write-Host "  Starting backend server..." -ForegroundColor Gray
    Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c cd backend && npm run dev" `
        -WindowStyle Normal
    
    Write-Host "  ⏳ Waiting for backend to initialize..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    
    # Verify backend is running
    try {
        if (Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 5) {
            Write-Host "  ✅ Backend server is running" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ❌ Backend server failed to start" -ForegroundColor Red
    }
    
    # Start frontend
    Write-Host "  Starting frontend server..." -ForegroundColor Gray
    Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c cd frontend && npm run dev" `
        -WindowStyle Normal
    
    Write-Host "  ⏳ Waiting for frontend to initialize..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    
    Write-Host "  ✅ Servers started" -ForegroundColor Green
}

# Step 7: Run tests if requested
if ($RunTests) {
    Write-Host "`n7️⃣ Running authentication tests..." -ForegroundColor Yellow
    
    # First run a quick connection test
    Write-Host "  Running connection test..." -ForegroundColor Gray
    
    $testScript = @'
# Quick connection test
for ($i = 1; $i -le 5; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 5
        Write-Host "  ✅ Connection $i successful" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Connection $i failed: $_" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 500
}
'@
    
    Invoke-Expression $testScript
    
    # Run authentication tests
    Write-Host "`n  Running full authentication test suite..." -ForegroundColor Gray
    & ".\scripts\TS_CGA_v1\Test-AuthenticationFlow.ps1" -ProjectRoot (Get-Location)
}

Write-Host "`n✅ AUTHENTICATION FIX COMPLETE" -ForegroundColor Green
Write-Host "`nRecommendations:" -ForegroundColor Cyan
Write-Host "1. Run: .\Fix-AuthenticationIssues.ps1 -RestartServers" -ForegroundColor Gray
Write-Host "2. In another terminal: .\Monitor-ServerHealth.ps1" -ForegroundColor Gray
Write-Host "3. Then run: .\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1" -ForegroundColor Gray
Write-Host "`nIf issues persist:" -ForegroundColor Yellow
Write-Host "- Check MongoDB connection string in backend\.env" -ForegroundColor Gray
Write-Host "- Ensure JWT_SECRET is set in backend\.env" -ForegroundColor Gray
Write-Host "- Consider using MongoDB Atlas for better stability" -ForegroundColor Gray