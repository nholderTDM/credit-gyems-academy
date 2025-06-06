# Fix-FrontendImports.ps1 (safe version)
$projectRoot = "frontend/src"
$aliases = @{
    "@components" = "components"
    "@pages"      = "pages"
    "@contexts"   = "contexts"
    "@hooks"      = "hooks"
    "@utils"      = "utils"
    "@assets"     = "assets"
    "@config"     = "config"
    "@services"   = "services"
}

function Get-RelativePath {
    param (
        [string]$From,
        [string]$To
    )

    try {
        $fromUri = New-Object System.Uri ($From + [IO.Path]::DirectorySeparatorChar)
        $toUri = New-Object System.Uri $To
        $relativeUri = $fromUri.MakeRelativeUri($toUri)
        return $relativeUri.ToString().Replace('/', '/')
    } catch {
        return $null
    }
}

Get-ChildItem -Path $projectRoot -Recurse -Include *.jsx | ForEach-Object {
    $filePath = $_.FullName
    try {
        $content = Get-Content $filePath -Raw -ErrorAction Stop
    } catch {
        Write-Warning "⚠️ Skipping file due to read error: $filePath"
        return
    }

    if ([string]::IsNullOrWhiteSpace($content)) {
        Write-Warning "⚠️ Skipping empty or unreadable file: $filePath"
        return
    }

    $original = $content

    foreach ($alias in $aliases.Keys) {
        $aliasPath = $aliases[$alias]
        $regex = [regex]::new("from\s+['\""`]$alias\/([^'\""`]+)['\""`]")

        $content = $regex.Replace($content, {
            param($match)
            if (-not $match.Success -or -not $match.Groups[1]) {
                return $match.Value
            }

            $importPath = $match.Groups[1].Value
            $absoluteTarget = Join-Path "$projectRoot\$aliasPath" $importPath

            if (-not (Test-Path $absoluteTarget)) {
                $absoluteTarget = "$absoluteTarget.jsx"
            }

            $relativePath = Get-RelativePath -From (Split-Path $filePath) -To $absoluteTarget

            if ($relativePath) {
                return "from './$relativePath'"
            } else {
                return $match.Value
            }
        })
    }

    if ($content -ne $original) {
        try {
            Set-Content -Path $filePath -Value $content -Encoding UTF8
            Write-Host "✅ Updated imports in $filePath"
        } catch {
            Write-Warning "⚠️ Failed to write changes to: $filePath"
        }
    }
}