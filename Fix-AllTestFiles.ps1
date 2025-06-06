# Fix-AllTestIssues.ps1
# Comprehensive script to fix all test suite issues

Write-Host @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                    CREDIT GYEMS ACADEMY TEST SUITE FIX                       ║
║                           Fixing All Known Issues                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$projectRoot = "D:\credit-gyems-academy"
$apiTestsPath = Join-Path $projectRoot "QA\scripts\api-tests"
$masterPath = Join-Path $projectRoot "QA\scripts\master"
$backendPath = Join-Path $projectRoot "backend"

$fixes = @{
    Applied = 0
    Failed = 0
}

function Invoke-Fix {
    param($Name, $ScriptBlock)
    
    Write-Host "`n→ $Name" -ForegroundColor Yellow
    try {
        & $ScriptBlock
        Write-Host "  ✓ Fixed successfully" -ForegroundColor Green
        $script:fixes.Applied++
    } catch {
        Write-Host "  ✗ Failed: $_" -ForegroundColor Red
        $script:fixes.Failed++
    }
}

# Fix 1: Test-Utilities.ps1 null safety
Invoke-Fix "Making Test-Utilities.ps1 null-safe" {
    $utilPath = Join-Path $apiTestsPath "Test-Utilities.ps1"
    $content = Get-Content $utilPath -Raw
    
    # Make all Write functions null-safe
    $functions = @{
    'Write-TestSuccess' = @'
function Write-TestSuccess($message) {
    Write-Host "  ✓ $message" -ForegroundColor Green
    if ($Global:TestResults) {
        if ($null -eq $Global:TestResults.Passed) { $Global:TestResults.Passed = 0 }
        $Global:TestResults.Passed++
        if ($Global:TestResults.Details -is [System.Collections.ArrayList]) {
            [void]$Global:TestResults.Details.Add(@{
                Type = "Success";
                Message = $message;
                Timestamp = Get-Date
            })
        }
    }
}
'@

    'Write-TestFailure' = @'
function Write-TestFailure($message, $errorDetails = $null) {
    Write-Host "  ✗ $message" -ForegroundColor Red
    if ($errorDetails) {
        Write-Host "    Error: $errorDetails" -ForegroundColor DarkRed
    }
    if ($Global:TestResults) {
        if ($null -eq $Global:TestResults.Failed) { $Global:TestResults.Failed = 0 }
        $Global:TestResults.Failed++
        if ($Global:TestResults.Details -is [System.Collections.ArrayList]) {
            [void]$Global:TestResults.Details.Add(@{
                Type = "Failure";
                Message = $message;
                Error = $errorDetails;
                Timestamp = Get-Date
            })
        }
    }
}
'@

    'Write-TestWarning' = @'
function Write-TestWarning($message) {
    Write-Host "  ⚠ $message" -ForegroundColor Yellow
    if ($Global:TestResults) {
        if ($null -eq $Global:TestResults.Warnings) { $Global:TestResults.Warnings = 0 }
        $Global:TestResults.Warnings++
        if ($Global:TestResults.Details -is [System.Collections.ArrayList]) {
            [void]$Global:TestResults.Details.Add(@{
                Type = "Warning";
                Message = $message;
                Timestamp = Get-Date
            })
        }
    }
}
'@
}

    
    foreach ($func in $functions.GetEnumerator()) {
        $pattern = "function $($func.Key)\([^}]+\}"
        $content = $content -replace $pattern, $func.Value
    }
    
    $content | Set-Content $utilPath -Encoding UTF8
}

# Fix 2: Test-Environment.ps1 null checks
Invoke-Fix "Adding null checks to Test-Environment.ps1" {
    $envPath = Join-Path $apiTestsPath "Test-Environment.ps1"
    $content = Get-Content $envPath -Raw
    
    # Fix null content issue
    $content = $content -replace '(\$frontendEnv = Get-Content[^\n]+)', '$1
    if ($null -eq $frontendEnv) { $frontendEnv = @() }'
    
    $content = $content -replace '(\$backendEnv = Get-Content[^\n]+)', '$1
    if ($null -eq $backendEnv) { $backendEnv = @() }'
    
    $content | Set-Content $envPath -Encoding UTF8
}

