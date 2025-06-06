# Diagnose-PathIssue.ps1
# Run this from the QA\scripts\master directory

Write-Host "Diagnosing path issue in Run-AllTests.ps1..." -ForegroundColor Cyan
Write-Host "Current Location: $(Get-Location)" -ForegroundColor Gray
Write-Host ("-" * 60) -ForegroundColor DarkGray

# Test 1: Check if we can directly call Run-APITests.ps1
Write-Host "`nTest 1: Direct script execution" -ForegroundColor Yellow
$apiTestPath = "..\..\api-tests\Run-APITests.ps1"
if (Test-Path $apiTestPath) {
    Write-Host "✓ Script found at relative path: $apiTestPath" -ForegroundColor Green
    $fullPath = Resolve-Path $apiTestPath
    Write-Host "  Full path: $fullPath" -ForegroundColor Gray
} else {
    Write-Host "✗ Script not found at relative path: $apiTestPath" -ForegroundColor Red
}

# Test 2: Check Join-Path resolution
Write-Host "`nTest 2: Join-Path resolution" -ForegroundColor Yellow
$scriptDir = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
$scriptsPath = Split-Path -Parent $scriptDir
$apiPath = Join-Path $scriptsPath "api-tests"
$apiTestScript = Join-Path $apiPath "Run-APITests.ps1"

Write-Host "  Script Dir: $scriptDir" -ForegroundColor Gray
Write-Host "  Scripts Path: $scriptsPath" -ForegroundColor Gray
Write-Host "  API Path: $apiPath" -ForegroundColor Gray
Write-Host "  API Test Script: $apiTestScript" -ForegroundColor Gray

if (Test-Path $apiTestScript) {
    Write-Host "✓ Script found using Join-Path" -ForegroundColor Green
} else {
    Write-Host "✗ Script not found using Join-Path" -ForegroundColor Red
}

# Test 3: Try to execute with different methods
Write-Host "`nTest 3: Execution methods" -ForegroundColor Yellow

# Method 1: Using & with string path
try {
    Write-Host "  Testing & operator with string path..." -ForegroundColor Gray
    $testPath = Resolve-Path $apiTestScript
    & "$testPath" -Environment "local" -QuickRun 2>&1 | Out-Null
    Write-Host "  ✓ Method 1 works" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Method 1 failed: $_" -ForegroundColor Red
}

# Method 2: Using Invoke-Expression
try {
    Write-Host "  Testing Invoke-Expression..." -ForegroundColor Gray
    Invoke-Expression "& '$testPath' -Environment 'local' -QuickRun" 2>&1 | Out-Null
    Write-Host "  ✓ Method 2 works" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Method 2 failed: $_" -ForegroundColor Red
}

# Method 3: Using Start-Process
try {
    Write-Host "  Testing Start-Process..." -ForegroundColor Gray
    $proc = Start-Process -FilePath "powershell.exe" -ArgumentList "-File", $testPath, "-Environment", "local", "-QuickRun" -Wait -PassThru -NoNewWindow
    if ($proc.ExitCode -eq 0) {
        Write-Host "  ✓ Method 3 works" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Method 3 failed with exit code: $($proc.ExitCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ Method 3 failed: $_" -ForegroundColor Red
}

# Test 4: Check the actual config loading in Run-APITests.ps1
Write-Host "`nTest 4: Checking Run-APITests.ps1 configuration loading" -ForegroundColor Yellow
$apiContent = Get-Content $apiTestScript -First 20
$configLine = $apiContent | Where-Object { $_ -like "*Test-Config.ps1*" }
if ($configLine) {
    Write-Host "  Config loading line found: $configLine" -ForegroundColor Gray
    
    # Check if the path is correct
    if ($configLine -match '\$PSScriptRoot') {
        Write-Host "  ⚠ Uses $PSScriptRoot - checking if it resolves correctly" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ No Test-Config.ps1 loading found!" -ForegroundColor Red
}

Write-Host "`nRecommendation:" -ForegroundColor Cyan
Write-Host "The issue appears to be in the Invoke-TestSuite function in Run-AllTests.ps1" -ForegroundColor White
Write-Host "The script path is being lost when passed to the function." -ForegroundColor White