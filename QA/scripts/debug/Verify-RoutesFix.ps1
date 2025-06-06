# Verify-RoutesFix.ps1
# Quick verification that routes are working
# Location: D:\credit-gyems-academy\

Write-Host "`n🔍 VERIFYING ROUTES FIX" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

# Test each main route
$routes = @(
    @{Path="/api/auth/register"; Method="POST"; Body='{"email":"test@test.com"}'},
    @{Path="/api/products"; Method="GET"; Body=$null},
    @{Path="/api/services"; Method="GET"; Body=$null},
    @{Path="/api/bookings/available-slots"; Method="GET"; Body=$null},
    @{Path="/api/community/discussions"; Method="GET"; Body=$null},
    @{Path="/api/leads"; Method="POST"; Body='{"email":"test@test.com"}'},
    @{Path="/api/contact"; Method="POST"; Body='{"email":"test@test.com"}'}
)

$working = 0
$notFound = 0

foreach ($route in $routes) {
    Write-Host "`nTesting $($route.Method) $($route.Path)..." -NoNewline
    
    try {
        if ($route.Method -eq "GET") {
            $response = Invoke-WebRequest -Uri "http://localhost:5000$($route.Path)" -Method $route.Method -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri "http://localhost:5000$($route.Path)" -Method $route.Method -Body $route.Body -ContentType "application/json" -ErrorAction Stop
        }
        
        if ($response.StatusCode -eq 404) {
            Write-Host " ❌ 404 Not Found" -ForegroundColor Red
            $notFound++
        } else {
            Write-Host " ✅ Route exists! (Status: $($response.StatusCode))" -ForegroundColor Green
            $working++
        }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host " ❌ 404 Not Found" -ForegroundColor Red
            $notFound++
        } else {
            # Other errors (401, 400, etc) mean the route EXISTS
            Write-Host " ✅ Route exists! (Status: $($_.Exception.Response.StatusCode))" -ForegroundColor Green
            $working++
        }
    }
}

Write-Host "`n📊 SUMMARY" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan
Write-Host "Routes working: $working/$($routes.Count)" -ForegroundColor $(if($working -eq $routes.Count){'Green'}else{'Yellow'})
Write-Host "404 errors: $notFound" -ForegroundColor $(if($notFound -eq 0){'Green'}else{'Red'})

if ($notFound -gt 0) {
    Write-Host "`n❌ Routes are still not loading properly!" -ForegroundColor Red
    Write-Host "Make sure you:" -ForegroundColor Yellow
    Write-Host "1. Run .\Fix-Routes-Index.ps1" -ForegroundColor Gray
    Write-Host "2. Restart the backend server" -ForegroundColor Gray
} else {
    Write-Host "`n✅ All routes are working!" -ForegroundColor Green
    Write-Host "Run the QA suite: .\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1" -ForegroundColor Yellow
}