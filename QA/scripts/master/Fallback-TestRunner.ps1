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
