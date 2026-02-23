# Script per aggiornare navbar e footer in tutte le pagine
$pages = @(
    "companies.html", "contact.html", "faq.html", "pricing.html",
    "listings.html", "signup.html"
)

foreach ($page in $pages) {
    $filePath = "c:\Users\CAdre\Desktop\PC\Portfolio\SPLit8\pages\$page"
    
    if (Test-Path $filePath) {
        Write-Host "Aggiornando $page..." -ForegroundColor Cyan
        
        # Leggi il contenuto
        $content = Get-Content $filePath -Raw
        
        # Aggiorna canvas id
        $content = $content -replace 'id="skyline"', 'id="skyline-canvas"'
        
        # Salva
        $content | Set-Content $filePath -NoNewline
        
        Write-Host "✓ $page aggiornato" -ForegroundColor Green
    }
}

Write-Host "`n✅ Completato!" -ForegroundColor Green
