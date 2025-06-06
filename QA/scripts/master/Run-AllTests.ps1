# Run-AllTests.ps1
# Master test orchestrator for Credit Gyems Academy
# Location: QA/scripts/master/

param(
    [ValidateSet("Quick", "Standard", "Full", "API", "GUI", "Edge", "Stress", "All")]
    [string]$TestMode = "Standard",
    
    [ValidateSet("local", "staging", "production")]
    [string]$Environment = "local",
    
    [ValidateSet("chromium", "firefox", "webkit", "all")]
    [string]$Browser = "chromium",
    
    [switch]$SkipAPI,
    [switch]$SkipGUI,
    [switch]$SkipEdgeCases,
    [switch]$SkipStress,
    [switch]$GenerateReport,
    [switch]$CIMode,
    [switch]$Debug
)

# Get absolute paths based on this script's location
$thisScriptPath = $MyInvocation.MyCommand.Path
$masterDir = Split-Path -Parent $thisScriptPath
$scriptsDir = Split-Path -Parent $masterDir
$qaDir = Split-Path -Parent $scriptsDir
$projectRoot = Split-Path -Parent $qaDir

# Load shared configuration
$configPath = Join-Path $masterDir "Test-Config.ps1"
if (Test-Path $configPath) {
    . $configPath
} else {
    Write-Host "ERROR: Test-Config.ps1 not found at: $configPath" -ForegroundColor Red
    exit 1
}

# Override paths to ensure they're absolute
$Global:ProjectRoot = $projectRoot
$Global:TestPaths = @{
    Root = $qaDir
    Scripts = @{
        Master = $masterDir
        API = Join-Path $scriptsDir "api-tests"
        GUI = Join-Path $scriptsDir "gui-tests"
        EdgeCases = Join-Path $scriptsDir "edge-cases"
        K6 = Join-Path $scriptsDir "k6"
    }
    Reports = @{
        Root = Join-Path $qaDir "test-reports"
        Today = Join-Path (Join-Path $qaDir "test-reports") (Get-Date -Format 'yyyy-MM-dd')
    }
    Backend = Join-Path $projectRoot "backend"
    Frontend = Join-Path $projectRoot "frontend"
}

# Debug output
if ($Debug) {
    Write-Host "`nDEBUG MODE - Path Configuration:" -ForegroundColor Magenta
    Write-Host "This Script: $thisScriptPath" -ForegroundColor Gray
    Write-Host "Master Dir: $masterDir" -ForegroundColor Gray
    Write-Host "Scripts Dir: $scriptsDir" -ForegroundColor Gray
    Write-Host "QA Dir: $qaDir" -ForegroundColor Gray
    Write-Host "Project Root: $projectRoot" -ForegroundColor Gray
    
    Write-Host "`nTest Script Locations:" -ForegroundColor Magenta
    $Global:TestPaths.Scripts.GetEnumerator() | ForEach-Object {
        $exists = Test-Path (Join-Path $_.Value "*.ps1")
        $status = if ($exists) { "✓" } else { "✗" }
        $color = if ($exists) { "Green" } else { "Red" }
        Write-Host "  $status $($_.Key): $($_.Value)" -ForegroundColor $color
    }
}

# Initialize results
$Global:MasterTestResults = @{
    StartTime = Get-Date
    Environment = $Environment
    TestMode = $TestMode
    Results = @{}
    Summary = @{
        TotalPassed = 0
        TotalFailed = 0
        TotalSkipped = 0
        Duration = ""
    }
}

# ASCII Art Header
Write-Host @"

╔══════════════════════════════════════════════════════════════════════════════╗
║                    CREDIT GYEMS ACADEMY - QA TEST SUITE                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Test Mode: $TestMode" -ForegroundColor White
Write-Host "  Environment: $Environment" -ForegroundColor White
Write-Host "  Browser: $Browser" -ForegroundColor White
Write-Host "  Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host ("-" * 80) -ForegroundColor DarkGray

# Function to check prerequisites
function Test-Prerequisites {
    Write-Host "`nChecking Prerequisites..." -ForegroundColor Cyan
    
    $prerequisites = @{
        "Node.js" = { node --version 2>$null }
        "NPM" = { npm --version 2>$null }
        "PowerShell 5+" = { $PSVersionTable.PSVersion.Major -ge 5 }
    }
    
    $allPassed = $true
    foreach ($tool in $prerequisites.Keys) {
        try {
            $result = & $prerequisites[$tool]
            if ($result) {
                Write-Host "  ✓ $tool is installed" -ForegroundColor Green
            } else {
                throw
            }
        }
        catch {
            Write-Host "  ✗ $tool is not installed or not accessible" -ForegroundColor Red
            $allPassed = $false
        }
    }
    
    return $allPassed
}

