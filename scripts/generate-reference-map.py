import sys, json, html, base64
from pathlib import Path
import pdfplumber

p = pdfplumber.open(sys.argv[1]).pages[0]
province_colors = {(0.68,1.0,0.66),(.949,.8,.502),(1.,1.,.745),(1.,.7,1.),(.902,.765,.996),(.678,1.,.659),(1.,.702,1.),(.73,.7,1.)}
paths=[]; province_count=0; island_count=0
def svg_path(commands):
    result=[]
    for cmd in commands:
        if cmd[0] in ('m','l','c'):
            result.append(cmd[0].upper()+' '.join(f'{v:.2f}' for pt in cmd[1:] for v in pt))
        elif cmd[0]=='h':result.append('Z')
    return ' '.join(result)
for obj in p.curves:
    if not obj.get('fill'):continue
    color=tuple(round(v,3) for v in obj['non_stroking_color']) if isinstance(obj['non_stroking_color'],tuple) else ()
    province=color in province_colors
    cream=color==(.949,.949,.851)
    # Source islands only, at their original positions. No invented island dots.
    offshore=(300<obj['x0']<525 and 290<obj['top']<700) or (48<obj['x0']<290 and 460<obj['top']<650)
    reef=color==(0.,.514,.843) and offshore and obj['width']<3 and obj['height']<3
    island=(cream and offshore and obj['width']<38 and obj['height']<38) or reef
    if not (province or island):continue
    if province:province_count+=1
    else:island_count+=1
    paths.append(f'<path d="{svg_path(obj["path"])}"'+(' fill="#ba8b35"' if reef else '')+'/>')

s=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="18 82 573 622" role="img" aria-labelledby="title desc">',
'<title id="title">Vietnam travel map — Hoàng Sa and Trường Sa</title>',
'<desc id="desc">Mainland and island vector geometry extracted from the 2025 administrative map supplied by the customer, https://vnsdi.mae.gov.vn/downloads/hcvn_9tr_2025.pdf . Gold styling and schematic travel markers are separate overlays; not an official administrative map.</desc>',
'<defs><linearGradient id="paper" x2="0" y2="1"><stop stop-color="#f6eedf"/><stop offset="1" stop-color="#ede0cc"/></linearGradient><pattern id="waves" width="30" height="14" patternUnits="userSpaceOnUse"><path d="M0 7 Q7 4 15 7 T30 7" fill="none" stroke="#b88b41" stroke-width=".2" opacity=".18"/></pattern><pattern id="terrain" width="23" height="25" patternUnits="userSpaceOnUse"><path d="M2 17 8 8 16 17M6 13 8 8 10 13M12 20 17 12 22 20M15 16 17 12 19 16" fill="none" stroke="#b88b41" stroke-width=".25" opacity=".32"/></pattern><clipPath id="mainland">'+''.join(paths)+'</clipPath></defs>',
'<rect x="18" y="82" width="573" height="622" fill="url(#waves)"/>',
'<defs><filter id="landOutline" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius=".18" result="expanded"/><feFlood flood-color="#c8a66b"/><feComposite in2="expanded" operator="in"/><feComposite in2="SourceAlpha" operator="out" result="edge"/><feMerge><feMergeNode in="edge"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>',
'<g fill="#ede0cc" stroke="none" filter="url(#landOutline)">',*paths,'</g>']

# Decorative engraving only: clipped to the unchanged source geography.
s.append('<defs><radialGradient id="badgeGold" cx="35%" cy="25%" r="85%"><stop stop-color="#82571c"/><stop offset=".6" stop-color="#55370f"/><stop offset="1" stop-color="#291c0b"/></radialGradient><symbol id="etchedMountain" viewBox="0 0 24 19"><g fill="none" stroke="#a88750" stroke-linecap="round" stroke-linejoin="round"><path stroke-width=".30" d="M.5 17 3 14 5 10 7 8 9 4 10.5 3 12 6 14 9 15 11 18 13 21 17M9 4 9.5 8 8.5 10 9 13 7 17M10.5 3 12 8 14.5 12 17 17M3 16l3-4m-1 5 2-3m4 3 .5-7m1 7-.3-4m2 4-1.2-5m3 5-1.5-3m-11 4 4-.5m5 .5 8-.3"/><path stroke-width=".23" d="M13 10 15 7 16.5 5 18 8 20 12 23 16M16.5 5 17 10 19 15M15 12l-1 3m6 1-1-3"/></g></symbol></defs>')
art_path = Path(__file__).resolve().parents[1] / 'assets' / 'map-mountain-texture.png'
art_data = base64.b64encode(art_path.read_bytes()).decode('ascii')
old_map_path = Path(__file__).resolve().parents[1] / 'assets' / 'map-original-compass.png'
old_map_data = base64.b64encode(old_map_path.read_bytes()).decode('ascii')
s.append(f'<defs><pattern id="mountainEngraving" width="88" height="88" patternUnits="userSpaceOnUse"><image width="88" height="88" href="data:image/png;base64,{art_data}"/></pattern><image id="originalNorthernMap" width="128" height="121" href="data:image/png;base64,{old_map_data}"/></defs>')
s.append('<rect x="18" y="82" width="573" height="622" fill="url(#mountainEngraving)" opacity=".43" clip-path="url(#mainland)"/>')

