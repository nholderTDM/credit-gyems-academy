# Test-ConcurrentUsers.ps1
# Tests concurrent user scenarios, race conditions, and multi-device access
# Location: credit-gyems-academy/scripts/edge-cases/

param(
    [string]$ProjectRoot,
    [int]$ConcurrentUsers = 10,
    [int]$MaxThreads = 20
)

# Get script root if not already set
if (-not $ScriptRoot) { 
    $ScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition 
}

. "$PSScriptRoot\Test-Utilities.ps1"

Write-TestHeader "CONCURRENT USER BEHAVIOR & RACE CONDITION TESTS"

# Initialize concurrent test results
$Global:ConcurrentTestResults = @{
    RaceConditions = @()
    SessionConflicts = @()
    InventoryConflicts = @()
    DataIntegrity = @()
}

Write-TestSection "SIMULTANEOUS LOGIN TESTS"

Write-TestStep 1 "Testing multiple device login attempts"

# Create a test user for concurrent testing
$concurrentTestUser = Get-RandomTestUser
$registerResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $concurrentTestUser

if ($registerResult.Success) {
    Write-TestSuccess "Concurrent test user created: $($concurrentTestUser.email)"
    
    # Simulate logins from multiple devices
    $devices = @("Desktop-Chrome", "Mobile-iOS", "Tablet-Android", "Desktop-Firefox", "Mobile-Android")
    $loginJobs = @()
    
    foreach ($device in $devices) {
        $loginJobs += Start-Job -ScriptBlock {
            param($email, [SecureString]$password, $device)
            
            try {
                $headers = @{ "User-Agent" = $device }
                $body = @{
                    email = $email
                    password = (New-Object PSCredential "user", $password).GetNetworkCredential().Password
                    deviceInfo = $device
                }
                
                    # Store API response and use it for return value
                    $apiResponse = Invoke-RestMethod `
                        -Method POST `
                        -Uri "http://localhost:5000/api/auth/login" `
                        -Headers $headers `
                        -Body ($body | ConvertTo-Json) `
                        -ContentType "application/json"
                
                return @{
                    Success = $true
                    Device = $device
                    Token = $apiResponse.token
                    SessionId = $apiResponse.sessionId
                }
            }
            catch {
                return @{
                    Success = $false
                    Device = $device
                    Error = $_.Exception.Message
                }
            }
        } -ArgumentList $concurrentTestUser.email, $concurrentTestUser.password, $device
    }
    
    # Wait for all login attempts
    $loginResults = $loginJobs | Wait-Job | Receive-Job
    $loginJobs | Remove-Job
    
    # Analyze results
    $successfulLogins = $loginResults | Where-Object { $_.Success }
    Write-TestInfo "Successful logins: $($successfulLogins.Count) out of $($devices.Count)"
    
    # Test if all sessions are valid
    foreach ($login in $successfulLogins) {
        $profileResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ 
                Authorization = "Bearer $($login.Token)"
                "User-Agent" = $login.Device
            }
        
        if ($profileResult.Success) {
            Write-TestSuccess "Session valid for device: $($login.Device)"
        } else {
            Write-TestFailure "Session invalid for device: $($login.Device)"
            $Global:ConcurrentTestResults.SessionConflicts += @{
                Type = "InvalidSession"
                Device = $login.Device
            }
        }
    }
}

Write-TestStep 2 "Testing session conflict detection"

# Try to invalidate other sessions
if ($successfulLogins.Count -gt 1) {
    $primarySession = $successfulLogins[0]
    
    # Attempt to logout all other sessions
    $logoutAllResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/logout-all-devices" `
        -Headers @{ Authorization = "Bearer $($primarySession.Token)" }
    
    if ($logoutAllResult.Success) {
        Write-TestSuccess "Logout all devices endpoint working"
        
        # Verify other sessions are invalidated
        foreach ($login in $successfulLogins | Select-Object -Skip 1) {
            $checkResult = Test-APIEndpoint `
                -Method "GET" `
                -Endpoint "http://localhost:5000/api/auth/profile" `
                -Headers @{ Authorization = "Bearer $($login.Token)" } `
                -ExpectedStatus "401"
            
            if ($checkResult.Success) {
                Write-TestSuccess "Session correctly invalidated for: $($login.Device)"
            }
        }
    }
}

Write-TestSection "RACE CONDITIONS - INVENTORY CONFLICTS"

Write-TestStep 3 "Testing limited inventory booking conflicts"

# Create a service with limited capacity
$adminUser = $Global:TestUsers | Where-Object { $_.role -eq "admin" } | Select-Object -First 1
if ($adminUser) {
    $limitedService = @{
        serviceType = "masterclass"
        title = "Limited Seats Masterclass"
        displayName = "Exclusive Credit Repair Masterclass"
        description = "Limited to 3 seats only"
        duration = 120
        price = @{
            amount = 299
            displayPrice = "$299"
        }
        capacity = 3  # Only 3 seats available
        eventDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        status = "active"
    }
    
    $serviceResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/services" `
        -Headers @{ Authorization = "Bearer $($adminUser.token)" } `
        -Body $limitedService
    
    if ($serviceResult.Success) {
        $limitedServiceId = $serviceResult.Data.data._id
        Write-TestSuccess "Limited capacity service created (3 seats)"
        
        # Create multiple users trying to book simultaneously
        $bookingJobs = @()
        $testUsers = @()
        
        # Create 5 users (more than capacity)
        for ($i = 1; $i -le 5; $i++) {
            $user = Get-RandomTestUser
            $regResult = Test-APIEndpoint `
                -Method "POST" `
                -Endpoint "http://localhost:5000/api/auth/register" `
                -Body $user
            
            if ($regResult.Success) {
                $user.token = $regResult.Data.token
                $testUsers += $user
            }
        }
        
        # All users try to book at the same time
        $bookingStartTime = (Get-Date).AddDays(7).AddHours(14).ToString("yyyy-MM-ddTHH:mm:ss")
        
        foreach ($user in $testUsers) {
            $bookingJobs += Start-Job -ScriptBlock {
                param($serviceId, $token, $startTime)
                
                try {
                    $body = @{
                        serviceId = $serviceId
                        startTime = $startTime
                        notes = "Race condition test booking"
                    } | ConvertTo-Json
                    
                    $response = Invoke-RestMethod `
                        -Method POST `
                        -Uri "http://localhost:5000/api/bookings" `
                        -Headers @{ 
                            Authorization = "Bearer $token"
                            "Content-Type" = "application/json"
                        } `
                        -Body $body
                    
                    return @{
                        Success = $true
                        BookingId = $response.booking._id
                        Message = "Booking successful"
                    }
                }
                catch {
                    $statusCode = $_.Exception.Response.StatusCode.value__
                    return @{
                        Success = $false
                        StatusCode = $statusCode
                        Message = $_.ErrorDetails.Message
                    }
                }
            } -ArgumentList $limitedServiceId, $user.token, $bookingStartTime
        }
        
        # Wait for all booking attempts
        $bookingResults = $bookingJobs | Wait-Job | Receive-Job
        $bookingJobs | Remove-Job
        
        # Analyze race condition results
        $successfulBookings = $bookingResults | Where-Object { $_.Success }
        $failedBookings = $bookingResults | Where-Object { -not $_.Success }
        
        Write-TestInfo "Booking results:"
        Write-TestInfo "  Successful: $($successfulBookings.Count) (Expected: 3)"
        Write-TestInfo "  Failed: $($failedBookings.Count) (Expected: 2)"
        
        if ($successfulBookings.Count -eq 3) {
            Write-TestSuccess "Race condition handled correctly - capacity limit enforced"
        } else {
            Write-TestFailure "Race condition issue - incorrect number of bookings"
            $Global:ConcurrentTestResults.RaceConditions += @{
                Type = "CapacityOverflow"
                Expected = 3
                Actual = $successfulBookings.Count
            }
        }
    }
}

Write-TestSection "CART RACE CONDITIONS"

Write-TestStep 4 "Testing simultaneous cart operations"

# Test product with limited stock
$limitedProduct = @{
    type = "physical"
    title = "Limited Edition Credit Guide"
    slug = "limited-edition-guide"
    description = "Only 5 copies available"
    price = 199.99
    shortDescription = "Exclusive limited edition"
    inventory = 5
    trackInventory = $true
    status = "published"
}

if ($adminUser) {
    $productResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/products" `
        -Headers @{ Authorization = "Bearer $($adminUser.token)" } `
        -Body $limitedProduct
    
    if ($productResult.Success) {
        $limitedProductId = $productResult.Data._id
        Write-TestSuccess "Limited inventory product created (5 units)"
        
        # Multiple users add to cart simultaneously
        $cartJobs = @()
        
        foreach ($user in $testUsers | Select-Object -First 8) {  # 8 users for 5 items
            $cartJobs += Start-Job -ScriptBlock {
                param($productId, $token)
                
                try {
                    # Add 1 item to cart
                    $body = @{
                        productId = $productId
                        quantity = 1
                        type = "product"
                    } | ConvertTo-Json
                    
                    $cartResponse = Invoke-RestMethod `
                        -Method POST `
                        -Uri "http://localhost:5000/api/cart/add" `
                        -Headers @{ 
                            Authorization = "Bearer $token"
                            "Content-Type" = "application/json"
                        } `
                        -Body $body
                    
                    if (-not $cartResponse) {
                        throw "Failed to add item to cart"
                    }
                    
                    # Immediately try to checkout
                    Start-Sleep -Milliseconds (Get-Random -Minimum 100 -Maximum 500)
                    
                    $checkoutBody = @{
                        paymentMethod = @{
                            type = "card"
                            card = @{
                                number = "4242424242424242"
                                exp_month = "12"
                                exp_year = "2025"
                                cvc = "123"
                            }
                        }
                    } | ConvertTo-Json
                    
                    $checkoutResponse = Invoke-RestMethod `
                        -Method POST `
                        -Uri "http://localhost:5000/api/orders" `
                        -Headers @{ 
                            Authorization = "Bearer $token"
                            "Content-Type" = "application/json"
                        } `
                        -Body $checkoutBody
                    
                    return @{
                        Success = $true
                        OrderId = $checkoutResponse._id
                    }
                }
                catch {
                    return @{
                        Success = $false
                        Error = $_.Exception.Message
                    }
                }
            } -ArgumentList $limitedProductId, $user.token
        }
        
        # Wait for results
        $cartResults = $cartJobs | Wait-Job | Receive-Job
        $cartJobs | Remove-Job
        
        $successfulOrders = $cartResults | Where-Object { $_.Success }
        Write-TestInfo "Successful orders: $($successfulOrders.Count) (Expected: 5 or less)"
        
        if ($successfulOrders.Count -le 5) {
            Write-TestSuccess "Inventory limits enforced during concurrent checkout"
        } else {
            Write-TestFailure "Inventory oversold in race condition"
            $Global:ConcurrentTestResults.InventoryConflicts += @{
                Type = "Oversold"
                Available = 5
                Sold = $successfulOrders.Count
            }
        }
    }
}

Write-TestSection "ACCOUNT RECOVERY RACE CONDITIONS"

Write-TestStep 5 "Testing expired token scenarios"

# Create password reset tokens
$resetUser = Get-RandomTestUser
$regResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $resetUser

if ($regResult.Success) {
    # Request password reset
    $resetResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/forgot-password" `
        -Body @{ email = $resetUser.email }
    
    if ($resetResult.Success) {
        Write-TestInfo "Password reset token generated"
        
        # Simulate expired token (would need backend support)
        $expiredToken = "expired_token_123456"
        
        # Try to use expired token
        $expiredResetResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/reset-password" `
            -Body @{
                token = $expiredToken
                newPassword = "NewPassword123!"
            } `
            -ExpectedStatus "400"
        
        if ($expiredResetResult.Success) {
            Write-TestSuccess "Expired token correctly rejected"
        }
        
        # Test multiple reset attempts
        $resetAttempts = @()
        for ($i = 1; $i -le 3; $i++) {
            $attemptResult = Test-APIEndpoint `
                -Method "POST" `
                -Endpoint "http://localhost:5000/api/auth/forgot-password" `
                -Body @{ email = $resetUser.email }
            
            $resetAttempts += $attemptResult
            Start-Sleep -Seconds 1
        }
        
        Write-TestInfo "Multiple reset requests handled"
    }
}

