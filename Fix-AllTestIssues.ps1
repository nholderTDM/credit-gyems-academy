# Fix-AllTestIssues.ps1
# Comprehensive fix for all test suite issues

Write-Host @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                    FIXING ALL TEST SUITE ISSUES                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$projectRoot = "D:\credit-gyems-academy"
$scriptsPath = Join-Path $projectRoot "QA\scripts\api-tests"

# Fix 1: Create a generic fix for duplicate Message key issues
Write-Host "`nFix 1: Fixing duplicate Message key issues in all test scripts..." -ForegroundColor Yellow

function Repair-DuplicateMessageKey {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "  ✗ File not found: $FilePath" -ForegroundColor Red
        return
    }
    
    $fileName = Split-Path -Leaf $FilePath
    Write-Host "  Processing: $fileName" -ForegroundColor Gray
    
    # Create backup
    $backupPath = "$FilePath.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
    Copy-Item $FilePath $backupPath -Force
    
    $content = Get-Content $FilePath -Raw
    $originalContent = $content
    
    # Fix patterns that cause duplicate Message keys
    # Pattern 1: Fix hashtables with duplicate Message keys
    $content = $content -replace '(@\{[^}]*)(Message\s*=\s*[^;]+;\s*)(Message\s*=\s*[^;]+;)', '$1$2'
    
    # Pattern 2: Fix .Add("Message", ...) to use assignment instead
    $content = $content -replace '(\$\w+)\.Add\([''"]Message[''"]\s*,\s*([^)]+)\)', '$1["Message"] = $2'
    
    # Pattern 3: Fix common pattern in error responses
    $content = $content -replace '(\$response\s*=\s*@\{[^}]*)(\s*Message\s*=\s*)([^}]+)(\s*Message\s*=\s*)([^}]+)(\})', '$1$2$3$6'
    
    # Pattern 4: Fix Test-APIEndpoint result handling
    # Look for patterns where Message might be added twice
    $content = $content -replace '(\$\w+)\s*=\s*@\{\s*Success\s*=\s*\$false\s*;\s*Message\s*=\s*([^}]+)\s*;\s*Message\s*=', '$1 = @{ Success = $false; Message = $2; Error ='
    
    if ($content -ne $originalContent) {
        $content | Set-Content $FilePath -Encoding UTF8
        Write-Host "    ✓ Fixed duplicate key issues" -ForegroundColor Green
    } else {
        Write-Host "    ℹ No duplicate key issues found" -ForegroundColor Blue
    }
}

# Apply fix to all test scripts
$testScripts = @(
    "Test-Environment.ps1",
    "Test-Authentication.ps1",
    "Test-Ecommerce.ps1",
    "Test-Booking.ps1",
    "Test-Community.ps1",
    "Test-LeadCapture.ps1"
)

foreach ($script in $testScripts) {
    $fullPath = Join-Path $scriptsPath $script
    Repair-DuplicateMessageKey -FilePath $fullPath
}

# Fix 2: Fix Test-Environment.ps1 path issues
Write-Host "`nFix 2: Fixing path issues in Test-Environment.ps1..." -ForegroundColor Yellow

$envTestPath = Join-Path $scriptsPath "Test-Environment.ps1"
if (Test-Path $envTestPath) {
    $content = Get-Content $envTestPath -Raw
    
    # Fix the path construction - ensure it uses the correct project root
    # Replace patterns that might be causing the "\frontend" issue
    $content = $content -replace 'Join-Path\s+\$PSScriptRoot\s+"\\\\frontend"', 'Join-Path $Global:ProjectRoot "frontend"'
    $content = $content -replace 'Join-Path\s+\$PSScriptRoot\s+"\\\\backend"', 'Join-Path $Global:ProjectRoot "backend"'
    $content = $content -replace 'Join-Path\s+\$PSScriptRoot\s+''\\frontend''', 'Join-Path $Global:ProjectRoot "frontend"'
    $content = $content -replace 'Join-Path\s+\$PSScriptRoot\s+''\\backend''', 'Join-Path $Global:ProjectRoot "backend"'
    
    # If the script doesn't have $Global:ProjectRoot, add it
    if ($content -notmatch '\$Global:ProjectRoot') {
        $insertPoint = $content.IndexOf("`n")
        if ($insertPoint -gt 0) {
            $firstLine = $content.Substring(0, $insertPoint)
            $restOfContent = $content.Substring($insertPoint)
            $content = $firstLine + "`n`n# Set project root`n`$Global:ProjectRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent `$PSScriptRoot))" + $restOfContent
        }
    }
    
    $content | Set-Content $envTestPath -Encoding UTF8
    Write-Host "  ✓ Fixed path construction issues" -ForegroundColor Green
}

