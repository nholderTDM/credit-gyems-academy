Write-Host '[DEBUG] Loading Test-Utilities.ps1 from: \Test-Utilities.ps1' -ForegroundColor Yellow
# Test-Utilities.ps1
# Common utility functions for all test scripts
# Location: QA/scripts/api-tests/

# Color-coded output functions
function Write-TestHeader($message) {
    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║ $message".PadRight(64) + "║" -ForegroundColor Magenta
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
}

function Write-TestSection($message) {
    Write-Host "`n┌─────────────────────────────────────────────────────────────┐" -ForegroundColor Blue
    Write-Host "│ $message".PadRight(62) + "│" -ForegroundColor Blue
    Write-Host "└─────────────────────────────────────────────────────────────┘" -ForegroundColor Blue
}

function Write-TestStep($step, $description) {
    Write-Host "`n→ Step $step`: $description" -ForegroundColor White
}

function Write-TestSuccess($message) {
    Write-Host "  ✓ $message" -ForegroundColor Green
    if ($Global:TestResults) {
        if ($null -eq $Global:TestResults.Passed) { $Global:TestResults.Passed = 0 }
        $Global:TestResults.Passed++
        if ($Global:TestResults.Details -is [System.Collections.ArrayList]) {
            [void]$Global:TestResults.Details.Add(@{
                Type = "Success"
                Message = $message
                Timestamp = Get-Date
            })
        }
    }
}

function Write-TestFailure($message, $errorDetails = $null) {
    Write-Host "  ✗ $message" -ForegroundColor Red
    if ($errorDetails) {
        Write-Host "    Error: $errorDetails" -ForegroundColor DarkRed
    }
    if ($Global:TestResults) {
        if ($null -eq $Global:TestResults.Failed) { $Global:TestResults.Failed = 0 }
        $Global:TestResults.Failed++
        if ($Global:TestResults.Details -is [System.Collections.ArrayList]) {
            [void]$Global:TestResults.Details.Add(@{
                Type = "Failure"
                Message = $message
                Error = $errorDetails
                Timestamp = Get-Date
            })
        }
    }
}

function Write-TestWarning($message) {
    Write-Host "  ⚠ $message" -ForegroundColor Yellow
    if ($Global:TestResults) {
        if ($null -eq $Global:TestResults.Warnings) { $Global:TestResults.Warnings = 0 }
        $Global:TestResults.Warnings++
        if ($Global:TestResults.Details -is [System.Collections.ArrayList]) {
            [void]$Global:TestResults.Details.Add(@{
                Type = "Warning"
                Message = $message
                Timestamp = Get-Date
            })
        }
    }
}

function Write-TestInfo($message) {
    Write-Host "  ℹ $message" -ForegroundColor Cyan
}

# API Testing Functions
function Test-APIEndpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [hashtable]$Body = @{},
        [string]$ExpectedStatus = "200"
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Endpoint
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body.Count -gt 0) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        Write-TestSuccess "$Method $Endpoint - Status: $ExpectedStatus"
        return @{
            Success = $true
            Data = $response
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.ErrorDetails.Message
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-TestSuccess "$Method $Endpoint - Expected error status: $statusCode"
            return @{
                Success = $true
                StatusCode = $statusCode
                Error = $errorMessage
            }
        }
        else {
            Write-TestFailure "$METHOD $Endpoint - Status: $statusCode (Expected: $ExpectedStatus)" $errorMessage
            return @{
                Success = $false
                StatusCode = $statusCode
                Error = $errorMessage
            }
        }
    }
}

# Server Management Functions
function Test-ServerRunning {
    param(
        [string]$Url,
        [string]$Name
    )
    
    try {
        $null = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-TestSuccess "$Name is running at $Url"
        return $true
    }
    catch {
        Write-TestWarning "$Name is not running at $Url"
        return $false
    }
}

function Start-DevServer {
    param(
        [string]$Path,
        [string]$Command,
        [string]$Name,
        [int]$WaitSeconds = 10
    )
    
    Write-TestInfo "Starting $Name..."
    $process = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c cd /d `"$Path`" && $Command" `
        -PassThru -WindowStyle Minimized
    
    Start-Sleep -Seconds $WaitSeconds
    
    if (-not $process.HasExited) {
        Write-TestSuccess "$Name started successfully (PID: $($process.Id))"
        return $process
    }
    else {
        Write-TestFailure "$Name failed to start"
        return $null
    }
}

# Test Data Generators
function Get-RandomTestEmail {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $random = Get-Random -Maximum 9999
    return "test_${timestamp}_${random}@creditgyemstest.com"
}

function Get-RandomTestUser {
    $firstName = @("John", "Jane", "Michael", "Sarah", "David", "Emma", "Robert", "Lisa") | Get-Random
    $lastName = @("Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis") | Get-Random
    
    return @{
        firstName = $firstName
        lastName = $lastName
        email = Get-RandomTestEmail
        password = "TestPass123!"
        phone = "555-$(Get-Random -Minimum 1000 -Maximum 9999)"
    }
}

# Stripe Test Cards
$Global:StripeTestCards = @{
    Success = @{
        Number = "4242424242424242"
        CVC = "123"
        ExpMonth = "12"
        ExpYear = (Get-Date).AddYears(2).Year
    }
    DeclineGeneric = @{
        Number = "4000000000000002"
        CVC = "123"
        ExpMonth = "12"
        ExpYear = (Get-Date).AddYears(2).Year
    }
    InsufficientFunds = @{
        Number = "4000000000009995"
        CVC = "123"
        ExpMonth = "12"
        ExpYear = (Get-Date).AddYears(2).Year
    }
}

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

function Stop-ConnectionSlot {
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
        Stop-ConnectionSlot
    }
}

# Smart retry with exponential backoff
function Invoke-WithRetry {
    param(
        [scriptblock]$ScriptBlock,
        [int]$MaxAttempts = 3,
        [int]$InitialDelay = 1000,
        [double]$BackoffMultiplier = 2.0
    )
    
    $attempt = 0
    $delay = $InitialDelay
    $lastError = $null
    
    while ($attempt -lt $MaxAttempts) {
        $attempt++
        
        try {
            return & $ScriptBlock
        }
        catch {
            $lastError = $_
            
            if ($_.Exception.Message -like "*connection*refused*" -or 
                $_.Exception.Message -like "*ECONNREFUSED*") {
                
                if ($attempt -lt $MaxAttempts) {
                    Write-Host "  Connection failed, retrying in $($delay)ms... (Attempt $attempt/$MaxAttempts)" -ForegroundColor Yellow
                    Start-Sleep -Milliseconds $delay
                    $delay = [int]($delay * $BackoffMultiplier)
                    continue
                }
            }
            
            throw $_
        }
    }
    
    throw $lastError
}

# Check TIME_WAIT connections with configurable threshold
function Test-TimeWaitConnections {
    param(
        [int]$WarningThreshold = 100
    )
    
    $timeWaitCount = (netstat -an | Select-String "TIME_WAIT").Count
    
    if ($timeWaitCount -gt $WarningThreshold) {
        Write-TestWarning "High TIME_WAIT count detected: $timeWaitCount"
    } else {
        Write-TestSuccess "TIME_WAIT connections within acceptable range: $timeWaitCount"
    }
    
    return $timeWaitCount
}
