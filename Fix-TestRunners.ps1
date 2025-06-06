# Fix-TestRunners.ps1
# Fixes configuration loading in all test runner scripts
# Run this from the project root (D:\credit-gyems-academy)

Write-Host "Fixing Test Runner Scripts..." -ForegroundColor Cyan
Write-Host "This will update the configuration loading in all test runner scripts" -ForegroundColor Gray
Write-Host ("-" * 60) -ForegroundColor DarkGray

# Define test runner scripts to fix
$testRunners = @(
    "QA\scripts\api-tests\Run-APITests.ps1",
    "QA\scripts\edge-cases\Run-EdgeCaseTests.ps1",
    "QA\scripts\gui-tests\Run-GUITests.ps1",
    "QA\scripts\k6\Run-StressTests.ps1"
)

foreach ($runner in $testRunners) {
    Write-Host "`nProcessing: $runner" -ForegroundColor Yellow
    
    if (-not (Test-Path $runner)) {
        Write-Host "  ✗ File not found!" -ForegroundColor Red
        continue
    }
    
    # Read the current content
    $content = Get-Content $runner -Raw
    
    # Check if it has the old configuration loading pattern
    if ($content -match '\$configPath = Join-Path \(Split-Path -Parent \$PSScriptRoot\) "master\\Test-Config\.ps1"') {
        Write-Host "  Found old config loading pattern" -ForegroundColor Gray
        
        # Create backup
        $backupPath = "$runner.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
        Copy-Item $runner $backupPath
        Write-Host "  Created backup: $backupPath" -ForegroundColor Gray
        
        # Replace with the correct pattern
        $newConfigLoading = @'
# Get the directory where this script is located
$thisScriptDir = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
$scriptsDir = Split-Path -Parent $thisScriptDir
$masterDir = Join-Path $scriptsDir "master"
$configPath = Join-Path $masterDir "Test-Config.ps1"

if (-not (Test-Path $configPath)) {
    Write-Host "ERROR: Test-Config.ps1 not found at: $configPath" -ForegroundColor Red
    exit 1
}

. $configPath
'@
        
        # Replace the configuration loading section
        $pattern = '\$configPath = Join-Path.*?\. \$configPath'
        $content = $content -replace '(?s)' + $pattern, $newConfigLoading
        
        # Save the updated content
        $content | Set-Content $runner -Encoding UTF8
        Write-Host "  ✓ Updated configuration loading" -ForegroundColor Green
    } else {
        Write-Host "  ℹ Already has correct configuration loading or uses different pattern" -ForegroundColor Blue
    }
}

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    UPDATE COMPLETE                             " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Navigate to the master directory:" -ForegroundColor White
Write-Host "   cd QA\scripts\master" -ForegroundColor Gray
Write-Host "`n2. Run the tests with debug mode:" -ForegroundColor White
Write-Host "   .\Run-AllTests.ps1 -TestMode Quick -Debug" -ForegroundColor Gray
Write-Host "`n3. If you still get errors, check the individual test scripts" -ForegroundColor White