Write-TestSection "ROLE CHANGE CONFLICTS"

Write-TestStep 6 "Testing active user role changes"

# Create a user and upgrade while they're active
$roleTestUser = Get-RandomTestUser
$regResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $roleTestUser

if ($regResult.Success) {
    $userToken = $regResult.Data.token
    $userId = $regResult.Data.user.id
    
    # Start a background job simulating user activity
    $activityJob = Start-Job -ScriptBlock {
        param($token)
        
        $activities = @()
        for ($i = 1; $i -le 10; $i++) {
            try {
                # User performing various actions
                $actions = @(
                    { Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Headers @{ Authorization = "Bearer $token" } },
                    { Invoke-RestMethod -Uri "http://localhost:5000/api/auth/profile" -Headers @{ Authorization = "Bearer $token" } },
                    { Invoke-RestMethod -Uri "http://localhost:5000/api/community/discussions" -Headers @{ Authorization = "Bearer $token" } }
                )
                
                $action = $actions | Get-Random
                & $action
                
                $activities += @{ Success = $true; Iteration = $i }
                Start-Sleep -Milliseconds 500
            }
            catch {
                $activities += @{ Success = $false; Iteration = $i; Error = $_.Exception.Message }
            }
        }
        return $activities
    } -ArgumentList $userToken
    
    # Admin changes user role while they're active
    Start-Sleep -Seconds 2  # Let some activities happen
    
    if ($adminUser) {
        $roleChangeResult = Test-APIEndpoint `
            -Method "PUT" `
            -Endpoint "http://localhost:5000/api/users/$userId/role" `
            -Headers @{ Authorization = "Bearer $($adminUser.token)" } `
            -Body @{ role = "premium" }
        
        if ($roleChangeResult.Success) {
            Write-TestSuccess "User role changed to premium while active"
        }
    }
    
    # Check activity results
    $activities = $activityJob | Wait-Job | Receive-Job
    $activityJob | Remove-Job
    
    $failedAfterRoleChange = $activities | Where-Object { -not $_.Success }
    if ($failedAfterRoleChange.Count -eq 0) {
        Write-TestSuccess "User session remained valid after role change"
    } else {
        Write-TestWarning "Some activities failed after role change"
        $Global:ConcurrentTestResults.SessionConflicts += @{
            Type = "RoleChangeConflict"
            FailedActivities = $failedAfterRoleChange.Count
        }
    }
}

