# Verify-TestCount.ps1
# Verify all tests are running

$expectedTests = @{
    "Environment Validation" = 5
    "Test Data Setup" = 5
    "Authentication Flow" = 11
    "E-commerce Flow" = 8
    "Booking System" = 10
    "Community Forum" = 10
    "Lead Capture" = 10
    "Integration Tests" = 10
    "Error Scenarios" = 10
}

$totalExpected = ($expectedTests.Values | Measure-Object -Sum).Sum
Write-Host "Expected total tests: $totalExpected" -ForegroundColor Cyan

if ($Global:TestResults) {
    $actualTotal = $Global:TestResults.Passed + $Global:TestResults.Failed
    Write-Host "Actual tests run: $actualTotal" -ForegroundColor Yellow
    
    if ($actualTotal -lt $totalExpected) {
        Write-Host "⚠️  Missing $(($totalExpected - $actualTotal)) tests!" -ForegroundColor Red
    }
}
