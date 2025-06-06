# Debug-CommunityTest.ps1
# Debug why community tests aren't running

Write-Host "🔍 DEBUGGING COMMUNITY TEST" -ForegroundColor Cyan

# Check if the file exists
$testPath = "scripts\TS_CGA_v1\Test-CommunityFlow.ps1"
if (Test-Path $testPath) {
    Write-Host "✅ Community test file exists" -ForegroundColor Green
    
    # Check file content
    $content = Get-Content $testPath -Raw
    $lineCount = ($content -split "`n").Count
    Write-Host "  Lines: $lineCount" -ForegroundColor Gray
    
    # Check for common issues
    if ($content -match 'disabled|placeholder') {
        Write-Host "⚠️  Test might be disabled" -ForegroundColor Yellow
    }
    
    if ($content -match '\$PSScriptRoot') {
        Write-Host "✅ Uses PSScriptRoot" -ForegroundColor Green
    }
    
    if ($content -match 'Test-APIEndpoint') {
        Write-Host "✅ Contains API tests" -ForegroundColor Green
    }
    
    # Try to run it directly
    Write-Host "`nTrying to run community test directly..." -ForegroundColor Yellow
    
    # Set up required globals
    $Global:TestResults = @{
        Passed = 0
        Failed = 0
        Warnings = 0
        Details = @()
    }
    
    $Global:PrimaryTestUser = @{
        email = "test@example.com"
        token = "dummy-token"
    }
    
    try {
        & $testPath -ProjectRoot (Get-Location)
    } catch {
        Write-Host "❌ Error running test: $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Community test file not found!" -ForegroundColor Red
}
