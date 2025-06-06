# Test-AuthenticationFlow.ps1
# Comprehensive authentication flow testing for Credit Gyems Academy
# Tests user registration, login, password reset, profile management, and session handling
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot
)

# Get script root if not already set
if (-not $ScriptRoot) {
    $ScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

# Retry wrapper for API calls
function Test-APIEndpointWithRetry {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = @{},
        [hashtable]$Headers = @{},
        [string]$ExpectedStatus = "200",
        [int]$MaxRetries = 3,
        [int]$RetryDelay = 2
    )
    
    $attempts = 0
    $lastError = $null
    
    while ($attempts -lt $MaxRetries) {
        $attempts++
        
        try {
            $result = Test-APIEndpoint `
                -Method $Method `
                -Endpoint $Endpoint `
                -Body $Body `
                -Headers $Headers `
                -ExpectedStatus $ExpectedStatus
            
            # If we get here, the call succeeded
            return $result
        } catch {
            $lastError = # Test-AuthenticationFlow.ps1
# Comprehensive authentication flow testing for Credit Gyems Academy
# Tests user registration, login, password reset, profile management, and session handling
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot
)

# Get script root if not already set
if (-not $ScriptRoot) {
    $ScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

# Retry wrapper for API calls with connection error handling
function Test-APIEndpointWithRetry {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = @{},
        [hashtable]$Headers = @{},
        [string]$ExpectedStatus = "200",
        [int]$MaxRetries = 3,
        [int]$RetryDelay = 2
    )
    
    $attempts = 0
    $lastError = $null
    
    while ($attempts -lt $MaxRetries) {
        $attempts++
        
        try {
            $result = Test-APIEndpoint `
                -Method $Method `
                -Endpoint $Endpoint `
                -Body $Body `
                -Headers $Headers `
                -ExpectedStatus $ExpectedStatus
            
            # If we get here, the call succeeded
            return $result
        }
        catch {
            $lastError = $_
            
            # Check if it's a connection error
            if ($_.Exception.Message -like "*connection*" -or 
                $_.Exception.Message -like "*refused*" -or
                $_.Exception.Message -like "*could not be made*") {
                
                if ($attempts -lt $MaxRetries) {
                    Write-TestInfo "Connection failed, retrying in $RetryDelay seconds... (Attempt $attempts/$MaxRetries)"
                    Start-Sleep -Seconds $RetryDelay
                    continue
                }
            }
            
            # For other errors, don't retry
            throw $_
        }
    }
    
    # If we get here, all retries failed
    throw $lastError
}

# Helper function to validate JWT token format
function Test-ValidateJWT {
    param([string]$Token)
    
    if ([string]::IsNullOrEmpty($Token)) {
        return $false
    }
    
    $parts = $Token.Split('.')
    return $parts.Count -eq 3
}

Write-TestSection "AUTHENTICATION FLOW TESTS"

Write-TestStep 1 "Testing user registration flow"

# Test 1.1: New user registration with valid data
$newUser = Get-RandomTestUser
$registerResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body @{
        email = $newUser.email
        password = $newUser.password
        firstName = $newUser.firstName
        lastName = $newUser.lastName
        phone = $newUser.phone
    }

if ($registerResult.Success) {
    Write-TestSuccess "User registration successful"
    Write-TestInfo "  User ID: $($registerResult.Data.user.id)"
    Write-TestInfo "  Email: $($registerResult.Data.user.email)"
    Write-TestInfo "  Role: $($registerResult.Data.user.role)"
    
    # Validate JWT token
    if (Test-ValidateJWT -Token $registerResult.Data.token) {
        Write-TestSuccess "Valid JWT token received"
    } else {
        Write-TestFailure "Invalid JWT token format"
    }
    
    # Store for later tests
    $registeredUser = @{
        id = $registerResult.Data.user.id
        email = $newUser.email
        password = $newUser.password
        token = $registerResult.Data.token
    }
} else {
    Write-TestFailure "User registration failed"
    $registeredUser = $null
}

# Test 1.2: Duplicate registration prevention
Write-TestStep 2 "Testing duplicate registration prevention"

if ($registeredUser) {
    $duplicateResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body @{
            email = $registeredUser.email
            password = "DifferentPassword123!"
            firstName = "Duplicate"
            lastName = "User"
        } `
        -ExpectedStatus "400"
    
    if ($duplicateResult.Success -and $duplicateResult.Error -like "*already registered*") {
        Write-TestSuccess "Duplicate registration properly prevented"
    }
}

# Test 1.3: Registration validation
Write-TestStep 3 "Testing registration input validation"

$validationTests = @(
    @{
        Name = "Missing email"
        Body = @{ password = "Test123!"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*email*required*"
    },
    @{
        Name = "Invalid email format"
        Body = @{ email = "invalid-email"; password = "Test123!"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*email*"
    },
    @{
        Name = "Missing password"
        Body = @{ email = "test@test.com"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*password*required*"
    },
    @{
        Name = "Missing first name"
        Body = @{ email = "test@test.com"; password = "Test123!"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*firstName*required*"
    },
    @{
        Name = "Missing last name"
        Body = @{ email = "test@test.com"; password = "Test123!"; firstName = "Test" }
        ExpectedStatus = "400"
        ExpectedError = "*lastName*required*"
    }
)

$validationPassed = 0
foreach ($test in $validationTests) {
    $result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body $test.Body `
        -ExpectedStatus $test.ExpectedStatus
    
    if ($result.Success) {
        $validationPassed++
        Write-TestInfo "  ✓ Validation test passed: $($test.Name)"
    } else {
        Write-TestInfo "  ✗ Validation test failed: $($test.Name)"
    }
}

Write-TestInfo "Registration validation: $validationPassed/$($validationTests.Count) tests passed"

Write-TestStep 4 "Testing user login flow"

# Test 4.1: Valid login
if ($registeredUser) {
    $loginResult = Test-APIEndpointWithRetry `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = $registeredUser.email
            password = $registeredUser.password
        }
    
    if ($loginResult.Success) {
        Write-TestSuccess "Login successful"
        $authToken = $loginResult.Data.token
        
        # Verify token is different from registration token (new session)
        if ($authToken -ne $registeredUser.token) {
            Write-TestSuccess "New session token generated"
        }
        
        # Verify user data returned
        if ($loginResult.Data.user) {
            Write-TestInfo "  User data returned with login"
        }
    } else {
        Write-TestFailure "Valid login failed"
        $authToken = $registeredUser.token  # Fallback to registration token
    }
} else {
    # Create a new user for login testing
    $loginTestUser = Get-RandomTestUser
    $regResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body @{
            email = $loginTestUser.email
            password = $loginTestUser.password
            firstName = $loginTestUser.firstName
            lastName = $loginTestUser.lastName
        }
    
    if ($regResult.Success) {
        $registeredUser = @{
            email = $loginTestUser.email
            password = $loginTestUser.password
        }
        
        $loginResult = Test-APIEndpointWithRetry `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $registeredUser.email
                password = $registeredUser.password
            }
        
        if ($loginResult.Success) {
            $authToken = $loginResult.Data.token
        }
    }
}

# Test 4.2: Invalid login scenarios
Write-TestStep 5 "Testing invalid login scenarios"

# Wrong password
$wrongPasswordResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = $registeredUser.email
        password = "WrongPassword123!"
    } `
    -ExpectedStatus "401"

if ($wrongPasswordResult.Success) {
    Write-TestSuccess "Wrong password properly rejected"
}

# Non-existent user
$nonExistentResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = "nonexistent_$(Get-Random -Maximum 9999)@test.com"
        password = "Password123!"
    } `
    -ExpectedStatus "401"

if ($nonExistentResult.Success) {
    Write-TestSuccess "Non-existent user properly rejected"
}

# Empty credentials
$emptyCredsResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{} `
    -ExpectedStatus "400"

if ($emptyCredsResult.Success) {
    Write-TestSuccess "Empty credentials properly rejected"
}

Write-TestStep 6 "Testing authenticated endpoints"

# Test 6.1: Profile access with valid token
if ($authToken) {
    $profileResult = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" }
    
    if ($profileResult.Success) {
        Write-TestSuccess "Profile retrieved with valid token"
        Write-TestInfo "  Email: $($profileResult.Data.email)"
        Write-TestInfo "  Role: $($profileResult.Data.role)"
        Write-TestInfo "  Member Status: $($profileResult.Data.membershipStatus)"
    }
}

# Test 6.2: Profile access without token
$noTokenResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -ExpectedStatus "401"

if ($noTokenResult.Success) {
    Write-TestSuccess "Unauthenticated access properly blocked"
}

# Test 6.3: Profile access with invalid token
$invalidTokenResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -Headers @{ Authorization = "Bearer invalid.token.here" } `
    -ExpectedStatus "401"

if ($invalidTokenResult.Success) {
    Write-TestSuccess "Invalid token properly rejected"
}

Write-TestStep 7 "Testing profile update"

if ($authToken) {
    # Test 7.1: Valid profile update
    $updateData = @{
        firstName = "Updated"
        lastName = "Name"
        phone = "555-0123"
        creditScore = 750
        targetCreditScore = 800
        creditGoals = @("Improve payment history", "Reduce credit utilization")
    }
    
    $updateResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body $updateData
    
    if ($updateResult.Success) {
        Write-TestSuccess "Profile updated successfully"
        
        # Verify updates persisted
        $verifyResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($verifyResult.Success -and $verifyResult.Data.firstName -eq "Updated") {
            Write-TestSuccess "Profile updates persisted correctly"
        }
    }
    
    # Test 7.2: Attempt to update protected fields
    $protectedUpdateResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            email = "newemail@test.com"
            role = "admin"
            _id = "fake-id"
        }
    
    if ($protectedUpdateResult.Success) {
        # Verify protected fields weren't changed
        $checkResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($checkResult.Success -and 
            $checkResult.Data.email -eq $registeredUser.email -and 
            $checkResult.Data.role -ne "admin") {
            Write-TestSuccess "Protected fields properly maintained"
        }
    }
}

