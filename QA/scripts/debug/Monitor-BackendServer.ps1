# Monitor-BackendServer.ps1
# Run this in a separate terminal to monitor the backend server

Write-Host "Monitoring Backend Server..." -ForegroundColor Cyan
while ($true) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop -TimeoutSec 2
        Write-Host "[$timestamp] ✅ Server OK - MongoDB: $($health.mongodb)" -ForegroundColor Green
    } catch {
        Write-Host "[$timestamp] ❌ Server Down - $($_.Exception.Message)" -ForegroundColor Red
    }
    Start-Sleep -Seconds 5
}
