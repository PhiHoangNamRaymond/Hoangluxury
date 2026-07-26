$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$pattern = "sticky|floating|book-your|route-map|routes-layout|route-card|hlt-service-image|fleet-image|curated|journey"
$sourceFiles = Get-ChildItem -Path (Join-Path $PSScriptRoot "..\src") -Recurse -File |
    Where-Object { $_.Extension -in ".jsx", ".js", ".css" }

$outputLines = [System.Collections.Generic.List[string]]::new()

foreach ($file in $sourceFiles) {
    $content = Get-Content -LiteralPath $file.FullName
    $included = [System.Collections.Generic.HashSet[int]]::new()

    for ($index = 0; $index -lt $content.Count; $index++) {
        if ($content[$index] -match $pattern) {
            $start = [Math]::Max(0, $index - 6)
            $end = [Math]::Min($content.Count - 1, $index + 16)

            if ($included.Add($start)) {
                $outputLines.Add("")
                $outputLines.Add("FILE: $($file.FullName)")
                for ($line = $start; $line -le $end; $line++) {
                    $outputLines.Add(("{0,5}: {1}" -f ($line + 1), $content[$line]))
                }
            }
        }
    }
}

$font = New-Object System.Drawing.Font("Consolas", 11)
$lineHeight = 18
$width = 2400
$height = [Math]::Max(800, ($outputLines.Count + 2) * $lineHeight)
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.Clear([System.Drawing.Color]::White)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 30, 34))

$y = 12
foreach ($line in $outputLines) {
    $graphics.DrawString($line, $font, $brush, 12, $y)
    $y += $lineHeight
}

$outputPath = Join-Path $PSScriptRoot "source-diagnostic.png"
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$brush.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
$font.Dispose()
