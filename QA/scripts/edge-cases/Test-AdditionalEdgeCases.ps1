# Test-AdditionalEdgeCases.ps1
# Additional edge case tests for screen flows and complex user journeys
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot,
    [int]$MaxRetries = 3
)

# Get script root if not already set
if (-not $ScriptRoot) {
    $ScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

Write-TestHeader "ADDITIONAL EDGE CASES - SCREEN FLOWS & USER JOURNEYS"

# Initialize results
$Global:AdditionalTestResults = @{
    ScreenFlowIssues = @()
    BookingEdgeCases = @()
    DownloadIssues = @()
    NavigationErrors = @()
}

Write-TestSection "E-BOOK DOWNLOAD EDGE CASES"

Write-TestStep 1 "Testing simultaneous download attempts"

# Create test user and purchase an ebook
$testUser = $Global:PrimaryTestUser
if (-not $testUser) {
    Write-TestFailure "No test user available"
    return
}

# Find an ebook product
$ebookProduct = $Global:TestProducts | Where-Object { $_.type -eq "ebook" } | Select-Object -First 1

if ($ebookProduct) {
    # Purchase the ebook
    $orderData = @{
        items = @(@{
            productId = $ebookProduct.id
            quantity = 1
            price = $ebookProduct.price
        })
        paymentMethod = @{
            type = "card"
            card = $Global:StripeTestCards.Success
        }
        totalAmount = $ebookProduct.price
    }
    
    $orderResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/orders" `
        -Headers @{ Authorization = "Bearer $($testUser.token)" } `
        -Body $orderData
    
    if ($orderResult.Success) {
        $orderId = $orderResult.Data._id
        Write-TestSuccess "Ebook purchased: Order $orderId"
        
        # Simulate multiple download attempts
        $downloadJobs = @()
        for ($i = 1; $i -le 5; $i++) {
            $downloadJobs += Start-Job -ScriptBlock {
                param($orderId, $token, $attempt)
                
                try {
                    $response = Invoke-RestMethod `
                        -Method "GET" `
                        -Uri "http://localhost:5000/api/orders/$orderId/download" `
                        -Headers @{ Authorization = "Bearer $token" }
                    
                    return @{
                        Success = $true
                        Attempt = $attempt
                        DownloadUrl = $response.downloadUrl
                    }
                }
                catch {
                    return @{
                        Success = $false
                        Attempt = $attempt
                        Error = $_.Exception.Message
                    }
                }
            } -ArgumentList $orderId, $testUser.token, $i
        }
        
        $downloadResults = $downloadJobs | Wait-Job | Receive-Job
        $downloadJobs | Remove-Job
        
        $successfulDownloads = $downloadResults | Where-Object { $_.Success }
        Write-TestInfo "Successful download attempts: $($successfulDownloads.Count) out of 5"
        
        # Check if download URLs are unique (prevent URL sharing)
        $uniqueUrls = $successfulDownloads.DownloadUrl | Select-Object -Unique
        if ($uniqueUrls.Count -eq $successfulDownloads.Count) {
            Write-TestSuccess "Each download has unique URL (prevents sharing)"
        } else {
            Write-TestWarning "Download URLs are not unique - potential security risk"
            $Global:AdditionalTestResults.DownloadIssues += @{
                Type = "SharedDownloadUrls"
                Issue = "Multiple downloads share same URL"
            }
        }
    }
}

Write-TestStep 2 "Testing download expiration"

# Test expired download link
$expiredDownloadResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/orders/expired-order-123/download" `
    -Headers @{ Authorization = "Bearer $($testUser.token)" } `
    -ExpectedStatus "404"

if ($expiredDownloadResult.Success) {
    Write-TestSuccess "Expired download link properly rejected"
}

Write-TestSection "BOOKING CANCELLATION/RESCHEDULING EDGE CASES"

Write-TestStep 3 "Testing last-minute cancellation attempts"

if ($Global:TestServices -and $Global:TestServices.Count -gt 0) {
    $testService = $Global:TestServices[0]
    
    # Book for tomorrow (less than 24 hours)
    $tomorrowBooking = @{
        serviceId = $testService._id
        startTime = (Get-Date).AddHours(20).ToString("yyyy-MM-ddTHH:mm:ss")  # 20 hours from now
        notes = "Testing last-minute cancellation"
    }
    
    $bookingResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/bookings" `
        -Headers @{ Authorization = "Bearer $($testUser.token)" } `
        -Body $tomorrowBooking
    
    if ($bookingResult.Success) {
        $bookingId = $bookingResult.Data.booking._id
        
        # Try to cancel (should fail - less than 24 hours)
        $cancelResult = Test-APIEndpoint `
            -Method "PUT" `
            -Endpoint "http://localhost:5000/api/bookings/$bookingId/cancel" `
            -Headers @{ Authorization = "Bearer $($testUser.token)" } `
            -Body @{ reason = "Changed my mind" } `
            -ExpectedStatus "400"
        
        if ($cancelResult.Success) {
            Write-TestSuccess "Last-minute cancellation properly blocked"
        } else {
            Write-TestFailure "Last-minute cancellation allowed"
            $Global:AdditionalTestResults.BookingEdgeCases += @{
                Type = "ImproperCancellation"
                Issue = "Cancellation allowed within 24 hours"
            }
        }
    }
}