# Fix 3: Run-APITests.ps1 initialization
Invoke-Fix "Fixing TestResults initialization in Run-APITests.ps1" {
    $runPath = Join-Path $apiTestsPath "Run-APITests.ps1"
    $content = Get-Content $runPath -Raw
    
    $content = $content -replace '# Initialize test results[^}]+}', @'
# Initialize test results
$Global:TestResults = @{
    StartTime = Get-Date
    Passed = 0
    Failed = 0
    Warnings = 0
    TestDetails = [System.Collections.ArrayList]@()
    Details = [System.Collections.ArrayList]@()
}'@
    
    $content | Set-Content $runPath -Encoding UTF8
}

# Fix 4: Generate-TestReport.ps1 null safety
Invoke-Fix "Making Generate-TestReport.ps1 null-safe" {
    $genPath = Join-Path $apiTestsPath "Generate-TestReport.ps1"
    if (Test-Path $genPath) {
        $content = @'
# Generate-TestReport.ps1
param(
    [hashtable]$TestResults,
    [string]$ProjectRoot,
    [string]$OutputPath,
    [string]$ReportName
)

# Initialize defaults
if (-not $TestResults) { 
    $TestResults = if ($Global:TestResults) { $Global:TestResults } else { @{Passed=0; Failed=0; Warnings=0} }
}
if (-not $ProjectRoot) { $ProjectRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) }
if (-not $OutputPath) { $OutputPath = Join-Path $ProjectRoot "test-reports" }
if (-not $ReportName) { $ReportName = "test-report-$(Get-Date -Format 'HHmmss')" }

Write-Host "Generating test report..." -ForegroundColor Gray

# Calculate safe values
$passed = if ($TestResults.Passed) { $TestResults.Passed } else { 0 }
$failed = if ($TestResults.Failed) { $TestResults.Failed } else { 0 }
$warnings = if ($TestResults.Warnings) { $TestResults.Warnings } else { 0 }
$total = $passed + $failed + $warnings
$passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 2) } else { 0 }

# Create simple HTML report
$html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        .warning { color: orange; }
    </style>
</head>
<body>
    <h1>Credit Gyems Academy - Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Generated: $(Get-Date)</p>
        <p class="passed">Passed: $($passed)</p>
        <p class="failed">Failed: $($failed)</p>
        <p class="warning">Warnings: $($warnings)</p>
        <p>Pass Rate: $($passRate)%</p>
    </div>
</body>
</html>
"@

# Save report
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
}

$htmlPath = Join-Path $OutputPath "$ReportName.html"
$html | Out-File $htmlPath -Encoding UTF8

Write-Host "Report saved to: $htmlPath" -ForegroundColor Green
'@
        
        $content | Set-Content $genPath -Encoding UTF8
    }


# Fix 5: Create admin update script
Invoke-Fix "Creating admin role update script" {
    $adminScript = @'
const mongoose = require('mongoose');
require('dotenv').config();

async function updateAdmins() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/credit-gyems-academy';
    
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
        
        const User = mongoose.model('User', {
            email: String,
            role: { type: String, default: 'user' }
        });
        
        // Update all admin pattern emails
        const result = await User.updateMany(
            { email: /admin.*@creditgyemstest\.com$/i },
            { $set: { role: 'admin' } }
        );
        
        console.log(`Updated ${result.modifiedCount} users to admin role`);
        
        // Show updated admins
        const admins = await User.find({ role: 'admin' }).select('email').limit(5);
        console.log('Sample admin users:', admins.map(a => a.email));
        
        await mongoose.disconnect();
        console.log('Done');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

updateAdmins();
'@
    
    $adminPath = Join-Path $backendPath "update-admins.js"
    $adminScript | Out-File $adminPath -Encoding UTF8
}

