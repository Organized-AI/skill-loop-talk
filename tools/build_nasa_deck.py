"""Build the Build Lab web deck: talk.organizedai.vip/NASA/

Usage: python3 tools/build_nasa_deck.py <deck project folder> <output index.html>
The project folder holds deck.json and slides/<id>.html (the Slides artifact's files).
Mirrors build_web_deck.py (DealCon) and build_gavel_deck.py: stacked 1920x1080 stages
scaled to width, speaker notes stripped, a fixed bar with progress, arrow keys, GSAP
reveal, and the narrated Build Lab film in a player opened from the cover.
"""
import json, re, sys

SRC = sys.argv[1].rstrip('/') + '/'
OUT = sys.argv[2]
BASE = '/NASA'
EVENT = 'https://riverhacks-spaceapps.org/'
BLOBS = {'/_blob/761991570fca92046863de912c8aeb06': BASE + '/event-qr.png'}
# figure stills in the Slides deck become the live Anatomy figures here
FIGS = {'972e08aad266897b6210a26ca9985672': 'fig-cover.html', '67aadef6ca7fbd949c211e4d67ab872a': 'fig-build.html', 'c2430f468c72206bf87372b67d674828': 'fig-launch.html', 'acd646e0c03013b04494eaa377946647': 'fig-rocket.html'}

HERE = __file__.rsplit('/', 1)[0] + '/'
MOTION_CSS = open(HERE + 'nasa_motion.css').read()
MOTION_JS = open(HERE + 'nasa_motion.js').read()

deck = json.load(open(SRC + 'deck.json'))
order = deck['order']


def convert(s):
    s = re.sub(r'<aside>.*?</aside>', '', s, flags=re.S)                 # speaker notes stay private
    for bid, page in FIGS.items():
        s = re.sub(r'<img src="/_blob/' + bid + r'" alt="([^"]*)" style="([^"]*)">',
                   lambda m: f'<iframe class="fig" src="{BASE}/{page}" title="{m.group(1)}" loading="lazy" scrolling="no" style="{m.group(2)}; border:0; background:transparent"></iframe>', s)
    for k, v in BLOBS.items():
        s = s.replace(k, v)
    s = re.sub(r'<x-shape kind="arrow-right" style="([^"]*)"></x-shape>',
               lambda m: f'<span class="xarrow" style="{m.group(1)}"></span>', s)
    s = re.sub(r'<x-icon name="Check" style="([^"]*)"></x-icon>',
               lambda m: f'<span class="xcheck" style="{m.group(1)}"></span>', s)
    s = s.replace('<section id="', '<section class="sl" id="', 1)
    # the QR on the last slide opens the event site when tapped
    s = re.sub(r'(<img src="' + re.escape(BASE) + r'/event-qr\.png"[^>]*>)',
               lambda m: f'<a href="{EVENT}" class="qrlink" data-track="event">{m.group(1)}</a>', s)
    return s


# the narrated film: a play button pinned on the cover
play = ('<button class="playbtn" type="button" onclick="openVid()" aria-label="Play the 3-minute build lab film">'
        '<span>▶</span> Watch the 3-minute film</button>')
body = ''
for i, sid in enumerate(order):
    s = convert(open(SRC + f'slides/{sid}.html').read())
    if sid == 'cover':
        s = s.replace('</section>', play + '</section>')
    body += f'<div class="stage" data-i="{i}" data-id="{sid}"><div class="fit">{s}</div></div>\n'
missing = re.findall(r'/_blob/[0-9a-f]+', body)
assert not missing, f'unmapped assets: {missing}'

page = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Build Lab · RiverHacks × NASA Space Apps</title>
<meta name="description" content="How our student team builds with an AI coding agent: the build lab, building a change, pressing Launch!, the rules we work by and the RiverHacks weekend.">
<meta name="theme-color" content="#0c0b09">
<meta property="og:title" content="The Build Lab · RiverHacks × NASA Space Apps">
<meta property="og:description" content="The team decides. One change at a time. Every fact needs a source.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{background:#0c0b09}}
body{{color:#a09888;font-family:Inter,Arial,sans-serif;-webkit-font-smoothing:antialiased}}
.bar{{position:fixed;top:0;left:0;right:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 20px;background:rgba(12,11,9,.9);backdrop-filter:blur(10px);border-bottom:1px solid #2a2520;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8a8272}}
.bar b{{color:#f0ece4}}.bar b i{{color:#F5D623;font-style:normal}}
.bar a{{color:#F5D623;text-decoration:none;margin-left:16px;white-space:nowrap}}
.prog{{position:fixed;top:0;left:0;height:2px;background:#F5D623;z-index:21;width:0}}
main{{padding-top:40px}}
.stage{{position:relative;width:100%;overflow:hidden;border-bottom:1px solid #1a1814}}
.fit{{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0}}
section.sl{{position:relative;width:1920px;height:1080px;overflow:hidden}}
section.sl img,section.sl iframe.fig{{display:block}}
section.sl iframe.fig{{color-scheme:dark}}
section.sl table{{border-collapse:collapse;width:100%}}
section.sl th,section.sl td{{padding:12px 18px;text-align:left;vertical-align:top;line-height:1.4}}
section.sl ul,section.sl ol{{list-style:none}}
.xarrow{{display:block;flex:none;background:transparent!important;position:relative}}
.xarrow::after{{content:"→";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#8B7A12;font:800 40px 'JetBrains Mono',monospace}}
.xcheck{{display:inline-block;flex:none;position:relative}}
.xcheck::after{{content:"✓";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:currentColor;font:800 26px 'JetBrains Mono',monospace}}
.qrlink{{display:block}}
.playbtn{{position:absolute;right:128px;bottom:150px;display:flex;align-items:center;gap:14px;background:#F5D623;color:#0c0b09;border:0;border-radius:6px;padding:18px 26px;font:800 24px 'JetBrains Mono',monospace;letter-spacing:.04em;cursor:pointer}}
.playbtn span{{font-size:22px}}
.vid{{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center;padding:20px}}
.vid.on{{display:flex}}
.vid video{{width:min(1200px,100%);aspect-ratio:16/9;background:#000;border:1px solid #2a2520}}
.vid button{{position:absolute;top:16px;right:20px;background:none;border:1px solid #605848;color:#f0ece4;font:600 13px 'JetBrains Mono',monospace;padding:8px 14px;cursor:pointer}}
.hint{{position:fixed;right:16px;bottom:14px;z-index:20;font:600 10px 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#605848}}
@media (max-width:700px){{.hint{{display:none}}.bar{{font-size:10px;padding:10px 16px}}.bar .sec{{display:none}}.bar a{{margin-left:10px}}.bar .pbtn{{margin-left:10px}}}}
{{MOTION_CSS}}</style>
</head>
<body>
<div class="prog" id="prog"></div>
<div class="bar"><span><b>Organized<i>AI</i></b><span class="sec"> · RiverHacks × NASA Space Apps · The build lab</span></span><span><span id="count">01 / {len(order):02d}</span><a href="{EVENT}" data-track="event">Event schedule</a><a href="{BASE}/guide/" data-track="guide">Guide</a><button type="button" class="pbtn" id="presentBtn" aria-label="Present full screen (P)">▶ Present</button></span></div>
<canvas id="stars" aria-hidden="true"></canvas><canvas id="warp" aria-hidden="true"></canvas>
<main>
{body}</main>
<div class="vid" id="vid" role="dialog" aria-label="Build lab film"><button type="button" onclick="closeVid()">Close ✕</button><video id="v" src="{BASE}/build-lab-film.mp4" controls playsinline preload="none" aria-label="Build lab film, 3 minutes, voiceover with captions on screen"></video></div>
<div class="hint">← → to move · P to present</div>
<div class="pcount" id="pcount" aria-live="polite"></div><button type="button" class="pexit" id="pexit">Esc · exit</button>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/SplitText.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrambleTextPlugin.min.js" defer></script>
<script>
{{MOTION_JS}}
</script>
</body>
</html>
'''
page = page.replace('{MOTION_CSS}', MOTION_CSS).replace('{MOTION_JS}', MOTION_JS)
open(OUT, 'w').write(page)
print(len(order), 'slides ->', OUT)
