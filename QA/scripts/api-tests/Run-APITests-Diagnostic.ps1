# Diagnostic Run-APITests.ps1
param(
    [string]$Environment = "local",
    [bool]$QuickRun = $false
)

Write-Host "=== DIAGNOSTIC RUN-APITESTS ===" -ForegroundColor Cyan
Write-Host "Current Directory: $PWD"
Write-Host "PSScriptRoot: $PSScriptRoot"
Write-Host "Environment: $Environment"
Write-Host "QuickRun: $QuickRun"

# Check which Test-Utilities.ps1 exists
$utilPaths = @(
    "$PSScriptRoot\Test-Utilities.ps1",
    "$PSScriptRoot\..\Test-Utilities.ps1",
    "$PSScriptRoot\..\..\scripts\TS_CGA_v1\Test-Utilities.ps1"
)

foreach ($path in $utilPaths) {
    if (Test-Path $path) {
        Write-Host "Found utilities at: $path" -ForegroundColor Green
        $fullPath = (Resolve-Path $path).Path
        Write-Host "  Full path: $fullPath"
        Write-Host "  Size: $((Get-Item $fullPath).Length) bytes"
    } else {
        Write-Host "NOT found: $path" -ForegroundColor Red
    }
}

Write-Host "`nAttempting to load Test-Utilities.ps1..." -ForegroundColor Yellow
try {
    . "$PSScriptRoot\Test-Utilities.ps1"
    Write-Host "SUCCESS: Test-Utilities.ps1 loaded!" -ForegroundColor Green
} catch {
    Write-Host "FAILED to load Test-Utilities.ps1" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Stack trace:" -ForegroundColor Yellow
    Write-Host $_.ScriptStackTrace
}

Write-Host "`nTesting a simple function..." -ForegroundColor Yellow
try {
    Write-TestSuccess "Basic test successful"
} catch {
    Write-Host "Failed to run test function: $_" -ForegroundColor Red
}
