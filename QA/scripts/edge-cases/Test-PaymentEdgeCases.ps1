# Test-PaymentEdgeCases.ps1
# Tests advanced payment scenarios including partial refunds, BNPL, and edge cases
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot
)

# Get script root if not already set
if (-not $ScriptRoot) {
    $ScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

Write-TestHeader "ADVANCED PAYMENT EDGE CASE TESTS"

# Initialize payment test results
$Global:PaymentTestResults = @{
    PartialRefunds = @()
    PaymentFailures = @()
    BNPLTests = @()
    CurrencyTests = @()
    SubscriptionTests = @()
}

# Use existing test user or create new one
if (-not $Global:PrimaryTestUser) {
    Write-TestFailure "No test user available. Run Setup-TestData.ps1 first"
    return
}

$testUser = $Global:PrimaryTestUser
$authHeaders = @{ Authorization = "Bearer $($testUser.token)" }

Write-TestSection "PARTIAL REFUND SCENARIOS"

Write-TestStep 1 "Testing partial refund for digital product"

# First, create an order
$orderData = @{
    items = @(
        @{
            productId = $Global:TestProducts[0].id
            quantity = 1
            price = $Global:TestProducts[0].price
        }
    )
    paymentMethod = @{
        type = "card"
        card = $Global:StripeTestCards.Success
    }
    totalAmount = $Global:TestProducts[0].price
}

$orderResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/orders" `
    -Headers $authHeaders `
    -Body $orderData

if ($orderResult.Success) {
    $orderId = $orderResult.Data._id
    Write-TestSuccess "Order created: $orderId"
    
    # Test 50% partial refund
    $partialRefundData = @{
        orderId = $orderId
        refundAmount = [math]::Round($Global:TestProducts[0].price * 0.5, 2)
        reason = "Customer requested partial refund"
        refundType = "partial"
    }
    
    # Admin endpoint for refunds
    $adminUser = $Global:TestUsers | Where-Object { $_.role -eq "admin" } | Select-Object -First 1
    if ($adminUser) {
        $adminHeaders = @{ Authorization = "Bearer $($adminUser.token)" }
        
        $refundResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/orders/$orderId/refund" `
            -Headers $adminHeaders `
            -Body $partialRefundData
        
        if ($refundResult.Success) {
            Write-TestSuccess "Partial refund processed: $$($partialRefundData.refundAmount)"
            $Global:PaymentTestResults.PartialRefunds += @{
                Success = $true
                Amount = $partialRefundData.refundAmount
                OrderId = $orderId
            }
        }
    }
}

Write-TestStep 2 "Testing partial refund validation"

# Test invalid refund amounts
$invalidRefundTests = @(
    @{
        Name = "Refund exceeds order total"
        Amount = 999.99
        Expected = "400"
    },
    @{
        Name = "Negative refund amount"
        Amount = -10.00
        Expected = "400"
    },
    @{
        Name = "Zero refund amount"
        Amount = 0
        Expected = "400"
    }
)

foreach ($test in $invalidRefundTests) {
    $result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/orders/$orderId/refund" `
        -Headers $adminHeaders `
        -Body @{
            orderId = $orderId
            refundAmount = $test.Amount
            reason = "Test"
            refundType = "partial"
        } `
        -ExpectedStatus $test.Expected
    
    if ($result.Success) {
        Write-TestSuccess "Validation passed: $($test.Name)"
    }
}

Write-TestSection "BUY NOW PAY LATER (BNPL) TESTS"

Write-TestStep 3 "Testing Klarna payment flow"

$klarnaOrderData = @{
    items = @(
        @{
            productId = $Global:TestProducts[1].id  # Higher priced item
            quantity = 1
            price = $Global:TestProducts[1].price
        }
    )
    paymentMethod = @{
        type = "klarna"
        klarnaOptions = @{
            paymentPlan = "pay_in_4"
            customerInfo = @{
                email = $testUser.email
                phone = "+1234567890"
            }
        }
    }
    totalAmount = $Global:TestProducts[1].price
}

$klarnaResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/orders/create-klarna-session" `
    -Headers $authHeaders `
    -Body $klarnaOrderData

if ($klarnaResult.Success) {
    Write-TestSuccess "Klarna session created"
    Write-TestInfo "Klarna approval URL: $($klarnaResult.Data.approvalUrl)"
    
    # Simulate Klarna webhook for payment approval
    $klarnaWebhookData = @{
        event_type = "payment.approved"
        session_id = $klarnaResult.Data.sessionId
        order_id = $klarnaResult.Data.orderId
    }
    
    $webhookResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/orders/klarna-webhook" `
        -Headers @{ "klarna-signature" = "test_signature" } `
        -Body $klarnaWebhookData
    
    if ($webhookResult.Success) {
        Write-TestSuccess "Klarna payment confirmed via webhook"
        $Global:PaymentTestResults.BNPLTests += @{
            Provider = "Klarna"
            Success = $true
            OrderId = $klarnaResult.Data.orderId
        }
    }
}

Write-TestStep 4 "Testing AfterPay payment flow"

$afterpayOrderData = @{
    items = @(
        @{
            productId = $Global:TestProducts[2].id
            quantity = 1
            price = $Global:TestProducts[2].price
        }
    )
    paymentMethod = @{
        type = "afterpay"
        afterpayOptions = @{
            checkoutMode = "express"
        }
    }
    totalAmount = $Global:TestProducts[2].price
}

$afterpayResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/orders/create-afterpay-checkout" `
    -Headers $authHeaders `
    -Body $afterpayOrderData

if ($afterpayResult.Success) {
    Write-TestSuccess "AfterPay checkout created"
    $Global:PaymentTestResults.BNPLTests += @{
        Provider = "AfterPay"
        Success = $true
        OrderId = $afterpayResult.Data.orderId
    }
}

Write-TestSection "PAYMENT FAILURE SCENARIOS"

Write-TestStep 5 "Testing declined card scenarios"

$declinedCardTests = @(
    @{
        Name = "Generic decline"
        Card = $Global:StripeTestCards.DeclineGeneric
        ExpectedError = "card_declined"
    },
    @{
        Name = "Insufficient funds"
        Card = $Global:StripeTestCards.InsufficientFunds
        ExpectedError = "insufficient_funds"
    },
    @{
        Name = "Expired card"
        Card = @{
            Number = "4000000000000069"
            CVC = "123"
            ExpMonth = "12"
            ExpYear = (Get-Date).AddYears(-1).Year  # Past year
        }
        ExpectedError = "expired_card"
    }
)

foreach ($test in $declinedCardTests) {
    $failedOrderData = @{
        items = @(
            @{
                productId = $Global:TestProducts[0].id
                quantity = 1
                price = $Global:TestProducts[0].price
            }
        )
        paymentMethod = @{
            type = "card"
            card = $test.Card
        }
        totalAmount = $Global:TestProducts[0].price
    }
    
    $result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/orders" `
        -Headers $authHeaders `
        -Body $failedOrderData `
        -ExpectedStatus "400"
    
    if ($result.Success) {
        Write-TestSuccess "Payment correctly declined: $($test.Name)"
        Write-TestInfo "Error code: $($result.Error)"
        $Global:PaymentTestResults.PaymentFailures += @{
            Scenario = $test.Name
            ErrorCode = $result.Error
            Handled = $true
        }
    }
}

Write-TestStep 6 "Testing payment retry logic"

# Simulate a payment that fails then succeeds
$retryOrderId = $null
$retryOrderData = @{
    items = @(@{
        productId = $Global:TestProducts[0].id
        quantity = 1
        price = $Global:TestProducts[0].price
    })
    paymentMethod = @{
        type = "card"
        card = $Global:StripeTestCards.DeclineGeneric
    }
    totalAmount = $Global:TestProducts[0].price
    saveForRetry = $true  # Flag to save order for retry
}

