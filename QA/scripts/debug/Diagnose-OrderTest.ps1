# Diagnose-OrderTest.ps1
# Diagnoses why the order test fix isn't working

Write-Host "🔍 DIAGNOSING ORDER TEST ISSUE" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

$errorTestPath = "scripts\TS_CGA_v1\Test-ErrorScenarios.ps1"

if (Test-Path $errorTestPath) {
    Write-Host "`nFile exists at: $errorTestPath" -ForegroundColor Green
    
    # Get file content
    $content = Get-Content $errorTestPath -Raw
    $lines = $content -split "`n"
    
    Write-Host "`nSearching for order test patterns..." -ForegroundColor Yellow
    
    # Find all mentions of orders/fake-order
    $found = $false
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "orders/fake-order" -or $lines[$i] -match "/api/orders" -or $lines[$i] -match "fake-order") {
            $found = $true
            Write-Host "`nFound at line $($i+1):" -ForegroundColor Yellow
            
            # Show context (5 lines before and after)
            $start = [Math]::Max(0, $i-5)
            $end = [Math]::Min($lines.Count-1, $i+5)
            
            for ($j = $start; $j -le $end; $j++) {
                if ($j -eq $i) {
                    Write-Host ">>> $($j+1): $($lines[$j])" -ForegroundColor Cyan
                } else {
                    Write-Host "    $($j+1): $($lines[$j])" -ForegroundColor Gray
                }
            }
        }
    }
    
    if (-not $found) {
        Write-Host "`nNo 'orders/fake-order' pattern found!" -ForegroundColor Red
        Write-Host "Searching for any 404 test..." -ForegroundColor Yellow
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match '"404"' -or $lines[$i] -match 'ExpectedStatus.*404') {
                Write-Host "`nFound 404 test at line $($i+1):" -ForegroundColor Yellow
                Write-Host "    $($lines[$i])" -ForegroundColor Gray
            }
        }
    }
    
    # Create a backup
    $backupPath = "$errorTestPath.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
    Copy-Item $errorTestPath $backupPath
    Write-Host "`nCreated backup: $backupPath" -ForegroundColor Green
    
} else {
    Write-Host "❌ File not found at: $errorTestPath" -ForegroundColor Red
}

Write-Host "`n📝 DIRECT FIX SCRIPT" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

# Create a direct fix script
$directFix = @'
# Direct-Fix-OrderTest.ps1
$file = "scripts\TS_CGA_v1\Test-ErrorScenarios.ps1"
$content = Get-Content $file -Raw

# Replace any test expecting 404 for orders endpoint
$content = $content -replace '(Test-APIEndpoint[^}]+/api/orders/[^}]+ExpectedStatus\s*=\s*)"404"', '$1"401"'
$content = $content -replace '404 handling correct for: /api/orders', 'Auth required for: /api/orders'

Set-Content -Path $file -Value $content -Encoding UTF8
Write-Host "✅ Applied direct fix to $file" -ForegroundColor Green
'@

Set-Content -Path "Direct-Fix-OrderTest.ps1" -Value $directFix -Encoding UTF8
Write-Host "Created: Direct-Fix-OrderTest.ps1" -ForegroundColor Green
Write-Host "Run this script to apply the fix directly" -ForegroundColor Yellow