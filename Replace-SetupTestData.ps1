# Replace-SetupTestData.ps1
# Run from project root to replace the corrupted Setup-TestData.ps1

$targetPath = "D:\credit-gyems-academy\QA\scripts\api-tests\Setup-TestData.ps1"

# Create backup
$backupPath = "$targetPath.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
Copy-Item $targetPath $backupPath -Force
Write-Host "Created backup: $backupPath" -ForegroundColor Green

# The clean content
$cleanContent = @'
# Setup-TestData.ps1
# Creates test data for API testing
# Location: QA/scripts/api-tests/

param(
    [string]$Environment = "local",
    [switch]$SkipUsers,
    [switch]$SkipProducts,
    [switch]$SkipServices
)

# Load configuration
$configPath = Join-Path (Split-Path -Parent $PSScriptRoot) "master\Test-Config.ps1"
. $configPath

Write-Host "`nSetting up test data..." -ForegroundColor Yellow

# Get environment configuration
$env = Get-TestEnvironment -Environment $Environment
$baseUrl = $env.BackendUrl

# Initialize collections
$Global:CreatedTestUsers = @()
$Global:CreatedTestProducts = @()
$Global:CreatedTestServices = @()

# Step 1: Create test users
if (-not $SkipUsers) {
    Write-Host "→ Step 1: Creating test users" -ForegroundColor Cyan
    
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $random = Get-Random -Maximum 9999
    
    # Create a regular user
    $regularUser = @{
        email = "test_${timestamp}_${random}@creditgyemstest.com"
        password = "Test123!@#"
        firstName = "Test"
        lastName = "User${random}"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
            -Method POST `
            -Body ($regularUser | ConvertTo-Json) `
            -ContentType "application/json"
        
        $regularUser.token = $response.token
        $regularUser.id = $response.user.id
        $regularUser.role = $response.user.role
        
        $Global:CreatedTestUsers += $regularUser
        Write-Host "  ✓ Created test user: $($regularUser.email) [Role: $($regularUser.role)]" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ Failed to create regular user: $_" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "    Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
    }
    
    # Create an admin user (will need role update in DB)
    $adminUser = @{
        email = "admin_${timestamp}_${random}@creditgyemstest.com"
        password = "Admin123!@#"
        firstName = "Admin"
        lastName = "User${random}"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
            -Method POST `
            -Body ($adminUser | ConvertTo-Json) `
            -ContentType "application/json"
        
        $adminUser.token = $response.token
        $adminUser.id = $response.user.id
        $adminUser.role = "admin" # Will be updated in DB
        
        $Global:CreatedTestUsers += $adminUser
        Write-Host "  ✓ Created admin user: $($adminUser.email)" -ForegroundColor Green
        Write-Host "    Note: Admin role needs to be set in database" -ForegroundColor Yellow
    }
    catch {
        Write-Host "  ✗ Failed to create admin user: $_" -ForegroundColor Red
    }
}

# Step 2: Create test products
if (-not $SkipProducts) {
    Write-Host "→ Step 2: Creating test products" -ForegroundColor Cyan
    
    # Get admin token (use first user as fallback)
    $authToken = if ($Global:CreatedTestUsers.Count -gt 0) { 
        $Global:CreatedTestUsers[0].token 
    } else { 
        Write-Warning "No auth token available for product creation"
        $null 
    }
    
    if ($authToken) {
        $testProducts = @(
            @{
                type = "ebook"
                title = "Test Credit Repair Guide $(Get-Random)"
                slug = "test-credit-repair-guide-$(Get-Random)"
                description = "Test product for automated testing"
                price = 49.99
                shortDescription = "Test ebook"
                features = @("Feature 1", "Feature 2")
                status = "published"
            }
        )
        
        foreach ($product in $testProducts) {
            try {
                $headers = @{
                    Authorization = "Bearer $authToken"
                }
                
                $response = Invoke-RestMethod -Uri "$baseUrl/api/products" `
                    -Method POST `
                    -Headers $headers `
                    -Body ($product | ConvertTo-Json -Depth 10) `
                    -ContentType "application/json"
                
                $product.id = $response._id
                $Global:CreatedTestProducts += $product
                Write-Host "  ✓ Created test product: $($product.title)" -ForegroundColor Green
            }
            catch {
                Write-Host "  ✗ Failed to create product: $($product.title)" -ForegroundColor Red
                Write-Host "    Error: $_" -ForegroundColor Yellow
            }
        }
    }
}

# Step 3: Create test services
if (-not $SkipServices) {
    Write-Host "→ Step 3: Creating test services" -ForegroundColor Cyan
    
    $authToken = if ($Global:CreatedTestUsers.Count -gt 0) { 
        $Global:CreatedTestUsers[0].token 
    } else { 
        $null 
    }
    
    if ($authToken) {
        # Try to seed default services first
        try {
            $headers = @{
                Authorization = "Bearer $authToken"
            }
            
            $response = Invoke-RestMethod -Uri "$baseUrl/api/services/seed" `
                -Method POST `
                -Headers $headers
            
            Write-Host "  ✓ Seeded default services" -ForegroundColor Green
            
            # Get the created services
            $servicesResponse = Invoke-RestMethod -Uri "$baseUrl/api/services" `
                -Method GET
            
            $Global:CreatedTestServices = $servicesResponse.data
            
            foreach ($service in $Global:CreatedTestServices) {
                Write-Host "    - $($service.displayName)" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "  ⚠ Could not seed services: $_" -ForegroundColor Yellow
        }
    }
}

# Summary
Write-Host "`nTest Data Setup Summary:" -ForegroundColor Cyan
Write-Host "  Users created: $($Global:CreatedTestUsers.Count)" -ForegroundColor White
Write-Host "  Products created: $($Global:CreatedTestProducts.Count)" -ForegroundColor White
Write-Host "  Services created: $($Global:CreatedTestServices.Count)" -ForegroundColor White

# Save test data for use in tests
$Global:TestDataCreated = @{
    Users = $Global:CreatedTestUsers
    Products = $Global:CreatedTestProducts
    Services = $Global:CreatedTestServices
    PrimaryUser = if ($Global:CreatedTestUsers.Count -gt 0) { $Global:CreatedTestUsers[0] } else { $null }
}

# Return success status
return ($Global:CreatedTestUsers.Count -gt 0)
'@

# Write the clean content
$cleanContent | Set-Content $targetPath -Encoding UTF8

Write-Host "Replaced Setup-TestData.ps1 with clean version" -ForegroundColor Green
Write-Host "Now try running the test again:" -ForegroundColor Yellow
Write-Host "cd QA\scripts\master" -ForegroundColor Gray
Write-Host ".\Run-AllTests.ps1 -TestMode Quick -Debug" -ForegroundColor Gray