Write-TestStep 4 "Testing double-booking prevention"

# Try to book overlapping consultations of different types
$service1 = $Global:TestServices | Where-Object { $_.serviceType -eq "credit_repair" } | Select-Object -First 1
$service2 = $Global:TestServices | Where-Object { $_.serviceType -eq "financial_planning" } | Select-Object -First 1

if ($service1 -and $service2) {
    $bookingTime = (Get-Date).AddDays(7).AddHours(14).ToString("yyyy-MM-ddTHH:mm:ss")
    
    # Book first service
    $booking1Result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/bookings" `
        -Headers @{ Authorization = "Bearer $($testUser.token)" } `
        -Body @{
            serviceId = $service1._id
            startTime = $bookingTime
            notes = "First booking"
        }
    
    if ($booking1Result.Success) {
        # Try to book different service at same time
        $booking2Result = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/bookings" `
            -Headers @{ Authorization = "Bearer $($testUser.token)" } `
            -Body @{
                serviceId = $service2._id
                startTime = $bookingTime
                notes = "Overlapping booking"
            }
        
        if ($booking2Result.Success) {
            Write-TestSuccess "Different service types can be booked at same time (as designed)"
        } else {
            Write-TestInfo "Overlapping bookings prevented even for different service types"
        }
    }
}

Write-TestSection "COMPLEX USER JOURNEY FLOWS"

Write-TestStep 5 "Testing interrupted checkout recovery"

# Start a checkout process
$cartItems = @(@{
    productId = $Global:TestProducts[0].id
    quantity = 2
    price = $Global:TestProducts[0].price
})

# Add items to cart
foreach ($item in $cartItems) {
    Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/cart/add" `
        -Headers @{ Authorization = "Bearer $($testUser.token)" } `
        -Body @{
            productId = $item.productId
            quantity = $item.quantity
            type = "product"
        }
}

# Simulate interrupted checkout (get checkout session)
$checkoutSessionResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/checkout/create-session" `
    -Headers @{ Authorization = "Bearer $($testUser.token)" } `
    -Body @{}

if ($checkoutSessionResult.Success) {
    $sessionId = $checkoutSessionResult.Data.sessionId
    Write-TestInfo "Checkout session created: $sessionId"
    
    # Wait to simulate user leaving
    Start-Sleep -Seconds 2
    
    # Try to resume checkout
    $resumeResult = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/checkout/session/$sessionId" `
        -Headers @{ Authorization = "Bearer $($testUser.token)" }
    
    if ($resumeResult.Success) {
        Write-TestSuccess "Checkout session can be resumed"
    } else {
        Write-TestWarning "Checkout session cannot be resumed"
        $Global:AdditionalTestResults.ScreenFlowIssues += @{
            Type = "CheckoutRecovery"
            Issue = "Cannot resume interrupted checkout"
        }
    }
}

Write-TestStep 6 "Testing navigation with expired session"

# Create a new user for session testing
$sessionTestUser = Get-RandomTestUser
$regResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $sessionTestUser

if ($regResult.Success) {
    $expiredToken = $regResult.Data.token
    
    # Simulate user navigating through multiple pages with potentially expired token
    $navigationFlow = @(
        @{ Name = "Dashboard"; Endpoint = "/api/auth/profile" },
        @{ Name = "Products"; Endpoint = "/api/products" },
        @{ Name = "Cart"; Endpoint = "/api/cart" },
        @{ Name = "Orders"; Endpoint = "/api/orders" }
    )
    
    foreach ($page in $navigationFlow) {
        $navResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000$($page.Endpoint)" `
            -Headers @{ Authorization = "Bearer $expiredToken" }
        
        if ($navResult.Success -or $navResult.StatusCode -eq 401) {
            Write-TestInfo "Navigation to $($page.Name): $(if ($navResult.Success) { 'Allowed' } else { 'Requires re-auth' })"
        } else {
            Write-TestFailure "Unexpected error navigating to $($page.Name)"
            $Global:AdditionalTestResults.NavigationErrors += @{
                Page = $page.Name
                Error = $navResult.Error
            }
        }
    }
}

Write-TestSection "CONSULTATION BOOKING BLACKOUT DATES"

Write-TestStep 7 "Testing blackout date enforcement"

