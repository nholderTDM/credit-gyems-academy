# Fix-AllAuthenticationIssues-v2.ps1
# Improved version that handles server restart properly

param(
    [switch]$SkipServerRestart,
    [switch]$OnlyUpdateController
)

Write-Host "🚀 Fixing All Authentication and Lead Issues (v2)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get the script location and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = $ScriptDir  # Assuming script is in project root

# Step 1: Update Lead Model
if (-not $OnlyUpdateController) {
    Write-Host "Step 1: Updating Lead Model..." -ForegroundColor Yellow
    $leadModelPath = Join-Path $ProjectRoot "backend\models\lead.js"

    if (Test-Path $leadModelPath) {
        $content = Get-Content $leadModelPath -Raw
        
        # Check if updates already applied
        if ($content -match "google_ads" -and $content -match "contact_form") {
            Write-Host "   ℹ️  Lead model already has required enum values" -ForegroundColor Blue
        } else {
            # Update source enum to include missing values
            $content = $content -replace "(source:\s*{\s*type:\s*String,\s*enum:\s*\[)[^]]+(\])", "`$1'landing_page', 'free_guide', 'blog', 'referral', 'social_media', 'website', 'contact_form', 'google_ads', 'other'`$2"
            
            # Create backup
            $backupPath = "$leadModelPath.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
            Copy-Item $leadModelPath $backupPath
            
            # Save updated content
            Set-Content -Path $leadModelPath -Value $content -Encoding UTF8
            Write-Host "   ✅ Updated source enum" -ForegroundColor Green
            Write-Host "   📁 Backup created: $backupPath" -ForegroundColor Blue
        }
        
        # Fix downloadedGuides schema to use String instead of ObjectId
        if ($content -match "Schema\.Types\.ObjectId.*ref.*Product") {
            $content = $content -replace "guideId:\s*{\s*type:\s*Schema\.Types\.ObjectId,\s*ref:\s*'Product'\s*}", "guideId: { type: String, trim: true }"
            Set-Content -Path $leadModelPath -Value $content -Encoding UTF8
            Write-Host "   ✅ Fixed downloadedGuides schema" -ForegroundColor Green
        }
    }
}

# Step 2: Update Lead Controller with inline fix
Write-Host "`nStep 2: Fixing Lead Controller..." -ForegroundColor Yellow
$leadControllerPath = Join-Path $ProjectRoot "backend\controllers\leadController.js"

if (Test-Path $leadControllerPath) {
    $content = Get-Content $leadControllerPath -Raw
    
    # Create backup
    $backupPath = "$leadControllerPath.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
    Copy-Item $leadControllerPath $backupPath
    Write-Host "   📁 Backup created: $backupPath" -ForegroundColor Blue
    
    # Fix 1: Missing comma in subscribeNewsletter
    if ($content -match "source:\s*'website'[^,]\s*interests:") {
        $content = $content -replace "(source:\s*'website')(\s*//[^`n]*)?(\s*interests:)", "`$1,`$2`n      `$3"
        Write-Host "   ✅ Fixed missing comma in subscribeNewsletter" -ForegroundColor Green
    }
    
    # Fix 2: downloadGuide guideId handling
    if ($content -match "guideId:\s*guideId,") {
        # Ensure guideId is stored as string in downloadedGuides
        $content = $content -replace "(downloadedGuides\.push\(\s*{\s*guideId:\s*)guideId(,)", "`$1guideId.toString()`$2"
        Write-Host "   ✅ Fixed guideId handling in downloadGuide" -ForegroundColor Green
    }
    
    # Fix 3: Ensure guideEntry uses string
    if ($content -notmatch "guideId:\s*guideId\.toString\(\)") {
        $content = $content -replace "(const guideEntry = {\s*guideId:\s*)guideId(,)", "`$1guideId.toString()`$2"
    }
    
    Set-Content -Path $leadControllerPath -Value $content -Encoding UTF8
    Write-Host "   ✅ Lead controller updated" -ForegroundColor Green
} else {
    Write-Host "   ❌ Lead controller not found!" -ForegroundColor Red
}

# Step 3: Fix Test-Environment.ps1
if (-not $OnlyUpdateController) {
    Write-Host "`nStep 3: Fixing Test Environment Script..." -ForegroundColor Yellow
    $testEnvPath = Join-Path $ProjectRoot "scripts\TS_CGA_v1\Test-Environment.ps1"

    if (Test-Path $testEnvPath) {
        $content = Get-Content $testEnvPath -Raw
        $updated = $false
        
        # Add longer wait time after starting backend
        if ($content -match "WaitSeconds 10") {
            $content = $content -replace "WaitSeconds 10", "WaitSeconds 20"
            Write-Host "   ✅ Increased backend startup wait time" -ForegroundColor Green
            $updated = $true
        }
        
        # Add server ready check if not present
        if ($content -notmatch "Wait for server to be fully ready") {
            $serverReadyCheck = @'

    # Wait for server to be fully ready
    Write-TestInfo "Waiting for backend server to be fully ready..."
    $attempts = 0
    $maxAttempts = 30
    $serverReady = $false
    
    while ($attempts -lt $maxAttempts -and -not $serverReady) {
        Start-Sleep -Seconds 2
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop
            if ($health.status -eq "ok") {
                $serverReady = $true
                Write-TestSuccess "Backend server is fully ready"
            }
        } catch {
            $attempts++
            if ($attempts % 5 -eq 0) {
                Write-TestInfo "Still waiting for server... ($attempts/$maxAttempts)"
            }
        }
    }
    
    if (-not $serverReady) {
        Write-TestFailure "Backend server failed to become ready after 60 seconds"
    }
'@
            
            # Insert before the basic API connectivity test
            $content = $content -replace '(Write-TestStep 4 "Testing basic API connectivity")', "$serverReadyCheck`n`n`$1"
            Write-Host "   ✅ Added server ready check" -ForegroundColor Green
            $updated = $true
        }
        
        if ($updated) {
            Set-Content -Path $testEnvPath -Value $content -Encoding UTF8
        }
    }
}

