# PowerShell Script to Extract Credit Gyems Academy Project Directory Structure
# This script creates a text file with the complete project structure, excluding specified folders

# Configuration
$projectPath = "."  # Current directory (run from project root)
$outputFile = "credit-gyems-project-structure.txt"

# Folders to exclude - add more as needed
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
    ".idea",
    "out",
    ".turbo",
    ".vercel",
    ".netlify",
    "logs",
    "*.log",
    "__pycache__",
    ".pytest_cache",
    "venv",
    ".venv",
    "vendor"
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
        [bool]$IsLast = $false,
        [string]$ParentPath = ""
    )
    
    $items = @()
    
    # Get the current directory name
    $dirName = Split-Path $Path -Leaf
    
    # For root directory, show full project name
    if ($Indent -eq "") {
        $items += "credit-gyems-academy/"
    } else {
        $prefix = if ($IsLast) { "└── " } else { "├── " }
        $items += $Indent + $prefix + $dirName + "/"
    }
    
    # Get subdirectories and files
    $children = Get-ChildItem -Path $Path -Force -ErrorAction SilentlyContinue | 
        Where-Object { -not (Test-ExcludedPath $_.FullName) } |
        Sort-Object { $_.PSIsContainer }, Name
    
    if ($children) {
        # Separate directories and files
        $directories = $children | Where-Object { $_.PSIsContainer }
        $files = $children | Where-Object { -not $_.PSIsContainer }
        
        # Process directories first
        for ($i = 0; $i -lt $directories.Count; $i++) {
            $dir = $directories[$i]
            $isLastDir = ($i -eq $directories.Count - 1) -and ($files.Count -eq 0)
            
            # Update indent for children
            if ($Indent -eq "") {
                $newIndent = ""
            } else {
                $extension = if ($IsLast) { "    " } else { "│   " }
                $newIndent = $Indent + $extension
            }
            
            # Recursively process subdirectories
            $items += Get-DirectoryTree -Path $dir.FullName -Indent $newIndent -IsLast $isLastDir
        }
        
        # Process files
        for ($i = 0; $i -lt $files.Count; $i++) {
            $file = $files[$i]
            $isLastFile = ($i -eq $files.Count - 1)
            
            # Update indent for files
            if ($Indent -eq "") {
                $newIndent = ""
            } else {
                $extension = if ($IsLast) { "    " } else { "│   " }
                $newIndent = $Indent + $extension
            }
            
            $prefix = if ($isLastFile) { "└── " } else { "├── " }
            $items += $newIndent + $prefix + $file.Name
        }
    }
    
    return $items
}