# Fix 3: Fix empty path in Run-APITests.ps1
Write-Host "`nFix 3: Fixing empty path issue in Run-APITests.ps1..." -ForegroundColor Yellow

$runApiTestsPath = Join-Path $scriptsPath "Run-APITests.ps1"
if (Test-Path $runApiTestsPath) {
    $content = Get-Content $runApiTestsPath -Raw
    
    # Ensure $Global:TestPaths is properly initialized
    if ($content -notmatch '\$Global:TestPaths\.Reports\.Today') {
        # Add initialization if missing
        $initCode = @'

# Ensure report directory exists
if (-not $Global:TestPaths) {
    $Global:TestPaths = @{
        Reports = @{
            Root = Join-Path $Global:QARoot "test-reports"
            Today = Join-Path (Join-Path $Global:QARoot "test-reports") (Get-Date -Format 'yyyy-MM-dd')
        }
    }
}

if (-not (Test-Path $Global:TestPaths.Reports.Today)) {
    New-Item -ItemType Directory -Path $Global:TestPaths.Reports.Today -Force | Out-Null
}
'@
        
        # Insert before Generate-TestReport call
        $content = $content -replace '(# Generate report\s*\n)', "`$1$initCode`n"
    }
    
    # Fix the Generate-TestReport call to handle empty path
    $content = $content -replace '& "\$PSScriptRoot\\Generate-TestReport\.ps1".*-OutputPath\s+\$reportDir', @'
if (-not $reportDir) {
    $reportDir = Join-Path (Join-Path $Global:QARoot "test-reports") (Get-Date -Format 'yyyy-MM-dd')
    if (-not (Test-Path $reportDir)) {
        New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
    }
}

& "$PSScriptRoot\Generate-TestReport.ps1" `
    -OutputPath $reportDir
'@
    
    $content | Set-Content $runApiTestsPath -Encoding UTF8
    Write-Host "  ✓ Fixed empty path parameter issue" -ForegroundColor Green
}

# Fix 4: Create a script to set admin role in database
Write-Host "`nFix 4: Creating admin role update script..." -ForegroundColor Yellow

$adminFixScript = @'
// fix-admin-role.js
// Run this from the backend directory to set admin role

const mongoose = require('mongoose');
require('dotenv').config();

async function fixAdminRole() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/credit-gyems-academy');
        
        const User = mongoose.model('User', {
            email: String,
            role: { type: String, default: 'user' }
        });
        
        // Update any users with admin in email to have admin role
        const result = await User.updateMany(
            { email: { $regex: /admin.*@creditgyemstest\.com$/i } },
            { $set: { role: 'admin' } }
        );
        
        console.log(`Updated ${result.modifiedCount} users to admin role`);
        
        // List all admin users
        const admins = await User.find({ role: 'admin' }).select('email role');
        console.log('Current admin users:', admins);
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixAdminRole();
'@

$adminFixPath = Join-Path $projectRoot "backend\fix-admin-role.js"
$adminFixScript | Out-File $adminFixPath -Encoding UTF8
Write-Host "  ✓ Created admin fix script at: $adminFixPath" -ForegroundColor Green
Write-Host "  ℹ Run this from backend directory: node fix-admin-role.js" -ForegroundColor Cyan

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    ALL FIXES APPLIED                           " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Set admin role in database:" -ForegroundColor White
Write-Host "   cd $projectRoot\backend" -ForegroundColor Gray
Write-Host "   node fix-admin-role.js" -ForegroundColor Gray
Write-Host "`n2. Run the test suite again:" -ForegroundColor White
Write-Host "   cd $projectRoot\QA\scripts\master" -ForegroundColor Gray
Write-Host "   .\Run-AllTests.ps1 -TestMode Quick -Debug" -ForegroundColor Gray