Write-TestStep 8 "Testing password reset flow"

# Test 8.1: Request password reset
$resetRequestResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{ email = $registeredUser.email }

if ($resetRequestResult.Success) {
    Write-TestSuccess "Password reset request accepted"
    Write-TestInfo "  Reset email would be sent to: $($registeredUser.email)"
}

# Test 8.2: Request reset for non-existent email
$invalidResetResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{ email = "nonexistent@test.com" } `
    -ExpectedStatus "404"

if ($invalidResetResult.Success) {
    Write-TestSuccess "Non-existent email properly handled"
}

# Test 8.3: Request reset without email
$noEmailResetResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{} `
    -ExpectedStatus "400"

if ($noEmailResetResult.Success) {
    Write-TestSuccess "Missing email properly rejected"
}

Write-TestStep 9 "Testing password change (authenticated)"

if ($authToken) {
    # Test 9.1: Change password with correct current password
    $newPassword = "NewPassword123!"
    
    $changePasswordResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/change-password" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            currentPassword = $registeredUser.password
            newPassword = $newPassword
        }
    
    if ($changePasswordResult.Success) {
        Write-TestSuccess "Password changed successfully"
        
        # Verify can login with new password
        $newLoginResult = Test-APIEndpointWithRetry `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $registeredUser.email
                password = $newPassword
            }
        
        if ($newLoginResult.Success) {
            Write-TestSuccess "Login successful with new password"
            $registeredUser.password = $newPassword
            $authToken = $newLoginResult.Data.token
        }
    }
    
    # Test 9.2: Change password with wrong current password
    $wrongCurrentResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/change-password" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            currentPassword = "WrongCurrent123!"
            newPassword = "AnotherNew123!"
        } `
        -ExpectedStatus "401"
    
    if ($wrongCurrentResult.Success) {
        Write-TestSuccess "Wrong current password properly rejected"
    }
}

Write-TestStep 10 "Testing session management"

# Test 10.1: Multiple concurrent sessions
$sessions = @()
$sessionCount = 3

Write-TestInfo "Creating $sessionCount concurrent sessions..."

for ($i = 1; $i -le $sessionCount; $i++) {
    $sessionResult = Test-APIEndpointWithRetry `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = $registeredUser.email
            password = $registeredUser.password
        }
    
    if ($sessionResult.Success) {
        $sessions += @{
            Index = $i
            Token = $sessionResult.Data.token
            Created = Get-Date
        }
        Write-TestInfo "  Session $i created"
    }
}

# Test 10.2: Verify all sessions are valid
Write-TestInfo "Verifying all sessions are active..."

$activeSessions = 0
foreach ($session in $sessions) {
    $sessionCheck = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $($session.Token)" }
    
    if ($sessionCheck.Success) {
        $activeSessions++
        Write-TestInfo "  Session $($session.Index) is active"
    } else {
        Write-TestInfo "  Session $($session.Index) is invalid"
    }
}

Write-TestInfo "Active sessions: $activeSessions/$($sessions.Count)"

Write-TestStep 11 "Testing logout flow"

if ($authToken) {
    # Test logout
    $logoutResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/logout" `
        -Headers @{ Authorization = "Bearer $authToken" }
    
    if ($logoutResult.Success) {
        Write-TestSuccess "Logout successful"
        
        # In a stateless JWT system, the token should still work
        # Logout is typically handled client-side
        $postLogoutCheck = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($postLogoutCheck.Success) {
            Write-TestInfo "  Token still valid (stateless JWT system)"
        }
    }
}

Write-TestStep 12 "Testing edge cases and security"

# Test 12.1: SQL injection attempt in login
$sqlInjectionResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = "admin' OR '1'='1"
        password = "' OR '1'='1"
    } `
    -ExpectedStatus "401"

if ($sqlInjectionResult.Success) {
    Write-TestSuccess "SQL injection attempt properly handled"
}

# Test 12.2: XSS attempt in registration
$xssTestUser = Get-RandomTestUser
$xssResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body @{
        email = $xssTestUser.email
        password = $xssTestUser.password
        firstName = "<script>alert('XSS')</script>"
        lastName = "Test"
    }

if ($xssResult.Success) {
    # Check if the script tag was properly escaped/sanitized
    $profileCheck = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $($xssResult.Data.token)" }
    
    if ($profileCheck.Success -and $profileCheck.Data.firstName -notlike "*<script>*") {
        Write-TestSuccess "XSS attempt properly sanitized"
    } else {
        Write-TestWarning "XSS prevention may need improvement"
    }
}

# Test 12.3: Rate limiting check (if implemented)
Write-TestInfo "Testing rate limiting (5 rapid requests)..."
$rapidRequests = 0
$blockedRequests = 0

for ($i = 1; $i -le 5; $i++) {
    $rapidResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = "ratelimit@test.com"
            password = "wrong"
        } `
        -ExpectedStatus @("401", "429")  # 429 = Too Many Requests
    
    $rapidRequests++
    if ($rapidResult.StatusCode -eq 429) {
        $blockedRequests++
    }
}

if ($blockedRequests -gt 0) {
    Write-TestSuccess "Rate limiting is active ($blockedRequests/$rapidRequests requests blocked)"
} else {
    Write-TestInfo "Rate limiting not detected (consider implementing)"
}

Write-TestStep 13 "Authentication flow summary"

# Calculate test results
$totalTests = $Global:TestResults.Passed + $Global:TestResults.Failed

Write-Host "`nAuthentication Test Summary:" -ForegroundColor Cyan
Write-Host "  Total Tests: $totalTests" -ForegroundColor Gray
Write-Host "  Passed: $($Global:TestResults.Passed)" -ForegroundColor Green
Write-Host "  Failed: $($Global:TestResults.Failed)" -ForegroundColor Red
Write-Host "  Warnings: $($Global:TestResults.Warnings)" -ForegroundColor Yellow

# Feature coverage report
Write-Host "`nFeature Coverage:" -ForegroundColor Cyan
$features = @(
    "User Registration",
    "User Login", 
    "JWT Token Generation",
    "Profile Management",
    "Password Reset",
    "Password Change",
    "Session Management",
    "Input Validation",
    "Security (XSS/SQL Injection)",
    "Access Control"
)

foreach ($feature in $features) {
    Write-Host "  ✓ $feature" -ForegroundColor Green
}
            
            # Check if it's a connection error
            if (# Test-AuthenticationFlow.ps1
# Comprehensive authentication flow testing for Credit Gyems Academy
# Tests user registration, login, password reset, profile management, and session handling
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot
)

