# Quick-FixLeadController.ps1
# Quick fix for lead controller without touching the server

Write-Host "🔧 Quick Lead Controller Fix" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

# Fix Lead Controller
$leadControllerPath = "backend\controllers\leadController.js"

if (Test-Path $leadControllerPath) {
    Write-Host "📝 Reading lead controller..." -ForegroundColor Yellow
    $content = Get-Content $leadControllerPath -Raw
    
    # Create backup
    $backupPath = "$leadControllerPath.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
    Copy-Item $leadControllerPath $backupPath
    Write-Host "   📁 Backup created: $backupPath" -ForegroundColor Blue
    
    $fixesApplied = 0
    
    # Fix 1: Missing comma in subscribeNewsletter
    if ($content -match "source:\s*'website'\s*(/[^/]*/)?[^,]\s*interests:") {
        Write-Host "   🔍 Found missing comma issue..." -ForegroundColor Yellow
        $content = $content -replace "(source:\s*'website')(\s*//[^`n]*)?\s*(interests:)", "`$1,`$2`n      `$3"
        Write-Host "   ✅ Fixed missing comma in subscribeNewsletter" -ForegroundColor Green
        $fixesApplied++
    }
    
    # Fix 2: Ensure guideId is converted to string in downloadedGuides
    # Look for the pattern where we push to downloadedGuides
    if ($content -match "lead\.downloadedGuides\.push\(\s*{\s*guideId:\s*guideId,") {
        $content = $content -replace "(lead\.downloadedGuides\.push\(\s*{\s*guideId:\s*)guideId(,)", "`$1guideId.toString()`$2"
        Write-Host "   ✅ Fixed guideId conversion in existing lead" -ForegroundColor Green
        $fixesApplied++
    }
    
    # Fix 3: Ensure guideEntry uses string
    if ($content -match "const guideEntry = {\s*guideId:\s*guideId,") {
        $content = $content -replace "(const guideEntry = {\s*guideId:\s*)guideId(,)", "`$1guideId.toString()`$2"
        Write-Host "   ✅ Fixed guideEntry to use string" -ForegroundColor Green
        $fixesApplied++
    }
    
    # Fix 4: Ensure new lead creation also uses string
    if ($content -match "downloadedGuides:\s*\[\s*{\s*guideId:\s*guideId,") {
        $content = $content -replace "(downloadedGuides:\s*\[\s*{\s*guideId:\s*)guideId(,)", "`$1guideId.toString()`$2"
        Write-Host "   ✅ Fixed new lead downloadedGuides" -ForegroundColor Green
        $fixesApplied++
    }
    
    if ($fixesApplied -gt 0) {
        # Save the fixed content
        Set-Content -Path $leadControllerPath -Value $content -Encoding UTF8
        Write-Host "`n✅ Lead controller updated with $fixesApplied fixes" -ForegroundColor Green
        
        Write-Host "`n⚠️  IMPORTANT: The server will auto-restart due to nodemon" -ForegroundColor Yellow
        Write-Host "   Watch your backend terminal for any errors" -ForegroundColor Yellow
    } else {
        Write-Host "`n✅ No fixes needed - controller appears to be already fixed" -ForegroundColor Green
    }
    
} else {
    Write-Host "❌ Lead controller not found at: $leadControllerPath" -ForegroundColor Red
}

# Quick verification
Write-Host "`n🧪 Quick Verification..." -ForegroundColor Cyan
Start-Sleep -Seconds 3  # Give nodemon time to restart

try {
    # Test guide download
    $guideTest = @{
        email = "guide_quicktest_$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
        firstName = "Quick"
        lastName = "Test"
        guideId = "free-credit-guide"
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/leads/download-guide" -Method POST -Body $guideTest -ContentType "application/json" -ErrorAction Stop
    Write-Host "   🔍 Response: $($result | ConvertTo-Json -Depth 10)" -ForegroundColor Cyan
    Write-Host "   ✅ Guide download endpoint working!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Guide download test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Check your backend terminal for errors" -ForegroundColor Yellow
}

Write-Host "`n📌 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Check your backend terminal to ensure server restarted cleanly"
Write-Host "2. Run the QA tests: cd scripts\TS_CGA_v1 && .\Run-CreditGyemsQA.ps1"