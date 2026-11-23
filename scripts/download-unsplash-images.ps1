# download-unsplash-images.ps1
# Downloads high quality curated food photos from Unsplash for local development

$targetDir = Join-Path $PSScriptRoot "..\frontend\public\images"
if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
}

$images = @{
    "burger.jpg" = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80"
    "pizza.jpg" = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80"
    "salad.jpg" = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80"
    "grilled-food.jpg" = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80"
}

Write-Host "Downloading local food images to $targetDir..." -ForegroundColor Cyan

foreach ($name in $images.Keys) {
    $outPath = Join-Path $targetDir $name
    if (!(Test-Path $outPath)) {
        Write-Host "Downloading $name..."
        try {
            Invoke-WebRequest -Uri $images[$name] -OutFile $outPath -TimeoutSec 30
            Write-Host "Saved $name" -ForegroundColor Green
        } catch {
            Write-Warning "Failed to download $name. Creating a placeholder SVG if needed."
        }
    } else {
        Write-Host "$name already exists, skipping." -ForegroundColor Yellow
    }
}

Write-Host "Done downloading images." -ForegroundColor Green
