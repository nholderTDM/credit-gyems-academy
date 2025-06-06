# Test-Config.ps1
# Shared configuration for all test scripts
# Location: QA/scripts/master/

# Get the directory where this script is located
$configScriptDir = Split-Path -Path $MyInvocation.MyCommand.Path -Parent

# Navigate up to get correct paths
$masterPath = $configScriptDir
$scriptsPath = Split-Path -Parent $masterPath
$qaPath = Split-Path -Parent $scriptsPath
$projectPath = Split-Path -Parent $qaPath

# Define global test paths
$Global:ProjectRoot = $projectPath
$Global:QARoot = $qaPath
$Global:TestPaths = @{
    Root = $qaPath
    Scripts = @{
        Master = $masterPath
        API = Join-Path $scriptsPath "api-tests"
        GUI = Join-Path $scriptsPath "gui-tests"
        EdgeCases = Join-Path $scriptsPath "edge-cases"
        K6 = Join-Path $scriptsPath "k6"
    }
    Reports = @{
        Root = Join-Path $qaPath "test-reports"
        Today = Join-Path (Join-Path $qaPath "test-reports") (Get-Date -Format 'yyyy-MM-dd')
    }
    TestData = @{
        Root = Join-Path $qaPath "test-data"
        Fixtures = Join-Path $qaPath "test-data\fixtures"
        Mocks = Join-Path $qaPath "test-data\mocks"
    }
    Backend = Join-Path $projectPath "backend"
    Frontend = Join-Path $projectPath "frontend"
}

# Test environment configuration
function Get-TestEnvironment {
    param([string]$Environment = "local")
    
    $environments = @{
        "local" = @{
            BackendUrl = "http://localhost:5000"
            FrontendUrl = "http://localhost:5173"
            MongoDB = "mongodb://localhost:27017/credit-gyems-test"
        }
        "staging" = @{
            BackendUrl = if ($env:STAGING_BACKEND_URL) { $env:STAGING_BACKEND_URL } else { "https://staging-api.creditgyems.com" }
            FrontendUrl = if ($env:STAGING_FRONTEND_URL) { $env:STAGING_FRONTEND_URL } else { "https://staging.creditgyems.com" }
            MongoDB = $env:STAGING_MONGODB_URI
        }
        "production" = @{
            BackendUrl = if ($env:PROD_BACKEND_URL) { $env:PROD_BACKEND_URL } else { "https://api.creditgyems.com" }
            FrontendUrl = if ($env:PROD_FRONTEND_URL) { $env:PROD_FRONTEND_URL } else { "https://creditgyems.com" }
            MongoDB = $env:PROD_MONGODB_URI
        }
    }
    
    return $environments[$Environment]
}

# Test user credentials
$Global:TestUsers = @{
    Admin = @{
        email = "admin.test@creditgyems.com"
        password = "Admin123!@#"
        firstName = "Admin"
        lastName = "Test"
        role = "admin"
    }
    User = @{
        email = "user.test@creditgyems.com"
        password = "User123!@#"
        firstName = "User"
        lastName = "Test"
        role = "user"
    }
    TestUser = @{
        email = "test.user@creditgyems.com"
        password = "Test123!@#"
        firstName = "Test"
        lastName = "User"
        role = "user"
    }
}

# API endpoints
$Global:APIEndpoints = @{
    Auth = @{
        Register = "/api/auth/register"
        Login = "/api/auth/login"
        Logout = "/api/auth/logout"
        Profile = "/api/auth/profile"
        ForgotPassword = "/api/auth/forgot-password"
        ResetPassword = "/api/auth/reset-password"
    }
    Products = @{
        List = "/api/products"
        Details = "/api/products/{id}"
        Create = "/api/products"
        Update = "/api/products/{id}"
        Delete = "/api/products/{id}"
        Search = "/api/products/search"
    }
    Orders = @{
        Create = "/api/orders"
        List = "/api/orders"
        Details = "/api/orders/{id}"
        UserOrders = "/api/orders/user/{userId}"
        UpdateStatus = "/api/orders/{id}/status"
    }
    Bookings = @{
        Create = "/api/bookings"
        List = "/api/bookings"
        Details = "/api/bookings/{id}"
        UserBookings = "/api/bookings/user/{userId}"
        Cancel = "/api/bookings/{id}/cancel"
        Available = "/api/bookings/available-slots"
    }
    Community = @{
        Posts = "/api/community/posts"
        PostDetails = "/api/community/posts/{id}"
        CreatePost = "/api/community/posts"
        UpdatePost = "/api/community/posts/{id}"
        DeletePost = "/api/community/posts/{id}"
        Like = "/api/community/posts/{id}/like"
        Unlike = "/api/community/posts/{id}/unlike"
        Comments = "/api/community/posts/{id}/comments"
        CreateComment = "/api/community/posts/{id}/comments"
    }
    Services = @{
        List = "/api/services"
        Details = "/api/services/{id}"
        Create = "/api/services"
        Update = "/api/services/{id}"
        Delete = "/api/services/{id}"
    }
    Contact = @{
        Submit = "/api/contact"
        Newsletter = "/api/contact/newsletter"
    }
    Health = @{
        Check = "/api/health"
        Status = "/api/status"
    }
}

