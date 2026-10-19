"""Build the Gavel & Gown web deck: talk.organizedai.vip/gavel-and-gown/

Usage: python3 tools/build_gavel_deck.py <deck project folder> <output index.html>
The project folder holds deck.json and slides/<id>.html (the Slides artifact's files).
Mirrors build_web_deck.py (DealCon): stacked 1920x1080 stages scaled to width,
speaker notes stripped, a fixed bar with progress, arrow keys, GSAP reveal.
"""
import json, re, sys

SRC = sys.argv[1].rstrip('/') + '/'
OUT = sys.argv[2]
BASE = '/gavel-and-gown'
BOARD = 'https://judy-the-judge.jordan-691.workers.dev/hq'
BLOBS = {'/_blob/a7ace44632f356fcd2bcba54c5cd8dd5': BASE + '/hq-board.png',
         '/_blob/41f4f8b4e1552353327f9e90ba93075a': BASE + '/hq-qr.png'}

deck = json.load(open(SRC + 'deck.json'))
order = deck['order']


def convert(s):
    s = re.sub(r'<aside>.*?</aside>', '', s, flags=re.S)                 # speaker notes stay private
    for k, v in BLOBS.items():
        s = s.replace(k, v)
    s = re.sub(r'<x-shape kind="arrow-right" style="([^"]*)"></x-shape>',
               lambda m: f'<span class="xarrow" style="{m.group(1)}"></span>', s)
    s = re.sub(r'<x-icon name="Check" style="([^"]*)"></x-icon>',
               lambda m: f'<span class="xcheck" style="{m.group(1)}"></span>', s)
    s = s.replace('<section id="', '<section class="sl" id="', 1)
    # the QR on the last slide opens the board when tapped
    s = re.sub(r'(<img src="' + re.escape(BASE) + r'/hq-qr\.png"[^>]*>)',
               lambda m: f'<a href="{BOARD}" class="qrlink" data-track="board">{m.group(1)}</a>', s)
    return s


body = ''
for i, sid in enumerate(order):
    s = convert(open(SRC + f'slides/{sid}.html').read())
    body += f'<div class="stage" data-i="{i}" data-id="{sid}"><div class="fit">{s}</div></div>\n'
missing = re.findall(r'/_blob/[0-9a-f]+', body)
assert not missing, f'unmapped assets: {missing}'

page = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gavel &amp; Gown · Judging the Judge-Makers</title>
<meta name="description" content="Who judges the judges? Judy does. Build an LLM-as-a-judge, then let Judy put it on trial and audit the system you built to check it.">
<meta name="theme-color" content="#0c0b09">
<meta property="og:title" content="Gavel &amp; Gown · Judging the Judge-Makers">
<meta property="og:description" content="Two verdicts per team: how your judge behaves, and how you built and checked it. Live board at /hq.">
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
section.sl img{{display:block}}
.xarrow{{display:block;flex:none;background:transparent!important;position:relative}}
.xarrow::after{{content:"→";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#8B7A12;font:800 40px 'JetBrains Mono',monospace}}
.xcheck{{display:inline-block;flex:none;position:relative}}
.xcheck::after{{content:"✓";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:currentColor;font:800 26px 'JetBrains Mono',monospace}}
.qrlink{{display:block}}
.hint{{position:fixed;right:16px;bottom:14px;z-index:20;font:600 10px 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#605848}}
@media (max-width:700px){{.hint{{display:none}}.bar{{font-size:10px;padding:10px 16px}}.bar .sec{{display:none}}.bar a{{margin-left:10px}}}}
</style>
</head>
<body>
<div class="prog" id="prog"></div>
<div class="bar"><span><b>Organized<i>AI</i></b><span class="sec"> · Gavel &amp; Gown · Judging the judge-makers</span></span><span><span id="count">01 / {len(order):02d}</span><a href="{BOARD}" data-track="board">Open the board</a></span></div>
<main>
{body}</main>
<div class="hint">← → to move</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script>
(function(){{
  window.dataLayer=window.dataLayer||[];
  function track(ev,p){{try{{p=p||{{}};p.event=ev;p.deck='gavel-and-gown';window.dataLayer.push(p)}}catch(e){{}}}}
  var stages=[].slice.call(document.querySelectorAll('.stage')),n=stages.length,cur=0;
  function fit(){{var w=document.documentElement.clientWidth,s=w/1920;
    stages.forEach(function(st){{st.style.height=(1080*s)+'px';st.firstElementChild.style.transform='scale('+s+')';}});}}
  fit();addEventListener('resize',fit);
  var cnt=document.getElementById('count'),prog=document.getElementById('prog');
  function pad(x){{return(x<10?'0':'')+x}}
  var io=new IntersectionObserver(function(es){{es.forEach(function(e){{if(e.isIntersecting){{cur=+e.target.dataset.i;cnt.textContent=pad(cur+1)+' / '+pad(n);reveal(e.target);}}}})}},{{threshold:.5}});
  stages.forEach(function(s){{io.observe(s)}});
  var seen=new WeakSet();
  function reveal(st){{if(seen.has(st))return;seen.add(st);track('deck_slide_view',{{slide:st.dataset.id,index:+st.dataset.i+1}});
    if(!window.gsap||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var kids=st.querySelectorAll('section.sl > *:not([style*="position:absolute"])');
    gsap.from(kids,{{y:18,opacity:0,duration:.5,stagger:.06,ease:'power2.out',clearProps:'transform,opacity'}});}}
  addEventListener('scroll',function(){{var h=document.documentElement;prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'}},{{passive:true}});
  function go(i){{i=Math.max(0,Math.min(n-1,i));stages[i].scrollIntoView({{behavior:'smooth',block:'start'}})}}
  addEventListener('keydown',function(e){{
    if(['ArrowRight','ArrowDown','PageDown',' '].indexOf(e.key)>-1){{e.preventDefault();go(cur+1)}}
    if(['ArrowLeft','ArrowUp','PageUp'].indexOf(e.key)>-1){{e.preventDefault();go(cur-1)}}
    if(e.key==='Home'){{e.preventDefault();go(0)}}if(e.key==='End'){{e.preventDefault();go(n-1)}}}});
  document.addEventListener('click',function(e){{var a=e.target.closest('[data-track]');if(a)track('deck_board_click',{{from:a.closest('.stage')?'slide':'bar'}})}});
}})();
</script>
</body>
</html>
'''
open(OUT, 'w').write(page)
print(len(order), 'slides ->', OUT)
