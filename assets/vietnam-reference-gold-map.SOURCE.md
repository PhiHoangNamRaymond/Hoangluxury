# Source-derived travel map

Reference supplied by the site owner:
https://vnsdi.mae.gov.vn/downloads/hcvn_9tr_2025.pdf

Reference PDF SHA-256:
8caa80f799a05960f6343f1e93a77e55997d0e3933bbf2e2f66f5a51289d2cf9

The gold SVG uses selected filled land paths and offshore geographic symbols
extracted from page 1 with pdfplumber, retaining their page coordinates.
It is a simplified travel illustration, not a complete administrative map or an
official publication. Some source layers (roads, rivers, administrative labels,
neighbouring countries and underwater terrain) are omitted. The travel pins,
route lines, type and decorative patterns are separate schematic overlays.
No generative image model was used to redraw the geography in this version.
The all-over interior mountain texture is a separate AI-generated transparent
asset (`map-mountain-texture.png`), clipped inside the source land geometry.
It is decorative, not terrain data. The former pagoda/palm vignettes are not
rendered. `map-original-compass.png` reuses the compass region of the old
`opt/vietnam-routes-map-detail-balanced-2026.webp` asset without redrawing it.

Reproduction (requires Python and pdfplumber):
`python scripts/generate-reference-map.py /path/to/hcvn_9tr_2025.pdf`
The command prints SVG to stdout and feature counts to stderr.
Raster delivery asset: `opt/vietnam-map-vnsdi-2025-gold.webp`, rendered from the
SVG at 180 dpi and encoded WebP quality 90. Keep the SVG as the editable source.
The earlier AI illustration is retained but no longer imported by the site.

Owner/cartographic review remains required before public release. Do not label
this adaptation as an official government map or as a source of surveying data.