# Function to get project statistics
function Get-ProjectStats {
    param([string]$Path)
    
    $stats = @{
        TotalFiles = 0
        TotalFolders = 0
        FileTypes = @{}
        LargestFiles = @()
    }
    
    # Get all items recursively
    $allItems = Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | 
        Where-Object { -not (Test-ExcludedPath $_.FullName) }
    
    $stats.TotalFiles = ($allItems | Where-Object { -not $_.PSIsContainer }).Count
    $stats.TotalFolders = ($allItems | Where-Object { $_.PSIsContainer }).Count
    
    # Count file types
    $files = $allItems | Where-Object { -not $_.PSIsContainer }
    foreach ($file in $files) {
        $ext = $file.Extension.ToLower()
        if ($ext) {
            if ($stats.FileTypes.ContainsKey($ext)) {
                $stats.FileTypes[$ext]++
            } else {
                $stats.FileTypes[$ext] = 1
            }
        }
    }
    
    # Get largest files
    $stats.LargestFiles = $files | 
        Sort-Object Length -Descending | 
        Select-Object -First 10 | 
        ForEach-Object { 
            @{
                Name = $_.Name
                Size = "{0:N2} MB" -f ($_.Length / 1MB)
                Path = $_.FullName.Replace($Path, "").TrimStart("\", "/")
            }
        }
    
    return $stats
}

# Main script execution
try {
    Write-Host "Starting Credit Gyems Academy project structure extraction..." -ForegroundColor Green
    Write-Host "Project path: $projectPath" -ForegroundColor Yellow
    
    # Check if project directory exists
    if (-not (Test-Path $projectPath)) {
        Write-Host "Error: Project directory not found at '$projectPath'" -ForegroundColor Red
        exit 1
    }
    
    # Get project statistics first
    Write-Host "`nGathering project statistics..." -ForegroundColor Yellow
    $stats = Get-ProjectStats -Path $projectPath
    
    # Get the directory tree
    Write-Host "Building directory structure..." -ForegroundColor Yellow
    $treeContent = @()
    
    # Add header
    $treeContent += "CREDIT GYEMS ACADEMY PROJECT STRUCTURE"
    $treeContent += "=" * 50
    $treeContent += "Generated on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $treeContent += "=" * 50
    $treeContent += ""
    
    # Add statistics
    $treeContent += "PROJECT STATISTICS:"
    $treeContent += "-" * 20
    $treeContent += "Total Folders: $($stats.TotalFolders)"
    $treeContent += "Total Files: $($stats.TotalFiles)"
    $treeContent += ""
    
    # Add file type breakdown
    $treeContent += "FILE TYPES:"
    $treeContent += "-" * 20
    $sortedTypes = $stats.FileTypes.GetEnumerator() | Sort-Object Value -Descending
    foreach ($type in $sortedTypes) {
        $treeContent += "$($type.Key): $($type.Value) files"
    }
    $treeContent += ""
    
    # Add largest files
    if ($stats.LargestFiles.Count -gt 0) {
        $treeContent += "LARGEST FILES:"
        $treeContent += "-" * 20
        foreach ($file in $stats.LargestFiles) {
            $treeContent += "$($file.Size) - $($file.Path)"
        }
        $treeContent += ""
    }
    
    # Add excluded folders note
    $treeContent += "EXCLUDED FOLDERS:"
    $treeContent += "-" * 20
    $excludeFolders | ForEach-Object { $treeContent += "- $_" }
    $treeContent += ""
    $treeContent += "=" * 50
    $treeContent += ""
    
    # Add directory tree
    $treeContent += "DIRECTORY STRUCTURE:"
    $treeContent += ""
    $treeContent += Get-DirectoryTree -Path $projectPath
    
    # Write to file
    $treeContent | Out-File -FilePath $outputFile -Encoding UTF8
    
    # Display summary
    Write-Host "`nExtraction completed successfully!" -ForegroundColor Green
    Write-Host "Output file: $outputFile" -ForegroundColor Cyan
    Write-Host "`nProject Summary:" -ForegroundColor Yellow
    Write-Host "  Total folders extracted: $($stats.TotalFolders)" -ForegroundColor Cyan
    Write-Host "  Total files extracted: $($stats.TotalFiles)" -ForegroundColor Cyan
    Write-Host "  Output file size: $((Get-Item $outputFile).Length / 1KB) KB" -ForegroundColor Cyan
    
    # Show common file types
    Write-Host "`nMost common file types:" -ForegroundColor Yellow
    $sortedTypes | Select-Object -First 5 | ForEach-Object {
        Write-Host "  $($_.Key): $($_.Value) files" -ForegroundColor Gray
    }
    
    Write-Host "`nExcluded folders:" -ForegroundColor Yellow
    $excludeFolders | Select-Object -First 5 | ForEach-Object { 
        Write-Host "  - $_" -ForegroundColor Gray 
    }
    if ($excludeFolders.Count -gt 5) {
        Write-Host "  ... and $($excludeFolders.Count - 5) more" -ForegroundColor Gray
    }
    
    # Option to open the file
    $openFile = Read-Host "`nDo you want to open the output file? (Y/N)"
    if ($openFile -eq 'Y' -or $openFile -eq 'y') {
        Start-Process notepad.exe $outputFile
    }
    
} catch {
    Write-Host "An error occurred: $_" -ForegroundColor Red
    exit 1
}

# Optional: Display the first 100 lines of the output
Write-Host "`nPreview of the project structure:" -ForegroundColor Green
Write-Host "-" * 50 -ForegroundColor Gray
Get-Content $outputFile -Head 100 | ForEach-Object { Write-Host $_ }
if ((Get-Content $outputFile).Count -gt 100) {
    Write-Host "`n... (truncated - see full output in $outputFile)" -ForegroundColor Gray
}
Write-Host "-" * 50 -ForegroundColor Gray