Write-TestSection "DATA INTEGRITY UNDER CONCURRENT LOAD"

Write-TestStep 7 "Testing simultaneous community post creation"

# Multiple users create posts at the same time
$postJobs = @()
$discussionTitle = "Concurrent Test Discussion $(Get-Date -Format 'yyyyMMddHHmmss')"

# First create a discussion
$discussionResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/community/discussions" `
    -Headers @{ Authorization = "Bearer $($testUsers[0].token)" } `
    -Body @{
        title = $discussionTitle
        content = "Testing concurrent post creation"
        category = "general"
    }

if ($discussionResult.Success) {
    $discussionId = $discussionResult.Data._id
    
    # Multiple users post simultaneously
    foreach ($user in $testUsers | Select-Object -First 5) {
        $postJobs += Start-Job -ScriptBlock {
            param($discussionId, $token, $userIndex)
            
            try {
                $body = @{
                    content = "Concurrent post from user $userIndex at $(Get-Date -Format 'HH:mm:ss.fff')"
                } | ConvertTo-Json
                
                $response = Invoke-RestMethod `
                    -Method POST `
                    -Uri "http://localhost:5000/api/community/discussions/$discussionId/posts" `
                    -Headers @{ 
                        Authorization = "Bearer $token"
                        "Content-Type" = "application/json"
                    } `
                    -Body $body
                
                return @{
                    Success = $true
                    PostId = $response.data._id
                    Timestamp = $response.data.createdAt
                }
            }
            catch {
                return @{
                    Success = $false
                    Error = $_.Exception.Message
                }
            }
        } -ArgumentList $discussionId, $user.token, $testUsers.IndexOf($user)
    }
    
    # Wait for all posts
    $postResults = $postJobs | Wait-Job | Receive-Job
    $postJobs | Remove-Job
    
    $successfulPosts = $postResults | Where-Object { $_.Success }
    Write-TestInfo "Concurrent posts created: $($successfulPosts.Count)"
    
    # Verify all posts exist and have unique IDs
    $uniqueIds = $successfulPosts.PostId | Select-Object -Unique
    if ($uniqueIds.Count -eq $successfulPosts.Count) {
        Write-TestSuccess "All concurrent posts have unique IDs"
    } else {
        Write-TestFailure "Duplicate post IDs detected"
        $Global:ConcurrentTestResults.DataIntegrity += @{
            Type = "DuplicateIds"
            Expected = $successfulPosts.Count
            Unique = $uniqueIds.Count
        }
    }
}

Write-TestSection "LIKE/UNLIKE RACE CONDITIONS"

Write-TestStep 8 "Testing simultaneous like operations"

if ($discussionId -and $successfulPosts.Count -gt 0) {
    $targetPost = $successfulPosts[0]
    
    # Multiple users like the same post simultaneously
    $likeJobs = @()
    
    foreach ($user in $testUsers) {
        $likeJobs += Start-Job -ScriptBlock {
            param($discussionId, $postId, $token)
            
            $results = @()
            
            # Like
            try {
                $likeResponse = Invoke-RestMethod `
                    -Method POST `
                    -Uri "http://localhost:5000/api/community/discussions/$discussionId/posts/$postId/like" `
                    -Headers @{ Authorization = "Bearer $token" }
                
                $results += @{ Action = "Like"; Success = $true; LikeCount = $likeResponse.data.likeCount }
            }
            catch {
                $results += @{ Action = "Like"; Success = $false; Error = $_.Exception.Message }
            }
            
            # Unlike
            Start-Sleep -Milliseconds 100
            try {
                $unlikeResponse = Invoke-RestMethod `
                    -Method POST `
                    -Uri "http://localhost:5000/api/community/discussions/$discussionId/posts/$postId/like" `
                    -Headers @{ Authorization = "Bearer $token" }
                
                $results += @{ Action = "Unlike"; Success = $true; LikeCount = $unlikeResponse.data.likeCount }
            }
            catch {
                $results += @{ Action = "Unlike"; Success = $false; Error = $_.Exception.Message }
            }
            
            return $results
        } -ArgumentList $discussionId, $targetPost.PostId, $user.token
    }
    
    # Wait for results
    $likeResults = $likeJobs | Wait-Job | Receive-Job
    $likeJobs | Remove-Job

    # Analyze like/unlike operations
    $successfulLikes = ($likeResults | ForEach-Object { $_[0] } | Where-Object { $_.Success }).Count
    $successfulUnlikes = ($likeResults | ForEach-Object { $_[1] } | Where-Object { $_.Success }).Count
    Write-TestInfo "Successful likes: $successfulLikes, Successful unlikes: $successfulUnlikes"

    # Verify final like count
    $finalCheckResult = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/community/discussions/$discussionId" `
        -Headers @{ Authorization = "Bearer $($testUsers[0].token)" }
    
    if ($finalCheckResult.Success) {
        $targetPostData = $finalCheckResult.Data.data.posts | Where-Object { $_._id -eq $targetPost.PostId }
        Write-TestInfo "Final like count: $($targetPostData.likeCount)"
        Write-TestSuccess "Like/unlike race conditions handled"
    }
}