# Function to run test suite - SIMPLIFIED VERSION
function Invoke-TestSuite {
    param(
        [string]$Name,
        [string]$ScriptPath,
        [hashtable]$Parameters = @{}
    )
    
    Write-Host "`nRunning $Name..." -ForegroundColor Cyan
    $suiteStart = Get-Date
    
    # Debug output
    if ($Debug) {
        Write-Host "  DEBUG: Script path: $ScriptPath" -ForegroundColor Magenta
        Write-Host "  DEBUG: Exists: $(Test-Path $ScriptPath)" -ForegroundColor Magenta
    }
    
    # Verify script exists
    if (-not (Test-Path $ScriptPath)) {
        $Global:MasterTestResults.Results[$Name] = @{
            Success = $false
            Error = "Script not found at: $ScriptPath"
        }
        Write-Host "  ✗ $Name failed: Script not found" -ForegroundColor Red
        return $false
    }
    
    try {
        # Build parameter string for direct execution
        $paramString = ""
        foreach ($param in $Parameters.GetEnumerator()) {
            if ($param.Value -is [switch] -and $param.Value) {
                $paramString += " -$($param.Key)"
            } elseif ($param.Value -is [string]) {
                $paramString += " -$($param.Key) '$($param.Value)'"
            } else {
                $paramString += " -$($param.Key) $($param.Value)"
            }
        }
        
        if ($Debug) {
            Write-Host "  DEBUG: Executing: & '$ScriptPath'$paramString" -ForegroundColor Magenta
        }
        
        # Execute the script
        $scriptBlock = [ScriptBlock]::Create("& '$ScriptPath'$paramString")
        $result = Invoke-Command -ScriptBlock $scriptBlock
        
        $duration = (Get-Date) - $suiteStart
        $Global:MasterTestResults.Results[$Name] = @{
            Success = $true
            Duration = $duration
            Details = $result
        }
        
        Write-Host "  ✓ $Name completed in $($duration.ToString('mm\:ss'))" -ForegroundColor Green
        return $true
    }
    catch {
        $errorMessage = $_.Exception.Message
        $Global:MasterTestResults.Results[$Name] = @{
            Success = $false
            Error = $errorMessage
        }
        Write-Host "  ✗ $Name failed: $errorMessage" -ForegroundColor Red
        if ($Debug) {
            Write-Host "  DEBUG: Full error: $_" -ForegroundColor Magenta
        }
        return $false
    }
}

