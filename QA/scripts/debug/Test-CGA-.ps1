# Test-CGA.ps1
# Convenience launcher for Credit Gyems Academy test suite
# Place this in the project root: D:\credit-gyems-academy\

param(
    [switch]$SkipServerStart,
    [switch]$SkipDataSetup,
    [switch]$CleanupAll,
    [switch]$VerboseLogging,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Credit Gyems Academy Test Suite Launcher

Usage: .\Test-CGA.ps1 [options]

Options:
    -SkipServerStart    Skip automatic server startup
    -SkipDataSetup      Skip test data creation
    -CleanupAll         Remove all test data after completion
    -VerboseLogging     Enable detailed logging
    -Help               Show this help message

Examples:
    .\Test-CGA.ps1
    .\Test-CGA.ps1 -SkipServerStart -VerboseLogging
    .\Test-CGA.ps1 -CleanupAll

Test Suite Location: scripts\TS_CGA_v1\
Reports Location: test-reports\

"@ -ForegroundColor Cyan
    exit
}

$scriptPath = Join-Path $PSScriptRoot "scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1"

if (-not (Test-Path $scriptPath)) {
    Write-Host "Error: Test suite not found at expected location:" -ForegroundColor Red
    Write-Host "  $scriptPath" -ForegroundColor Yellow
    Write-Host "`nPlease ensure the test suite is installed in: scripts\TS_CGA_v1\" -ForegroundColor Yellow
    exit 1
}

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║        Credit Gyems Academy Test Suite Launcher               ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host "`nProject Root: $PSScriptRoot" -ForegroundColor Cyan
Write-Host "Script Location: $scriptPath" -ForegroundColor Cyan

# Pass through all parameters
& $scriptPath `
    -SkipServerStart:$SkipServerStart `
    -SkipDataSetup:$SkipDataSetup `
    -CleanupAll:$CleanupAll `
    -VerboseLogging:$VerboseLogging