# Update-ProductTestData.ps1
# Quick script to update just the product test data
# Run this to fix product creation without changing other parts

param(
    [string]$SetupTestDataPath = ".\scripts\TS_CGA_v1\Setup-TestData.ps1"
)

Write-Host "`n🔧 Updating Product Test Data..." -ForegroundColor Cyan

# Read the current file
$content = Get-Content $SetupTestDataPath -Raw

# Find and replace the testProducts section
$oldProductPattern = '(?s)\$testProducts = @\(.*?\)\s*foreach \(\$product in \$testProducts\)'

$newProductSection = @'
# FIXED: Use correct required fields for Product model
$testProducts = @(
    @{
        type = "ebook"
        title = "Credit Repair Mastery Guide"
        slug = "credit-repair-mastery-guide"
        description = "Complete guide to repairing your credit score with proven strategies and step-by-step instructions"
        price = 49.99
        shortDescription = "Transform your credit score with proven strategies"
        features = @("10 Chapter Guide", "Worksheets Included", "Lifetime Access")
        status = "published"
    },
    @{
        type = "ebook"
        title = "Financial Freedom Blueprint"
        slug = "financial-freedom-blueprint"
        description = "Step-by-step roadmap to financial independence with practical strategies for wealth building"
        price = 79.99
        shortDescription = "Your path to financial freedom starts here"
        features = @("15 Chapters", "Video Tutorials", "Monthly Updates")
        status = "published"
    },
    @{
        type = "masterclass"
        title = "Credit Coaching Masterclass"
        slug = "credit-coaching-masterclass"
        description = "Live masterclass with Coach Tae covering advanced credit repair strategies and Q&A session"
        price = 299.99
        shortDescription = "Interactive session with credit expert"
        eventDate = (Get-Date).AddDays(14).ToString("yyyy-MM-dd")
        duration = 120
        capacity = 50
        status = "published"
    }
)
'@

if ($content -match $oldProductPattern) {
    $updatedContent = $content -replace $oldProductPattern, $newProductSection
    
    # Backup original
    $backupPath = $SetupTestDataPath + ".backup"
    Copy-Item $SetupTestDataPath $backupPath -Force
    Write-Host "✅ Created backup: $backupPath" -ForegroundColor Green
    
    # Write updated content
    $updatedContent | Out-File $SetupTestDataPath -Encoding UTF8
    Write-Host "✅ Updated product test data in Setup-TestData.ps1" -ForegroundColor Green
    
    Write-Host "`nChanges made:" -ForegroundColor Yellow
    Write-Host "  - Removed 'name' field from products" -ForegroundColor White
    Write-Host "  - Removed 'category' field from products" -ForegroundColor White
    Write-Host "  - Added proper 'slug' field" -ForegroundColor White
    Write-Host "  - Added full 'description' field" -ForegroundColor White
}
else {
    Write-Host "❌ Could not find product section to update" -ForegroundColor Red
    Write-Host "   Please manually update the product test data" -ForegroundColor Yellow
}

Write-Host "`n📌 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Re-run the QA tests" -ForegroundColor White
Write-Host "   2. For newsletter issue, check server logs or use lead creation first" -ForegroundColor White
Write-Host "   3. Community features will still fail (expected)" -ForegroundColor White