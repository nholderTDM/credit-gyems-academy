# Diagnose-APIFields.ps1
# Diagnose what fields the API expects for registration

Write-Host "Diagnosing API Registration Requirements" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"

# Test different field combinations
$testCombinations = @(
    @{
        Name = "Test 1: email, password, name"
        Body = @{
            email = "test1@test.com"
            password = "Test123!@#"
            name = "Test User"
        }
    },
    @{
        Name = "Test 2: email, password, firstName, lastName"
        Body = @{
            email = "test2@test.com"
            password = "Test123!@#"
            firstName = "Test"
            lastName = "User"
        }
    },
    @{
        Name = "Test 3: email, password, username"
        Body = @{
            email = "test3@test.com"
            password = "Test123!@#"
            username = "testuser"
        }
    },
    @{
        Name = "Test 4: email, password only"
        Body = @{
            email = "test4@test.com"
            password = "Test123!@#"
        }
    },
    @{
        Name = "Test 5: Empty body"
        Body = @{}
    }
)

foreach ($test in $testCombinations) {
    Write-Host "`n$($test.Name)" -ForegroundColor Yellow
    Write-Host "Sending: $($test.Body | ConvertTo-Json -Compress)" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
            -Method POST `
            -Body ($test.Body | ConvertTo-Json) `
            -ContentType "application/json"
        
        Write-Host "✓ Success: $($response | ConvertTo-Json -Compress)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "✗ Failed (Status $statusCode)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "  Message: $($errorResponse.message)" -ForegroundColor Yellow
            if ($errorResponse.errors) {
                Write-Host "  Errors: $($errorResponse.errors | ConvertTo-Json -Compress)" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "`nDiagnosis complete." -ForegroundColor Cyan