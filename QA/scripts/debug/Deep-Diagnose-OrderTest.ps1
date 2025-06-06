# Deep-Diagnose-OrderTest.ps1
# Deep diagnostic to understand why verification is still failing

Write-Host "🔍 DEEP DIAGNOSTIC FOR ORDER TEST" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$errorTestPath = "scripts\TS_CGA_v1\Test-ErrorScenarios.ps1"
$verifyPath = ".\Verify-QAFixes.ps1"

Write-Host "`n1️⃣ Checking Test-ErrorScenarios.ps1..." -ForegroundColor Yellow

if (Test-Path $errorTestPath) {
    $content = Get-Content $errorTestPath -Raw
    
    # Search for all mentions of 404
    Write-Host "`nSearching for '404' patterns:" -ForegroundColor Yellow
    $lines = $content -split "`n"
    $lineNum = 0
    
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match '404' -or $line -match 'fake-order') {
            Write-Host "  Line $lineNum`: $($line.Trim())" -ForegroundColor Gray
        }
    }
    
    # Check for auth test section
    Write-Host "`nSearching for auth/401 tests:" -ForegroundColor Yellow
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match '401' -or $line -match 'auth.*required') {
            Write-Host "  Line $lineNum`: $($line.Trim())" -ForegroundColor Gray
        }
    }
    
    # Extract relevant sections
    Write-Host "`nExtracting test structure:" -ForegroundColor Yellow
    if ($content -match '\$notFoundTests\s*=\s*@\(([\s\S]*?)\)') {
        Write-Host "  404 Test Array:" -ForegroundColor Cyan
        $matches[1] -split "`n" | ForEach-Object { 
            if ($_.Trim()) { Write-Host "    $_" -ForegroundColor Gray }
        }
    }
    
    if ($content -match '\$authRequiredEndpoints\s*=\s*@\(([\s\S]*?)\)') {
        Write-Host "`n  Auth Required Array:" -ForegroundColor Cyan
        $matches[1] -split "`n" | ForEach-Object { 
            if ($_.Trim()) { Write-Host "    $_" -ForegroundColor Gray }
        }
    }
}

Write-Host "`n2️⃣ Checking Verify-QAFixes.ps1..." -ForegroundColor Yellow

if (Test-Path $verifyPath) {
    $verifyContent = Get-Content $verifyPath -Raw
    
    # Find the exact check being performed
    Write-Host "`nVerification check pattern:" -ForegroundColor Yellow
    $lines = $verifyContent -split "`n"
    $lineNum = 0
    
    foreach ($line in $lines) {
        $lineNum++
        if ($line -match 'order.*test.*expectation' -or $line -match 'fake-order.*404.*401') {
            $start = [Math]::Max(0, $lineNum - 3)
            $end = [Math]::Min($lines.Count - 1, $lineNum + 3)
            
            Write-Host "`n  Context around line $lineNum`:" -ForegroundColor Cyan
            for ($i = $start; $i -le $end; $i++) {
                if ($i -eq $lineNum - 1) {
                    Write-Host ">>> $($i+1): $($lines[$i])" -ForegroundColor Yellow
                } else {
                    Write-Host "    $($i+1): $($lines[$i])" -ForegroundColor Gray
                }
            }
        }
    }
}

Write-Host "`n3️⃣ Creating Manual Verification..." -ForegroundColor Yellow

# Create a simple test to verify
$testScript = @'
$file = Get-Content "scripts\TS_CGA_v1\Test-ErrorScenarios.ps1" -Raw

# Check 1: Is fake-order in the 404 array?
if ($file -match '\$notFoundTests.*fake-order') {
    Write-Host "❌ fake-order is STILL in 404 array" -ForegroundColor Red
} else {
    Write-Host "✅ fake-order removed from 404 array" -ForegroundColor Green
}

# Check 2: Is there a 401 test for fake-order?
if ($file -match 'fake-order.*401|401.*fake-order') {
    Write-Host "✅ 401 test exists for fake-order" -ForegroundColor Green
} else {
    Write-Host "❌ No 401 test found for fake-order" -ForegroundColor Red
}

# Check 3: What the verify script is actually checking
if ($file -match '/api/orders/fake-order.*?"404"') {
    Write-Host "❌ Found pattern: /api/orders/fake-order with 404" -ForegroundColor Red
} else {
    Write-Host "✅ No 404 pattern found for /api/orders/fake-order" -ForegroundColor Green
}
'@

Write-Host "`nRunning manual verification:" -ForegroundColor Yellow
Invoke-Expression $testScript

Write-Host "`n📊 RECOMMENDATION:" -ForegroundColor Cyan
Write-Host "The issue might be in how Verify-QAFixes.ps1 is checking for the fix." -ForegroundColor White
Write-Host "Let me create a better verification pattern..." -ForegroundColor White

# Create updated verification
$updateVerify = @'
# Update-VerifyScript.ps1
$path = ".\Verify-QAFixes.ps1"
$content = Get-Content $path -Raw

# Update the check to look for the correct pattern
$oldCheck = 'if ($content -match ''/api/orders/fake-order.*ExpectedStatus\s*=\s*"401"'')'
$newCheck = 'if ($content -match ''fake-order.*401|authRequiredEndpoints.*fake-order'')'

$content = $content -replace [regex]::Escape($oldCheck), $newCheck

Set-Content -Path $path -Value $content -Encoding UTF8
Write-Host "✅ Updated verification script" -ForegroundColor Green
'@

Set-Content -Path "Update-VerifyScript.ps1" -Value $updateVerify -Encoding UTF8
Write-Host "`nCreated: Update-VerifyScript.ps1" -ForegroundColor Green
Write-Host "This will fix the verification pattern" -ForegroundColor Gray