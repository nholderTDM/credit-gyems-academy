# Test-Environment.ps1
# Validates environment setup and starts servers if needed
# Location: QA/scripts/api-tests/

param(
    [string]$ProjectRoot,
    [switch]$SkipServerStart
)

# Set project root
$Global:ProjectRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))

# Get script root if not already set
if (-not $PSScriptRoot) {
    $PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

Write-TestStep 1 "Checking project structure"

# Validate project structure
$requiredPaths = @(
    @{Path = Join-Path $Global:ProjectRoot "frontend"; Type = "Frontend"},
    @{Path = Join-Path $Global:ProjectRoot "backend"; Type = "Backend"},
    @{Path = Join-Path $Global:ProjectRoot "frontend\.env"; Type = "Frontend ENV"},
    @{Path = Join-Path $Global:ProjectRoot "backend\.env"; Type = "Backend ENV"},
    @{Path = Join-Path $Global:ProjectRoot "frontend\package.json"; Type = "Frontend package.json"},
    @{Path = Join-Path $Global:ProjectRoot "backend\package.json"; Type = "Backend package.json"}
)

foreach ($item in $requiredPaths) {
    if (Test-Path $item.Path) {
        Write-TestSuccess "$($item.Type) found at: $($item.Path)"
    }
    else {
        Write-TestFailure "$($item.Type) NOT FOUND at: $($item.Path)"
    }
}

Write-TestStep 2 "Validating environment variables"

# Check Frontend .env
$frontendEnvPath = Join-Path $Global:ProjectRoot "frontend\.env"
if (Test-Path $frontendEnvPath) {
    $frontendEnv = Get-Content $frontendEnvPath -ErrorAction SilentlyContinue
    if ($null -eq $frontendEnv) { $frontendEnv = @() }
    if ($null -eq $frontendEnv) { $frontendEnv = @() }
    $requiredFrontendVars = @(
        "VITE_API_URL",
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_AUTH_DOMAIN",
        "VITE_FIREBASE_PROJECT_ID"
    )

    foreach ($var in $requiredFrontendVars) {
        if ($frontendEnv -match "^$var=.+") {
            Write-TestSuccess "Frontend: $var is configured"
        }
        else {
            Write-TestWarning "Frontend: $var is MISSING or empty"
        }
    }
} else {
    Write-TestWarning "Frontend .env file not found"
}

# Check Backend .env
$backendEnvPath = Join-Path $Global:ProjectRoot "backend\.env"
if (Test-Path $backendEnvPath) {
    $backendEnv = Get-Content $backendEnvPath -ErrorAction SilentlyContinue
    if ($null -eq $backendEnv) { $backendEnv = @() }
    if ($null -eq $backendEnv) { $backendEnv = @() }
    $requiredBackendVars = @(
        "PORT",
        "MONGODB_URI",
        "JWT_SECRET"
    )

    foreach ($var in $requiredBackendVars) {
        if ($backendEnv -match "^$var=.+") {
            Write-TestSuccess "Backend: $var is configured"
        }
        else {
            Write-TestWarning "Backend: $var is MISSING or empty"
        }
    }
} else {
    Write-TestWarning "Backend .env file not found"
}

Write-TestStep 3 "Checking server status"

$frontendRunning = Test-ServerRunning -Url "http://localhost:5173" -Name "Frontend"
$backendRunning = Test-ServerRunning -Url "http://localhost:5000/api/health" -Name "Backend API"

if (-not $SkipServerStart) {
    if (-not $backendRunning) {
        Write-TestWarning "Backend server is not running. Please start it manually:"
        Write-TestInfo "  cd $Global:ProjectRoot\backend"
        Write-TestInfo "  npm run dev"
    }
    
    if (-not $frontendRunning) {
        Write-TestInfo "Frontend server is not running (optional for API tests)"
    }
}

Write-TestStep 4 "Testing basic API connectivity"

# Test health endpoint
$healthCheck = Test-APIEndpoint -Method "GET" -Endpoint "http://localhost:5000/api/health"

if ($healthCheck.Success) {
    Write-TestSuccess "API is accessible"
}

# Test MongoDB connection through API
$dbCheck = Test-APIEndpoint -Method "GET" -Endpoint "http://localhost:5000/api/products" -ExpectedStatus "200"
if ($dbCheck.Success) {
    Write-TestSuccess "MongoDB connection verified through API"
}
else {
    Write-TestWarning "MongoDB connection issue - check MONGODB_URI in backend/.env"
}