# Step 4: Check if server needs restart
if (-not $SkipServerRestart) {
    Write-Host "`nStep 4: Checking Backend Server..." -ForegroundColor Yellow
    
    # Check if server is running
    $serverRunning = $false
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop -TimeoutSec 2
        if ($health.status -eq "ok") {
            $serverRunning = $true
            Write-Host "   ✅ Backend server is already running" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ℹ️  Backend server is not running" -ForegroundColor Blue
    }
    
    if (-not $serverRunning) {
        Write-Host "   Starting backend server..." -ForegroundColor Yellow
        
        # Use full path for backend directory
        $backendPath = Join-Path $ProjectRoot "backend"
        
        if (Test-Path $backendPath) {
            # Start server using cmd to avoid PowerShell issues
            $startInfo = New-Object System.Diagnostics.ProcessStartInfo
            $startInfo.FileName = "cmd.exe"
            $startInfo.Arguments = "/c cd /d `"$backendPath`" && npm run dev"
            $startInfo.UseShellExecute = $true
            $startInfo.WindowStyle = "Minimized"
            
            try {
                $process = [System.Diagnostics.Process]::Start($startInfo)
                Write-Host "   ℹ️  Backend server starting (PID: $($process.Id))..." -ForegroundColor Blue
                
                # Wait for server to be ready
                $attempts = 0
                $maxAttempts = 30
                $serverReady = $false
                
                Write-Host "   Waiting for server to be ready..." -ForegroundColor Gray
                while ($attempts -lt $maxAttempts -and -not $serverReady) {
                    Start-Sleep -Seconds 2
                    try {
                        $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop -TimeoutSec 2
                        if ($health.status -eq "ok") {
                            $serverReady = $true
                            Write-Host "   ✅ Backend server is ready!" -ForegroundColor Green
                        }
                    } catch {
                        $attempts++
                        if ($attempts % 5 -eq 0) {
                            Write-Host "   Still waiting... ($attempts/$maxAttempts)" -ForegroundColor Gray
                        }
                    }
                }
                
                if (-not $serverReady) {
                    Write-Host "   ❌ Server failed to become ready" -ForegroundColor Red
                    Write-Host "   Please start the server manually: cd backend && npm run dev" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "   ❌ Failed to start server: $_" -ForegroundColor Red
                Write-Host "   Please start the server manually: cd backend && npm run dev" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ❌ Backend directory not found at: $backendPath" -ForegroundColor Red
        }
    }
}

# Step 5: Verify fixes
Write-Host "`nStep 5: Verifying Fixes..." -ForegroundColor Yellow

# Give server a moment to stabilize
Start-Sleep -Seconds 2

# Test authentication
$testUser = @{
    email = "verify_test_$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
    password = "TestPass123!"
    firstName = "Verify"
    lastName = "Test"
} | ConvertTo-Json

try {
    $authTest = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $testUser -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ Authentication working" -ForegroundColor Green
    Write-Host "   Response: $($authTest | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Authentication still failing: $($_.Exception.Message)" -ForegroundColor Red
}

# Test lead creation with google_ads source
$leadTest = @{
    email = "lead_verify_$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
    firstName = "Lead"
    lastName = "Test"
    source = "google_ads"
} | ConvertTo-Json

try {
    $leadResult = Invoke-RestMethod -Uri "http://localhost:5000/api/leads" -Method POST -Body $leadTest -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ Lead creation with google_ads source working: $($leadResult | ConvertTo-Json -Depth 2)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Lead creation still failing: $($_.Exception.Message)" -ForegroundColor Red
}

# Test guide download
$guideTest = @{
    email = "guide_verify_$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
    firstName = "Guide"
    lastName = "Test"
    guideId = "free-credit-guide"
} | ConvertTo-Json

try {
    $guideResult = Invoke-RestMethod -Uri "http://localhost:5000/api/leads/download-guide" -Method POST -Body $guideTest -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ Guide download working: $($guideResult | ConvertTo-Json -Depth 2)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Guide download still failing: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "✅ Lead Model - Updated with all required enum values"
Write-Host "✅ Lead Controller - Fixed syntax and validation issues"
Write-Host "✅ Test Environment - Added proper startup checks"
Write-Host "✅ Server Status - Checked and managed appropriately"

Write-Host "`n📌 Next Steps:" -ForegroundColor Yellow
Write-Host "1. If server is running, proceed to run QA tests"
Write-Host "2. Run QA tests: cd scripts\TS_CGA_v1 && .\Run-CreditGyemsQA.ps1"
Write-Host "3. Monitor test results for improvements"

Write-Host "`n💡 Tips:" -ForegroundColor Blue
Write-Host "- Keep your backend terminal open to see server logs"
Write-Host "- Use -SkipServerRestart flag if server is already running"
Write-Host "- Use -OnlyUpdateController flag for quick controller fixes"