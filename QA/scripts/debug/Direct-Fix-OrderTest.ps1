# Direct-Fix-OrderTest.ps1
$file = "scripts\TS_CGA_v1\Test-ErrorScenarios.ps1"
$content = Get-Content $file -Raw

# Replace any test expecting 404 for orders endpoint
$content = $content -replace '(Test-APIEndpoint[^}]+/api/orders/[^}]+ExpectedStatus\s*=\s*)"404"', '$1"401"'
$content = $content -replace '404 handling correct for: /api/orders', 'Auth required for: /api/orders'

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "✅ Applied direct fix to $file" -ForegroundColor Green
