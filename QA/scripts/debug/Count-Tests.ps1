# Count-Tests.ps1
# Accurately counts tests in all test files

$testFiles = Get-ChildItem "scripts\TS_CGA_v1\Test-*.ps1"
$totalTests = 0
$testDetails = @()

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Count different test patterns
    $successTests = ([regex]::Matches($content, 'Write-TestSuccess')).Count
    $apiTests = ([regex]::Matches($content, 'Test-APIEndpoint(?:Managed)?')).Count
    $infoTests = ([regex]::Matches($content, 'Write-TestInfo.*test.*passed')).Count
    
    $fileTests = $successTests + $apiTests + $infoTests
    $totalTests += $fileTests
    
    $testDetails += [PSCustomObject]@{
        File = $file.Name
        Tests = $fileTests
    }
}

Write-Host "`nTest Count by File:" -ForegroundColor Cyan
$testDetails | Format-Table -AutoSize

Write-Host "`nTotal Unique Tests: $totalTests" -ForegroundColor Green
