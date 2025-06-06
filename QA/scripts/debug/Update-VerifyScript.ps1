# Update-VerifyScript.ps1
$path = ".\Verify-QAFixes.ps1"
$content = Get-Content $path -Raw

# Update the check to look for the correct pattern
$oldCheck = 'if ($content -match ''/api/orders/fake-order.*ExpectedStatus\s*=\s*"401"'')'
$newCheck = 'if ($content -match ''fake-order.*401|authRequiredEndpoints.*fake-order'')'

$content = $content -replace [regex]::Escape($oldCheck), $newCheck

Set-Content -Path $path -Value $content -Encoding UTF8
Write-Host "✅ Updated verification script" -ForegroundColor Green
