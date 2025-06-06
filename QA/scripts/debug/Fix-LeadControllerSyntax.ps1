# Fix-LeadControllerSyntax.ps1
# Script to fix the syntax error in leadController.js

Write-Host "🔧 Fixing LeadController Syntax Error..." -ForegroundColor Yellow
Write-Host ""

$leadControllerPath = "backend\controllers\leadController.js"

if (Test-Path $leadControllerPath) {
    Write-Host "📝 Reading leadController.js..." -ForegroundColor Cyan
    $content = Get-Content $leadControllerPath -Raw
    
    # Find the specific line with the syntax error
    # Looking for: source: 'website' // Changed from 'newsletter' which is not a valid enum,
    # Missing comma before interests
    
    $pattern = "source: 'website' // Changed from 'newsletter' which is not a valid enum,\s*interests:"
    
    if ($content -match $pattern) {
        Write-Host "   ✅ Found the syntax error" -ForegroundColor Green
        
        # Fix by adding the missing comma
        $content = $content -replace "source: 'website' // Changed from 'newsletter' which is not a valid enum,", "source: 'website', // Changed from 'newsletter' which is not a valid enum"
        
        # Create backup
        $backupPath = "$leadControllerPath.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
        Copy-Item $leadControllerPath $backupPath
        Write-Host "   📁 Created backup: $backupPath" -ForegroundColor Blue
        
        # Save fixed content
        Set-Content -Path $leadControllerPath -Value $content -Encoding UTF8
        Write-Host "   ✅ Fixed syntax error - added missing comma" -ForegroundColor Green
    } else {
        # Try alternative fix - look for the general pattern
        Write-Host "   🔍 Looking for alternative pattern..." -ForegroundColor Yellow
        
        # Look for missing comma between source and interests
        if ($content -match "source:\s*'[^']+'\s*interests:") {
            Write-Host "   ✅ Found missing comma between source and interests" -ForegroundColor Green
            
            # Fix by adding comma after source value
            $content = $content -replace "(source:\s*'[^']+')\s*(interests:)", '$1,`n    $2'
            
            # Create backup
            $backupPath = "$leadControllerPath.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
            Copy-Item $leadControllerPath $backupPath
            Write-Host "   📁 Created backup: $backupPath" -ForegroundColor Blue
            
            # Save fixed content
            Set-Content -Path $leadControllerPath -Value $content -Encoding UTF8
            Write-Host "   ✅ Fixed syntax error - added missing comma" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Could not find the exact syntax error pattern" -ForegroundColor Yellow
            Write-Host "   ℹ️  Manual inspection required" -ForegroundColor Blue
        }
    }
    
    # Verify the fix
    Write-Host "`n🧪 Verifying the fix..." -ForegroundColor Cyan
    Push-Location backend
    try {
        # Try to load the controller
        $testScript = @"
try {
    const leadController = require('./controllers/leadController');
    console.log('✅ leadController loads successfully');
    process.exit(0);
} catch (error) {
    console.error('❌ leadController still has errors:', error.message);
    process.exit(1);
}
"@
        
        $testScript | node 2>&1 | ForEach-Object { Write-Host "   $_" }
    } catch {
        Write-Host "   ❌ Verification failed" -ForegroundColor Red
    }
    Pop-Location
    
} else {
    Write-Host "   ❌ leadController.js not found at: $leadControllerPath" -ForegroundColor Red
}

Write-Host "`n📌 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Run the route debug script again: node backend/debug-route-loading.js"
Write-Host "   2. If routes load successfully, restart the backend server"
Write-Host "   3. Run the QA tests: cd scripts\TS_CGA_v1 && .\Run-CreditGyemsQA.ps1"