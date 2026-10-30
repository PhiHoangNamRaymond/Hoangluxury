# Illustrative travel map

User-supplied illustration, selected on 2026-10-30 as replacement for the previous generated map.
The parchment background was removed with the built-in image generation/editing tool (background-extraction, transparent output).
The selected PNG is retained in the tool's generated-images directory; the website uses the compressed transparent WebP sibling in `opt/`.

This is a decorative travel illustration, not an authoritative geographic or administrative map.
The homepage first displayed the caption "Bản đồ minh hoạ" (replaced on 2026-10-30, see below).

Preserve the full composition, numbered destinations, compass, illustrated details and offshore island labels when replacing this asset.

## Island-label revision

The active website asset is `opt/vietnam-illustrative-travel-map-islands.webp`.
Requested labels: EAST SEA, Hoang Sa, Truong Sa, Phu Quoc, Con Dao.
Removed the BIEN DONG line and the English island names in parentheses.
Added the Phu Quoc and Con Dao illustrations near southern Vietnam.
Relative island placement was checked against the previously supplied reference:
https://vnsdi.mae.gov.vn/downloads/hcvn_9tr_2025.pdf
The earlier transparent WebP is retained as a recoverable prior version.

## Responsive color variants

- Mobile/tablet (below 961 CSS px): `opt/vietnam-illustrative-travel-map-islands.webp`, unchanged.
- Desktop (961 CSS px and above): `opt/vietnam-illustrative-travel-map-islands-desktop.webp`, lighter muted antique-gold variant based on the old-map color reference supplied by the user.
- Both variants retain the full-country illustration, updated sea/island labels and the caption.
- Native `picture`/`source` selection loads only the selected variant, still deferred until the section is near the viewport.
- Desktop variant was edited with the built-in image tool and compressed to transparent WebP. The generator originals remain outside the repository for recovery.

## Desktop border-color correction

The border reference supplied later was sampled at approximately `#D8C09C`.
Rather than consuming a further generative edit (which changed unrelated artwork),
the desktop image now uses a native SVG color-transfer filter at display time.
The transfer softly lifts mid/light ink toward the sampled pale beige-gold,
retains tonal differences and dark lettering, and does not change the raster geometry.
The filter applies only at the existing desktop breakpoint (961 CSS px).
No mobile image bytes or map labels were changed in this correction.

## Classic desktop variant (2026-10-30)

The display-time SVG filters above were dropped (their pixel radii did not scale with
the rendered map). As requested, desktop now shows the mobile map itself with thinner
borders and borders/motifs in the colours of the previous route map
(`opt/vietnam-routes-map-detail-balanced-2026.webp`):
`opt/vietnam-illustrative-travel-map-islands-desktop-classic.webp`, processed once from
`opt/vietnam-illustrative-travel-map-islands.webp` at its native 1024 x 980 px.

- Labels, number badges and the 15 location dots keep the mobile look: within 14 px of
  dark lettering (luminance below 0.08, specks under 8 px ignored) and around each dot,
  dark ink and the pale label plaques are left untouched.
- Very light ink elsewhere (luminance 0.82 and above: pale ribbon centres, highlights)
  is removed, so borders read as thin lines.
- All other ink (borders, route lines, motifs) is mapped by luminance to a light bronze
  range centred on the homepage route-card border, `rgba(184,126,39,.68)` over the cream
  background (about `rgb(203,161,96)`), from `rgb(150,100,30)` to `rgb(226,200,155)`.
  The user confirmed the old map's borders were this lighter bronze (an earlier muted
  grey-tan version sampled from the old map's land shading was replaced the same day).

The earlier gold desktop file `opt/vietnam-illustrative-travel-map-islands-desktop.webp`
is no longer referenced and is kept for recovery.

## File name, alt and caption (2026-10-30)

The classic file below was renamed to `opt/vietnam-tourism-illustrated-map.webp`
(the user's file name; "classic" in the sections above refers to this file).
The homepage now exposes it with the user's alt text and replaces the old
"Bản đồ minh hoạ" caption with: "This is an illustrative travel map. Locations and
distances are not shown to scale."

## One map for all screens (2026-10-30)

At the user's request PC and mobile now share this classic file: the homepage loads
`opt/vietnam-illustrative-travel-map-islands-desktop-classic.webp` everywhere, with no
`picture`/`source` switch. `opt/vietnam-illustrative-travel-map-islands.webp` is no
longer referenced by the site but stays as the source the classic file was made from.
The "Responsive color variants" section above is historical.
