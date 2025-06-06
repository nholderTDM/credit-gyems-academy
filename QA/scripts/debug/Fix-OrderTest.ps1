# Final-Fix-OrderTest.ps1
# Properly adds the order endpoint to the auth test

Write-Host "🔧 FINAL FIX FOR ORDER TEST" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

$errorTestPath = "scripts\TS_CGA_v1\Test-ErrorScenarios.ps1"

if (Test-Path $errorTestPath) {
    $content = Get-Content $errorTestPath -Raw
    
    Write-Host "Fixing auth test array..." -ForegroundColor Yellow
    
    # The diagnostic showed there are TWO auth test sections with empty arrays
    # We need to populate at least one of them
    
    # Replace the first empty auth array with one containing our endpoint
    $content = $content -replace '\$authRequiredEndpoints = @\(\)', '$authRequiredEndpoints = @("/api/orders/fake-order")'
    
    # If there's a second occurrence with the fake-order already, leave it
    # Otherwise, add it to the second occurrence too
    if ($content -match '\$authRequiredEndpoints = @\(\s*"/api/orders/fake-order"\s*\)') {
        Write-Host "✅ First array updated with fake-order endpoint" -ForegroundColor Green
    }
    
    # Find and update any remaining empty arrays
    $pattern = '\$authRequiredEndpoints = @\(\s*\)'
    if ($content -match $pattern) {
        $content = $content -replace $pattern, '$authRequiredEndpoints = @("/api/orders/fake-order")'
        Write-Host "✅ Updated additional empty auth arrays" -ForegroundColor Green
    }
    
    # Save the file
    Set-Content -Path $errorTestPath -Value $content -Encoding UTF8
    
    Write-Host "`n✅ Order test fix completed!" -ForegroundColor Green
    
    # Verify the fix
    Write-Host "`nVerifying fix..." -ForegroundColor Yellow
    $verifyContent = Get-Content $errorTestPath -Raw
    
    # Check that fake-order is in auth array
    if ($verifyContent -match '\$authRequiredEndpoints = @\(\s*"/api/orders/fake-order"\s*\)') {
        Write-Host "✅ Confirmed: fake-order is in auth test array" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Could not confirm fix" -ForegroundColor Yellow
    }
    
    # Check it's not in 404 array
    if ($verifyContent -match '\$notFoundTests.*fake-order') {
        Write-Host "❌ Error: fake-order still in 404 array!" -ForegroundColor Red
    } else {
        Write-Host "✅ Confirmed: fake-order NOT in 404 array" -ForegroundColor Green
    }
    
} else {
    Write-Host "❌ Test file not found!" -ForegroundColor Red
}

Write-Host "`n📊 Next: Run .\Verify-QAFixes.ps1 to confirm all fixes" -ForegroundColor Cyan