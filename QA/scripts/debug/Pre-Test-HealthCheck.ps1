# Pre-Test-HealthCheck.ps1
# Run this before tests to ensure server is stable

Write-Host "🏥 Running pre-test health check..." -ForegroundColor Cyan

$checks = @(
    @{Name = "Server Response"; Endpoint = "http://localhost:5000/api/health"},
    @{Name = "Auth Endpoint"; Endpoint = "http://localhost:5000/api/auth/login"; Method = "POST"; Body = @{email="test@test.com"; password="test"}; ExpectFail = $true},
    @{Name = "Products Endpoint"; Endpoint = "http://localhost:5000/api/products"; Method = "GET"}
)

$allPassed = $true

foreach ($check in $checks) {
    Write-Host "  Checking $($check.Name)..." -NoNewline
    
    try {
        $params = @{
            Uri = $check.Endpoint
            Method = $check.Method ?? "GET"
            ErrorAction = "Stop"
        }
        
        if ($check.Body) {
            $params.Body = ($check.Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host " ✅" -ForegroundColor Green
    } catch {
        if ($check.ExpectFail) {
            Write-Host " ✅ (Expected failure)" -ForegroundColor Green
        } else {
            Write-Host " ❌" -ForegroundColor Red
            $allPassed = $false
        }
    }
}

if ($allPassed) {
    Write-Host "`n✅ All health checks passed!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Some health checks failed!" -ForegroundColor Red
}

return $allPassed