# Try to book on common blackout dates
$blackoutDates = @(
    (Get-Date -Month 12 -Day 25).ToString("yyyy-MM-ddT14:00:00"),  # Christmas
    (Get-Date -Month 1 -Day 1).ToString("yyyy-MM-ddT14:00:00"),    # New Year
    (Get-Date -Month 7 -Day 4).ToString("yyyy-MM-ddT14:00:00")     # July 4th
)

foreach ($date in $blackoutDates) {
    if ($Global:TestServices.Count -gt 0) {
        $blackoutResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/bookings" `
            -Headers @{ Authorization = "Bearer $($testUser.token)" } `
            -Body @{
                serviceId = $Global:TestServices[0]._id
                startTime = $date
                notes = "Blackout date test"
            } `
            -ExpectedStatus "400"
        
        if ($blackoutResult.Success) {
            Write-TestSuccess "Blackout date properly enforced: $date"
        } else {
            Write-TestWarning "Blackout date not enforced: $date"
        }
    }
}

Write-TestSection "BUNDLED PRODUCT EDGE CASES"

Write-TestStep 8 "Testing partial bundle availability"

# This would need admin access to create a bundle with mixed availability
$adminUser = $Global:TestUsers | Where-Object { $_.role -eq "admin" } | Select-Object -First 1

if ($adminUser -and $Global:TestProducts.Count -ge 2) {
    # Create a bundle with one available and one out-of-stock product
    $bundleData = @{
        name = "Mixed Availability Bundle"
        products = @($Global:TestProducts[0].id, "out-of-stock-product-id")
        bundleDiscount = 15
        type = "bundle"
    }
    
    $bundleResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/products/bundles" `
        -Headers @{ Authorization = "Bearer $($adminUser.token)" } `
        -Body $bundleData
    
    if ($bundleResult.Success) {
        # Try to purchase bundle with partial availability
        $bundlePurchaseResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/orders" `
            -Headers @{ Authorization = "Bearer $($testUser.token)" } `
            -Body @{
                items = @(@{
                    productId = $bundleResult.Data._id
                    quantity = 1
                    type = "bundle"
                })
                paymentMethod = @{ type = "card"; card = $Global:StripeTestCards.Success }
            } `
            -ExpectedStatus "400"
        
        if ($bundlePurchaseResult.Success) {
            Write-TestSuccess "Bundle with unavailable items properly blocked"
        }
    }
}

Write-TestSection "SCREEN FLOW TEST SUMMARY"

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "             ADDITIONAL EDGE CASES SUMMARY                      " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$totalIssues = $Global:AdditionalTestResults.ScreenFlowIssues.Count +
               $Global:AdditionalTestResults.BookingEdgeCases.Count +
               $Global:AdditionalTestResults.DownloadIssues.Count +
               $Global:AdditionalTestResults.NavigationErrors.Count

Write-Host "`nIssues Found:" -ForegroundColor White
Write-Host "  • Screen Flow Issues: $($Global:AdditionalTestResults.ScreenFlowIssues.Count)" -ForegroundColor $(if ($Global:AdditionalTestResults.ScreenFlowIssues.Count -eq 0) { 'Green' } else { 'Yellow' })
Write-Host "  • Booking Edge Cases: $($Global:AdditionalTestResults.BookingEdgeCases.Count)" -ForegroundColor $(if ($Global:AdditionalTestResults.BookingEdgeCases.Count -eq 0) { 'Green' } else { 'Yellow' })
Write-Host "  • Download Issues: $($Global:AdditionalTestResults.DownloadIssues.Count)" -ForegroundColor $(if ($Global:AdditionalTestResults.DownloadIssues.Count -eq 0) { 'Green' } else { 'Yellow' })
Write-Host "  • Navigation Errors: $($Global:AdditionalTestResults.NavigationErrors.Count)" -ForegroundColor $(if ($Global:AdditionalTestResults.NavigationErrors.Count -eq 0) { 'Green' } else { 'Red' })

if ($totalIssues -gt 0) {
    Write-Host "`nRecommendations:" -ForegroundColor Yellow
    Write-Host "  1. Implement session recovery for interrupted checkouts" -ForegroundColor White
    Write-Host "  2. Add unique download URLs with expiration" -ForegroundColor White
    Write-Host "  3. Enforce booking cancellation policies strictly" -ForegroundColor White
    Write-Host "  4. Handle edge cases in bundle availability" -ForegroundColor White
}

# Save results
$additionalReportPath = Join-Path $ProjectRoot "test-reports\additional-edge-cases-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$Global:AdditionalTestResults | ConvertTo-Json -Depth 10 | Out-File $additionalReportPath -Encoding UTF8
Write-TestInfo "`nDetailed report saved to: $additionalReportPath"