# Common test utilities
function Get-AuthToken {
    param(
        [string]$UserType = "User",
        [string]$BaseUrl = "http://localhost:5000"
    )
    
    $user = $Global:TestUsers[$UserType]
    $loginUrl = "$BaseUrl$($Global:APIEndpoints.Auth.Login)"
    
    $loginBody = @{
        email = $user.email
        password = $user.password
    }
    
    try {
        $response = Invoke-RestMethod -Uri $loginUrl -Method POST -Body ($loginBody | ConvertTo-Json) -ContentType "application/json"
        return $response.token
    }
    catch {
        Write-Warning "Failed to get auth token for $UserType : $_"
        return $null
    }
}

function Test-APIEndpoint {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [string]$BaseUrl = "http://localhost:5000",
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [switch]$ExpectSuccess
    )
    
    $uri = "$BaseUrl$Endpoint"
    $params = @{
        Uri = $uri
        Method = $Method
        Headers = $Headers
        ContentType = "application/json"
    }
    
    if ($Body) {
        $params.Body = $Body | ConvertTo-Json -Depth 10
    }
    
    try {
        $response = Invoke-RestMethod @params
        if ($ExpectSuccess) {
            return @{
                Success = $true
                Data = $response
                StatusCode = 200
            }
        } else {
            return @{
                Success = $false
                Error = "Expected failure but request succeeded"
                Data = $response
            }
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        if (-not $ExpectSuccess) {
            return @{
                Success = $true
                StatusCode = $statusCode
                Error = $_.ErrorDetails.Message
            }
        } else {
            return @{
                Success = $false
                StatusCode = $statusCode
                Error = $_.Exception.Message
                Details = $_.ErrorDetails.Message
            }
        }
    }
}

# Color-coded output functions
function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Message = ""
    )
    
    if ($Success) {
        Write-Host "  ✓ $TestName" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $TestName" -ForegroundColor Red
    }
    
    if ($Message) {
        Write-Host "    $Message" -ForegroundColor Gray
    }
}

function Write-TestSection {
    param([string]$SectionName)
    
    Write-Host "`n━━━ $SectionName ━━━" -ForegroundColor Cyan
}

function Write-TestSummary {
    param(
        [int]$Passed,
        [int]$Failed,
        [int]$Total
    )
    
    $passRate = if ($Total -gt 0) { [math]::Round(($Passed / $Total) * 100, 2) } else { 0 }
    
    Write-Host "`n══════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "Test Summary:" -ForegroundColor Yellow
    Write-Host "  Total: $Total" -ForegroundColor White
    Write-Host "  Passed: $Passed" -ForegroundColor Green
    Write-Host "  Failed: $Failed" -ForegroundColor Red
    Write-Host "  Pass Rate: ${passRate}%" -ForegroundColor $(if ($passRate -eq 100) { 'Green' } elseif ($passRate -ge 80) { 'Yellow' } else { 'Red' })
    Write-Host "══════════════════════════════════════" -ForegroundColor DarkGray
}

# Ensure report directories exist
if (-not (Test-Path $Global:TestPaths.Reports.Root)) {
    New-Item -ItemType Directory -Path $Global:TestPaths.Reports.Root -Force | Out-Null
}

if (-not (Test-Path $Global:TestPaths.Reports.Today)) {
    New-Item -ItemType Directory -Path $Global:TestPaths.Reports.Today -Force | Out-Null
}

# Functions and variables are automatically available when dot-sourced
# No export needed for .ps1 files