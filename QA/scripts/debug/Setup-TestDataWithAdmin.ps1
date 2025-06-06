# Setup-TestDataWithAdmin.ps1
# Creates test data including an admin user for product tests

param(
    [string]$ProjectRoot = (Get-Location)
)

Write-Host "`n📦 SETTING UP TEST DATA WITH ADMIN USER" -ForegroundColor Cyan

# Create admin user
$adminEmail = "admin_test@creditgyems.com"
$adminPassword = "AdminTest123!"

Write-Host "Creating admin user: $adminEmail" -ForegroundColor Yellow

# Register admin
$adminReg = @{
    email = $adminEmail
    password = $adminPassword
    firstName = "Admin"
    lastName = "Test"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -Body $adminReg `
        -ContentType "application/json"
    
    Write-Host "✅ Admin user created" -ForegroundColor Green
    
    # Promote to admin using the script
    Write-Host "Promoting user to admin..." -ForegroundColor Yellow
    
    Set-Location backend
    $result = node promote-to-admin.js $adminEmail 2>&1
    Write-Host $result -ForegroundColor Gray
    Set-Location ..
    
    Write-Host "✅ User promoted to admin" -ForegroundColor Green
    
    # Save credentials for tests
    @{
        AdminEmail = $adminEmail
        AdminPassword = $adminPassword
    } | ConvertTo-Json | Set-Content "test-admin-credentials.json"
    
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "ℹ️ Admin user already exists" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to create admin user: $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ Test data setup complete" -ForegroundColor Green