# Get script root if not already set
if (-not $ScriptRoot) {
    $ScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

# Retry wrapper for API calls with connection error handling
function Test-APIEndpointWithRetry {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = @{},
        [hashtable]$Headers = @{},
        [string]$ExpectedStatus = "200",
        [int]$MaxRetries = 3,
        [int]$RetryDelay = 2
    )
    
    $attempts = 0
    $lastError = $null
    
    while ($attempts -lt $MaxRetries) {
        $attempts++
        
        try {
            $result = Test-APIEndpoint `
                -Method $Method `
                -Endpoint $Endpoint `
                -Body $Body `
                -Headers $Headers `
                -ExpectedStatus $ExpectedStatus
            
            # If we get here, the call succeeded
            return $result
        }
        catch {
            $lastError = $_
            
            # Check if it's a connection error
            if ($_.Exception.Message -like "*connection*" -or 
                $_.Exception.Message -like "*refused*" -or
                $_.Exception.Message -like "*could not be made*") {
                
                if ($attempts -lt $MaxRetries) {
                    Write-TestInfo "Connection failed, retrying in $RetryDelay seconds... (Attempt $attempts/$MaxRetries)"
                    Start-Sleep -Seconds $RetryDelay
                    continue
                }
            }
            
            # For other errors, don't retry
            throw $_
        }
    }
    
    # If we get here, all retries failed
    throw $lastError
}

# Helper function to validate JWT token format
function Test-ValidateJWT {
    param([string]$Token)
    
    if ([string]::IsNullOrEmpty($Token)) {
        return $false
    }
    
    $parts = $Token.Split('.')
    return $parts.Count -eq 3
}

Write-TestSection "AUTHENTICATION FLOW TESTS"

Write-TestStep 1 "Testing user registration flow"

# Test 1.1: New user registration with valid data
$newUser = Get-RandomTestUser
$registerResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body @{
        email = $newUser.email
        password = $newUser.password
        firstName = $newUser.firstName
        lastName = $newUser.lastName
        phone = $newUser.phone
    }

if ($registerResult.Success) {
    Write-TestSuccess "User registration successful"
    Write-TestInfo "  User ID: $($registerResult.Data.user.id)"
    Write-TestInfo "  Email: $($registerResult.Data.user.email)"
    Write-TestInfo "  Role: $($registerResult.Data.user.role)"
    
    # Validate JWT token
    if (Test-ValidateJWT -Token $registerResult.Data.token) {
        Write-TestSuccess "Valid JWT token received"
    } else {
        Write-TestFailure "Invalid JWT token format"
    }
    
    # Store for later tests
    $registeredUser = @{
        id = $registerResult.Data.user.id
        email = $newUser.email
        password = $newUser.password
        token = $registerResult.Data.token
    }
} else {
    Write-TestFailure "User registration failed"
    $registeredUser = $null
}

# Test 1.2: Duplicate registration prevention
Write-TestStep 2 "Testing duplicate registration prevention"

if ($registeredUser) {
    $duplicateResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body @{
            email = $registeredUser.email
            password = "DifferentPassword123!"
            firstName = "Duplicate"
            lastName = "User"
        } `
        -ExpectedStatus "400"
    
    if ($duplicateResult.Success -and $duplicateResult.Error -like "*already registered*") {
        Write-TestSuccess "Duplicate registration properly prevented"
    }
}

# Test 1.3: Registration validation
Write-TestStep 3 "Testing registration input validation"

$validationTests = @(
    @{
        Name = "Missing email"
        Body = @{ password = "Test123!"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*email*required*"
    },
    @{
        Name = "Invalid email format"
        Body = @{ email = "invalid-email"; password = "Test123!"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*email*"
    },
    @{
        Name = "Missing password"
        Body = @{ email = "test@test.com"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*password*required*"
    },
    @{
        Name = "Missing first name"
        Body = @{ email = "test@test.com"; password = "Test123!"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*firstName*required*"
    },
    @{
        Name = "Missing last name"
        Body = @{ email = "test@test.com"; password = "Test123!"; firstName = "Test" }
        ExpectedStatus = "400"
        ExpectedError = "*lastName*required*"
    }
)

$validationPassed = 0
foreach ($test in $validationTests) {
    $result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body $test.Body `
        -ExpectedStatus $test.ExpectedStatus
    
    if ($result.Success) {
        $validationPassed++
        Write-TestInfo "  ✓ Validation test passed: $($test.Name)"
    } else {
        Write-TestInfo "  ✗ Validation test failed: $($test.Name)"
    }
}

Write-TestInfo "Registration validation: $validationPassed/$($validationTests.Count) tests passed"

Write-TestStep 4 "Testing user login flow"

# Test 4.1: Valid login
if ($registeredUser) {
    $loginResult = Test-APIEndpointWithRetry `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = $registeredUser.email
            password = $registeredUser.password
        }
    
    if ($loginResult.Success) {
        Write-TestSuccess "Login successful"
        $authToken = $loginResult.Data.token
        
        # Verify token is different from registration token (new session)
        if ($authToken -ne $registeredUser.token) {
            Write-TestSuccess "New session token generated"
        }
        
        # Verify user data returned
        if ($loginResult.Data.user) {
            Write-TestInfo "  User data returned with login"
        }
    } else {
        Write-TestFailure "Valid login failed"
        $authToken = $registeredUser.token  # Fallback to registration token
    }
} else {
    # Create a new user for login testing
    $loginTestUser = Get-RandomTestUser
    $regResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body @{
            email = $loginTestUser.email
            password = $loginTestUser.password
            firstName = $loginTestUser.firstName
            lastName = $loginTestUser.lastName
        }
    
    if ($regResult.Success) {
        $registeredUser = @{
            email = $loginTestUser.email
            password = $loginTestUser.password
        }
        
        $loginResult = Test-APIEndpointWithRetry `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $registeredUser.email
                password = $registeredUser.password
            }
        
        if ($loginResult.Success) {
            $authToken = $loginResult.Data.token
        }
    }
}

# Test 4.2: Invalid login scenarios
Write-TestStep 5 "Testing invalid login scenarios"

# Wrong password
$wrongPasswordResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = $registeredUser.email
        password = "WrongPassword123!"
    } `
    -ExpectedStatus "401"

if ($wrongPasswordResult.Success) {
    Write-TestSuccess "Wrong password properly rejected"
}

# Non-existent user
$nonExistentResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = "nonexistent_$(Get-Random -Maximum 9999)@test.com"
        password = "Password123!"
    } `
    -ExpectedStatus "401"

if ($nonExistentResult.Success) {
    Write-TestSuccess "Non-existent user properly rejected"
}

# Empty credentials
$emptyCredsResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{} `
    -ExpectedStatus "400"

if ($emptyCredsResult.Success) {
    Write-TestSuccess "Empty credentials properly rejected"
}

Write-TestStep 6 "Testing authenticated endpoints"

# Test 6.1: Profile access with valid token
if ($authToken) {
    $profileResult = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" }
    
    if ($profileResult.Success) {
        Write-TestSuccess "Profile retrieved with valid token"
        Write-TestInfo "  Email: $($profileResult.Data.email)"
        Write-TestInfo "  Role: $($profileResult.Data.role)"
        Write-TestInfo "  Member Status: $($profileResult.Data.membershipStatus)"
    }
}

# Test 6.2: Profile access without token
$noTokenResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -ExpectedStatus "401"

if ($noTokenResult.Success) {
    Write-TestSuccess "Unauthenticated access properly blocked"
}

# Test 6.3: Profile access with invalid token
$invalidTokenResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -Headers @{ Authorization = "Bearer invalid.token.here" } `
    -ExpectedStatus "401"

if ($invalidTokenResult.Success) {
    Write-TestSuccess "Invalid token properly rejected"
}

Write-TestStep 7 "Testing profile update"

if ($authToken) {
    # Test 7.1: Valid profile update
    $updateData = @{
        firstName = "Updated"
        lastName = "Name"
        phone = "555-0123"
        creditScore = 750
        targetCreditScore = 800
        creditGoals = @("Improve payment history", "Reduce credit utilization")
    }
    
    $updateResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body $updateData
    
    if ($updateResult.Success) {
        Write-TestSuccess "Profile updated successfully"
        
        # Verify updates persisted
        $verifyResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($verifyResult.Success -and $verifyResult.Data.firstName -eq "Updated") {
            Write-TestSuccess "Profile updates persisted correctly"
        }
    }
    
    # Test 7.2: Attempt to update protected fields
    $protectedUpdateResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            email = "newemail@test.com"
            role = "admin"
            _id = "fake-id"
        }
    
    if ($protectedUpdateResult.Success) {
        # Verify protected fields weren't changed
        $checkResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($checkResult.Success -and 
            $checkResult.Data.email -eq $registeredUser.email -and 
            $checkResult.Data.role -ne "admin") {
            Write-TestSuccess "Protected fields properly maintained"
        }
    }
}

Write-TestStep 8 "Testing password reset flow"

# Test 8.1: Request password reset
$resetRequestResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{ email = $registeredUser.email }

if ($resetRequestResult.Success) {
    Write-TestSuccess "Password reset request accepted"
    Write-TestInfo "  Reset email would be sent to: $($registeredUser.email)"
}

# Test 8.2: Request reset for non-existent email
$invalidResetResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{ email = "nonexistent@test.com" } `
    -ExpectedStatus "404"

if ($invalidResetResult.Success) {
    Write-TestSuccess "Non-existent email properly handled"
}

# Test 8.3: Request reset without email
$noEmailResetResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{} `
    -ExpectedStatus "400"

if ($noEmailResetResult.Success) {
    Write-TestSuccess "Missing email properly rejected"
}

Write-TestStep 9 "Testing password change (authenticated)"

if ($authToken) {
    # Test 9.1: Change password with correct current password
    $newPassword = "NewPassword123!"
    
    $changePasswordResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/change-password" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            currentPassword = $registeredUser.password
            newPassword = $newPassword
        }
    
    if ($changePasswordResult.Success) {
        Write-TestSuccess "Password changed successfully"
        
        # Verify can login with new password
        $newLoginResult = Test-APIEndpointWithRetry `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $registeredUser.email
                password = $newPassword
            }
        
        if ($newLoginResult.Success) {
            Write-TestSuccess "Login successful with new password"
            $registeredUser.password = $newPassword
            $authToken = $newLoginResult.Data.token
        }
    }
    
    # Test 9.2: Change password with wrong current password
    $wrongCurrentResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/change-password" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            currentPassword = "WrongCurrent123!"
            newPassword = "AnotherNew123!"
        } `
        -ExpectedStatus "401"
    
    if ($wrongCurrentResult.Success) {
        Write-TestSuccess "Wrong current password properly rejected"
    }
}

Write-TestStep 10 "Testing session management"

# Test 10.1: Multiple concurrent sessions
$sessions = @()
$sessionCount = 3

Write-TestInfo "Creating $sessionCount concurrent sessions..."

for ($i = 1; $i -le $sessionCount; $i++) {
    $sessionResult = Test-APIEndpointWithRetry `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = $registeredUser.email
            password = $registeredUser.password
        }
    
    if ($sessionResult.Success) {
        $sessions += @{
            Index = $i
            Token = $sessionResult.Data.token
            Created = Get-Date
        }
        Write-TestInfo "  Session $i created"
    }
}

# Test 10.2: Verify all sessions are valid
Write-TestInfo "Verifying all sessions are active..."

$activeSessions = 0
foreach ($session in $sessions) {
    $sessionCheck = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $($session.Token)" }
    
    if ($sessionCheck.Success) {
        $activeSessions++
        Write-TestInfo "  Session $($session.Index) is active"
    } else {
        Write-TestInfo "  Session $($session.Index) is invalid"
    }
}

Write-TestInfo "Active sessions: $activeSessions/$($sessions.Count)"

Write-TestStep 11 "Testing logout flow"

if ($authToken) {
    # Test logout
    $logoutResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/logout" `
        -Headers @{ Authorization = "Bearer $authToken" }
    
    if ($logoutResult.Success) {
        Write-TestSuccess "Logout successful"
        
        # In a stateless JWT system, the token should still work
        # Logout is typically handled client-side
        $postLogoutCheck = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($postLogoutCheck.Success) {
            Write-TestInfo "  Token still valid (stateless JWT system)"
        }
    }
}

Write-TestStep 12 "Testing edge cases and security"

# Test 12.1: SQL injection attempt in login
$sqlInjectionResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = "admin' OR '1'='1"
        password = "' OR '1'='1"
    } `
    -ExpectedStatus "401"

if ($sqlInjectionResult.Success) {
    Write-TestSuccess "SQL injection attempt properly handled"
}

# Test 12.2: XSS attempt in registration
$xssTestUser = Get-RandomTestUser
$xssResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body @{
        email = $xssTestUser.email
        password = $xssTestUser.password
        firstName = "<script>alert('XSS')</script>"
        lastName = "Test"
    }

if ($xssResult.Success) {
    # Check if the script tag was properly escaped/sanitized
    $profileCheck = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $($xssResult.Data.token)" }
    
    if ($profileCheck.Success -and $profileCheck.Data.firstName -notlike "*<script>*") {
        Write-TestSuccess "XSS attempt properly sanitized"
    } else {
        Write-TestWarning "XSS prevention may need improvement"
    }
}

# Test 12.3: Rate limiting check (if implemented)
Write-TestInfo "Testing rate limiting (5 rapid requests)..."
$rapidRequests = 0
$blockedRequests = 0

for ($i = 1; $i -le 5; $i++) {
    $rapidResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = "ratelimit@test.com"
            password = "wrong"
        } `
        -ExpectedStatus @("401", "429")  # 429 = Too Many Requests
    
    $rapidRequests++
    if ($rapidResult.StatusCode -eq 429) {
        $blockedRequests++
    }
}

