# Generate-TestReport.ps1
# Generates comprehensive test report with actionable insights
# Location: QA/scripts/api-tests/

param(
    [hashtable]$TestResults,
    [string]$ProjectRoot,
    [string]$OutputPath,
    [string]$ReportName
)

# Use output path if provided, otherwise use project root
if (-not $ProjectRoot -and $OutputPath) {
    $ProjectRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $OutputPath)))
}

if (-not $ProjectRoot) {
    $ProjectRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
}

# Get script root if not already set
if (-not $PSScriptRoot) {
    $PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

# Function to generate fix suggestions
function Get-FixSuggestion {
    param(
        [string]$Message,
        [string]$Error
    )
    
    if ($Message -match "MongoDB connection") {
        return "Ensure MongoDB is running and MONGODB_URI in backend/.env is correct. Check if MongoDB Atlas whitelist includes your IP."
    }
    elseif ($Message -match "Firebase") {
        return "Verify Firebase project configuration and service account credentials in backend/.env file."
    }
    elseif ($Message -match "Stripe") {
        return "Check Stripe API keys in .env files. Ensure webhook secret is properly configured for payment confirmations."
    }
    elseif ($Message -match "SendGrid") {
        return "Verify SendGrid API key and sender email is verified in SendGrid dashboard."
    }
    elseif ($Message -match "401|authorization|token") {
        return "Check JWT token generation and validation. Ensure Authorization header format is 'Bearer [token]'."
    }
    elseif ($Message -match "CORS") {
        return "Update CORS configuration in backend to allow requests from frontend URL (http://localhost:3000)."
    }
    elseif ($Message -match "port|EADDRINUSE") {
        return "Port already in use. Check if servers are already running or change port in .env file."
    }
    elseif ($Message -match "connection.*refused|ECONNREFUSED") {
        return "Server connection failed. Check if backend server is running on port 5000. May need to restart server or check for crashes."
    }
    elseif ($Message -match "\.env") {
        return "Ensure all required environment variables are set in both frontend/.env and backend/.env files."
    }
    elseif ($Message -match "Google Calendar") {
        return "Verify Google Calendar API credentials and ensure the service account has calendar access."
    }
    else {
        return $null
    }
}

# Create reports directory
$reportsDir = Join-Path $ProjectRoot "test-reports"
if (-not (Test-Path $reportsDir)) {
    New-Item -ItemType Directory -Path $reportsDir -Force | Out-Null
    Write-TestInfo "Created test reports directory: $reportsDir"
}

$reportPath = Join-Path $reportsDir "qa-test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"

Write-TestInfo "Generating comprehensive test report..."

# Initialize defaults if not set
if (-not $TestResults) {
    $TestResults = @{
        Passed = 0
        Failed = 0
        Warnings = 0
        Details = @()
        StartTime = Get-Date
    }
}

# Ensure StartTime is set
if (-not $TestResults.StartTime) {
    $TestResults.StartTime = Get-Date
}

# Calculate statistics
$totalTests = $TestResults.Passed + $TestResults.Failed + $TestResults.Warnings
$passRate = if ($totalTests -gt 0) { [math]::Round(($TestResults.Passed / $totalTests) * 100, 2) } else { 0 }

# Calculate duration safely
try {
    $endTime = Get-Date
    $duration = $endTime - $TestResults.StartTime
} catch {
    # If date subtraction fails, use a default duration
    $duration = New-TimeSpan -Seconds 0
}

# Initialize collections if they don't exist
if (-not $TestResults.Details) {
    $TestResults.Details = @()
}

# Group failures by category
$failuresByCategory = @{}
foreach ($detail in $TestResults.Details) {
    if ($detail.Type -eq "Failure") {
        $category = "General"
        if ($detail.Message -match "auth|login|register") { $category = "Authentication" }
        elseif ($detail.Message -match "product|cart|order|payment") { $category = "E-commerce" }
        elseif ($detail.Message -match "booking|appointment|calendar") { $category = "Booking" }
        elseif ($detail.Message -match "community|discussion|post") { $category = "Community" }
        elseif ($detail.Message -match "email|sendgrid|lead") { $category = "Communications" }
        elseif ($detail.Message -match "MongoDB|database") { $category = "Database" }
        elseif ($detail.Message -match "Firebase|Stripe|SendGrid|Google") { $category = "Integrations" }
        
        if (-not $failuresByCategory[$category]) {
            $failuresByCategory[$category] = @()
        }
        $failuresByCategory[$category] += $detail
    }
}

# Initialize global collections if they don't exist
if (-not $Global:TestUsers) { $Global:TestUsers = @() }
if (-not $Global:TestProducts) { $Global:TestProducts = @() }
if (-not $Global:TestServices) { $Global:TestServices = @() }

# Generate HTML Report
$html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Credit Gyems Academy - QA Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #FFD700; text-align: center; }
        h2 { color: #333; border-bottom: 2px solid #FFD700; padding-bottom: 10px; }
        h3 { color: #666; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-box { text-align: center; padding: 20px; border-radius: 8px; flex: 1; margin: 0 10px; }
        .stat-box.passed { background: #d4edda; color: #155724; }
        .stat-box.failed { background: #f8d7da; color: #721c24; }
        .stat-box.warnings { background: #fff3cd; color: #856404; }
        .stat-box.info { background: #d1ecf1; color: #0c5460; }
        .stat-number { font-size: 36px; font-weight: bold; }
        .stat-label { font-size: 14px; margin-top: 5px; }
        .section { margin: 20px 0; }
        .test-item { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .test-item.success { background: #f0f9ff; border-left: 4px solid #28a745; }
        .test-item.failure { background: #fff5f5; border-left: 4px solid #dc3545; }
        .test-item.warning { background: #fffbf0; border-left: 4px solid #ffc107; }
        .error-detail { color: #dc3545; font-size: 12px; margin-top: 5px; font-family: monospace; }
        .timestamp { color: #999; font-size: 12px; }
        .action-items { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .action-items h3 { margin-top: 0; }
        .action-items ul { margin: 10px 0; }
        .category-section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .fix-suggestion { background: #e7f3ff; padding: 10px; border-radius: 4px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: bold; }
        .chart { margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Credit Gyems Academy - QA Test Report</h1>
        <p style="text-align: center; color: #666;">Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
        
        <div class="summary">
            <div class="stat-box passed">
                <div class="stat-number">$($TestResults.Passed)</div>
                <div class="stat-label">Tests Passed</div>
            </div>
            <div class="stat-box failed">
                <div class="stat-number">$($TestResults.Failed)</div>
                <div class="stat-label">Tests Failed</div>
            </div>
            <div class="stat-box warnings">
                <div class="stat-number">$($TestResults.Warnings)</div>
                <div class="stat-label">Warnings</div>
            </div>
            <div class="stat-box info">
                <div class="stat-number">$passRate%</div>
                <div class="stat-label">Pass Rate</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Test Execution Summary</h2>
            <table>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Total Tests Executed</td>
                    <td>$totalTests</td>
                </tr>
                <tr>
                    <td>Execution Time</td>
                    <td>$($duration.ToString('hh\:mm\:ss'))</td>
                </tr>
                <tr>
                    <td>Test Environment</td>
                    <td>Local Development (Frontend: 5173, Backend: 5000)</td>
                </tr>
                <tr>
                    <td>Project Root</td>
                    <td>$ProjectRoot</td>
                </tr>
                <tr>
                    <td>Test Data Created</td>
                    <td>Users: $($Global:TestUsers.Count), Products: $($Global:TestProducts.Count), Services: $($Global:TestServices.Count)</td>
                </tr>
            </table>
        </div>
"@

# Add failure analysis
if ($TestResults.Failed -gt 0) {
    $html += @"
        <div class="section">
            <h2>Failure Analysis</h2>
"@
    
    foreach ($category in $failuresByCategory.Keys | Sort-Object) {
        $failures = $failuresByCategory[$category]
        $html += @"
            <div class="category-section">
                <h3>$category Issues ($($failures.Count))</h3>
"@
        
        foreach ($failure in $failures) {
            $html += @"
                <div class="test-item failure">
                    <strong>$($failure.Message)</strong>
                    <div class="timestamp">$($failure.Timestamp.ToString('HH:mm:ss'))</div>
"@
            if ($failure.Error) {
                $html += @"
                    <div class="error-detail">Error: $($failure.Error)</div>
"@
            }
            
            # Add fix suggestions based on error type
            $fixSuggestion = Get-FixSuggestion -Message $failure.Message -Error $failure.Error
            if ($fixSuggestion) {
                $html += @"
                    <div class="fix-suggestion">
                        <strong>Suggested Fix:</strong> $fixSuggestion
                    </div>
"@
            }
            
            $html += "</div>"
        }
        
        $html += "</div>"
    }
    
    $html += "</div>"
}

# Add action items
$html += @"
        <div class="action-items">
            <h3>Recommended Action Items</h3>
            <ul>
"@

# Generate action items based on failures
if ($failuresByCategory["Authentication"]) {
    $html += "<li><strong>Authentication:</strong> Review Firebase configuration and ensure auth tokens are properly handled. Check JWT_SECRET in backend/.env</li>"
}
if ($failuresByCategory["E-commerce"]) {
    $html += "<li><strong>E-commerce:</strong> Verify Stripe integration and product/order models in MongoDB. Ensure STRIPE_SECRET_KEY is valid</li>"
}
if ($failuresByCategory["Booking"]) {
    $html += "<li><strong>Booking:</strong> Check Google Calendar API credentials and service availability settings</li>"
}
if ($failuresByCategory["Community"]) {
    $html += "<li><strong>Community:</strong> Ensure discussion and post models are properly indexed in MongoDB</li>"
}
if ($failuresByCategory["Communications"]) {
    $html += "<li><strong>Communications:</strong> Verify SendGrid API key and email template configurations</li>"
}
if ($failuresByCategory["Database"]) {
    $html += "<li><strong>Database:</strong> Check MongoDB connection string and ensure database is accessible</li>"
}
if ($failuresByCategory["Integrations"]) {
    $html += "<li><strong>Integrations:</strong> Review all third-party service credentials in .env files</li>"
}

$html += @"
            </ul>
        </div>
        
        <div class="section">
            <h2>Test Coverage Summary</h2>
            <table>
                <tr>
                    <th>Feature Area</th>
                    <th>Status</th>
                    <th>Notes</th>
                </tr>
                <tr>
                    <td>User Authentication</td>
                    <td>$(if ($failuresByCategory["Authentication"]) { "⚠️ Issues Found" } else { "✅ Passed" })</td>
                    <td>Registration, login, profile management, password reset</td>
                </tr>
                <tr>
                    <td>E-commerce</td>
                    <td>$(if ($failuresByCategory["E-commerce"]) { "⚠️ Issues Found" } else { "✅ Passed" })</td>
                    <td>Product browsing, cart, checkout, payment processing</td>
                </tr>
                <tr>
                    <td>Booking System</td>
                    <td>$(if ($failuresByCategory["Booking"]) { "⚠️ Issues Found" } else { "✅ Passed" })</td>
                    <td>Service booking, calendar integration, availability</td>
                </tr>
                <tr>
                    <td>Community Forum</td>
                    <td>$(if ($failuresByCategory["Community"]) { "⚠️ Issues Found" } else { "✅ Passed" })</td>
                    <td>Discussions, posts, likes, moderation</td>
                </tr>
                <tr>
                    <td>Lead Capture</td>
                    <td>$(if ($failuresByCategory["Communications"]) { "⚠️ Issues Found" } else { "✅ Passed" })</td>
                    <td>Lead forms, email delivery, analytics</td>
                </tr>
            </table>
        </div>
        
        <div class="section">
            <h2>Next Steps</h2>
            <ol>
                <li>Address all failed tests starting with critical authentication and payment flows</li>
                <li>Re-run failed tests after fixes are implemented</li>
                <li>Set up continuous integration to run these tests automatically</li>
                <li>Consider adding more edge case scenarios for robust testing</li>
                <li>Document any manual testing requirements not covered by automation</li>
            </ol>
        </div>
        
        <div class="footer">
            <p>Report generated by Credit Gyems Academy QA Test Suite v1.0</p>
            <p>Script Location: $PSScriptRoot</p>
        </div>
    </div>
</body>
</html>
"@

# Save report
$html | Out-File -FilePath $reportPath -Encoding UTF8

Write-TestSuccess "Test report generated: $reportPath"

# Display summary in console
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    TEST EXECUTION SUMMARY                      " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`nTest Results:" -ForegroundColor White
Write-Host "  • Passed:   $($TestResults.Passed)" -ForegroundColor Green
Write-Host "  • Failed:   $($TestResults.Failed)" -ForegroundColor Red
Write-Host "  • Warnings: $($TestResults.Warnings)" -ForegroundColor Yellow
Write-Host "  • Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })

if ($TestResults.Failed -gt 0) {
    Write-Host "`nTop Issues to Address:" -ForegroundColor Red
    $topIssues = $TestResults.Details | Where-Object { $_.Type -eq "Failure" } | Select-Object -First 5
    foreach ($issue in $topIssues) {
        Write-Host "  • $($issue.Message)" -ForegroundColor Red
    }
}

Write-Host "`nReport Location: $reportPath" -ForegroundColor Cyan
Write-Host "Open the HTML report for detailed analysis and fix suggestions." -ForegroundColor White

# Open report in default browser (optional - comment out if not wanted)
# Start-Process $reportPath

# Return the report path
return $reportPath