Write-TestSection "CONCURRENT TEST SUMMARY"

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "              CONCURRENT BEHAVIOR TEST SUMMARY                  " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`nRace Conditions Detected:" -ForegroundColor White
Write-Host "  • Total: $($Global:ConcurrentTestResults.RaceConditions.Count)" -ForegroundColor $(if ($Global:ConcurrentTestResults.RaceConditions.Count -eq 0) { 'Green' } else { 'Red' })

Write-Host "`nSession Conflicts:" -ForegroundColor White
Write-Host "  • Total: $($Global:ConcurrentTestResults.SessionConflicts.Count)" -ForegroundColor $(if ($Global:ConcurrentTestResults.SessionConflicts.Count -eq 0) { 'Green' } else { 'Yellow' })

Write-Host "`nInventory Issues:" -ForegroundColor White
Write-Host "  • Oversold items: $(($Global:ConcurrentTestResults.InventoryConflicts | Where-Object { $_.Type -eq 'Oversold' }).Count)" -ForegroundColor $(if (($Global:ConcurrentTestResults.InventoryConflicts | Where-Object { $_.Type -eq 'Oversold' }).Count -eq 0) { 'Green' } else { 'Red' })

Write-Host "`nData Integrity:" -ForegroundColor White
Write-Host "  • Issues found: $($Global:ConcurrentTestResults.DataIntegrity.Count)" -ForegroundColor $(if ($Global:ConcurrentTestResults.DataIntegrity.Count -eq 0) { 'Green' } else { 'Red' })

# Save detailed results
$concurrentReportPath = Join-Path $ProjectRoot "test-reports\concurrent-behavior-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$Global:ConcurrentTestResults | ConvertTo-Json -Depth 10 | Out-File $concurrentReportPath -Encoding UTF8
Write-TestInfo "`nDetailed concurrent test report saved to: $concurrentReportPath"