# Verify-CreditGyemsRoutes.ps1
$projectRoot = "D:\credit-gyems-academy"
$frontendPath = Join-Path $projectRoot "frontend\src"
$appFilePath = Join-Path $frontendPath "App.jsx"

# Get all JSX page files
$pageFiles = Get-ChildItem -Path (Join-Path $frontendPath "pages") -Recurse -Include *.jsx

# Extract component names
$pageComponents = $pageFiles | ForEach-Object { $_.BaseName }

# Load App.jsx contents
$appContents = Get-Content $appFilePath -Raw

Write-Host "`n📦 Found $($pageComponents.Count) JSX components under /pages/..." -ForegroundColor Cyan

# Compare with App.jsx
$missingRoutes = @()
foreach ($component in $pageComponents) {
    if ($appContents -notmatch $component) {
        $missingRoutes += $component
    }
}

if ($missingRoutes.Count -eq 0) {
    Write-Host "`n✅ All components appear to be routed in App.jsx." -ForegroundColor Green
} else {
    Write-Host "`n⚠️ The following components are NOT referenced in App.jsx:" -ForegroundColor Yellow
    $missingRoutes | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
}