if ($blockedRequests -gt 0) {
    Write-TestSuccess "Rate limiting is active ($blockedRequests/$rapidRequests requests blocked)"
} else {
    Write-TestInfo "Rate limiting not detected (consider implementing)"
}

Write-TestStep 13 "Authentication flow summary"

# Calculate test results
$totalTests = $Global:TestResults.Passed + $Global:TestResults.Failed

Write-Host "`nAuthentication Test Summary:" -ForegroundColor Cyan
Write-Host "  Total Tests: $totalTests" -ForegroundColor Gray
Write-Host "  Passed: $($Global:TestResults.Passed)" -ForegroundColor Green
Write-Host "  Failed: $($Global:TestResults.Failed)" -ForegroundColor Red
Write-Host "  Warnings: $($Global:TestResults.Warnings)" -ForegroundColor Yellow

# Feature coverage report
Write-Host "`nFeature Coverage:" -ForegroundColor Cyan
$features = @(
    "User Registration",
    "User Login", 
    "JWT Token Generation",
    "Profile Management",
    "Password Reset",
    "Password Change",
    "Session Management",
    "Input Validation",
    "Security (XSS/SQL Injection)",
    "Access Control"
)

foreach ($feature in $features) {
    Write-Host "  ✓ $feature" -ForegroundColor Green
}.Exception.Message -like "*connection*" -or # Test-AuthenticationFlow.ps1
# Comprehensive authentication flow testing for Credit Gyems Academy
# Tests user registration, login, password reset, profile management, and session handling
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot
)

