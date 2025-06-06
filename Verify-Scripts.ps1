# Run this from your project root (D:\credit-gyems-academy)
# This will check if all the required test runner scripts exist

$projectRoot = Get-Location
$qaPath = Join-Path $projectRoot "QA"
$scriptsPath = Join-Path $qaPath "scripts"

Write-Host "Checking test runner scripts..." -ForegroundColor Cyan
Write-Host "Project Root: $projectRoot" -ForegroundColor Gray
Write-Host "QA Path: $qaPath" -ForegroundColor Gray
Write-Host "Scripts Path: $scriptsPath" -ForegroundColor Gray
Write-Host ("-" * 60) -ForegroundColor DarkGray

# Define expected scripts and their locations
$testScripts = @(
    @{ Path = "api-tests\Run-APITests.ps1"; Name = "API Test Runner" },
    @{ Path = "edge-cases\Run-EdgeCaseTests.ps1"; Name = "Edge Case Test Runner" },
    @{ Path = "gui-tests\Run-GUITests.ps1"; Name = "GUI Test Runner" },
    @{ Path = "k6\Run-StressTests.ps1"; Name = "Stress Test Runner" },
    @{ Path = "master\Run-AllTests.ps1"; Name = "Master Test Runner" },
    @{ Path = "master\Test-Config.ps1"; Name = "Test Configuration" }
)

$missingScripts = @()

foreach ($script in $testScripts) {
    $fullPath = Join-Path $scriptsPath $script.Path
    if (Test-Path $fullPath) {
        Write-Host "✓ Found: $($script.Name)" -ForegroundColor Green
        Write-Host "  Path: $fullPath" -ForegroundColor Gray
    } else {
        Write-Host "✗ Missing: $($script.Name)" -ForegroundColor Red
        Write-Host "  Expected at: $fullPath" -ForegroundColor Yellow
        $missingScripts += $fullPath
    }
}

Write-Host ("-" * 60) -ForegroundColor DarkGray

# Check actual folder structure
Write-Host "`nActual folder structure in scripts directory:" -ForegroundColor Cyan
Get-ChildItem $scriptsPath -Directory | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor White
    $subItems = Get-ChildItem $_.FullName -Filter "*.ps1" | Select-Object -First 5
    foreach ($item in $subItems) {
        Write-Host "    • $($item.Name)" -ForegroundColor Gray
    }
}

if ($missingScripts.Count -gt 0) {
    Write-Host "`n⚠ Found $($missingScripts.Count) missing scripts!" -ForegroundColor Yellow
    Write-Host "This is likely causing the test execution errors." -ForegroundColor Yellow
} else {
    Write-Host "`n✓ All test runner scripts found!" -ForegroundColor Green
}