# Main execution
try {
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        Write-Host "`n✗ Prerequisites check failed. Please install missing components." -ForegroundColor Red
        exit 1
    }
    
    # Build test suite list based on mode
    $testSuites = @()
    
    # Define script paths
    $apiTestScript = Join-Path $Global:TestPaths.Scripts.API "Run-APITests.ps1"
    $guiTestScript = Join-Path $Global:TestPaths.Scripts.GUI "Run-GUITests.ps1"
    $edgeTestScript = Join-Path $Global:TestPaths.Scripts.EdgeCases "Run-EdgeCaseTests.ps1"
    $stressTestScript = Join-Path $Global:TestPaths.Scripts.K6 "Run-StressTests.ps1"
    
    switch ($TestMode) {
        "Quick" {
            if (-not $SkipAPI) {
                $testSuites += @{
                    Name = "API Tests (Quick)"
                    Script = $apiTestScript
                    Parameters = @{ 
                        Environment = $Environment
                        QuickRun = $true 
                    }
                }
            }
        }
        "API" {
            if (-not $SkipAPI) {
                $testSuites += @{
                    Name = "API Tests"
                    Script = $apiTestScript
                    Parameters = @{ Environment = $Environment }
                }
            }
        }
        "GUI" {
            if (-not $SkipGUI) {
                $testSuites += @{
                    Name = "GUI Tests"
                    Script = $guiTestScript
                    Parameters = @{ 
                        Environment = $Environment
                        Browser = $Browser 
                    }
                }
            }
        }
        "Edge" {
            if (-not $SkipEdgeCases) {
                $testSuites += @{
                    Name = "Edge Case Tests"
                    Script = $edgeTestScript
                    Parameters = @{ Environment = $Environment }
                }
            }
        }
        "Stress" {
            if (-not $SkipStress) {
                $testSuites += @{
                    Name = "Stress Tests"
                    Script = $stressTestScript
                    Parameters = @{ Environment = $Environment }
                }
            }
        }
        "Standard" {
            if (-not $SkipAPI) {
                $testSuites += @{
                    Name = "API Tests"
                    Script = $apiTestScript
                    Parameters = @{ Environment = $Environment }
                }
            }
            if (-not $SkipGUI) {
                $testSuites += @{
                    Name = "GUI Tests"
                    Script = $guiTestScript
                    Parameters = @{ 
                        Environment = $Environment
                        Browser = $Browser 
                    }
                }
            }
            if (-not $SkipEdgeCases) {
                $testSuites += @{
                    Name = "Edge Case Tests (Quick)"
                    Script = $edgeTestScript
                    Parameters = @{ 
                        Environment = $Environment
                        QuickRun = $true 
                    }
                }
            }
        }
        "Full" {
            if (-not $SkipAPI) {
                $testSuites += @{
                    Name = "API Tests"
                    Script = $apiTestScript
                    Parameters = @{ 
                        Environment = $Environment
                        FullSuite = $true 
                    }
                }
            }
            if (-not $SkipGUI) {
                $testSuites += @{
                    Name = "GUI Tests"
                    Script = $guiTestScript
                    Parameters = @{ 
                        Environment = $Environment
                        Browser = $Browser
                        FullSuite = $true 
                    }
                }
            }
            if (-not $SkipEdgeCases) {
                $testSuites += @{
                    Name = "Edge Case Tests"
                    Script = $edgeTestScript
                    Parameters = @{ 
                        Environment = $Environment
                        FullSuite = $true 
                    }
                }
            }
            if (-not $SkipStress) {
                $testSuites += @{
                    Name = "Stress Tests"
                    Script = $stressTestScript
                    Parameters = @{ 
                        Environment = $Environment
                        FullSuite = $true 
                    }
                }
            }
        }
        "All" {
            if (-not $SkipAPI) {
                $testSuites += @{
                    Name = "API Tests"
                    Script = $apiTestScript
                    Parameters = @{ 
                        Environment = $Environment
                        FullSuite = $true 
                    }
                }
            }
            if (-not $SkipGUI) {
                $testSuites += @{
                    Name = "GUI Tests (All Browsers)"
                    Script = $guiTestScript
                    Parameters = @{ 
                        Environment = $Environment
                        Browser = "all"
                        FullSuite = $true 
                    }
                }
            }
            if (-not $SkipEdgeCases) {
                $testSuites += @{
                    Name = "Edge Case Tests"
                    Script = $edgeTestScript
                    Parameters = @{ 
                        Environment = $Environment
                        FullSuite = $true 
                    }
                }
            }
            if (-not $SkipStress) {
                $testSuites += @{
                    Name = "Stress Tests"
                    Script = $stressTestScript
                    Parameters = @{ 
                        Environment = $Environment
                        FullSuite = $true 
                    }
                }
            }
        }
    }
    
    # Verify scripts exist before running
    Write-Host "`nVerifying test scripts..." -ForegroundColor Cyan
    $allScriptsExist = $true
    foreach ($suite in $testSuites) {
        if (Test-Path $suite.Script) {
            Write-Host "  ✓ Found: $($suite.Name)" -ForegroundColor Green
            if ($Debug) {
                Write-Host "    Path: $($suite.Script)" -ForegroundColor Gray
            }
        } else {
            Write-Host "  ✗ Missing: $($suite.Name)" -ForegroundColor Red
            Write-Host "    Expected at: $($suite.Script)" -ForegroundColor Yellow
            $allScriptsExist = $false
        }
    }
    
    if (-not $allScriptsExist) {
        Write-Host "`n✗ Some test scripts are missing. Cannot continue." -ForegroundColor Red
        exit 1
    }
    
    # Run test suites
    foreach ($suite in $testSuites) {
        $success = Invoke-TestSuite -Name $suite.Name -ScriptPath $suite.Script -Parameters $suite.Parameters
        if ($success) {
            $Global:MasterTestResults.Summary.TotalPassed++
        } else {
            $Global:MasterTestResults.Summary.TotalFailed++
        }
    }
    
    # Set duration
    $Global:MasterTestResults.Summary.Duration = ((Get-Date) - $Global:MasterTestResults.StartTime).ToString('hh\:mm\:ss')
    
    # Generate report
    if ($GenerateReport -or -not $CIMode) {
        Write-Host "`nGenerating Test Report..." -ForegroundColor Cyan
        
        # Create report directory
        $reportDate = Get-Date -Format 'yyyy-MM-dd'
        $reportTime = Get-Date -Format 'HHmmss'
        $reportDir = Join-Path $Global:TestPaths.Reports.Root $reportDate
        
        if (-not (Test-Path $reportDir)) {
            New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
        }
        
        # Generate HTML report
        $reportHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>Credit Gyems Academy - Test Report - $reportDate</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f0f2f5; }
        .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #333; padding: 40px; text-align: center; }
        .container { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .summary-card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); text-align: center; }
        .metric-value { font-size: 3em; font-weight: bold; margin: 10px 0; }
        .status-passed { color: #28a745; }
        .status-failed { color: #dc3545; }
        .status-skipped { color: #6c757d; }
        .test-results { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: bold; }
        .success { color: #28a745; }
        .failure { color: #dc3545; }
        .footer { text-align: center; padding: 40px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Credit Gyems Academy - Test Report</h1>
        <p>Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | Mode: $TestMode | Environment: $Environment</p>
    </div>
    
    <div class="container">
        <div class="summary-grid">
            <div class="summary-card">
                <div class="metric-label">Total Tests</div>
                <div class="metric-value">$($Global:MasterTestResults.Summary.TotalPassed + $Global:MasterTestResults.Summary.TotalFailed)</div>
            </div>
            <div class="summary-card">
                <div class="metric-label">Passed</div>
                <div class="metric-value status-passed">$($Global:MasterTestResults.Summary.TotalPassed)</div>
            </div>
            <div class="summary-card">
                <div class="metric-label">Failed</div>
                <div class="metric-value status-failed">$($Global:MasterTestResults.Summary.TotalFailed)</div>
            </div>
            <div class="summary-card">
                <div class="metric-label">Duration</div>
                <div class="metric-value">$($Global:MasterTestResults.Summary.Duration)</div>
            </div>
        </div>
        
        <div class="test-results">
            <h2>Test Suite Results</h2>
            <table>
                <tr>
                    <th>Test Suite</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Details</th>
                </tr>
"@
        
        foreach ($suite in $Global:MasterTestResults.Results.GetEnumerator()) {
            $status = if ($suite.Value.Success) { "PASSED" } else { "FAILED" }
            $statusClass = if ($suite.Value.Success) { "success" } else { "failure" }
            $duration = if ($suite.Value.Duration) { $suite.Value.Duration.ToString('mm\:ss') } else { "N/A" }
            $details = if ($suite.Value.Error) { $suite.Value.Error } else { "Completed successfully" }
            
            $reportHtml += @"
                <tr>
                    <td>$($suite.Key)</td>
                    <td class="$statusClass"><strong>$status</strong></td>
                    <td>$duration</td>
                    <td>$details</td>
                </tr>
"@
        }
        
        $reportHtml += @"
            </table>
        </div>
        
        <div class="footer">
            <p>Credit Gyems Academy QA Suite | Test Environment: $Environment</p>
        </div>
    </div>
</body>
</html>
"@
        
        # Save reports
        $htmlPath = Join-Path $reportDir "test-report-${reportTime}.html"
        $jsonPath = Join-Path $reportDir "test-summary-${reportTime}.json"
        
        $reportHtml | Out-File -FilePath $htmlPath -Encoding UTF8
        $Global:MasterTestResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8
        
        Write-Host "  ✓ HTML Report: $htmlPath" -ForegroundColor Green
        Write-Host "  ✓ JSON Summary: $jsonPath" -ForegroundColor Green
        
        # Open HTML report if not in CI mode
        if (-not $CIMode) {
            Start-Process $htmlPath
        }
    }
    
    # Final summary
    Write-Host "`n" -NoNewline
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "                    TEST EXECUTION COMPLETE                     " -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    $totalTests = $Global:MasterTestResults.Summary.TotalPassed + $Global:MasterTestResults.Summary.TotalFailed
    $passRate = if ($totalTests -gt 0) { 
        [math]::Round(($Global:MasterTestResults.Summary.TotalPassed / $totalTests) * 100, 2) 
    } else { 0 }
    
    Write-Host "`nSummary:" -ForegroundColor Yellow
    Write-Host "  Total Test Suites: $totalTests" -ForegroundColor White
    Write-Host "  Passed: $($Global:MasterTestResults.Summary.TotalPassed)" -ForegroundColor Green
    Write-Host "  Failed: $($Global:MasterTestResults.Summary.TotalFailed)" -ForegroundColor $(if ($Global:MasterTestResults.Summary.TotalFailed -eq 0) { 'Green' } else { 'Red' })
    Write-Host "  Pass Rate: ${passRate}%" -ForegroundColor $(if ($passRate -eq 100) { 'Green' } elseif ($passRate -ge 80) { 'Yellow' } else { 'Red' })
    Write-Host "`nExecuted at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    
    # Set exit code
    $exitCode = if ($Global:MasterTestResults.Summary.TotalFailed -eq 0) { 0 } else { 1 }
    exit $exitCode
}
catch {
    Write-Host "`n✗ FATAL ERROR: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed
    exit 1
}