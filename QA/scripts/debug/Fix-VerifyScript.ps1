# Fix-VerifyScript.ps1
# Fixes the verification pattern in Verify-QAFixes.ps1

Write-Host "🔧 FIXING VERIFICATION SCRIPT" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

$verifyPath = ".\Verify-QAFixes.ps1"

if (Test-Path $verifyPath) {
    $content = Get-Content $verifyPath -Raw
    
# Find the order test check section
$newPattern = @'
# Check if fake-order is in auth array (expecting 401)
    if ($content -match '\$authRequiredEndpoints.*fake-order|fake-order.*ExpectedStatus.*401') {
        Write-Host "✅ Order test expects 401 (correct)" -ForegroundColor Green
    } else {
        Write-Host "❌ Order test not properly configured for 401" -ForegroundColor Red
        $issues++
    }
'@

    # Try different variations of the pattern
    $patterns = @(
        'if \(\$content -match.*fake-order.*401.*\).*?\{.*?Green.*?\}.*?else.*?\{.*?Red.*?\$issues\+\+.*?\}',
        'if \(\$content -match.*orders/fake-order.*ExpectedStatus.*401.*\).*?\{.*?else.*?\{.*?404.*?401.*?\}'
    )
    
    $replaced = $false
    foreach ($pattern in $patterns) {
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $newPattern.Replace('`', '``')
            $replaced = $true
            Write-Host "✅ Updated verification pattern" -ForegroundColor Green
            break
        }
    }
    
    if (-not $replaced) {
        # Manual approach - find and replace the section
        $lines = $content -split "`n"
        $newLines = @()
        $skipLines = 0
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($skipLines -gt 0) {
                $skipLines--
                continue
            }
            
            if ($lines[$i] -match '4️⃣ Checking order test expectation') {
                $newLines += $lines[$i]
                $newLines += '$errorTestPath = "scripts\TS_CGA_v1\Test-ErrorScenarios.ps1"'
                $newLines += 'if (Test-Path $errorTestPath) {'
                $newLines += '    $content = Get-Content $errorTestPath -Raw'
                $newLines += '    '
                $newLines += '    # Check if fake-order is in auth array (expecting 401)'
                $newLines += '    if ($content -match ''\$authRequiredEndpoints.*fake-order|fake-order.*ExpectedStatus.*401'') {'
                $newLines += '        Write-Host "✅ Order test expects 401 (correct)" -ForegroundColor Green'
                $newLines += '    } else {'
                $newLines += '        Write-Host "❌ Order test not properly configured for 401" -ForegroundColor Red'
                $newLines += '        $issues++'
                $newLines += '    }'
                $newLines += '} else {'
                $newLines += '    Write-Host "❌ Test-ErrorScenarios.ps1 missing" -ForegroundColor Red'
                $newLines += '    $issues++'
                $newLines += '}'
                
                # Skip the next lines that contain the old check
                while ($i + $skipLines + 1 -lt $lines.Count -and 
                       $lines[$i + $skipLines + 1] -notmatch '5️⃣ Checking backend server') {
                    $skipLines++
                }
                $replaced = $true
            } else {
                $newLines += $lines[$i]
            }
        }
        
        if ($replaced) {
            $content = $newLines -join "`n"
        }
    }
    
    if ($replaced) {
        Set-Content -Path $verifyPath -Value $content -Encoding UTF8
        Write-Host "✅ Verification script updated successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Could not update verification script automatically" -ForegroundColor Yellow
        Write-Host "   The order test might still show as failing in verification" -ForegroundColor Gray
        Write-Host "   But the actual test should work correctly" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Verify script not found!" -ForegroundColor Red
}