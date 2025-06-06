# Test exactly how Run-AllTests.ps1 calls this
Write-Host "Simulating Run-AllTests.ps1 call pattern..." -ForegroundColor Yellow
Write-Host "Current Location: $PWD"

# This is how Run-AllTests.ps1 calls it based on your earlier output
$scriptPath = "D:\credit-gyems-academy\QA\scripts\api-tests\Run-APITests.ps1"
Write-Host "Calling: & '$scriptPath' -Environment 'local' -QuickRun True"

try {
    & $scriptPath -Environment 'local' -QuickRun $true
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    Write-Host "Stack trace:" -ForegroundColor Yellow
    Write-Host $_.ScriptStackTrace
}
