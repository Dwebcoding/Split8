# Script to update all HTML pages with centralized navbar and footer components
# SPLit8 Project - Update Pages with Components

Write-Host "Starting page update with centralized navbar/footer components..." -ForegroundColor Cyan

# Define the project root
$projectRoot = $PSScriptRoot

# Get all HTML files recursively
$htmlFiles = Get-ChildItem -Path $projectRoot -Filter "*.html" -Recurse | Where-Object {
    $_.FullName -notmatch "\\node_modules\\" -and 
    $_.FullName -notmatch "\\backend\\"
}

$updatedCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($file in $htmlFiles) {
    try {
        Write-Host "`nProcessing: $($file.Name)" -ForegroundColor Yellow
        
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $modified = $false

        # Calculate relative path to js folder
        $relativePath = ""
        $depth = ($file.DirectoryName.Substring($projectRoot.Length) -split "\\").Count - 1
        
        if ($depth -eq 0) {
            $relativePath = ""
        } else {
            $relativePath = "../" * $depth
        }

        # Replace navbar with placeholder
        if ($content -match '(?s)<header class="navbar">.*?</header>') {
            $content = $content -replace '(?s)<header class="navbar">.*?</header>', '<!-- Navbar Component -->`n    <div id="navbar-placeholder"></div>'
            $modified = $true
            Write-Host "  [OK] Replaced navbar with placeholder" -ForegroundColor Green
        }

        # Replace footer with placeholder
        if ($content -match '(?s)<footer class="footer">.*?</footer>') {
            $content = $content -replace '(?s)<footer class="footer">.*?</footer>', '<!-- Footer Component -->`n    <div id="footer-placeholder"></div>'
            $modified = $true
            Write-Host "  [OK] Replaced footer with placeholder" -ForegroundColor Green
        }

        # Add navbar.js and footer.js scripts if not present
        if ($content -match '</body>') {
            # Check if scripts are already included
            $hasNavbarScript = $content -match 'src=".*?navbar\.js"'
            $hasFooterScript = $content -match 'src=".*?footer\.js"'
            
            if (-not $hasNavbarScript -or -not $hasFooterScript) {
                # Find the position before </body>
                $scriptTags = ""
                
                if (-not $hasNavbarScript) {
                    $scriptTags += '  <script src="' + $relativePath + 'js/navbar.js"></script>' + "`n"
                    Write-Host "  [OK] Added navbar.js script" -ForegroundColor Green
                    $modified = $true
                }
                
                if (-not $hasFooterScript) {
                    $scriptTags += '  <script src="' + $relativePath + 'js/footer.js"></script>' + "`n"
                    Write-Host "  [OK] Added footer.js script" -ForegroundColor Green
                    $modified = $true
                }
                
                # Insert scripts before </body>
                $content = $content -replace '(</body>)', ($scriptTags + '$1')
            }
        }

        # Save the file if modified
        if ($modified) {
            $content | Set-Content -Path $file.FullName -Encoding UTF8 -NoNewline
            $updatedCount++
            Write-Host "  [DONE] File updated successfully" -ForegroundColor Green
        } else {
            $skippedCount++
            Write-Host "  [SKIP] No changes needed" -ForegroundColor Gray
        }
    }
    catch {
        $errorCount++
        Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Summary
Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Update Complete!" -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Total files processed: $($htmlFiles.Count)" -ForegroundColor White
Write-Host "Updated: $updatedCount" -ForegroundColor Green
Write-Host "Skipped: $skippedCount" -ForegroundColor Gray
Write-Host "Errors: $errorCount" -ForegroundColor Red
Write-Host "========================================"  -ForegroundColor Cyan