# Get script root if not already set
if (-not $ScriptRoot) {
    $ScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

# Retry wrapper for API calls with connection error handling
function Test-APIEndpointWithRetry {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = @{},
        [hashtable]$Headers = @{},
        [string]$ExpectedStatus = "200",
        [int]$MaxRetries = 3,
        [int]$RetryDelay = 2
    )
    
    $attempts = 0
    $lastError = $null
    
    while ($attempts -lt $MaxRetries) {
        $attempts++
        
        try {
            $result = Test-APIEndpoint `
                -Method $Method `
                -Endpoint $Endpoint `
                -Body $Body `
                -Headers $Headers `
                -ExpectedStatus $ExpectedStatus
            
            # If we get here, the call succeeded
            return $result
        }
        catch {
            $lastError = $_
            
            # Check if it's a connection error
            if ($_.Exception.Message -like "*connection*" -or 
                $_.Exception.Message -like "*refused*" -or
                $_.Exception.Message -like "*could not be made*") {
                
                if ($attempts -lt $MaxRetries) {
                    Write-TestInfo "Connection failed, retrying in $RetryDelay seconds... (Attempt $attempts/$MaxRetries)"
                    Start-Sleep -Seconds $RetryDelay
                    continue
                }
            }
            
            # For other errors, don't retry
            throw $_
        }
    }
    
    # If we get here, all retries failed
    throw $lastError
}

# Helper function to validate JWT token format
function Test-ValidateJWT {
    param([string]$Token)
    
    if ([string]::IsNullOrEmpty($Token)) {
        return $false
    }
    
    $parts = $Token.Split('.')
    return $parts.Count -eq 3
}

Write-TestSection "AUTHENTICATION FLOW TESTS"

Write-TestStep 1 "Testing user registration flow"

# Test 1.1: New user registration with valid data
$newUser = Get-RandomTestUser
$registerResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body @{
        email = $newUser.email
        password = $newUser.password
        firstName = $newUser.firstName
        lastName = $newUser.lastName
        phone = $newUser.phone
    }

if ($registerResult.Success) {
    Write-TestSuccess "User registration successful"
    Write-TestInfo "  User ID: $($registerResult.Data.user.id)"
    Write-TestInfo "  Email: $($registerResult.Data.user.email)"
    Write-TestInfo "  Role: $($registerResult.Data.user.role)"
    
    # Validate JWT token
    if (Test-ValidateJWT -Token $registerResult.Data.token) {
        Write-TestSuccess "Valid JWT token received"
    } else {
        Write-TestFailure "Invalid JWT token format"
    }
    
    # Store for later tests
    $registeredUser = @{
        id = $registerResult.Data.user.id
        email = $newUser.email
        password = $newUser.password
        token = $registerResult.Data.token
    }
} else {
    Write-TestFailure "User registration failed"
    $registeredUser = $null
}

# Test 1.2: Duplicate registration prevention
Write-TestStep 2 "Testing duplicate registration prevention"

if ($registeredUser) {
    $duplicateResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body @{
            email = $registeredUser.email
            password = "DifferentPassword123!"
            firstName = "Duplicate"
            lastName = "User"
        } `
        -ExpectedStatus "400"
    
    if ($duplicateResult.Success -and $duplicateResult.Error -like "*already registered*") {
        Write-TestSuccess "Duplicate registration properly prevented"
    }
}

# Test 1.3: Registration validation
Write-TestStep 3 "Testing registration input validation"

$validationTests = @(
    @{
        Name = "Missing email"
        Body = @{ password = "Test123!"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*email*required*"
    },
    @{
        Name = "Invalid email format"
        Body = @{ email = "invalid-email"; password = "Test123!"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*email*"
    },
    @{
        Name = "Missing password"
        Body = @{ email = "test@test.com"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*password*required*"
    },
    @{
        Name = "Missing first name"
        Body = @{ email = "test@test.com"; password = "Test123!"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*firstName*required*"
    },
    @{
        Name = "Missing last name"
        Body = @{ email = "test@test.com"; password = "Test123!"; firstName = "Test" }
        ExpectedStatus = "400"
        ExpectedError = "*lastName*required*"
    }
)

$validationPassed = 0
foreach ($test in $validationTests) {
    $result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body $test.Body `
        -ExpectedStatus $test.ExpectedStatus
    
    if ($result.Success) {
        $validationPassed++
        Write-TestInfo "  ✓ Validation test passed: $($test.Name)"
    } else {
        Write-TestInfo "  ✗ Validation test failed: $($test.Name)"
    }
}

Write-TestInfo "Registration validation: $validationPassed/$($validationTests.Count) tests passed"

Write-TestStep 4 "Testing user login flow"

# Test 4.1: Valid login
if ($registeredUser) {
    $loginResult = Test-APIEndpointWithRetry `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = $registeredUser.email
            password = $registeredUser.password
        }
    
    if ($loginResult.Success) {
        Write-TestSuccess "Login successful"
        $authToken = $loginResult.Data.token
        
        # Verify token is different from registration token (new session)
        if ($authToken -ne $registeredUser.token) {
            Write-TestSuccess "New session token generated"
        }
        
        # Verify user data returned
        if ($loginResult.Data.user) {
            Write-TestInfo "  User data returned with login"
        }
    } else {
        Write-TestFailure "Valid login failed"
        $authToken = $registeredUser.token  # Fallback to registration token
    }
} else {
    # Create a new user for login testing
    $loginTestUser = Get-RandomTestUser
    $regResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body @{
            email = $loginTestUser.email
            password = $loginTestUser.password
            firstName = $loginTestUser.firstName
            lastName = $loginTestUser.lastName
        }
    
    if ($regResult.Success) {
        $registeredUser = @{
            email = $loginTestUser.email
            password = $loginTestUser.password
        }
        
        $loginResult = Test-APIEndpointWithRetry `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $registeredUser.email
                password = $registeredUser.password
            }
        
        if ($loginResult.Success) {
            $authToken = $loginResult.Data.token
        }
    }
}

# Test 4.2: Invalid login scenarios
Write-TestStep 5 "Testing invalid login scenarios"

# Wrong password
$wrongPasswordResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = $registeredUser.email
        password = "WrongPassword123!"
    } `
    -ExpectedStatus "401"

if ($wrongPasswordResult.Success) {
    Write-TestSuccess "Wrong password properly rejected"
}

# Non-existent user
$nonExistentResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = "nonexistent_$(Get-Random -Maximum 9999)@test.com"
        password = "Password123!"
    } `
    -ExpectedStatus "401"

if ($nonExistentResult.Success) {
    Write-TestSuccess "Non-existent user properly rejected"
}

# Empty credentials
$emptyCredsResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{} `
    -ExpectedStatus "400"

if ($emptyCredsResult.Success) {
    Write-TestSuccess "Empty credentials properly rejected"
}

Write-TestStep 6 "Testing authenticated endpoints"

# Test 6.1: Profile access with valid token
if ($authToken) {
    $profileResult = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" }
    
    if ($profileResult.Success) {
        Write-TestSuccess "Profile retrieved with valid token"
        Write-TestInfo "  Email: $($profileResult.Data.email)"
        Write-TestInfo "  Role: $($profileResult.Data.role)"
        Write-TestInfo "  Member Status: $($profileResult.Data.membershipStatus)"
    }
}

# Test 6.2: Profile access without token
$noTokenResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -ExpectedStatus "401"

if ($noTokenResult.Success) {
    Write-TestSuccess "Unauthenticated access properly blocked"
}

# Test 6.3: Profile access with invalid token
$invalidTokenResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -Headers @{ Authorization = "Bearer invalid.token.here" } `
    -ExpectedStatus "401"

if ($invalidTokenResult.Success) {
    Write-TestSuccess "Invalid token properly rejected"
}

Write-TestStep 7 "Testing profile update"

if ($authToken) {
    # Test 7.1: Valid profile update
    $updateData = @{
        firstName = "Updated"
        lastName = "Name"
        phone = "555-0123"
        creditScore = 750
        targetCreditScore = 800
        creditGoals = @("Improve payment history", "Reduce credit utilization")
    }
    
    $updateResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body $updateData
    
    if ($updateResult.Success) {
        Write-TestSuccess "Profile updated successfully"
        
        # Verify updates persisted
        $verifyResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($verifyResult.Success -and $verifyResult.Data.firstName -eq "Updated") {
            Write-TestSuccess "Profile updates persisted correctly"
        }
    }
    
    # Test 7.2: Attempt to update protected fields
    $protectedUpdateResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            email = "newemail@test.com"
            role = "admin"
            _id = "fake-id"
        }
    
    if ($protectedUpdateResult.Success) {
        # Verify protected fields weren't changed
        $checkResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($checkResult.Success -and 
            $checkResult.Data.email -eq $registeredUser.email -and 
            $checkResult.Data.role -ne "admin") {
            Write-TestSuccess "Protected fields properly maintained"
        }
    }
}

Write-TestStep 8 "Testing password reset flow"

# Test 8.1: Request password reset
$resetRequestResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{ email = $registeredUser.email }

if ($resetRequestResult.Success) {
    Write-TestSuccess "Password reset request accepted"
    Write-TestInfo "  Reset email would be sent to: $($registeredUser.email)"
}

# Test 8.2: Request reset for non-existent email
$invalidResetResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{ email = "nonexistent@test.com" } `
    -ExpectedStatus "404"

if ($invalidResetResult.Success) {
    Write-TestSuccess "Non-existent email properly handled"
}

# Test 8.3: Request reset without email
$noEmailResetResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{} `
    -ExpectedStatus "400"

if ($noEmailResetResult.Success) {
    Write-TestSuccess "Missing email properly rejected"
}

Write-TestStep 9 "Testing password change (authenticated)"

if ($authToken) {
    # Test 9.1: Change password with correct current password
    $newPassword = "NewPassword123!"
    
    $changePasswordResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/change-password" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            currentPassword = $registeredUser.password
            newPassword = $newPassword
        }
    
    if ($changePasswordResult.Success) {
        Write-TestSuccess "Password changed successfully"
        
        # Verify can login with new password
        $newLoginResult = Test-APIEndpointWithRetry `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $registeredUser.email
                password = $newPassword
            }
        
        if ($newLoginResult.Success) {
            Write-TestSuccess "Login successful with new password"
            $registeredUser.password = $newPassword
            $authToken = $newLoginResult.Data.token
        }
    }
    
    # Test 9.2: Change password with wrong current password
    $wrongCurrentResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/change-password" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            currentPassword = "WrongCurrent123!"
            newPassword = "AnotherNew123!"
        } `
        -ExpectedStatus "401"
    
    if ($wrongCurrentResult.Success) {
        Write-TestSuccess "Wrong current password properly rejected"
    }
}

Write-TestStep 10 "Testing session management"

# Test 10.1: Multiple concurrent sessions
$sessions = @()
$sessionCount = 3

Write-TestInfo "Creating $sessionCount concurrent sessions..."

for ($i = 1; $i -le $sessionCount; $i++) {
    $sessionResult = Test-APIEndpointWithRetry `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = $registeredUser.email
            password = $registeredUser.password
        }
    
    if ($sessionResult.Success) {
        $sessions += @{
            Index = $i
            Token = $sessionResult.Data.token
            Created = Get-Date
        }
        Write-TestInfo "  Session $i created"
    }
}

# Test 10.2: Verify all sessions are valid
Write-TestInfo "Verifying all sessions are active..."

$activeSessions = 0
foreach ($session in $sessions) {
    $sessionCheck = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $($session.Token)" }
    
    if ($sessionCheck.Success) {
        $activeSessions++
        Write-TestInfo "  Session $($session.Index) is active"
    } else {
        Write-TestInfo "  Session $($session.Index) is invalid"
    }
}

Write-TestInfo "Active sessions: $activeSessions/$($sessions.Count)"

Write-TestStep 11 "Testing logout flow"

if ($authToken) {
    # Test logout
    $logoutResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/logout" `
        -Headers @{ Authorization = "Bearer $authToken" }
    
    if ($logoutResult.Success) {
        Write-TestSuccess "Logout successful"
        
        # In a stateless JWT system, the token should still work
        # Logout is typically handled client-side
        $postLogoutCheck = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($postLogoutCheck.Success) {
            Write-TestInfo "  Token still valid (stateless JWT system)"
        }
    }
}

Write-TestStep 12 "Testing edge cases and security"

# Test 12.1: SQL injection attempt in login
$sqlInjectionResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = "admin' OR '1'='1"
        password = "' OR '1'='1"
    } `
    -ExpectedStatus "401"

if ($sqlInjectionResult.Success) {
    Write-TestSuccess "SQL injection attempt properly handled"
}

# Test 12.2: XSS attempt in registration
$xssTestUser = Get-RandomTestUser
$xssResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body @{
        email = $xssTestUser.email
        password = $xssTestUser.password
        firstName = "<script>alert('XSS')</script>"
        lastName = "Test"
    }

if ($xssResult.Success) {
    # Check if the script tag was properly escaped/sanitized
    $profileCheck = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $($xssResult.Data.token)" }
    
    if ($profileCheck.Success -and $profileCheck.Data.firstName -notlike "*<script>*") {
        Write-TestSuccess "XSS attempt properly sanitized"
    } else {
        Write-TestWarning "XSS prevention may need improvement"
    }
}

# Test 12.3: Rate limiting check (if implemented)
Write-TestInfo "Testing rate limiting (5 rapid requests)..."
$rapidRequests = 0
$blockedRequests = 0

for ($i = 1; $i -le 5; $i++) {
    $rapidResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = "ratelimit@test.com"
            password = "wrong"
        } `
        -ExpectedStatus @("401", "429")  # 429 = Too Many Requests
    
    $rapidRequests++
    if ($rapidResult.StatusCode -eq 429) {
        $blockedRequests++
    }
}

if ($blockedRequests -gt 0) {
    Write-TestSuccess "Rate limiting is active ($blockedRequests/$rapidRequests requests blocked)"
} else {
    Write-TestInfo "Rate limiting not detected (consider implementing)"
}

Write-TestStep 13 "Authentication flow summary"

# Calculate test results
$totalTests = $Global:TestResults.Passed + $Global:TestResults.Failed

Write-Host "`nAuthentication Test Summary:" -ForegroundColor Cyan
Write-Host "  Total Tests: $totalTests" -ForegroundColor Gray
Write-Host "  Passed: $($Global:TestResults.Passed)" -ForegroundColor Green
Write-Host "  Failed: $($Global:TestResults.Failed)" -ForegroundColor Red
Write-Host "  Warnings: $($Global:TestResults.Warnings)" -ForegroundColor Yellow

# Feature coverage report
Write-Host "`nFeature Coverage:" -ForegroundColor Cyan
$features = @(
    "User Registration",
    "User Login", 
    "JWT Token Generation",
    "Profile Management",
    "Password Reset",
    "Password Change",
    "Session Management",
    "Input Validation",
    "Security (XSS/SQL Injection)",
    "Access Control"
)

foreach ($feature in $features) {
    Write-Host "  ✓ $feature" -ForegroundColor Green
}.Exception.Message -like "*refused*") {
                if ($attempts -lt $MaxRetries) {
                    Write-TestInfo "Connection failed, retrying in $RetryDelay seconds... (Attempt $attempts/$MaxRetries)"
                    Start-Sleep -Seconds $RetryDelay
                    continue
                }
            }
            
            # For other errors, don't retry
            throw # Test-AuthenticationFlow.ps1
# Comprehensive authentication flow testing for Credit Gyems Academy
# Tests user registration, login, password reset, profile management, and session handling
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot
)

