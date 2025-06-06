# Test-Environment.ps1
# Validates environment setup and starts servers if needed
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot,
    [switch]$SkipServerStart
)

# Get script root if not already set
if (-not $PSScriptRoot) {
    $PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

Write-TestStep 1 "Checking project structure"

# Validate project structure
$requiredPaths = @(
    @{Path = "$ProjectRoot\frontend"; Type = "Frontend"},
    @{Path = "$ProjectRoot\backend"; Type = "Backend"},
    @{Path = "$ProjectRoot\frontend\.env"; Type = "Frontend ENV"},
    @{Path = "$ProjectRoot\backend\.env"; Type = "Backend ENV"},
    @{Path = "$ProjectRoot\frontend\package.json"; Type = "Frontend package.json"},
    @{Path = "$ProjectRoot\backend\package.json"; Type = "Backend package.json"}
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
$frontendEnvPath = Join-Path $ProjectRoot "frontend\.env"
if (Test-Path $frontendEnvPath) {
    $frontendEnv = Get-Content $frontendEnvPath -ErrorAction SilentlyContinue
    $requiredFrontendVars = @(
        "VITE_API_URL",
        "VITE_FIREBASE_PROJECT_ID",
        "STRIPE_PUBLIC_KEY"
    )

    foreach ($var in $requiredFrontendVars) {
        if ($frontendEnv -match "^$var=.+") {
            Write-TestSuccess "Frontend: $var is configured"
        }
        else {
            Write-TestFailure "Frontend: $var is MISSING or empty"
        }
    }
} else {
    Write-TestFailure "Frontend .env file not found"
}

# Check Backend .env
$backendEnvPath = Join-Path $ProjectRoot "backend\.env"
if (Test-Path $backendEnvPath) {
    $backendEnv = Get-Content $backendEnvPath -ErrorAction SilentlyContinue
    $requiredBackendVars = @(
        "PORT",
        "MONGODB_URI",
        "JWT_SECRET",
        "STRIPE_SECRET_KEY",
        "SENDGRID_API_KEY",
        "FIREBASE_PROJECT_ID"
    )

    foreach ($var in $requiredBackendVars) {
        if ($backendEnv -match "^$var=.+") {
            Write-TestSuccess "Backend: $var is configured"
        }
        else {
            Write-TestFailure "Backend: $var is MISSING or empty"
        }
    }
} else {
    Write-TestFailure "Backend .env file not found"
}

Write-TestStep 3 "Checking server status"

# Function to wait for server with extended timeout
function Wait-ForServer {
    param(
        [string]$Url,
        [string]$Name,
        [int]$MaxAttempts = 60,
        [int]$DelaySeconds = 2
    )
    
    Write-TestInfo "Waiting for $Name to be ready at $Url..."
    $attempts = 0
    
    while ($attempts -lt $MaxAttempts) {
        try {
            $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
            if ($response) {
                Write-TestSuccess "$Name is ready!"
                return $true
            }
        } catch {
            $attempts++
            if ($attempts % 10 -eq 0) {
                Write-TestInfo "Still waiting for $Name... ($attempts/$MaxAttempts attempts)"
            }
            Start-Sleep -Seconds $DelaySeconds
        }
    }
    
    Write-TestFailure "$Name failed to start after $($MaxAttempts * $DelaySeconds) seconds"
    return $false
}

$frontendRunning = Test-ServerRunning -Url "http://localhost:3000" -Name "Frontend"
$backendRunning = Test-ServerRunning -Url "http://localhost:5000/api/health" -Name "Backend API"

if (-not $SkipServerStart) {
    $processes = @()
    
    if (-not $frontendRunning) {
        $frontendPath = Join-Path $ProjectRoot "frontend"
        $frontendProcess = Start-DevServer `
            -Path $frontendPath `
            -Command "npm run dev" `
            -Name "Frontend Server" `
            -WaitSeconds 15
        
        if ($frontendProcess) {
            $processes += $frontendProcess
            $Global:StartedProcesses = $processes
        }
    }
    
    if (-not $backendRunning) {
        $backendPath = Join-Path $ProjectRoot "backend"
        
        # Kill any existing process on port 5000
        try {
            $existingProcess = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
            if ($existingProcess) {
                $pid = $existingProcess.OwningProcess
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-TestInfo "Killed existing process on port 5000"
                Start-Sleep -Seconds 2
            }
        } catch {
            # Ignore errors
        }
        
        $backendProcess = Start-DevServer `
            -Path $backendPath `
            -Command "npm run dev" `
            -Name "Backend Server" `
            -WaitSeconds 20
        
        if ($backendProcess) {
            $processes += $backendProcess
            $Global:StartedProcesses = $processes
        }
    }
    
    # Wait for servers to be fully ready
    if (-not $frontendRunning) {
        Wait-ForServer -Url "http://localhost:3000" -Name "Frontend" | Out-Null
    }
    
    if (-not $backendRunning) {
        # First wait for health endpoint
        $healthReady = Wait-ForServer -Url "http://localhost:5000/api/health" -Name "Backend Health"
        
        if ($healthReady) {
            # Then verify auth routes are available
            Write-TestInfo "Verifying authentication routes..."
            $authRoutesReady = $false
            $attempts = 0
            
            while ($attempts -lt 30 -and -not $authRoutesReady) {
                try {
                    # Try to access login endpoint (should return 400 without body)
                    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
                        -Method POST `
                        -ContentType "application/json" `
                        -Body '{}' `
                        -UseBasicParsing `
                        -ErrorAction Stop
                } catch {
                    if ($_.Exception.Response.StatusCode -eq 400) {
                        # 400 means the route exists but needs valid data
                        $authRoutesReady = $true
                        Write-TestSuccess "Authentication routes are ready"
                    } else {
                        $attempts++
                        Start-Sleep -Seconds 1
                    }
                }
            }
            
            if (-not $authRoutesReady) {
                Write-TestWarning "Authentication routes may not be fully loaded"
            }
        }
    }
}

Write-TestStep 4 "Testing basic API connectivity"

# Test health endpoint with retry
$healthCheck = $null
for ($i = 1; $i -le 5; $i++) {
    $healthCheck = Test-APIEndpoint -Method "GET" -Endpoint "http://localhost:5000/api/health"
    if ($healthCheck.Success) {
        break
    }
    Write-TestInfo "Health check attempt $i failed, retrying..."
    Start-Sleep -Seconds 2
}

if ($healthCheck.Success) {
    Write-TestSuccess "API Health check passed"
} else {
    Write-TestFailure "API Health check failed after 5 attempts"
}

Write-TestStep 5 "Checking external service connectivity"

# Test MongoDB connection through API with retry
$dbCheck = $null
for ($i = 1; $i -le 3; $i++) {
    $dbCheck = Test-APIEndpoint -Method "GET" -Endpoint "http://localhost:5000/api/products" -ExpectedStatus "200"
    if ($dbCheck.Success) {
        break
    }
    Write-TestInfo "MongoDB check attempt $i failed, retrying..."
    Start-Sleep -Seconds 2
}

if ($dbCheck.Success) {
    Write-TestSuccess "MongoDB connection verified through API"
} else {
    Write-TestFailure "MongoDB connection failed - check MONGODB_URI in backend/.env"
}

# Final readiness check
Write-TestInfo "Performing final readiness check..."
Start-Sleep -Seconds 3

$finalCheck = Test-APIEndpoint -Method "GET" -Endpoint "http://localhost:5000/api/health"
if ($finalCheck.Success) {
    Write-TestSuccess "Environment is ready for testing!"
} else {
    Write-TestFailure "Environment may not be fully ready"
}
