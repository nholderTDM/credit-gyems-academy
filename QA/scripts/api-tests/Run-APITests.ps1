# Run-APITests.ps1
# API test suite runner
# Location: QA/scripts/api-tests/

param(
    [string]$Environment = "local",
    [switch]$QuickRun,
    [switch]$FullSuite,
    [switch]$SkipDataSetup,
    [switch]$CleanupAll
)

# Load configuration from master
$configPath = Join-Path (Split-Path -Parent $PSScriptRoot) "master\Test-Config.ps1"
. $configPath

Write-Host "`nAPI Test Suite" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Gray
Write-Host "Mode: $(if ($FullSuite) { 'Full Suite' } elseif ($QuickRun) { 'Quick Run' } else { 'Standard' })" -ForegroundColor Gray

# Get environment URLs
$env = Get-TestEnvironment -Environment $Environment

# Update base URL for all tests
$Global:BaseUrl = $env.BackendUrl

# Initialize test results
$Global:TestResults = @{
    StartTime = Get-Date
    Passed = 0
    Failed = 0
    TestDetails = @()
}

# Setup test data if needed
if (-not $SkipDataSetup) {
    Write-Host "`nSetting up test data..." -ForegroundColor Yellow
    & "$PSScriptRoot\Setup-TestData.ps1"
}

# Run test suites
$testSuites = @(
    @{ Name = "Environment"; Script = "Test-Environment.ps1" },
    @{ Name = "Authentication"; Script = "Test-Authentication.ps1" },
    @{ Name = "E-commerce"; Script = "Test-Ecommerce.ps1" },
    @{ Name = "Booking"; Script = "Test-Booking.ps1" },
    @{ Name = "Community"; Script = "Test-Community.ps1" },
    @{ Name = "Lead Capture"; Script = "Test-LeadCapture.ps1" }
)

if (-not $QuickRun) {
    $testSuites += @(
        @{ Name = "Error Scenarios"; Script = "Test-ErrorScenarios.ps1" },
        @{ Name = "Integrations"; Script = "Test-Integrations.ps1" }
    )
}

foreach ($suite in $testSuites) {
    Write-Host "`nRunning $($suite.Name) tests..." -ForegroundColor Cyan
    try {
        & "$PSScriptRoot\$($suite.Script)"
        Write-Host "✓ $($suite.Name) tests completed" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ $($suite.Name) tests failed: $_" -ForegroundColor Red
        $Global:TestResults.Failed++
    }
}

# Cleanup if requested
if ($CleanupAll) {
    Write-Host "`nCleaning up test data..." -ForegroundColor Yellow
    & "$PSScriptRoot\Cleanup-TestData.ps1"
}

# Generate report
$reportDir = Join-Path $Global:TestPaths.Reports.Today "api-tests"
if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

& "$PSScriptRoot\Generate-TestReport.ps1" `
    -OutputPath $reportDir `
    -ReportName "api-test-report-$(Get-Date -Format 'HHmmss')"

# Return results
return $Global:TestResults



