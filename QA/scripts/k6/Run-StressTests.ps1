# Run-StressTests.ps1
# K6 stress test runner
# Location: QA/scripts/k6/

param(
    [string]$Environment = "local",
    [switch]$QuickRun,
    [switch]$FullSuite
)

# Load configuration
$configPath = Join-Path (Split-Path -Parent $PSScriptRoot) "master\Test-Config.ps1"
. $configPath

Write-Host "`nK6 Stress Test Suite" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Gray
Write-Host "Mode: $(if ($FullSuite) { 'Full Suite' } elseif ($QuickRun) { 'Quick Run' } else { 'Standard' })" -ForegroundColor Gray

# Check K6 installation
try {
    $k6Version = k6 version 2>&1
    Write-Host "K6 Version: $k6Version" -ForegroundColor Gray
}
catch {
    Write-Host "✗ K6 is not installed. Please install from https://k6.io" -ForegroundColor Red
    return @{ Success = $false; Error = "K6 not installed" }
}

# Get environment URLs
$env = Get-TestEnvironment -Environment $Environment

# Set environment variables for K6
$env:BASE_URL = $env.BackendUrl
$env:FRONTEND_URL = $env.FrontendUrl

# Define test scenarios
$scenarios = @()

if ($QuickRun) {
    $scenarios = @(
        @{ Name = "Quick Load Test"; Script = "load-test.js"; Options = "--duration 2m --vus 10" }
    )
} elseif ($FullSuite) {
    $scenarios = @(
        @{ Name = "Load Test"; Script = "load-test.js"; Options = "" },
        @{ Name = "Stress Test"; Script = "stress-test.js"; Options = "" },
        @{ Name = "Spike Test"; Script = "spike-test.js"; Options = "" }
    )
} else {
    $scenarios = @(
        @{ Name = "Standard Stress Test"; Script = "stress-test.js"; Options = "--duration 10m" }
    )
}

# Create report directory
$reportDir = Join-Path $Global:TestPaths.Reports.Today "stress-tests"
if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

# Run scenarios
$results = @{}
foreach ($scenario in $scenarios) {
    Write-Host "`nRunning $($scenario.Name)..." -ForegroundColor Cyan
    
    $outputFile = Join-Path $reportDir "$($scenario.Script.Replace('.js', ''))-$(Get-Date -Format 'HHmmss').json"
    $command = "k6 run $($scenario.Options) --out json=$outputFile $PSScriptRoot\$($scenario.Script)"
    
    Write-Host "Command: $command" -ForegroundColor Gray
    
    try {
        $output = Invoke-Expression $command 2>&1
        Write-Host $output
        
        $results[$scenario.Name] = @{
            Success = $true
            OutputFile = $outputFile
        }
        
        Write-Host "✓ $($scenario.Name) completed" -ForegroundColor Green
    }
    catch {
        $results[$scenario.Name] = @{
            Success = $false
            Error = $_.Exception.Message
        }
        Write-Host "✗ $($scenario.Name) failed: $_" -ForegroundColor Red
    }
}

# Generate summary
$summaryPath = Join-Path $reportDir "stress-test-summary-$(Get-Date -Format 'HHmmss').json"
$results | ConvertTo-Json -Depth 10 | Out-File $summaryPath -Encoding UTF8

Write-Host "`nStress Test Summary saved to: $summaryPath" -ForegroundColor Cyan

# Return results
return $results
