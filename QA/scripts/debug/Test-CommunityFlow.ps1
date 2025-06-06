# Add this to Test-CommunityFlow.ps1 after creating discussion
if ($createResult.Success) {
    $discussionId = $createResult.Data._id
    if (-not $discussionId -and $createResult.Data.data) {
        $discussionId = $createResult.Data.data._id
    }
    
    if ($discussionId) {
        Write-TestSuccess "Created test discussion: $($discussion.title)"
        Write-TestInfo "  Discussion ID: $discussionId"
        
        # Use the discussionId for subsequent tests
        $Global:TestDiscussionId = $discussionId
    } else {
        Write-TestFailure "Discussion created but no ID returned"
    }
}