# First attempt - should fail
$firstAttempt = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/orders" `
    -Headers $authHeaders `
    -Body $retryOrderData `
    -ExpectedStatus "400"

if ($firstAttempt.Success -and $firstAttempt.Data.orderId) {
    $retryOrderId = $firstAttempt.Data.orderId
    Write-TestInfo "Order saved for retry: $retryOrderId"
    
    # Retry with good card
    $retryData = @{
        orderId = $retryOrderId
        paymentMethod = @{
            type = "card"
            card = $Global:StripeTestCards.Success
        }
    }
    
    $retryResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/orders/$retryOrderId/retry-payment" `
        -Headers $authHeaders `
        -Body $retryData
    
    if ($retryResult.Success) {
        Write-TestSuccess "Payment retry successful"
    }
}

Write-TestSection "SUBSCRIPTION EDGE CASES"

Write-TestStep 7 "Testing subscription upgrade mid-cycle"

# Create a basic subscription
$basicSubscriptionData = @{
    planId = "basic_monthly"
    paymentMethod = @{
        type = "card"
        card = $Global:StripeTestCards.Success
    }
}

$subResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/subscriptions" `
    -Headers $authHeaders `
    -Body $basicSubscriptionData

if ($subResult.Success) {
    $subscriptionId = $subResult.Data.subscriptionId
    Write-TestSuccess "Basic subscription created: $subscriptionId"
    
    # Upgrade to premium mid-cycle
    $upgradeData = @{
        newPlanId = "premium_monthly"
        proration = $true  # Apply proration for unused time
    }
    
    $upgradeResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/subscriptions/$subscriptionId/upgrade" `
        -Headers $authHeaders `
        -Body $upgradeData
    
    if ($upgradeResult.Success) {
        Write-TestSuccess "Subscription upgraded with proration"
        Write-TestInfo "Prorated amount: $$($upgradeResult.Data.proratedAmount)"
        $Global:PaymentTestResults.SubscriptionTests += @{
            Type = "Upgrade"
            Success = $true
            ProratedAmount = $upgradeResult.Data.proratedAmount
        }
    }
}

Write-TestStep 8 "Testing subscription downgrade"

if ($subscriptionId) {
    # Downgrade back to basic
    $downgradeData = @{
        newPlanId = "basic_monthly"
        effectiveDate = "next_billing_cycle"  # Downgrade at end of cycle
    }
    
    $downgradeResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/subscriptions/$subscriptionId/downgrade" `
        -Headers $authHeaders `
        -Body $downgradeData
    
    if ($downgradeResult.Success) {
        Write-TestSuccess "Subscription downgrade scheduled"
        Write-TestInfo "Effective date: $($downgradeResult.Data.effectiveDate)"
    }
}

Write-TestSection "CURRENCY AND REGIONAL EDGE CASES"

Write-TestStep 9 "Testing multi-currency support"

$currencyTests = @(
    @{ Currency = "EUR"; Symbol = "€" },
    @{ Currency = "GBP"; Symbol = "£" },
    @{ Currency = "CAD"; Symbol = "CA$" }
)

foreach ($test in $currencyTests) {
    $currencyOrderData = @{
        items = @(@{
            productId = $Global:TestProducts[0].id
            quantity = 1
            price = $Global:TestProducts[0].price
        })
        paymentMethod = @{
            type = "card"
            card = $Global:StripeTestCards.Success
        }
        currency = $test.Currency
        totalAmount = $Global:TestProducts[0].price
    }
    
    $result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/orders" `
        -Headers $authHeaders `
        -Body $currencyOrderData
    
    if ($result.Success) {
        Write-TestSuccess "Payment processed in $($test.Currency)"
        Write-TestInfo "Converted amount: $($test.Symbol)$($result.Data.convertedAmount)"
    } else {
        Write-TestWarning "Multi-currency not yet supported"
        break
    }
}

Write-TestSection "PAYMENT DISPUTE SCENARIOS"

Write-TestStep 10 "Testing chargeback handling"

# Simulate a disputed charge
if ($orderId) {
    $disputeWebhookData = @{
        type = "charge.dispute.created"
        data = @{
            object = @{
                charge = "ch_test_123"
                amount = 4999
                currency = "usd"
                reason = "fraudulent"
                status = "warning_needs_response"
                metadata = @{
                    order_id = $orderId
                }
            }
        }
    }
    
    $disputeResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/orders/stripe-webhook" `
        -Headers @{ "stripe-signature" = "test_webhook_signature" } `
        -Body $disputeWebhookData
    
    if ($disputeResult.Success) {
        Write-TestSuccess "Dispute webhook handled"
        Write-TestInfo "Order flagged for review"
    }
}

Write-TestSection "BUNDLED PRODUCT PAYMENT TESTS"

Write-TestStep 11 "Testing bundle pricing calculations"

# Create a test bundle
$bundleData = @{
    name = "Complete Credit Repair Bundle"
    products = @(
        $Global:TestProducts[0].id,
        $Global:TestProducts[1].id
    )
    bundleDiscount = 20  # 20% off
    type = "bundle"
}

# Admin creates bundle
if ($adminUser) {
    $bundleResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/products/bundles" `
        -Headers $adminHeaders `
        -Body $bundleData
    
    if ($bundleResult.Success) {
        $bundleId = $bundleResult.Data._id
        Write-TestSuccess "Bundle created with 20% discount"
        
        # Test purchasing bundle
        $bundleOrderData = @{
            items = @(@{
                productId = $bundleId
                quantity = 1
                type = "bundle"
            })
            paymentMethod = @{
                type = "card"
                card = $Global:StripeTestCards.Success
            }
        }
        
        $bundleOrderResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/orders" `
            -Headers $authHeaders `
            -Body $bundleOrderData
        
        if ($bundleOrderResult.Success) {
            Write-TestSuccess "Bundle purchased successfully"
            Write-TestInfo "Bundle price: $$($bundleOrderResult.Data.totalAmount)"
            Write-TestInfo "Savings: $$($bundleOrderResult.Data.bundleSavings)"
        }
    }
}

Write-TestSection "PAYMENT EDGE CASE SUMMARY"

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                  PAYMENT TEST SUMMARY                          " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "`nPartial Refunds:" -ForegroundColor White
Write-Host "  • Tested: $($Global:PaymentTestResults.PartialRefunds.Count)" -ForegroundColor Gray
Write-Host "  • Successful: $(($Global:PaymentTestResults.PartialRefunds | Where-Object { $_.Success }).Count)" -ForegroundColor Green

Write-Host "`nBNPL Integrations:" -ForegroundColor White
foreach ($bnpl in $Global:PaymentTestResults.BNPLTests) {
    Write-Host "  • $($bnpl.Provider): $(if ($bnpl.Success) { 'Working' } else { 'Failed' })" -ForegroundColor $(if ($bnpl.Success) { 'Green' } else { 'Red' })
}

Write-Host "`nPayment Failures Handled:" -ForegroundColor White
Write-Host "  • Total scenarios: $($Global:PaymentTestResults.PaymentFailures.Count)" -ForegroundColor Gray
Write-Host "  • All properly handled: $(($Global:PaymentTestResults.PaymentFailures | Where-Object { $_.Handled }).Count -eq $Global:PaymentTestResults.PaymentFailures.Count)" -ForegroundColor Green

Write-Host "`nSubscription Operations:" -ForegroundColor White
Write-Host "  • Tested: $($Global:PaymentTestResults.SubscriptionTests.Count)" -ForegroundColor Gray

# Generate detailed payment test report
$paymentReportPath = Join-Path $ProjectRoot "test-reports\payment-edge-cases-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$Global:PaymentTestResults | ConvertTo-Json -Depth 10 | Out-File $paymentReportPath -Encoding UTF8
Write-TestInfo "`nDetailed payment test report saved to: $paymentReportPath"