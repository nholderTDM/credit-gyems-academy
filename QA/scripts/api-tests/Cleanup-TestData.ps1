# Cleanup-TestData.ps1
# Cleans up test data (hybrid approach)
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot,
    [switch]$CleanupAll
)

# Get script root if not already set
if (-not $PSScriptRoot) {
    $PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

Write-TestStep 1 "Cleanup Strategy"

if ($CleanupAll) {
    Write-TestWarning "Full cleanup requested - removing ALL test data"
} else {
    Write-TestInfo "Hybrid cleanup - keeping some test data for inspection"
}

# Load test data config
$testDataPath = Join-Path $ProjectRoot "test-data\test-data-config.json"
if (Test-Path $testDataPath) {
    $testData = Get-Content $testDataPath | ConvertFrom-Json
    
    if ($CleanupAll) {
        Write-TestStep 2 "Removing all test users"
        # In a real scenario, you'd call DELETE endpoints for each user
        Write-TestInfo "Would delete $($testData.Users.Count) test users"
        
        Write-TestStep 3 "Removing all test products"
        Write-TestInfo "Would delete $($testData.Products.Count) test products"
        
        Write-TestStep 4 "Removing all test orders"
        Write-TestInfo "Would delete all test orders"
        
        # Remove config file
        Remove-Item $testDataPath -Force
        Write-TestSuccess "Test data configuration removed"
    }
    else {
        Write-TestStep 2 "Keeping primary test data"
        Write-TestInfo "Keeping primary test user: $($testData.PrimaryUser.Email)"
        Write-TestInfo "Keeping first product for manual testing"
        Write-TestInfo "Removing secondary test data..."
        
        # Keep only essential data
        $testData.Users = $testData.Users | Select-Object -First 2
        $testData.Products = $testData.Products | Select-Object -First 1
        
        # Update config
        $testData | ConvertTo-Json -Depth 10 | Out-File $testDataPath -Encoding UTF8
        Write-TestSuccess "Test data reduced to essential items only"
    }
}
else {
    Write-TestWarning "No test data configuration found"
}

Write-TestStep 5 "Cleanup Summary"

if ($CleanupAll) {
    Write-TestInfo "All test data has been marked for removal"
    Write-TestInfo "Database may still contain test records (manual cleanup required)"
} else {
    Write-TestInfo "Essential test data retained for manual inspection"
    Write-TestInfo "Use -CleanupAll flag to remove everything"
}