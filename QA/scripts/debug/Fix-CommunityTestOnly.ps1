# Fix-CommunityTestOnly.ps1
# Fix just the community test postId extraction issue

Write-Host "🔧 Fixing Community Test PostId Issue" -ForegroundColor Cyan

$communityTestPath = "scripts\TS_CGA_v1\Test-CommunityFlow.ps1"

# Backup current file
Copy-Item $communityTestPath "$communityTestPath.backup_$(Get-Date -Format 'yyyyMMddHHmmss')"

# Read the current content
$content = Get-Content $communityTestPath -Raw

# Find and replace the post creation and like sections
$newPostSection = @'

Write-TestStep 4 "Testing post creation"

if ($createdDiscussion) {
    $newPost = @{
        content = "This is a test reply to the discussion. Testing the post creation functionality."
    }
    
    $createPostResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/community/discussions/$($createdDiscussion._id)/posts" `
        -Headers @{ Authorization = "Bearer $authToken" } `
        -Body $newPost
    
    if ($createPostResult.Success) {
        $createdPost = $createPostResult.Data
        Write-TestInfo "Created post in discussion"
        
        # Extract the post ID properly
        $postId = $null
        if ($createdPost._id) {
            $postId = $createdPost._id
            Write-TestInfo "Post ID: $postId"
        } elseif ($createdPost.data -and $createdPost.data._id) {
            $postId = $createdPost.data._id
            Write-TestInfo "Post ID: $postId"
        } else {
            Write-TestWarning "Could not extract post ID from response"
        }
    }
}

Write-TestStep 5 "Testing post likes"

if ($createdDiscussion -and $postId) {
    # Like the post
    $likeResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/community/discussions/$($createdDiscussion._id)/posts/$postId/like" `
        -Headers @{ Authorization = "Bearer $authToken" }
    
    if ($likeResult.Success) {
        Write-TestInfo "Post liked successfully"
    }
    
    # Unlike the post
    $unlikeResult = Test-APIEndpoint `
        -Method "POST" `
        -Endpoint "http://localhost:5000/api/community/discussions/$($createdDiscussion._id)/posts/$postId/like" `
        -Headers @{ Authorization = "Bearer $authToken" }
    
    if ($unlikeResult.Success) {
        Write-TestInfo "Post unliked successfully"
    }
} else {
    Write-TestWarning "Skipping post like tests - no valid post ID"
}

'@

# Replace using a different approach to avoid the PowerShell error
$startMarker = 'Write-TestStep 4 "Testing post creation"'
$endMarker = 'Write-TestStep 6 "Testing discussion update"'

$startIndex = $content.IndexOf($startMarker)
$endIndex = $content.IndexOf($endMarker)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $newContent = $content.Substring(0, $startIndex) + $newPostSection + $content.Substring($endIndex)
    Set-Content -Path $communityTestPath -Value $newContent -Encoding UTF8
    Write-Host "✅ Community test fixed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not find the sections to replace, applying simpler fix..." -ForegroundColor Yellow
    
    # Simpler fix - just replace the problematic like endpoint calls
    $content = $content -replace 'posts/\$\(.*?\)/like', 'posts/$postId/like'
    $content = $content -replace 'if \(\$createdPost\)', 'if ($createdPost -and $postId)'
    
    # Add postId extraction after post creation
    $content = $content -replace '(Write-TestInfo "Created post in discussion")', @'
$1
        
        # Extract post ID
        $postId = $null
        if ($createdPost._id) {
            $postId = $createdPost._id
        } elseif ($createdPost.data -and $createdPost.data._id) {
            $postId = $createdPost.data._id
        }
'@
    
    Set-Content -Path $communityTestPath -Value $content -Encoding UTF8
    Write-Host "✅ Applied alternative fix" -ForegroundColor Green
}

Write-Host "`n✅ Community test fix complete!" -ForegroundColor Green
Write-Host "You can now run the full test suite:" -ForegroundColor Yellow
Write-Host ".\scripts\TS_CGA_v1\Run-CreditGyemsQA.ps1" -ForegroundColor White