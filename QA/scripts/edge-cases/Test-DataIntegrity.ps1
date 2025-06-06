# Test-DataIntegrity.ps1
# Tests data integrity, orphaned records, and database consistency edge cases
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot,
    [switch]$PerformCleanup  # Clean up orphaned data if found
)

# Get script root if not already set
if (-not $ScriptRoot) {
    $ScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

Write-TestHeader "DATA INTEGRITY & CONSISTENCY EDGE CASE TESTS"

# Initialize data integrity test results
$Global:DataIntegrityResults = @{
    OrphanedRecords = @()
    ReferentialIntegrity = @()
    DataConsistency = @()
    CascadeDeletes = @()
    DataRetention = @()
}

Write-TestSection "ORPHANED BOOKING TESTS"

Write-TestStep 1 "Testing bookings when service is deleted"

# Admin user needed for service operations
$adminUser = $Global:TestUsers | Where-Object { $_.role -eq "admin" } | Select-Object -First 1
if (-not $adminUser) {
    Write-TestFailure "No admin user available for testing"
    return
}

# Create a temporary service
$tempService = @{
    serviceType = "consultation"
    title = "Temporary Test Service"
    displayName = "Test Consultation Service"
    description = "Service that will be deleted for testing"
    duration = 60
    price = @{
        amount = 99
        displayPrice = "$99"
    }
    status = "active"
}

$serviceResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/services" `
    -Headers @{ Authorization = "Bearer $($adminUser.token)" } `
    -Body $tempService

if ($serviceResult.Success) {
    $serviceId = $serviceResult.Data.data._id
    Write-TestSuccess "Temporary service created: $serviceId"
    
    # Create bookings for this service
    $testUser = $Global:PrimaryTestUser
    $bookingIds = @()
    
    for ($i = 1; $i -le 3; $i++) {
        $bookingDate = (Get-Date).AddDays($i + 7).ToString("yyyy-MM-ddTHH:mm:ss")
        $bookingResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/bookings" `
            -Headers @{ Authorization = "Bearer $($testUser.token)" } `
            -Body @{
                serviceId = $serviceId
                startTime = $bookingDate
                notes = "Test booking $i"
            }
        
        if ($bookingResult.Success) {
            $bookingIds += $bookingResult.Data.booking._id
        }
    }
    
    Write-TestInfo "Created $($bookingIds.Count) bookings for service"
    
    # Now delete the service
    $deleteResult = Test-APIEndpoint `
        -Method "DELETE" `
        -Endpoint "http://localhost:5000/api/services/$serviceId" `
        -Headers @{ Authorization = "Bearer $($adminUser.token)" }
    
    if ($deleteResult.Success) {
        Write-TestSuccess "Service deleted"
        
        # Check what happened to bookings
        foreach ($bookingId in $bookingIds) {
            $checkResult = Test-APIEndpoint `
                -Method "GET" `
                -Endpoint "http://localhost:5000/api/bookings/$bookingId" `
                -Headers @{ Authorization = "Bearer $($testUser.token)" }
            
            if ($checkResult.Success) {
                # Booking still exists - check its state
                $booking = $checkResult.Data
                if ($booking.serviceId -eq $serviceId) {
                    Write-TestWarning "Orphaned booking found: $bookingId (service deleted)"
                    $Global:DataIntegrityResults.OrphanedRecords += @{
                        Type = "Booking"
                        Id = $bookingId
                        Reason = "ServiceDeleted"
                        ServiceId = $serviceId
                    }
                } elseif ($booking.status -eq "cancelled") {
                    Write-TestSuccess "Booking auto-cancelled when service deleted"
                }
            } else {
                Write-TestInfo "Booking removed with service (cascade delete)"
            }
        }
    }
}

Write-TestSection "COMMUNITY POST INTEGRITY"

Write-TestStep 2 "Testing posts from deleted users"

# Create a user who will post then be deleted
$tempUser = Get-RandomTestUser
$tempUserResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $tempUser

if ($tempUserResult.Success) {
    $tempUserToken = $tempUserResult.Data.token
    $tempUserId = $tempUserResult.Data.user.id
    
    # Create discussion and posts
    $discussionResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/community/discussions" `
        -Headers @{ Authorization = "Bearer $tempUserToken" } `
        -Body @{
            title = "Discussion from user who will be deleted"
            content = "Testing data integrity when user is deleted"
            category = "general"
        }
    
    if ($discussionResult.Success) {
        $discussionId = $discussionResult.Data._id
        
        # Add some replies from other users
        $replyResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/community/discussions/$discussionId/posts" `
            -Headers @{ Authorization = "Bearer $($Global:PrimaryTestUser.token)" } `
            -Body @{
                content = "Reply to user who will be deleted"
            }
        
        if ($replyResult.Success) {
            Write-TestSuccess "Reply created successfully"
        }
        
        # Now delete the user (admin action)
        $deleteUserResult = Test-APIEndpoint `
            -Method "DELETE" `
            -Endpoint "http://localhost:5000/api/users/$tempUserId" `
            -Headers @{ Authorization = "Bearer $($adminUser.token)" }
        
        if ($deleteUserResult.Success) {
            Write-TestSuccess "User deleted"
            
            # Check what happened to their content
            $checkDiscussionResult = Test-APIEndpoint `
                -Method "GET" `
                -Endpoint "http://localhost:5000/api/community/discussions/$discussionId" `
                -Headers @{ Authorization = "Bearer $($Global:PrimaryTestUser.token)" }
            
            if ($checkDiscussionResult.Success) {
                $discussion = $checkDiscussionResult.Data.data
                if ($discussion.author -eq $tempUserId) {
                    Write-TestWarning "Discussion still references deleted user"
                    $Global:DataIntegrityResults.OrphanedRecords += @{
                        Type = "Discussion"
                        Id = $discussionId
                        Reason = "DeletedAuthor"
                        UserId = $tempUserId
                    }
                } elseif ($discussion.author -eq "[Deleted User]" -or $discussion.isDeleted) {
                    Write-TestSuccess "Discussion properly anonymized/marked"
                }
            }
        }
    }
}

Write-TestSection "PRODUCT INVENTORY CONFLICTS"

Write-TestStep 3 "Testing inventory when product is modified"

# Create a product with inventory
$inventoryProduct = @{
    type = "physical"
    title = "Test Product with Inventory"
    slug = "test-inventory-product"
    description = "Product to test inventory integrity"
    price = 49.99
    shortDescription = "Test product"
    inventory = 10
    trackInventory = $true
    status = "published"
}

$productResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/products" `
    -Headers @{ Authorization = "Bearer $($adminUser.token)" } `
    -Body $inventoryProduct

if ($productResult.Success) {
    $productId = $productResult.Data._id
    Write-TestSuccess "Product created with inventory: 10"
    
    # Create some orders
    $orderCount = 3
    for ($i = 1; $i -le $orderCount; $i++) {
        $orderResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/orders" `
            -Headers @{ Authorization = "Bearer $($Global:PrimaryTestUser.token)" } `
            -Body @{
                items = @(@{
                    productId = $productId
                    quantity = 1
                    price = 49.99
                })
                paymentMethod = @{
                    type = "card"
                    card = $Global:StripeTestCards.Success
                }
                totalAmount = 49.99
            }
        
        if ($orderResult.Success) {
            Write-TestInfo "Order $i created"
        }
    }
    
    # Check current inventory
    $checkProductResult = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/products/$productId"
    
    if ($checkProductResult.Success) {
        $currentInventory = $checkProductResult.Data.data.inventory
        Write-TestInfo "Current inventory: $currentInventory (Expected: $($inventoryProduct.inventory - $orderCount))"
        
        if ($currentInventory -ne ($inventoryProduct.inventory - $orderCount)) {
            Write-TestFailure "Inventory mismatch detected"
            $Global:DataIntegrityResults.DataConsistency += @{
                Type = "InventoryMismatch"
                ProductId = $productId
                Expected = $inventoryProduct.inventory - $orderCount
                Actual = $currentInventory
            }
        }
    }
    
    # Now change product to not track inventory
    $updateResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/products/$productId" `
        -Headers @{ Authorization = "Bearer $($adminUser.token)" } `
        -Body @{
            trackInventory = $false
        }
    
    if ($updateResult.Success) {
        Write-TestInfo "Product updated to not track inventory"
        
        # Try to order again
        $postUpdateOrder = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/orders" `
            -Headers @{ Authorization = "Bearer $($Global:PrimaryTestUser.token)" } `
            -Body @{
                items = @(@{
                    productId = $productId
                    quantity = 100  # Large quantity
                    price = 49.99
                })
                paymentMethod = @{
                    type = "card"
                    card = $Global:StripeTestCards.Success
                }
                totalAmount = 4999.00
            }
        
        if ($postUpdateOrder.Success) {
            Write-TestSuccess "Large order allowed after disabling inventory tracking"
        }
    }
}

Write-TestSection "CASCADE DELETE TESTING"

Write-TestStep 4 "Testing cascade deletes for user data"

# Create a user with complete data footprint
$completeUser = Get-RandomTestUser
$completeUserResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $completeUser

if ($completeUserResult.Success) {
    $userId = $completeUserResult.Data.user.id
    $userToken = $completeUserResult.Data.token
    
    # Create data for this user
    $userData = @{
        Orders = @()
        Bookings = @()
        Discussions = @()
        Leads = @()
    }
    
    # Create an order
    if ($Global:TestProducts.Count -gt 0) {
        $orderResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/orders" `
            -Headers @{ Authorization = "Bearer $userToken" } `
            -Body @{
                items = @(@{
                    productId = $Global:TestProducts[0].id
                    quantity = 1
                    price = $Global:TestProducts[0].price
                })
                paymentMethod = @{
                    type = "card"
                    card = $Global:StripeTestCards.Success
                }
                totalAmount = $Global:TestProducts[0].price
            }
        
        if ($orderResult.Success) {
            $userData.Orders += $orderResult.Data._id
        }
    }
    
    # Create a booking
    if ($Global:TestServices.Count -gt 0) {
        $bookingResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/bookings" `
            -Headers @{ Authorization = "Bearer $userToken" } `
            -Body @{
                serviceId = $Global:TestServices[0]._id
                startTime = (Get-Date).AddDays(10).ToString("yyyy-MM-ddTHH:mm:ss")
                notes = "Test booking for cascade delete"
            }
        
        if ($bookingResult.Success) {
            $userData.Bookings += $bookingResult.Data.booking._id
        }
    }
    
    Write-TestInfo "Created user data footprint: Orders=$($userData.Orders.Count), Bookings=$($userData.Bookings.Count)"
    
    # Test soft delete vs hard delete
    $softDeleteResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/users/$userId/deactivate" `
        -Headers @{ Authorization = "Bearer $($adminUser.token)" }
    
    if ($softDeleteResult.Success) {
        Write-TestSuccess "User soft deleted (deactivated)"
        
        # Check if user data is retained
        foreach ($orderId in $userData.Orders) {
            $orderCheck = Test-APIEndpoint `
                -Method "GET" `
                -Endpoint "http://localhost:5000/api/orders/$orderId" `
                -Headers @{ Authorization = "Bearer $($adminUser.token)" }
            
            if ($orderCheck.Success) {
                Write-TestSuccess "Order retained after soft delete (audit trail)"
            }
        }
    }
    
    # Test data retention requirements
    $retentionCheck = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/admin/users/$userId/audit-trail" `
        -Headers @{ Authorization = "Bearer $($adminUser.token)" }
    
    if ($retentionCheck.Success) {
        Write-TestSuccess "Audit trail available for deactivated user"
        $Global:DataIntegrityResults.DataRetention += @{
            Type = "UserAuditTrail"
            UserId = $userId
            Status = "Retained"
        }
    }
}

Write-TestSection "REFERENTIAL INTEGRITY TESTS"

Write-TestStep 5 "Testing foreign key constraints"

# Test various referential integrity scenarios
$integrityTests = @(
    @{
        Name = "Order with non-existent product"
        Endpoint = "/api/orders"
        Body = @{
            items = @(@{
                productId = "000000000000000000000000"  # Non-existent
                quantity = 1
                price = 99.99
            })
            paymentMethod = @{ type = "card"; card = $Global:StripeTestCards.Success }
            totalAmount = 99.99
        }
        Expected = "400"
    },
    @{
        Name = "Booking with non-existent service"
        Endpoint = "/api/bookings"
        Body = @{
            serviceId = "000000000000000000000000"  # Non-existent
            startTime = (Get-Date).AddDays(5).ToString("yyyy-MM-ddTHH:mm:ss")
        }
        Expected = "404"
    },
    @{
        Name = "Discussion post with non-existent discussion"
        Endpoint = "/api/community/discussions/000000000000000000000000/posts"
        Body = @{
            content = "Reply to non-existent discussion"
        }
        Expected = "404"
    }
)

foreach ($test in $integrityTests) {
    $result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000$($test.Endpoint)" `
        -Headers @{ Authorization = "Bearer $($Global:PrimaryTestUser.token)" } `
        -Body $test.Body `
        -ExpectedStatus $test.Expected
    
    if ($result.Success) {
        Write-TestSuccess "Referential integrity enforced: $($test.Name)"
    } else {
        Write-TestFailure "Referential integrity violation: $($test.Name)"
        $Global:DataIntegrityResults.ReferentialIntegrity += @{
            Test = $test.Name
            Violation = $true
        }
    }
}

Write-TestSection "TRANSACTION CONSISTENCY TESTS"

Write-TestStep 6 "Testing payment and inventory atomicity"

# Create a product with very limited inventory
$atomicProduct = @{
    type = "physical"
    title = "Atomic Test Product"
    slug = "atomic-test-product"
    description = "Product for testing transaction atomicity"
    price = 29.99
    shortDescription = "Limited stock"
    inventory = 1  # Only 1 available
    trackInventory = $true
    status = "published"
}

$atomicProductResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/products" `
    -Headers @{ Authorization = "Bearer $($adminUser.token)" } `
    -Body $atomicProduct

if ($atomicProductResult.Success) {
    $atomicProductId = $atomicProductResult.Data._id
    
    # Two users try to buy the same last item
    $user1Token = $Global:TestUsers[0].token
    $user2Token = $Global:TestUsers[1].token
    
    # Add to cart for both users
    $cart1Result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/cart/add" `
        -Headers @{ Authorization = "Bearer $user1Token" } `
        -Body @{
            productId = $atomicProductId
            quantity = 1
            type = "product"
        }
    
    $cart2Result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/cart/add" `
        -Headers @{ Authorization = "Bearer $user2Token" } `
        -Body @{
            productId = $atomicProductId
            quantity = 1
            type = "product"
        }
    
    # Verify both carts were created successfully
    if ($cart1Result.Success -and $cart2Result.Success) {
        Write-TestSuccess "Successfully added product to both user carts"
    }
    
    # Simulate payment failure scenario
    $failedOrderResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/orders" `
        -Headers @{ Authorization = "Bearer $user1Token" } `
        -Body @{
            items = @(@{
                productId = $atomicProductId
                quantity = 1
                price = 29.99
            })
            paymentMethod = @{
                type = "card"
                card = $Global:StripeTestCards.DeclineGeneric  # Will fail
            }
            totalAmount = 29.99
        } `
        -ExpectedStatus "400"

    if ($failedOrderResult.Success) {
        Write-TestSuccess "Payment failure handled correctly"
    } else {
        Write-TestFailure "Payment failure not handled as expected"
    }

    # Check inventory wasn't decremented
    $inventoryCheck1 = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/products/$atomicProductId"
    
    if ($inventoryCheck1.Success) {
        $currentInventory = $inventoryCheck1.Data.data.inventory
        if ($currentInventory -eq 1) {
            Write-TestSuccess "Inventory correctly rolled back on payment failure"
        } else {
            Write-TestFailure "Inventory incorrectly decremented on failed payment"
            $Global:DataIntegrityResults.DataConsistency += @{
                Type = "TransactionRollback"
                Issue = "InventoryNotRolledBack"
            }
        }
    }
}

Write-TestSection "DATA RETENTION COMPLIANCE"

Write-TestStep 7 "Testing 1-year data retention policy"

# This test would need backend support for date manipulation
Write-TestInfo "Data retention policy test (1-year requirement)"

# Check if system has data purge endpoints
$purgeCheckResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/admin/data-retention/policy" `
    -Headers @{ Authorization = "Bearer $($adminUser.token)" }

if ($purgeCheckResult.Success) {
    $policy = $purgeCheckResult.Data
    Write-TestInfo "Data retention policy: $($policy.retentionPeriod)"
    
    if ($policy.retentionPeriod -ge 365) {
        Write-TestSuccess "Data retention meets 1-year requirement"
    } else {
        Write-TestFailure "Data retention below 1-year requirement"
    }
} else {
    Write-TestWarning "Data retention policy endpoint not implemented"
}

Write-TestSection "ORPHANED DATA CLEANUP"

if ($PerformCleanup -and $Global:DataIntegrityResults.OrphanedRecords.Count -gt 0) {
    Write-TestStep 8 "Cleaning up orphaned records"
    
    foreach ($orphan in $Global:DataIntegrityResults.OrphanedRecords) {
        Write-TestInfo "Would clean up orphaned $($orphan.Type): $($orphan.Id)"
        # Actual cleanup would require admin endpoints
    }
} else {
    Write-TestInfo "Orphaned data cleanup skipped (use -PerformCleanup to enable)"
}

Write-TestSection "DATA INTEGRITY TEST SUMMARY"

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "               DATA INTEGRITY TEST SUMMARY                      " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$orphanCount = $Global:DataIntegrityResults.OrphanedRecords.Count
$integrityViolations = ($Global:DataIntegrityResults.ReferentialIntegrity | Where-Object { $_.Violation }).Count
$consistencyIssues = $Global:DataIntegrityResults.DataConsistency.Count

Write-Host "`nData Integrity Status:" -ForegroundColor White
Write-Host "  • Orphaned Records: $orphanCount" -ForegroundColor $(if ($orphanCount -eq 0) { 'Green' } else { 'Yellow' })
Write-Host "  • Referential Integrity Violations: $integrityViolations" -ForegroundColor $(if ($integrityViolations -eq 0) { 'Green' } else { 'Red' })
Write-Host "  • Data Consistency Issues: $consistencyIssues" -ForegroundColor $(if ($consistencyIssues -eq 0) { 'Green' } else { 'Red' })

if ($orphanCount -gt 0) {
    Write-Host "`nOrphaned Records Found:" -ForegroundColor Yellow
    $Global:DataIntegrityResults.OrphanedRecords | Group-Object Type | ForEach-Object {
        Write-Host "  • $($_.Name): $($_.Count) records" -ForegroundColor White
    }
}

Write-Host "`nRecommendations:" -ForegroundColor White
if ($orphanCount -gt 0) {
    Write-Host "  1. Implement cascade delete or soft delete for related records" -ForegroundColor White
    Write-Host "  2. Add background job to clean orphaned data periodically" -ForegroundColor White
}
if ($integrityViolations -gt 0) {
    Write-Host "  3. Strengthen foreign key validation" -ForegroundColor White
    Write-Host "  4. Add database-level constraints where possible" -ForegroundColor White
}
if ($consistencyIssues -gt 0) {
    Write-Host "  5. Implement proper transaction management" -ForegroundColor White
    Write-Host "  6. Add consistency checks in critical operations" -ForegroundColor White
}

# Save integrity report
$integrityReportPath = Join-Path $ProjectRoot "test-reports\data-integrity-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$Global:DataIntegrityResults | ConvertTo-Json -Depth 10 | Out-File $integrityReportPath -Encoding UTF8
Write-TestInfo "`nDetailed integrity report saved to: $integrityReportPath"