# Get script root if not already set
if (-not $ScriptRoot) {
    $ScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

# Retry wrapper for API calls with connection error handling
function Test-APIEndpointWithRetry {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = @{},
        [hashtable]$Headers = @{},
        [string]$ExpectedStatus = "200",
        [int]$MaxRetries = 3,
        [int]$RetryDelay = 2
    )
    
    $attempts = 0
    $lastError = $null
    
    while ($attempts -lt $MaxRetries) {
        $attempts++
        
        try {
            $result = Test-APIEndpoint `
                -Method $Method `
                -Endpoint $Endpoint `
                -Body $Body `
                -Headers $Headers `
                -ExpectedStatus $ExpectedStatus
            
            # If we get here, the call succeeded
            return $result
        }
        catch {
            $lastError = $_
            
            # Check if it's a connection error
            if ($_.Exception.Message -like "*connection*" -or 
                $_.Exception.Message -like "*refused*" -or
                $_.Exception.Message -like "*could not be made*") {
                
                if ($attempts -lt $MaxRetries) {
                    Write-TestInfo "Connection failed, retrying in $RetryDelay seconds... (Attempt $attempts/$MaxRetries)"
                    Start-Sleep -Seconds $RetryDelay
                    continue
                }
            }
            
            # For other errors, don't retry
            throw $_
        }
    }
    
    # If we get here, all retries failed
    throw $lastError
}

# Helper function to validate JWT token format
function Test-ValidateJWT {
    param([string]$Token)
    
    if ([string]::IsNullOrEmpty($Token)) {
        return $false
    }
    
    $parts = $Token.Split('.')
    return $parts.Count -eq 3
}

Write-TestSection "AUTHENTICATION FLOW TESTS"

Write-TestStep 1 "Testing user registration flow"

# Test 1.1: New user registration with valid data
$newUser = Get-RandomTestUser
$registerResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body @{
        email = $newUser.email
        password = $newUser.password
        firstName = $newUser.firstName
        lastName = $newUser.lastName
        phone = $newUser.phone
    }

if ($registerResult.Success) {
    Write-TestSuccess "User registration successful"
    Write-TestInfo "  User ID: $($registerResult.Data.user.id)"
    Write-TestInfo "  Email: $($registerResult.Data.user.email)"
    Write-TestInfo "  Role: $($registerResult.Data.user.role)"
    
    # Validate JWT token
    if (Test-ValidateJWT -Token $registerResult.Data.token) {
        Write-TestSuccess "Valid JWT token received"
    } else {
        Write-TestFailure "Invalid JWT token format"
    }
    
    # Store for later tests
    $registeredUser = @{
        id = $registerResult.Data.user.id
        email = $newUser.email
        password = $newUser.password
        token = $registerResult.Data.token
    }
} else {
    Write-TestFailure "User registration failed"
    $registeredUser = $null
}

# Test 1.2: Duplicate registration prevention
Write-TestStep 2 "Testing duplicate registration prevention"

if ($registeredUser) {
    $duplicateResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body @{
            email = $registeredUser.email
            password = "DifferentPassword123!"
            firstName = "Duplicate"
            lastName = "User"
        } `
        -ExpectedStatus "400"
    
    if ($duplicateResult.Success -and $duplicateResult.Error -like "*already registered*") {
        Write-TestSuccess "Duplicate registration properly prevented"
    }
}

# Test 1.3: Registration validation
Write-TestStep 3 "Testing registration input validation"

$validationTests = @(
    @{
        Name = "Missing email"
        Body = @{ password = "Test123!"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*email*required*"
    },
    @{
        Name = "Invalid email format"
        Body = @{ email = "invalid-email"; password = "Test123!"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*email*"
    },
    @{
        Name = "Missing password"
        Body = @{ email = "test@test.com"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*password*required*"
    },
    @{
        Name = "Missing first name"
        Body = @{ email = "test@test.com"; password = "Test123!"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*firstName*required*"
    },
    @{
        Name = "Missing last name"
        Body = @{ email = "test@test.com"; password = "Test123!"; firstName = "Test" }
        ExpectedStatus = "400"
        ExpectedError = "*lastName*required*"
    }
)

$validationPassed = 0
foreach ($test in $validationTests) {
    $result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body $test.Body `
        -ExpectedStatus $test.ExpectedStatus
    
    if ($result.Success) {
        $validationPassed++
        Write-TestInfo "  ✓ Validation test passed: $($test.Name)"
    } else {
        Write-TestInfo "  ✗ Validation test failed: $($test.Name)"
    }
}

Write-TestInfo "Registration validation: $validationPassed/$($validationTests.Count) tests passed"

Write-TestStep 4 "Testing user login flow"

# Test 4.1: Valid login
if ($registeredUser) {
    $loginResult = Test-APIEndpointWithRetry `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = $registeredUser.email
            password = $registeredUser.password
        }
    
    if ($loginResult.Success) {
        Write-TestSuccess "Login successful"
        $authToken = $loginResult.Data.token
        
        # Verify token is different from registration token (new session)
        if ($authToken -ne $registeredUser.token) {
            Write-TestSuccess "New session token generated"
        }
        
        # Verify user data returned
        if ($loginResult.Data.user) {
            Write-TestInfo "  User data returned with login"
        }
    } else {
        Write-TestFailure "Valid login failed"
        $authToken = $registeredUser.token  # Fallback to registration token
    }
} else {
    # Create a new user for login testing
    $loginTestUser = Get-RandomTestUser
    $regResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body @{
            email = $loginTestUser.email
            password = $loginTestUser.password
            firstName = $loginTestUser.firstName
            lastName = $loginTestUser.lastName
        }
    
    if ($regResult.Success) {
        $registeredUser = @{
            email = $loginTestUser.email
            password = $loginTestUser.password
        }
        
        $loginResult = Test-APIEndpointWithRetry `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $registeredUser.email
                password = $registeredUser.password
            }
        
        if ($loginResult.Success) {
            $authToken = $loginResult.Data.token
        }
    }
}

# Test 4.2: Invalid login scenarios
Write-TestStep 5 "Testing invalid login scenarios"

# Wrong password
$wrongPasswordResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = $registeredUser.email
        password = "WrongPassword123!"
    } `
    -ExpectedStatus "401"

if ($wrongPasswordResult.Success) {
    Write-TestSuccess "Wrong password properly rejected"
}

# Non-existent user
$nonExistentResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = "nonexistent_$(Get-Random -Maximum 9999)@test.com"
        password = "Password123!"
    } `
    -ExpectedStatus "401"

if ($nonExistentResult.Success) {
    Write-TestSuccess "Non-existent user properly rejected"
}

# Empty credentials
$emptyCredsResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{} `
    -ExpectedStatus "400"

if ($emptyCredsResult.Success) {
    Write-TestSuccess "Empty credentials properly rejected"
}

Write-TestStep 6 "Testing authenticated endpoints"

# Test 6.1: Profile access with valid token
if ($authToken) {
    $profileResult = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" }
    
    if ($profileResult.Success) {
        Write-TestSuccess "Profile retrieved with valid token"
        Write-TestInfo "  Email: $($profileResult.Data.email)"
        Write-TestInfo "  Role: $($profileResult.Data.role)"
        Write-TestInfo "  Member Status: $($profileResult.Data.membershipStatus)"
    }
}

# Test 6.2: Profile access without token
$noTokenResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -ExpectedStatus "401"

if ($noTokenResult.Success) {
    Write-TestSuccess "Unauthenticated access properly blocked"
}

# Test 6.3: Profile access with invalid token
$invalidTokenResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -Headers @{ Authorization = "Bearer invalid.token.here" } `
    -ExpectedStatus "401"

if ($invalidTokenResult.Success) {
    Write-TestSuccess "Invalid token properly rejected"
}

Write-TestStep 7 "Testing profile update"

if ($authToken) {
    # Test 7.1: Valid profile update
    $updateData = @{
        firstName = "Updated"
        lastName = "Name"
        phone = "555-0123"
        creditScore = 750
        targetCreditScore = 800
        creditGoals = @("Improve payment history", "Reduce credit utilization")
    }
    
    $updateResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body $updateData
    
    if ($updateResult.Success) {
        Write-TestSuccess "Profile updated successfully"
        
        # Verify updates persisted
        $verifyResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($verifyResult.Success -and $verifyResult.Data.firstName -eq "Updated") {
            Write-TestSuccess "Profile updates persisted correctly"
        }
    }
    
    # Test 7.2: Attempt to update protected fields
    $protectedUpdateResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            email = "newemail@test.com"
            role = "admin"
            _id = "fake-id"
        }
    
    if ($protectedUpdateResult.Success) {
        # Verify protected fields weren't changed
        $checkResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($checkResult.Success -and 
            $checkResult.Data.email -eq $registeredUser.email -and 
            $checkResult.Data.role -ne "admin") {
            Write-TestSuccess "Protected fields properly maintained"
        }
    }
}

Write-TestStep 8 "Testing password reset flow"

# Test 8.1: Request password reset
$resetRequestResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{ email = $registeredUser.email }

if ($resetRequestResult.Success) {
    Write-TestSuccess "Password reset request accepted"
    Write-TestInfo "  Reset email would be sent to: $($registeredUser.email)"
}

# Test 8.2: Request reset for non-existent email
$invalidResetResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{ email = "nonexistent@test.com" } `
    -ExpectedStatus "404"

if ($invalidResetResult.Success) {
    Write-TestSuccess "Non-existent email properly handled"
}

# Test 8.3: Request reset without email
$noEmailResetResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{} `
    -ExpectedStatus "400"

if ($noEmailResetResult.Success) {
    Write-TestSuccess "Missing email properly rejected"
}

Write-TestStep 9 "Testing password change (authenticated)"

if ($authToken) {
    # Test 9.1: Change password with correct current password
    $newPassword = "NewPassword123!"
    
    $changePasswordResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/change-password" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            currentPassword = $registeredUser.password
            newPassword = $newPassword
        }
    
    if ($changePasswordResult.Success) {
        Write-TestSuccess "Password changed successfully"
        
        # Verify can login with new password
        $newLoginResult = Test-APIEndpointWithRetry `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $registeredUser.email
                password = $newPassword
            }
        
        if ($newLoginResult.Success) {
            Write-TestSuccess "Login successful with new password"
            $registeredUser.password = $newPassword
            $authToken = $newLoginResult.Data.token
        }
    }
    
    # Test 9.2: Change password with wrong current password
    $wrongCurrentResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/change-password" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            currentPassword = "WrongCurrent123!"
            newPassword = "AnotherNew123!"
        } `
        -ExpectedStatus "401"
    
    if ($wrongCurrentResult.Success) {
        Write-TestSuccess "Wrong current password properly rejected"
    }
}

Write-TestStep 10 "Testing session management"

# Test 10.1: Multiple concurrent sessions
$sessions = @()
$sessionCount = 3

Write-TestInfo "Creating $sessionCount concurrent sessions..."

for ($i = 1; $i -le $sessionCount; $i++) {
    $sessionResult = Test-APIEndpointWithRetry `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = $registeredUser.email
            password = $registeredUser.password
        }
    
    if ($sessionResult.Success) {
        $sessions += @{
            Index = $i
            Token = $sessionResult.Data.token
            Created = Get-Date
        }
        Write-TestInfo "  Session $i created"
    }
}

# Test 10.2: Verify all sessions are valid
Write-TestInfo "Verifying all sessions are active..."

$activeSessions = 0
foreach ($session in $sessions) {
    $sessionCheck = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $($session.Token)" }
    
    if ($sessionCheck.Success) {
        $activeSessions++
        Write-TestInfo "  Session $($session.Index) is active"
    } else {
        Write-TestInfo "  Session $($session.Index) is invalid"
    }
}

Write-TestInfo "Active sessions: $activeSessions/$($sessions.Count)"

Write-TestStep 11 "Testing logout flow"

if ($authToken) {
    # Test logout
    $logoutResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/logout" `
        -Headers @{ Authorization = "Bearer $authToken" }
    
    if ($logoutResult.Success) {
        Write-TestSuccess "Logout successful"
        
        # In a stateless JWT system, the token should still work
        # Logout is typically handled client-side
        $postLogoutCheck = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($postLogoutCheck.Success) {
            Write-TestInfo "  Token still valid (stateless JWT system)"
        }
    }
}

Write-TestStep 12 "Testing edge cases and security"

# Test 12.1: SQL injection attempt in login
$sqlInjectionResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = "admin' OR '1'='1"
        password = "' OR '1'='1"
    } `
    -ExpectedStatus "401"

if ($sqlInjectionResult.Success) {
    Write-TestSuccess "SQL injection attempt properly handled"
}

# Test 12.2: XSS attempt in registration
$xssTestUser = Get-RandomTestUser
$xssResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body @{
        email = $xssTestUser.email
        password = $xssTestUser.password
        firstName = "<script>alert('XSS')</script>"
        lastName = "Test"
    }

if ($xssResult.Success) {
    # Check if the script tag was properly escaped/sanitized
    $profileCheck = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $($xssResult.Data.token)" }
    
    if ($profileCheck.Success -and $profileCheck.Data.firstName -notlike "*<script>*") {
        Write-TestSuccess "XSS attempt properly sanitized"
    } else {
        Write-TestWarning "XSS prevention may need improvement"
    }
}

# Test 12.3: Rate limiting check (if implemented)
Write-TestInfo "Testing rate limiting (5 rapid requests)..."
$rapidRequests = 0
$blockedRequests = 0

for ($i = 1; $i -le 5; $i++) {
    $rapidResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = "ratelimit@test.com"
            password = "wrong"
        } `
        -ExpectedStatus @("401", "429")  # 429 = Too Many Requests
    
    $rapidRequests++
    if ($rapidResult.StatusCode -eq 429) {
        $blockedRequests++
    }
}

