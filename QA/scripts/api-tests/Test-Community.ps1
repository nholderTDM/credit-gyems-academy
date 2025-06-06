# Test-CommunityFlow.ps1
# Tests community forum functionality
# Location: credit-gyems-academy/scripts/TS_CGA_v1/

param(
    [string]$ProjectRoot
)

# Get script root if not already set
if (-not $PSScriptRoot) {
    $PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
}

. "$PSScriptRoot\Test-Utilities.ps1"

Write-TestHeader "COMMUNITY FORUM TESTS"

# Use existing test user
if ($Global:PrimaryTestUser) {
    $testUser = $Global:PrimaryTestUser
    Write-TestInfo "Using existing test user: $($testUser.email)"
} else {
    Write-TestFailure "No test user available. Run Setup-TestData.ps1 first"
    return
}

$authHeaders = @{ Authorization = "Bearer $($testUser.token)" }

Write-TestStep 1 "Testing discussion creation"
$newDiscussion = @{
    title = "How to improve credit score quickly?"
    content = "I need to improve my credit score by 100 points in the next 6 months. Any tips?"
    category = "credit_repair"
}

$discussionResult = Test-APIEndpoint `
    -Method "POST" `
    -Endpoint "http://localhost:5000/api/community/discussions" `
    -Headers $authHeaders `
    -Body $newDiscussion

if ($discussionResult.Success) {
    Write-TestSuccess "Created new discussion"
    $discussionId = $discussionResult.Data._id
    Write-TestInfo "Discussion ID: $discussionId"
} else {
    Write-TestFailure "Could not create discussion"
    $discussionId = $null
}

Write-TestStep 2 "Testing discussion listing"
# GET /discussions requires auth
$listResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/community/discussions" `
    -Headers $authHeaders

if ($listResult.Success) {
    Write-TestSuccess "Retrieved discussion list"
    $discussionCount = if ($listResult.Data.data.discussions) { 
        $listResult.Data.data.discussions.Count 
    } else { 
        0 
    }
    Write-TestInfo "Found $discussionCount discussions"
} else {
    Write-TestFailure "Could not retrieve discussions"
}

Write-TestStep 3 "Testing discussion details"
if ($discussionId) {
    $detailResult = Test-APIEndpoint `
        -Method "GET" `
        -Endpoint "http://localhost:5000/api/community/discussions/$discussionId" `
        -Headers $authHeaders
    
    if ($detailResult.Success) {
        Write-TestSuccess "Retrieved discussion details"
    } else {
        Write-TestFailure "Could not retrieve discussion details"
    }
}

Write-TestStep 4 "Testing adding a post (reply)"
if ($discussionId) {
    $newPost = @{
        content = "Here are some tips: 1) Pay all bills on time, 2) Reduce credit utilization..."
    }
    
    # Note: The actual endpoint is /discussions/:id/posts (not /replies)
    $postResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/community/discussions/$discussionId/posts" `
        -Headers $authHeaders `
        -Body $newPost
    
    if ($postResult.Success) {
        Write-TestSuccess "Added post to discussion"
        $postId = $postResult.Data.data._id
    } else {
        Write-TestFailure "Could not add post"
        $postId = $null
    }
}

Write-TestStep 5 "Testing discussion search"
$searchResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/community/discussions?search=credit" `
    -Headers $authHeaders

if ($searchResult.Success) {
    Write-TestSuccess "Search functionality working"
} else {
    Write-TestFailure "Search functionality failed"
}

Write-TestStep 6 "Testing discussion categories"
# Note: Categories endpoint doesn't exist, but we can test category filtering
$categoryResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/community/discussions?category=credit_repair" `
    -Headers $authHeaders

if ($categoryResult.Success) {
    Write-TestSuccess "Category filtering working"
} else {
    Write-TestWarning "Category filtering not available"
}

Write-TestStep 7 "Testing like functionality"
if ($discussionId -and $postId) {
    # The actual endpoint is /discussions/:discussionId/posts/:postId/like
    $likeResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/community/discussions/$discussionId/posts/$postId/like" `
        -Headers $authHeaders
    
    if ($likeResult.Success) {
        Write-TestSuccess "Like functionality working"
        Write-TestInfo "Post liked: $($likeResult.Data.data.liked), Total likes: $($likeResult.Data.data.likeCount)"
    } else {
        Write-TestFailure "Like functionality failed"
    }
}

Write-TestStep 8 "Testing moderation (admin only)"
# Get admin user if available
$adminUser = $Global:TestUsers | Where-Object { $_.role -eq "admin" } | Select-Object -First 1
if ($adminUser -and $discussionId) {
    $adminHeaders = @{ Authorization = "Bearer $($adminUser.token)" }
    
    # Test pinning a discussion
    $pinResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/community/discussions/$discussionId/pin" `
        -Headers $adminHeaders `
        -Body @{ isPinned = $true }
    
    if ($pinResult.Success) {
        Write-TestSuccess "Admin pin functionality working"
    } else {
        Write-TestWarning "Pin functionality not available"
    }
    
    # Test locking a discussion
    $lockResult = Test-APIEndpoint `
        -Method "PUT" `
        -Endpoint "http://localhost:5000/api/community/discussions/$discussionId/lock" `
        -Headers $adminHeaders `
        -Body @{ status = "locked" }
    
    if ($lockResult.Success) {
        Write-TestSuccess "Admin lock functionality working"
    } else {
        Write-TestWarning "Lock functionality not available"
    }
}

Write-TestStep 9 "Testing pagination"
$paginationResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/community/discussions?page=1&limit=10" `
    -Headers $authHeaders

if ($paginationResult.Success) {
    Write-TestSuccess "Pagination working"
    if ($paginationResult.Data.data.pagination) {
        $pagination = $paginationResult.Data.data.pagination
        Write-TestInfo "Page $($pagination.page) of $($pagination.pages), Total: $($pagination.total) discussions"
    }
} else {
    Write-TestFailure "Pagination failed"
}

Write-TestStep 10 "Testing sorting"
$sortResult = Test-APIEndpoint `
    -Method "GET" `
    -Endpoint "http://localhost:5000/api/community/discussions?sort=popular" `
    -Headers $authHeaders

if ($sortResult.Success) {
    Write-TestSuccess "Sorting functionality working"
} else {
    Write-TestWarning "Sorting functionality not available"
}

Write-Host "`n✅ COMMUNITY FORUM TESTS COMPLETE" -ForegroundColor Green
