param(
    [string]$TestMode = "Quick",
    [string]$Environment = "local"
)

Write-Host "DEBUG: Starting from $PWD" -ForegroundColor Yellow
Write-Host "DEBUG: TestMode = $TestMode" -ForegroundColor Yellow
Write-Host "DEBUG: Environment = $Environment" -ForegroundColor Yellow

# Find Run-AllTests.ps1
$runAllTests = Get-ChildItem -Path "D:\credit-gyems-academy\QA" -Recurse -Filter "Run-AllTests.ps1" | Select-Object -First 1
Write-Host "DEBUG: Found Run-AllTests.ps1 at: $($runAllTests.FullName)" -ForegroundColor Yellow

# Check which Test-Utilities.ps1 files exist
Write-Host "`nDEBUG: Looking for Test-Utilities.ps1 files..." -ForegroundColor Yellow
Get-ChildItem -Path "D:\credit-gyems-academy\QA" -Recurse -Filter "Test-Utilities.ps1" | ForEach-Object {
    Write-Host "  Found: $($_.FullName) (Size: $($_.Length) bytes)" -ForegroundColor Cyan
}

# Run with explicit error handling
try {
    & $runAllTests.FullName -TestMode $TestMode -Environment $Environment -Debug
} catch {
    Write-Host "`nDEBUG: Caught error in wrapper" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Error Type: $($_.Exception.GetType().FullName)" -ForegroundColor Red
    Write-Host "Stack Trace:" -ForegroundColor Yellow
    Write-Host $_.ScriptStackTrace -ForegroundColor Yellow
}
