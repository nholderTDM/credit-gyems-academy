# Diagnose-TestIssues.ps1
# Diagnose and fix issues in the test suite

Write-Host "Diagnosing Test Suite Issues" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor DarkGray

# Issue 1: Check for duplicate key errors in test scripts
Write-Host "`nIssue 1: Checking for duplicate Message key in test scripts..." -ForegroundColor Yellow

$testScripts = @(
    "D:\credit-gyems-academy\QA\scripts\api-tests\Test-Environment.ps1",
    "D:\credit-gyems-academy\QA\scripts\api-tests\Test-Authentication.ps1",
    "D:\credit-gyems-academy\QA\scripts\api-tests\Test-Ecommerce.ps1",
    "D:\credit-gyems-academy\QA\scripts\api-tests\Test-Booking.ps1",
    "D:\credit-gyems-academy\QA\scripts\api-tests\Test-Community.ps1",
    "D:\credit-gyems-academy\QA\scripts\api-tests\Test-LeadCapture.ps1"
)

foreach ($script in $testScripts) {
    if (Test-Path $script) {
        Write-Host "  Checking: $(Split-Path -Leaf $script)" -ForegroundColor Gray
        $content = Get-Content $script -Raw
        
        # Look for patterns that might cause duplicate Message keys
        $patterns = @(
            '@\{[^}]*Message\s*=\s*[^}]*Message\s*=',  # Duplicate Message in hashtable
            '\.Add\([''"]Message[''"]',                   # Using .Add() method
            '\$\w+\["Message"\]\s*=.*\$\w+\["Message"\]\s*='  # Setting Message twice
        )
        
        $issues = @()
        foreach ($pattern in $patterns) {
            if ($content -match $pattern) {
                $issues += "Found potential duplicate key pattern: $pattern"
            }
        }
        
        if ($issues.Count -gt 0) {
            Write-Host "    ✗ Issues found:" -ForegroundColor Red
            $issues | ForEach-Object { Write-Host "      $_" -ForegroundColor Yellow }
        } else {
            Write-Host "    ✓ No obvious duplicate key issues" -ForegroundColor Green
        }
    } else {
        Write-Host "    ✗ Script not found!" -ForegroundColor Red
    }
}

# Issue 2: Check project structure paths
Write-Host "`nIssue 2: Checking project structure paths..." -ForegroundColor Yellow

$projectRoot = "D:\credit-gyems-academy"
$paths = @{
    "Frontend" = Join-Path $projectRoot "frontend"
    "Backend" = Join-Path $projectRoot "backend"
    "QA" = Join-Path $projectRoot "QA"
}

foreach ($item in $paths.GetEnumerator()) {
    if (Test-Path $item.Value) {
        Write-Host "  ✓ $($item.Key) found at: $($item.Value)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($item.Key) NOT found at: $($item.Value)" -ForegroundColor Red
    }
}

# Issue 3: Check Test-Environment.ps1 specifically
Write-Host "`nIssue 3: Analyzing Test-Environment.ps1..." -ForegroundColor Yellow

$envTestPath = "D:\credit-gyems-academy\QA\scripts\api-tests\Test-Environment.ps1"
if (Test-Path $envTestPath) {
    $content = Get-Content $envTestPath -Raw
    
    # Check if it's using $PSScriptRoot correctly
    if ($content -match '\$PSScriptRoot') {
        Write-Host "  Found `$PSScriptRoot usage" -ForegroundColor Gray
        
        # Look for the specific line causing issues
        $lines = $content -split "`n"
        $lineNum = 0
        foreach ($line in $lines) {
            $lineNum++
            if ($line -match 'Frontend NOT FOUND at:' -or $line -match 'Backend NOT FOUND at:') {
                Write-Host "  Issue at line $lineNum`: $($line.Trim())" -ForegroundColor Yellow
            }
        }
    }
    
    # Check for incorrect path construction
    if ($content -match 'Join-Path.*\\(frontend|backend)') {
        Write-Host "  ✗ Found potential path issue with escaped backslashes" -ForegroundColor Red
    }
}

# Issue 4: Check for empty path parameter
Write-Host "`nIssue 4: Checking for empty path issues..." -ForegroundColor Yellow

$apiTestsPath = "D:\credit-gyems-academy\QA\scripts\api-tests\Run-APITests.ps1"
if (Test-Path $apiTestsPath) {
    $content = Get-Content $apiTestsPath -Raw
    
    # Look for Generate-TestReport calls
    if ($content -match 'Generate-TestReport.*-OutputPath\s+\$\w+') {
        Write-Host "  Found Generate-TestReport call" -ForegroundColor Gray
        
        # Check if the output path variable might be empty
        if ($content -match '\$reportDir\s*=.*\$Global:TestPaths\.Reports\.Today') {
            Write-Host "  ⚠ Potential issue: Using `$Global:TestPaths.Reports.Today which might not be set" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nRecommendations:" -ForegroundColor Cyan
Write-Host "1. Fix duplicate Message key issues in test scripts" -ForegroundColor White
Write-Host "2. Fix path construction in Test-Environment.ps1" -ForegroundColor White
Write-Host "3. Ensure report directories are created before use" -ForegroundColor White
Write-Host "4. Set admin role in database for admin users" -ForegroundColor White