# Fix-DuplicateKey.ps1
# Fixes the duplicate 'Message' key issue in Setup-TestData.ps1

$setupTestDataPath = "D:\credit-gyems-academy\QA\scripts\api-tests\Setup-TestData.ps1"

Write-Host "Fixing duplicate key issue in Setup-TestData.ps1..." -ForegroundColor Cyan

# Read the file
$content = Get-Content $setupTestDataPath -Raw

# Common patterns that cause duplicate key issues:
# 1. Adding to hashtable that already has the key
# 2. Using Add() method instead of assignment

# Pattern 1: Look for .Add("Message", ...) or .Add('Message', ...)
if ($content -match '\.Add\([''"]Message[''"]') {
    Write-Host "Found .Add() method with Message key - replacing with assignment" -ForegroundColor Yellow
    $content = $content -replace '(\$\w+)\.Add\([''"]Message[''"]\s*,\s*([^)]+)\)', '$1["Message"] = $2'
}

# Pattern 2: Look for duplicate Message = entries in hashtable literals
$pattern = '@\{[^}]*Message\s*=\s*[^}]*Message\s*=\s*[^}]*\}'
if ($content -match $pattern) {
    Write-Host "Found duplicate Message entries in hashtable" -ForegroundColor Yellow
    # This is more complex, would need specific context
}

# Pattern 3: Fix common response hashtable issues
$content = $content -replace '(\$response\s*=\s*@\{[^}]*)(Message\s*=\s*[^;]+;[^}]*)(Message\s*=\s*[^;]+;)', '$1$2'

# Create backup
$backupPath = "$setupTestDataPath.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
Copy-Item $setupTestDataPath $backupPath -Force
Write-Host "Created backup: $backupPath" -ForegroundColor Gray

# Save the fixed content
$content | Set-Content $setupTestDataPath -Encoding UTF8

Write-Host "Fix applied. Try running the test again." -ForegroundColor Green