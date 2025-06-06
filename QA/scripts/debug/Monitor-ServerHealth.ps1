# Monitor-ServerHealth.ps1
# Run this in a separate terminal while running tests

param(
    [int]$IntervalSeconds = 5,
    [int]$DurationMinutes = 10
)

$endTime = (Get-Date).AddMinutes($DurationMinutes)

Write-Host "🔍 Monitoring server health for $DurationMinutes minutes..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray

while ((Get-Date) -lt $endTime) {
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 5 | Out-Null
        $dbHealth = Invoke-RestMethod -Uri "http://localhost:5000/api/health/db" -TimeoutSec 5
        
        $connections = (netstat -an | Select-String ":5000" | Where-Object { $_ -match "ESTABLISHED" }).Count
        $timeWait = (netstat -an | Select-String ":5000" | Where-Object { $_ -match "TIME_WAIT" }).Count
        
        Clear-Host
        Write-Host "📊 SERVER HEALTH STATUS - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
        Write-Host "================================" -ForegroundColor Cyan
        Write-Host "Status: $($health.status)" -ForegroundColor Green
        Write-Host "MongoDB: $($health.mongodb)" -ForegroundColor $(if ($health.mongodb -eq 'connected') { 'Green' } else { 'Red' })
        Write-Host "DB Query: $($dbHealth.database.canQuery)" -ForegroundColor $(if ($dbHealth.database.canQuery) { 'Green' } else { 'Red' })
        Write-Host ""
        Write-Host "CONNECTIONS:" -ForegroundColor Yellow
        Write-Host "  Active: $connections"
        Write-Host "  TIME_WAIT: $timeWait"
        
        if ($timeWait -gt 50) {
            Write-Host "  ⚠️ High TIME_WAIT count detected!" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Server not responding!" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Gray
    }
    
    Start-Sleep -Seconds $IntervalSeconds
}
