# Verify-CommunityFixes.ps1
Write-Host "🔍 VERIFYING COMMUNITY FIXES" -ForegroundColor Cyan

# Check syntax error fix
Write-Host "`n1. Checking Test-ErrorScenarios.ps1..." -ForegroundColor Yellow
$errorTest = Get-Content "scripts\TS_CGA_v1\Test-ErrorScenarios.ps1" -Raw
if ($errorTest -notmatch '"/api/users/invalid-id",\)') {
    Write-Host "✅ Syntax error fixed" -ForegroundColor Green
} else {
    Write-Host "❌ Syntax error still present" -ForegroundColor Red
}

# Test parse
try {
    [scriptblock]::Create($errorTest) | Out-Null
    Write-Host "✅ Script parses correctly" -ForegroundColor Green
} catch {
    Write-Host "❌ Script has syntax errors: $_" -ForegroundColor Red
}

# Check community test
Write-Host "`n2. Checking Community tests..." -ForegroundColor Yellow
$communityTest = Get-Content "scripts\TS_CGA_v1\Test-CommunityFlow.ps1" -Raw
if ($communityTest -match '/posts' -and $communityTest -match 'Headers \$authHeaders') {
    Write-Host "✅ Community tests updated with auth headers" -ForegroundColor Green
    Write-Host "✅ Using correct /posts endpoint" -ForegroundColor Green
} else {
    Write-Host "❌ Community tests may still have issues" -ForegroundColor Red
}

Write-Host "`n✅ Verification complete!" -ForegroundColor Green
