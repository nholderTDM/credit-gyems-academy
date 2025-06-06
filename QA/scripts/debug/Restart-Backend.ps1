Write-Host "Stopping backend server..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*credit-gyems*" } | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Starting backend server..." -ForegroundColor Yellow
Push-Location backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Minimized
Pop-Location

Write-Host "Waiting for server to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "✅ Server restarted!" -ForegroundColor Green