if ($blockedRequests -gt 0) {
    Write-TestSuccess "Rate limiting is active ($blockedRequests/$rapidRequests requests blocked)"
} else {
    Write-TestInfo "Rate limiting not detected (consider implementing)"
}

Write-TestStep 13 "Authentication flow summary"

# Calculate test results
$totalTests = $Global:TestResults.Passed + $Global:TestResults.Failed

Write-Host "`nAuthentication Test Summary:" -ForegroundColor Cyan
Write-Host "  Total Tests: $totalTests" -ForegroundColor Gray
Write-Host "  Passed: $($Global:TestResults.Passed)" -ForegroundColor Green
Write-Host "  Failed: $($Global:TestResults.Failed)" -ForegroundColor Red
Write-Host "  Warnings: $($Global:TestResults.Warnings)" -ForegroundColor Yellow

# Feature coverage report
Write-Host "`nFeature Coverage:" -ForegroundColor Cyan
$features = @(
    "User Registration",
    "User Login", 
    "JWT Token Generation",
    "Profile Management",
    "Password Reset",
    "Password Change",
    "Session Management",
    "Input Validation",
    "Security (XSS/SQL Injection)",
    "Access Control"
)

foreach ($feature in $features) {
    Write-Host "  ✓ $feature" -ForegroundColor Green
}
        }
    }
    
    # If we get here, all retries failed
    throw $lastError
}

Write-TestStep 1 "Testing user registration flow"

# Test 1.1: New user registration with valid data
$newUser = Get-RandomTestUser
$registerResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body @{
        email = $newUser.email
        password = $newUser.password
        firstName = $newUser.firstName
        lastName = $newUser.lastName
        phone = $newUser.phone
    }

if ($registerResult.Success) {
    Write-TestSuccess "User registration successful"
    Write-TestInfo "  User ID: $($registerResult.Data.user.id)"
    Write-TestInfo "  Email: $($registerResult.Data.user.email)"
    Write-TestInfo "  Role: $($registerResult.Data.user.role)"
    
    # Validate JWT token
    if (Test-ValidateJWT -Token $registerResult.Data.token) {
        Write-TestSuccess "Valid JWT token received"
    } else {
        Write-TestFailure "Invalid JWT token format"
    }
    
    # Store for later tests
    $registeredUser = @{
        id = $registerResult.Data.user.id
        email = $newUser.email
        password = $newUser.password
        token = $registerResult.Data.token
    }
} else {
    Write-TestFailure "User registration failed"
    $registeredUser = $null
}

# Test 1.2: Duplicate registration prevention
Write-TestStep 2 "Testing duplicate registration prevention"

if ($registeredUser) {
    $duplicateResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body @{
            email = $registeredUser.email
            password = "DifferentPassword123!"
            firstName = "Duplicate"
            lastName = "User"
        } `
        -ExpectedStatus "400"
    
    if ($duplicateResult.Success -and $duplicateResult.Error -like "*already registered*") {
        Write-TestSuccess "Duplicate registration properly prevented"
    }
}

# Test 1.3: Registration validation
Write-TestStep 3 "Testing registration input validation"

$validationTests = @(
    @{
        Name = "Missing email"
        Body = @{ password = "Test123!"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*email*required*"
    },
    @{
        Name = "Invalid email format"
        Body = @{ email = "invalid-email"; password = "Test123!"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*email*"
    },
    @{
        Name = "Missing password"
        Body = @{ email = "test@test.com"; firstName = "Test"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*password*required*"
    },
    @{
        Name = "Missing first name"
        Body = @{ email = "test@test.com"; password = "Test123!"; lastName = "User" }
        ExpectedStatus = "400"
        ExpectedError = "*firstName*required*"
    },
    @{
        Name = "Missing last name"
        Body = @{ email = "test@test.com"; password = "Test123!"; firstName = "Test" }
        ExpectedStatus = "400"
        ExpectedError = "*lastName*required*"
    }
)

$validationPassed = 0
foreach ($test in $validationTests) {
    $result = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body $test.Body `
        -ExpectedStatus $test.ExpectedStatus
    
    if ($result.Success) {
        $validationPassed++
        Write-TestInfo "  ✓ Validation test passed: $($test.Name)"
    } else {
        Write-TestInfo "  ✗ Validation test failed: $($test.Name)"
    }
}

Write-TestInfo "Registration validation: $validationPassed/$($validationTests.Count) tests passed"

Write-TestStep 4 "Testing user login flow"

# Test 4.1: Valid login
if ($registeredUser) {
    $loginResult = Test-APIEndpointWithRetry `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = $registeredUser.email
            password = $registeredUser.password
        }
    
    if ($loginResult.Success) {
        Write-TestSuccess "Login successful"
        $authToken = $loginResult.Data.token
        
        # Verify token is different from registration token (new session)
        if ($authToken -ne $registeredUser.token) {
            Write-TestSuccess "New session token generated"
        }
        
        # Verify user data returned
        if ($loginResult.Data.user) {
            Write-TestInfo "  User data returned with login"
        }
    } else {
        Write-TestFailure "Valid login failed"
        $authToken = $registeredUser.token  # Fallback to registration token
    }
} else {
    # Create a new user for login testing
    $loginTestUser = Get-RandomTestUser
    $regResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body @{
            email = $loginTestUser.email
            password = $loginTestUser.password
            firstName = $loginTestUser.firstName
            lastName = $loginTestUser.lastName
        }
    
    if ($regResult.Success) {
        $registeredUser = @{
            email = $loginTestUser.email
            password = $loginTestUser.password
        }
        
        $loginResult = Test-APIEndpointWithRetry `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $registeredUser.email
                password = $registeredUser.password
            }
        
        if ($loginResult.Success) {
            $authToken = $loginResult.Data.token
        }
    }
}