# Fix 6: Create persistent test data mechanism
Invoke-Fix "Creating test data persistence" {
    $setupPath = Join-Path $apiTestsPath "Setup-TestData.ps1"
    if (Test-Path $setupPath) {
        $content = Get-Content $setupPath -Raw
        
        # Add persistence at the end if not exists
        if ($content -notmatch 'credit-gyems-test-session.json') {
            $content += @'

# Save test data for session persistence
$sessionFile = Join-Path $env:TEMP "credit-gyems-test-session.json"
@{
    Timestamp = Get-Date
    Users = $Global:CreatedTestUsers
    Products = $Global:CreatedTestProducts
    Services = $Global:CreatedTestServices
    PrimaryUser = if ($Global:CreatedTestUsers.Count -gt 0) { $Global:CreatedTestUsers[0] } else { $null }
} | ConvertTo-Json -Depth 10 | Out-File $sessionFile -Encoding UTF8
'@
            $content | Set-Content $setupPath -Encoding UTF8
        }
    }
}

# Fix 7: Create fallback test runner
Invoke-Fix "Creating fallback test runner" {
    $fallbackRunner = @'
# Fallback-TestRunner.ps1
# Simple test runner that works reliably

Write-Host "Credit Gyems Academy - Fallback Test Runner" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

$results = @{ Passed = 0; Failed = 0; Tests = @() }

function Test-API {
    param($Name, $Method = "GET", $Path, $Body, $Token)
    
    $uri = "http://localhost:5000$Path"
    Write-Host "`n→ Testing: $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Method = $Method
            Uri = $uri
            ContentType = "application/json"
        }
        
        if ($Token) { $params.Headers = @{ Authorization = "Bearer $Token" } }
        if ($Body) { $params.Body = ($Body | ConvertTo-Json) }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✓ Success" -ForegroundColor Green
        $script:results.Passed++
        $script:results.Tests += @{ Name = $Name; Result = "Passed" }
        return $response
    } catch {
        Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
        $script:results.Failed++
        $script:results.Tests += @{ Name = $Name; Result = "Failed"; Error = $_.Exception.Message }
        return $null
    }
}

# Run basic tests
$health = Test-API -Name "Health Check" -Path "/api/health"

if ($health) {
    # Create test user
    $user = @{
        email = "test_$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
        password = "Test123!@#"
        firstName = "Test"
        lastName = "User"
    }
    
    $reg = Test-API -Name "User Registration" -Method "POST" -Path "/api/auth/register" -Body $user
    
    if ($reg -and $reg.token) {
        # Test authenticated endpoints
        Test-API -Name "Get Profile" -Path "/api/auth/profile" -Token $reg.token
        Test-API -Name "List Products" -Path "/api/products"
        Test-API -Name "List Services" -Path "/api/services"
    }
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Summary: Passed = $($results.Passed), Failed = $($results.Failed)" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Save results
$reportPath = "D:\credit-gyems-academy\QA\test-reports\fallback-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$results | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding UTF8
Write-Host "`nResults saved to: $reportPath" -ForegroundColor Gray
'@
    
    $fallbackPath = Join-Path $masterPath "Fallback-TestRunner.ps1"
    $fallbackRunner | Out-File $fallbackPath -Encoding UTF8
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    FIX SUMMARY                                 " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Applied: $($fixes.Applied) fixes" -ForegroundColor Green
Write-Host "Failed: $($fixes.Failed) fixes" -ForegroundColor $(if ($fixes.Failed -eq 0) { 'Green' } else { 'Red' })

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "`n1. Update admin roles in database:" -ForegroundColor White
Write-Host "   cd $backendPath" -ForegroundColor Gray
Write-Host "   node update-admins.js" -ForegroundColor Gray

Write-Host "`n2. Try the fallback test runner (recommended):" -ForegroundColor White
Write-Host "   cd $masterPath" -ForegroundColor Gray
Write-Host "   .\Fallback-TestRunner.ps1" -ForegroundColor Gray

Write-Host "`n3. Or try the main test suite:" -ForegroundColor White
Write-Host "   .\Run-AllTests.ps1 -TestMode Quick" -ForegroundColor Gray

Write-Host "`n4. If issues persist, use the simple test runner:" -ForegroundColor White
Write-Host "   .\Simple-TestRunner.ps1" -ForegroundColor Gray

Write-Host "`nThe Fallback-TestRunner.ps1 is designed to work reliably" -ForegroundColor Cyan
Write-Host "without the complexity that's causing issues in the main suite." -ForegroundColor Cyan