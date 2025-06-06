# PowerShell Script to Extract Frontend Directory Structure
# This script creates a text file with the directory structure, excluding specified folders

# Configuration
$frontendPath = ".\frontend"  # Path to your frontend directory (adjust as needed)
$outputFile = "frontend_structure.txt"  # Output file name
$excludeFolders = @(
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    ".nuxt",
    "coverage",
    ".cache",
    "temp",
    "tmp",
    ".vscode",
    ".idea"
)

# Function to check if a path contains any excluded folder
function Test-ExcludedPath {
    param($Path)
    
    foreach ($excluded in $excludeFolders) {
        if ($Path -like "*\$excluded\*" -or $Path -like "*\$excluded" -or $Path -like "*/$excluded/*" -or $Path -like "*/$excluded") {
            return $true
        }
    }
    return $false
}

# Function to create tree-like structure
function Get-DirectoryTree {
    param(
        [string]$Path,
        [string]$Indent = "",
        [bool]$IsLast = $false
    )
    
    $items = @()
    
    # Get the current directory name
    $dirName = Split-Path $Path -Leaf
    
    # Add current directory to output
    if ($Indent -eq "") {
        $items += $dirName
    } else {
        $prefix = if ($IsLast) { "└── " } else { "├── " }
        $items += $Indent + $prefix + $dirName
    }
    
    # Get subdirectories and files
    $children = Get-ChildItem -Path $Path -Force -ErrorAction SilentlyContinue | 
        Where-Object { -not (Test-ExcludedPath $_.FullName) } |
        Sort-Object { $_.PSIsContainer }, Name
    
    if ($children) {
        for ($i = 0; $i -lt $children.Count; $i++) {
            $child = $children[$i]
            $isLastChild = ($i -eq $children.Count - 1)
            
            # Update indent for children
            if ($Indent -eq "") {
                $newIndent = ""
            } else {
                $extension = if ($IsLast) { "    " } else { "│   " }
                $newIndent = $Indent + $extension
            }
            
            if ($child.PSIsContainer) {
                # Recursively process subdirectories
                $items += Get-DirectoryTree -Path $child.FullName -Indent $newIndent -IsLast $isLastChild
            } else {
                # Add files
                $prefix = if ($isLastChild) { "└── " } else { "├── " }
                $items += $newIndent + $prefix + $child.Name
            }
        }
    }
    
    return $items
}

# Main script execution
try {
    Write-Host "Starting frontend directory extraction..." -ForegroundColor Green
    
    # Check if frontend directory exists
    if (-not (Test-Path $frontendPath)) {
        Write-Host "Error: Frontend directory not found at '$frontendPath'" -ForegroundColor Red
        Write-Host "Please update the `$frontendPath variable in the script to match your project structure." -ForegroundColor Yellow
        exit 1
    }
    
    # Get the directory tree
    Write-Host "Scanning directory structure..." -ForegroundColor Yellow
    $treeContent = Get-DirectoryTree -Path $frontendPath
    
    # Write to file
    $treeContent | Out-File -FilePath $outputFile -Encoding UTF8
    
    # Display summary
    $fileCount = (Get-ChildItem -Path $frontendPath -Recurse -File -Force -ErrorAction SilentlyContinue | 
        Where-Object { -not (Test-ExcludedPath $_.FullName) }).Count
    
    $folderCount = (Get-ChildItem -Path $frontendPath -Recurse -Directory -Force -ErrorAction SilentlyContinue | 
        Where-Object { -not (Test-ExcludedPath $_.FullName) }).Count
    
    Write-Host "`nExtraction completed successfully!" -ForegroundColor Green
    Write-Host "Output file: $outputFile" -ForegroundColor Cyan
    Write-Host "Total files extracted: $fileCount" -ForegroundColor Cyan
    Write-Host "Total folders extracted: $folderCount" -ForegroundColor Cyan
    Write-Host "`nExcluded folders:" -ForegroundColor Yellow
    $excludeFolders | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
    
} catch {
    Write-Host "An error occurred: $_" -ForegroundColor Red
    exit 1
}

# Optional: Display the first 50 lines of the output
Write-Host "`nPreview of the directory structure:" -ForegroundColor Green
Get-Content $outputFile -Head 50 | ForEach-Object { Write-Host $_ }
if ((Get-Content $outputFile).Count -gt 50) {
    Write-Host "... (truncated)" -ForegroundColor Gray
}