# Tourist markers are schematic, in a separate layer from the source geometry.
def point(lon,lat):return (33+(lon-102)*32.1+(24-lat)*.15,71+(24-lat)*35)
hx,hy=point(105.834,21.028)
routes=[('01','Sa Pa',103.843,22.336,80,121),('02','Ha Long',107.081,20.951,214,165),('03','Ninh Binh',105.974,20.251,165,228),('04','Ha Giang',104.983,22.823,130,96),('05','Cat Ba',107.05,20.726,224,202),('06','Cao Bang',106.258,22.666,190,113),('07','Moc Chau',104.635,20.852,99,205),('08','Mu Cang Chai',104.089,21.851,76,147),('09','Ta Xua',104.437,21.291,84,176)]
s.append('<g font-family="Georgia, serif" fill="#654314">')
for number,name,lon,lat,lx,ly in routes:
    x,y=point(lon,lat)
    s.append(f'<path d="M{hx:.2f} {hy:.2f} Q{(hx+x)/2:.2f} {min(hy,y)-4:.2f} {x:.2f} {y:.2f}" fill="none" stroke="#bc8a32" stroke-width=".7" stroke-linecap="round" stroke-dasharray="2 1.2"/>')
    s.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="2.2" fill="#d3ad55" stroke="#f2da93" stroke-width=".6"/><circle cx="{x:.2f}" cy="{y:.2f}" r=".85" fill="#9a6e20"/>')
    s.append(f'<circle cx="{lx}" cy="{ly-4}" r="8.1" fill="#d5b570" opacity=".3"/><circle cx="{lx}" cy="{ly-4}" r="7.2" fill="url(#badgeGold)" stroke="#cb9e47" stroke-width=".9"/><circle cx="{lx}" cy="{ly-4}" r="6.1" fill="none" stroke="#e6c574" stroke-width=".3"/><text x="{lx}" y="{ly-1.4}" text-anchor="middle" fill="#fff1cf" font-family="Times New Roman, serif" font-size="8.3">{number}</text><text x="{lx}" y="{ly+10}" text-anchor="middle" font-family="Times New Roman, serif" font-size="6.8" font-weight="600" fill="#292219">{name.upper()}</text>')
s.append(f'<g transform="translate({hx-8:.2f} {hy-23:.2f})" stroke="#b38635" fill="#e8cc8b" stroke-width=".55"><path d="M1 23V8H15V23M4 23V12H12V23M7 23V18Q8 15 9 18V23"/><path d="M0 8Q8 7 16 8L14 5H2ZM1 5Q8 4 15 5M3 4V1M13 4V1M4 1Q8 3 12 1M6 9V13H10V9Z"/><path d="M2 14H14M2 16H14M2 20H5M11 20H14M0 23H16"/><circle cx="8" cy="11" r="1.2" fill="#a47a2f"/></g><circle cx="{hx:.2f}" cy="{hy:.2f}" r="4.3" fill="#ac802a" stroke="#f7e1a8" stroke-width=".8"/><path d="M{hx-2:.2f} {hy:.2f}h4M{hx:.2f} {hy-2:.2f}v4" stroke="#fff0c8" stroke-width=".55"/><text x="{hx:.2f}" y="{hy+13:.2f}" text-anchor="middle" fill="#292219" font-weight="bold" font-size="8">HANOI</text><text x="{hx:.2f}" y="{hy+20:.2f}" text-anchor="middle" font-size="5.5">(NOI BAI)</text>')
for name,lon,lat,dx,dy in [('Da Nang',108.202,16.054,-5,-7),('Hoi An',108.328,15.88,8,8),('Nha Trang',109.196,12.238,8,-3),('Da Lat',108.442,11.941,-21,12),('Ho Chi Minh City',106.7,10.776,8,-4)]:
    x,y=point(lon,lat)
    s.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="1.7" fill="#a5782a"/><text x="{x+dx:.2f}" y="{y+dy:.2f}" font-size="6.3">{name}</text>')
s.extend(['<text x="340" y="310" font-size="13" letter-spacing=".5">QĐ. Hoàng Sa</text>','<text x="340" y="321" font-size="5.7">TP. Đà Nẵng — Việt Nam</text>','<text x="387" y="481" font-size="13" letter-spacing=".5">QĐ. Trường Sa</text>','<text x="387" y="492" font-size="5.7">Khánh Hòa — Việt Nam</text>','<text x="375" y="422" font-size="14" letter-spacing="3" fill="#a98648">BIỂN ĐÔNG</text>','<text x="92" y="382" font-size="13" letter-spacing="2" fill="#a98648">VIỆT NAM</text>','</g>','<svg overflow="hidden" x="42" y="618" width="56" height="53" viewBox="0 0 128 121" preserveAspectRatio="xMidYMid meet"><use href="#originalNorthernMap"/></svg>','</svg>'])
print('\n'.join(s))
print(json.dumps({'provincePaths':province_count,'islandPaths':island_count}),file=sys.stderr)