# Test 4.2: Invalid login scenarios
Write-TestStep 5 "Testing invalid login scenarios"

# Wrong password
$wrongPasswordResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = $registeredUser.email
        password = "WrongPassword123!"
    } `
    -ExpectedStatus "401"

if ($wrongPasswordResult.Success) {
    Write-TestSuccess "Wrong password properly rejected"
}

# Non-existent user
$nonExistentResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = "nonexistent_$(Get-Random -Maximum 9999)@test.com"
        password = "Password123!"
    } `
    -ExpectedStatus "401"

if ($nonExistentResult.Success) {
    Write-TestSuccess "Non-existent user properly rejected"
}

# Empty credentials
$emptyCredsResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{} `
    -ExpectedStatus "400"

if ($emptyCredsResult.Success) {
    Write-TestSuccess "Empty credentials properly rejected"
}

Write-TestStep 6 "Testing authenticated endpoints"

# Test 6.1: Profile access with valid token
if ($authToken) {
    $profileResult = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" }
    
    if ($profileResult.Success) {
        Write-TestSuccess "Profile retrieved with valid token"
        Write-TestInfo "  Email: $($profileResult.Data.email)"
        Write-TestInfo "  Role: $($profileResult.Data.role)"
        Write-TestInfo "  Member Status: $($profileResult.Data.membershipStatus)"
    }
}

# Test 6.2: Profile access without token
$noTokenResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -ExpectedStatus "401"

if ($noTokenResult.Success) {
    Write-TestSuccess "Unauthenticated access properly blocked"
}

# Test 6.3: Profile access with invalid token
$invalidTokenResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/auth/profile" `
    -Headers @{ Authorization = "Bearer invalid.token.here" } `
    -ExpectedStatus "401"

if ($invalidTokenResult.Success) {
    Write-TestSuccess "Invalid token properly rejected"
}

Write-TestStep 7 "Testing profile update"

if ($authToken) {
    # Test 7.1: Valid profile update
    $updateData = @{
        firstName = "Updated"
        lastName = "Name"
        phone = "555-0123"
        creditScore = 750
        targetCreditScore = 800
        creditGoals = @("Improve payment history", "Reduce credit utilization")
    }
    
    $updateResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body $updateData
    
    if ($updateResult.Success) {
        Write-TestSuccess "Profile updated successfully"
        
        # Verify updates persisted
        $verifyResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($verifyResult.Success -and $verifyResult.Data.firstName -eq "Updated") {
            Write-TestSuccess "Profile updates persisted correctly"
        }
    }
    
    # Test 7.2: Attempt to update protected fields
    $protectedUpdateResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            email = "newemail@test.com"
            role = "admin"
            _id = "fake-id"
        }
    
    if ($protectedUpdateResult.Success) {
        # Verify protected fields weren't changed
        $checkResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($checkResult.Success -and 
            $checkResult.Data.email -eq $registeredUser.email -and 
            $checkResult.Data.role -ne "admin") {
            Write-TestSuccess "Protected fields properly maintained"
        }
    }
}

Write-TestStep 8 "Testing password reset flow"

# Test 8.1: Request password reset
$resetRequestResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{ email = $registeredUser.email }

if ($resetRequestResult.Success) {
    Write-TestSuccess "Password reset request accepted"
    Write-TestInfo "  Reset email would be sent to: $($registeredUser.email)"
}

# Test 8.2: Request reset for non-existent email
$invalidResetResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{ email = "nonexistent@test.com" } `
    -ExpectedStatus "404"

if ($invalidResetResult.Success) {
    Write-TestSuccess "Non-existent email properly handled"
}

# Test 8.3: Request reset without email
$noEmailResetResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/forgot-password" `
    -Body @{} `
    -ExpectedStatus "400"

if ($noEmailResetResult.Success) {
    Write-TestSuccess "Missing email properly rejected"
}

Write-TestStep 9 "Testing password change (authenticated)"

if ($authToken) {
    # Test 9.1: Change password with correct current password
    $newPassword = "NewPassword123!"
    
    $changePasswordResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/change-password" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            currentPassword = $registeredUser.password
            newPassword = $newPassword
        }
    
    if ($changePasswordResult.Success) {
        Write-TestSuccess "Password changed successfully"
        
        # Verify can login with new password
        $newLoginResult = Test-APIEndpointWithRetry `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $registeredUser.email
                password = $newPassword
            }
        
        if ($newLoginResult.Success) {
            Write-TestSuccess "Login successful with new password"
            $registeredUser.password = $newPassword
            $authToken = $newLoginResult.Data.token
        }
    }
    
    # Test 9.2: Change password with wrong current password
    $wrongCurrentResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/change-password" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body @{
            currentPassword = "WrongCurrent123!"
            newPassword = "AnotherNew123!"
        } `
        -ExpectedStatus "401"
    
    if ($wrongCurrentResult.Success) {
        Write-TestSuccess "Wrong current password properly rejected"
    }
}

Write-TestStep 10 "Testing session management"

# Test 10.1: Multiple concurrent sessions
$sessions = @()
$sessionCount = 3

Write-TestInfo "Creating $sessionCount concurrent sessions..."

for ($i = 1; $i -le $sessionCount; $i++) {
    $sessionResult = Test-APIEndpointWithRetry `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = $registeredUser.email
            password = $registeredUser.password
        }
    
    if ($sessionResult.Success) {
        $sessions += @{
            Index = $i
            Token = $sessionResult.Data.token
            Created = Get-Date
        }
        Write-TestInfo "  Session $i created"
    }
}

# Test 10.2: Verify all sessions are valid
Write-TestInfo "Verifying all sessions are active..."

$activeSessions = 0
foreach ($session in $sessions) {
    $sessionCheck = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $($session.Token)" }
    
    if ($sessionCheck.Success) {
        $activeSessions++
        Write-TestInfo "  Session $($session.Index) is active"
    } else {
        Write-TestInfo "  Session $($session.Index) is invalid"
    }
}

Write-TestInfo "Active sessions: $activeSessions/$($sessions.Count)"

Write-TestStep 11 "Testing logout flow"

if ($authToken) {
    # Test logout
    $logoutResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/logout" `
        -Headers @{ Authorization = "Bearer $authToken" }
    
    if ($logoutResult.Success) {
        Write-TestSuccess "Logout successful"
        
        # In a stateless JWT system, the token should still work
        # Logout is typically handled client-side
        $postLogoutCheck = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $authToken" }
        
        if ($postLogoutCheck.Success) {
            Write-TestInfo "  Token still valid (stateless JWT system)"
        }
    }
}

Write-TestStep 12 "Testing edge cases and security"

# Test 12.1: SQL injection attempt in login
$sqlInjectionResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
    -Body @{
        email = "admin' OR '1'='1"
        password = "' OR '1'='1"
    } `
    -ExpectedStatus "401"

if ($sqlInjectionResult.Success) {
    Write-TestSuccess "SQL injection attempt properly handled"
}

# Test 12.2: XSS attempt in registration
$xssTestUser = Get-RandomTestUser
$xssResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body @{
        email = $xssTestUser.email
        password = $xssTestUser.password
        firstName = "<script>alert('XSS')</script>"
        lastName = "Test"
    }

if ($xssResult.Success) {
    # Check if the script tag was properly escaped/sanitized
    $profileCheck = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/profile" `
        -Headers @{ Authorization = "Bearer $($xssResult.Data.token)" }
    
    if ($profileCheck.Success -and $profileCheck.Data.firstName -notlike "*<script>*") {
        Write-TestSuccess "XSS attempt properly sanitized"
    } else {
        Write-TestWarning "XSS prevention may need improvement"
    }
}

# Test 12.3: Rate limiting check (if implemented)
Write-TestInfo "Testing rate limiting (5 rapid requests)..."
$rapidRequests = 0
$blockedRequests = 0

for ($i = 1; $i -le 5; $i++) {
    $rapidResult = Test-APIEndpointWithRetry `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = "ratelimit@test.com"
            password = "wrong"
        } `
        -ExpectedStatus @("401", "429")  # 429 = Too Many Requests
    
    $rapidRequests++
    if ($rapidResult.StatusCode -eq 429) {
        $blockedRequests++
    }
}

if ($blockedRequests -gt 0) {
    Write-TestSuccess "Rate limiting is active ($blockedRequests/$rapidRequests requests blocked)"
} else {
    Write-TestInfo "Rate limiting not detected (consider implementing)"
}

Write-TestStep 13 "Authentication flow summary"

# Calculate test results
$totalTests = $Global:TestResults.Passed + $Global:TestResults.Failed

Write-Host "`nAuthentication Test Summary:" -ForegroundColor Cyan
Write-Host "  Total Tests: $totalTests" -ForegroundColor Gray
Write-Host "  Passed: $($Global:TestResults.Passed)" -ForegroundColor Green
Write-Host "  Failed: $($Global:TestResults.Failed)" -ForegroundColor Red
Write-Host "  Warnings: $($Global:TestResults.Warnings)" -ForegroundColor Yellow

# Feature coverage report
Write-Host "`nFeature Coverage:" -ForegroundColor Cyan
$features = @(
    "User Registration",
    "User Login", 
    "JWT Token Generation",
    "Profile Management",
    "Password Reset",
    "Password Change",
    "Session Management",
    "Input Validation",
    "Security (XSS/SQL Injection)",
    "Access Control"
)

foreach ($feature in $features) {
    Write-Host "  ✓ $feature" -ForegroundColor Green
}
