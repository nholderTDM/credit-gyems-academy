Write-Host "Current directory: $PWD" -ForegroundColor Yellow
Write-Host "PSScriptRoot: $PSScriptRoot" -ForegroundColor Yellow
Write-Host "Looking for Test-Utilities.ps1 at: $PSScriptRoot\Test-Utilities.ps1" -ForegroundColor Yellow

$utilPath = "$PSScriptRoot\Test-Utilities.ps1"
if (Test-Path $utilPath) {
    Write-Host "File exists at: $utilPath" -ForegroundColor Green
    Write-Host "File size: $((Get-Item $utilPath).Length) bytes" -ForegroundColor Green
    Write-Host "Last modified: $((Get-Item $utilPath).LastWriteTime)" -ForegroundColor Green
    
    # Show lines 40-50 which are causing errors
    Write-Host "`nLines 40-50 of the file:" -ForegroundColor Cyan
    Get-Content $utilPath | Select-Object -Skip 39 -First 11 | ForEach-Object { $num = 40 + $_.ReadCount - 1; Write-Host "${num}: $_" }
} else {
    Write-Host "File NOT FOUND at: $utilPath" -ForegroundColor Red
}
