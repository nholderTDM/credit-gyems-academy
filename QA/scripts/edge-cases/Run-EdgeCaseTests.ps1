# Run-EdgeCaseTests.ps1
# Edge case test suite runner
# Location: QA/scripts/edge-cases/

param(
    [string]$Environment = "local",
    [switch]$QuickRun,
    [switch]$FullSuite,
    [switch]$SkipSecurity,
    [switch]$SkipStress
)

# Load configuration
$configPath = Join-Path (Split-Path -Parent $PSScriptRoot) "master\Test-Config.ps1"
. $configPath

Write-Host "`nEdge Case Test Suite" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Gray
Write-Host "Mode: $(if ($FullSuite) { 'Full Suite' } elseif ($QuickRun) { 'Quick Run' } else { 'Standard' })" -ForegroundColor Gray

# Get environment URLs
$env = Get-TestEnvironment -Environment $Environment
$Global:BaseUrl = $env.BackendUrl

# Initialize results
$Global:EdgeCaseResults = @{
    StartTime = Get-Date
    PaymentIssues = 0
    ConcurrencyIssues = 0
    SecurityVulnerabilities = 0
    DataIntegrityIssues = 0
}

# Define test suites
$testSuites = @()

if ($QuickRun) {
    $testSuites = @(
        @{ Name = "Payment Edge Cases"; Script = "Test-PaymentEdgeCases.ps1" }
    )
} else {
    $testSuites = @(
        @{ Name = "Payment Edge Cases"; Script = "Test-PaymentEdgeCases.ps1" },
        @{ Name = "Concurrent Users"; Script = "Test-ConcurrentUsers.ps1" },
        @{ Name = "Data Integrity"; Script = "Test-DataIntegrity.ps1" }
    )
    
    if (-not $SkipSecurity) {
        $testSuites += @{ Name = "Security Edge Cases"; Script = "Test-SecurityEdgeCases.ps1" }
    }
    
    if ($FullSuite) {
        $testSuites += @{ Name = "Additional Edge Cases"; Script = "Test-AdditionalEdgeCases.ps1" }
    }
}

# Run test suites
foreach ($suite in $testSuites) {
    Write-Host "`nRunning $($suite.Name)..." -ForegroundColor Cyan
    try {
        & "$PSScriptRoot\$($suite.Script)"
        Write-Host "✓ $($suite.Name) completed" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ $($suite.Name) failed: $_" -ForegroundColor Red
    }
}

# Generate report
$reportDir = Join-Path $Global:TestPaths.Reports.Today "edge-cases"
if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

$reportPath = Join-Path $reportDir "edge-case-report-$(Get-Date -Format 'HHmmss').json"
$Global:EdgeCaseResults | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding UTF8

Write-Host "`nEdge Case Summary:" -ForegroundColor Cyan
Write-Host "  Payment Issues: $($Global:EdgeCaseResults.PaymentIssues)" -ForegroundColor $(if ($Global:EdgeCaseResults.PaymentIssues -eq 0) { 'Green' } else { 'Yellow' })
Write-Host "  Concurrency Issues: $($Global:EdgeCaseResults.ConcurrencyIssues)" -ForegroundColor $(if ($Global:EdgeCaseResults.ConcurrencyIssues -eq 0) { 'Green' } else { 'Yellow' })
Write-Host "  Security Vulnerabilities: $($Global:EdgeCaseResults.SecurityVulnerabilities)" -ForegroundColor $(if ($Global:EdgeCaseResults.SecurityVulnerabilities -eq 0) { 'Green' } else { 'Red' })
Write-Host "  Data Integrity Issues: $($Global:EdgeCaseResults.DataIntegrityIssues)" -ForegroundColor $(if ($Global:EdgeCaseResults.DataIntegrityIssues -eq 0) { 'Green' } else { 'Yellow' })

# Return results
return $Global:EdgeCaseResults
