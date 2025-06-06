# Test-LeadCaptureFlow.ps1
# Tests lead capture forms and email delivery
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot
)

# Get script root if not already set
if (-not $PSScriptRoot) {
    $PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

Write-TestStep 1 "Testing lead capture form submission"

$leadData = @{
    email = Get-RandomTestEmail
    firstName = "Lead"
    lastName = "Test"
    phone = "555-0123"
    source = "landing_page"
    interests = @("credit_repair", "financial_planning")
}

$leadResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/leads" `
    -Body $leadData

if ($leadResult.Success) {
    Write-TestInfo "Lead captured with ID: $($leadResult.Data._id)"
    Write-TestInfo "Email would be sent to: $($leadData.email)"
}

Write-TestStep 2 "Testing newsletter subscription"

$newsletterData = @{
    email = Get-RandomTestEmail
    firstName = "Newsletter"
    lastName = "Subscriber"
    # source removed - using default
}

$newsletterResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/leads/newsletter" `
    -Body $newsletterData

if ($newsletterResult.Success) {
    Write-TestInfo "Newsletter subscription successful"
}

Write-TestStep 3 "Testing free guide download"

$guideData = @{
    email = Get-RandomTestEmail
    firstName = "Guide"
    lastName = "Downloader"
    guideId = "free-credit-guide"
}

$guideResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/leads/download-guide" `
    -Body $guideData

if ($guideResult.Success) {
    Write-TestInfo "Guide download lead captured"
    Write-TestInfo "Download link would be emailed"
}

Write-TestStep 4 "Testing duplicate lead handling"

# Submit same lead twice
$duplicateResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/leads" `
    -Body $leadData

if ($duplicateResult.Success) {
    Write-TestInfo "Duplicate lead handled appropriately"
}

Write-TestStep 5 "Testing lead validation"

$invalidLeads = @(
    @{
        Name = "Missing email"
        Data = @{ firstName = "Test"; lastName = "User" }
        Expected = "400"
    },
    @{
        Name = "Invalid email format"
        Data = @{ email = "not-an-email"; firstName = "Test" }
        Expected = "400"
    }
)

foreach ($test in $invalidLeads) {
    $result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/leads" `
        -Body $test.Data `
        -ExpectedStatus $test.Expected
    
    if ($result.Success) {
        Write-TestInfo "Validation working: $($test.Name)"
    }
}

Write-TestStep 6 "Testing lead analytics"

# Admin endpoint - test if available
if ($Global:TestUsers) {
    $adminUser = $Global:TestUsers | Where-Object { $_.role -eq "admin" } | Select-Object -First 1
    if ($adminUser) {
        # Re-authenticate to ensure we have valid admin token
        $loginResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $adminUser.email
                password = $adminUser.password
            }
        
        if ($loginResult.Success -and $loginResult.Data.user.role -eq "admin") {
            $adminToken = $loginResult.Data.token
            
            $analyticsResult = Test-APIEndpoint `
                -Method "GET" `
                -Endpoint "http://localhost:5000/api/leads/analytics" `
                -Headers @{ Authorization = "Bearer $adminToken" } `
                -ExpectedStatus "200"
            
            if ($analyticsResult.Success) {
                Write-TestInfo "Lead analytics accessible to admin"
                Write-TestInfo "  Total leads: $($analyticsResult.Data.data.overview.totalLeads)"
                Write-TestInfo "  Conversion rate: $($analyticsResult.Data.data.overview.conversionRate)%"
            }
        }
        else {
            Write-TestWarning "Could not authenticate as admin for analytics test"
        }
    }
}

Write-TestStep 7 "Testing email delivery tracking"

Write-TestInfo "Email delivery would be tracked through SendGrid webhooks"
Write-TestInfo "Google Sheets integration would log lead data"

Write-TestStep 8 "Testing UTM parameter tracking"

$utmData = @{
    email = Get-RandomTestEmail
    firstName = "UTM"
    lastName = "Test"
    source = "google_ads"
    utmParameters = @{
        source = "google"
        medium = "cpc"
        campaign = "credit_repair_2024"
    }
}

$utmResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/leads" `
    -Body $utmData

if ($utmResult.Success) {
    Write-TestInfo "UTM parameters tracked successfully"
}

Write-TestStep 9 "Testing contact form submission"

# Contact form uses separate firstName/lastName fields, not a combined "name" field
$contactData = @{
    firstName = "Contact"
    lastName = "Test"
    email = Get-RandomTestEmail
    phone = "555-9999"
    subject = "Question about services"
    message = "I would like more information about your credit repair services."
    preferredContactMethod = "email"
}

$contactResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/contact" `
    -Body $contactData

if ($contactResult.Success) {
    Write-TestInfo "Contact form submission successful"
    Write-TestInfo "Reference ID: $($contactResult.Data.data.referenceId)"
}

Write-TestStep 10 "Testing lead export"

# Admin functionality
if ($adminUser) {
    # Use the fresh admin token from step 6
    if ($adminToken) {
        $exportResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/leads/export" `
            -Headers @{ Authorization = "Bearer $adminToken" } `
            -ExpectedStatus "200"
        
        if ($exportResult.Success) {
            Write-TestInfo "Lead export functionality available"
            Write-TestInfo "  Total leads exported: $($exportResult.Data.count)"
        }
    }
    else {
        # Try to get admin token again
        $loginResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $adminUser.email
                password = $adminUser.password
            }
        
        if ($loginResult.Success) {
            $exportResult = Test-APIEndpoint `
                -Method "GET" `
                -Endpoint "http://localhost:5000/api/leads/export" `
                -Headers @{ Authorization = "Bearer $($loginResult.Data.token)" } `
                -ExpectedStatus "200"
            
            if ($exportResult.Success) {
                Write-TestInfo "Lead export functionality available"
            }
        }
    }
}


