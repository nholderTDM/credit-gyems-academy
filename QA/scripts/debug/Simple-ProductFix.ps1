# Simple-ProductFix.ps1
# Simple approach to fix product test data
# Run from project root

param(
    [string]$ProjectRoot = (Get-Location).Path
)

Write-Host "`n🔧 Fixing Product Test Data (Simple Approach)..." -ForegroundColor Cyan

$setupTestDataPath = Join-Path $ProjectRoot "scripts\TS_CGA_v1\Setup-TestData.ps1"

# Read the file
$lines = Get-Content $setupTestDataPath

# Find the line with $testProducts
$startIndex = -1
$endIndex = -1

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\$testProducts = @\(') {
        $startIndex = $i
    }
    if ($startIndex -ne -1 -and $lines[$i] -match '^foreach \(\$product in \$testProducts\)') {
        $endIndex = $i - 1
        break
    }
}

if ($startIndex -ne -1 -and $endIndex -ne -1) {
    Write-Host "Found product section at lines $startIndex to $endIndex" -ForegroundColor Gray
    
    # Create new product section
    $newProductLines = @(
        '$testProducts = @(',
        '    @{',
        '        type = "ebook"',
        '        title = "Credit Repair Mastery Guide"',
        '        slug = "credit-repair-mastery-guide"',
        '        description = "Complete guide to repairing your credit score with proven strategies and step-by-step instructions"',
        '        price = 49.99',
        '        shortDescription = "Transform your credit score with proven strategies"',
        '        features = @("10 Chapter Guide", "Worksheets Included", "Lifetime Access")',
        '        status = "published"',
        '    },',
        '    @{',
        '        type = "ebook"',
        '        title = "Financial Freedom Blueprint"',
        '        slug = "financial-freedom-blueprint"',
        '        description = "Step-by-step roadmap to financial independence with practical strategies for wealth building"',
        '        price = 79.99',
        '        shortDescription = "Your path to financial freedom starts here"',
        '        features = @("15 Chapters", "Video Tutorials", "Monthly Updates")',
        '        status = "published"',
        '    },',
        '    @{',
        '        type = "masterclass"',
        '        title = "Credit Coaching Masterclass"',
        '        slug = "credit-coaching-masterclass"',
        '        description = "Live masterclass with Coach Tae covering advanced credit repair strategies and Q&A session"',
        '        price = 299.99',
        '        shortDescription = "Interactive session with credit expert"',
        '        eventDate = (Get-Date).AddDays(14).ToString("yyyy-MM-dd")',
        '        duration = 120',
        '        capacity = 50',
        '        status = "published"',
        '    }',
        ')'
    )
    
    # Create backup
    $backupPath = $setupTestDataPath + ".backup_" + (Get-Date -Format "yyyyMMddHHmmss")
    Copy-Item $setupTestDataPath $backupPath -Force
    Write-Host "✅ Created backup: $backupPath" -ForegroundColor Green
    
    # Build new content
    $newContent = @()
    
    # Add lines before products
    for ($i = 0; $i -lt $startIndex; $i++) {
        $newContent += $lines[$i]
    }
    
    # Add new product lines
    $newContent += $newProductLines
    
    # Add lines after products
    for ($i = $endIndex + 1; $i -lt $lines.Count; $i++) {
        $newContent += $lines[$i]
    }
    
    # Write back
    $newContent | Out-File $setupTestDataPath -Encoding UTF8
    Write-Host "✅ Updated product test data successfully" -ForegroundColor Green
    
    Write-Host "`nChanges made:" -ForegroundColor Yellow
    Write-Host "  - Removed 'name' field from all products" -ForegroundColor White
    Write-Host "  - Removed 'category' field from all products" -ForegroundColor White
    Write-Host "  - Ensured all required fields are present" -ForegroundColor White
    Write-Host "  - Added proper slug values" -ForegroundColor White
}
else {
    Write-Host "❌ Could not find product section in file" -ForegroundColor Red
    Write-Host "   Please manually update the product test data" -ForegroundColor Yellow
}

Write-Host "`n📌 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run Fix-NewsletterSource.ps1 to fix the newsletter issue" -ForegroundColor White
Write-Host "   2. Re-run the QA tests" -ForegroundColor White