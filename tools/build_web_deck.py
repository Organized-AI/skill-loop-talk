import json, re, html
SRC = '/tmp/claude-0/-home-claude-skill-loop-talk/1457cf68-a59e-5675-ae11-1c893a8eb0ad/scratchpad/live5/project/'
OUT = '/home/claude/skill-loop-talk/public/dealcon/index.html'
BLOBS = {'/_blob/7c9a20be9812a57fb655bc60e0705ad6': '/dealcon/intake-qr.png',
         '/_blob/5ca5bb7bdea2299398322a32b8374e38': '/dealcon/audit-qr.png',
         '/_blob/0b3a3d32e7b42885d713804e2e91e5b4': '/dealcon/jordan.jpg',
         '/_blob/4db07ab58c0ab56535a91d64390e5c15': '/dealcon/mastermind-qr.png',
         '/_blob/ed2439faaff917f0db48838073bb2a34': '/dealcon/workshop-qr.png'}
deck = json.load(open(SRC + 'deck.json'))
order = deck['order']

def convert(s, sid):
    s = re.sub(r'<aside>.*?</aside>', '', s, flags=re.S)                 # speaker notes stay private
    for k, v in BLOBS.items(): s = s.replace(k, v)
    # x-shape arrow -> text arrow with the same box
    s = re.sub(r'<x-shape kind="arrow-right" style="([^"]*)"></x-shape>',
               lambda m: f'<span class="xarrow" style="{m.group(1)}"></span>', s)
    s = re.sub(r'<x-icon name="Check" style="([^"]*)"></x-icon>',
               lambda m: f'<span class="xcheck" style="{m.group(1)}"></span>', s)
    s = s.replace('<section id="', '<section class="sl" id="', 1)
    return s

slides = []
for sid in order:
    s = open(SRC + f'slides/{sid}.html').read()
    slides.append((sid, convert(s, sid)))

# the explainer video: a play button pinned on the playbook slide
play = ('<button class="playbtn" type="button" onclick="openVid()" aria-label="Play the 75-second explainer">'
        '<span>▶</span> Watch the 75-second explainer</button>')
body = ''
for i, (sid, s) in enumerate(slides):
    if sid == 'playbook':
        s = s.replace('</section>', play + '</section>')
    body += f'<div class="stage" data-i="{i}"><div class="fit">{s}</div></div>\n'

page = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The FDE Playbook · DealCon</title>
<meta name="description" content="The forward deployed engineer playbook for 7–9 figure acquirers: build, deploy and troubleshoot one toolkit across every business you buy.">
<meta name="theme-color" content="#0c0b09">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{background:#0c0b09}}
body{{color:#a09888;font-family:Inter,Arial,sans-serif;-webkit-font-smoothing:antialiased}}
.bar{{position:fixed;top:0;left:0;right:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:rgba(12,11,9,.9);backdrop-filter:blur(10px);border-bottom:1px solid #2a2520;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8a8272}}
.bar b{{color:#f0ece4}}.bar b i{{color:#F5D623;font-style:normal}}
.bar a{{color:#F5D623;text-decoration:none;margin-left:16px}}
.prog{{position:fixed;top:0;left:0;height:2px;background:#F5D623;z-index:21;width:0}}
main{{padding-top:40px}}
.stage{{position:relative;width:100%;overflow:hidden;border-bottom:1px solid #1a1814}}
.fit{{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0}}
section.sl{{position:relative;width:1920px;height:1080px;overflow:hidden}}
section.sl table{{border-collapse:collapse;width:100%}}
section.sl th,section.sl td{{padding:14px 18px;text-align:left;vertical-align:top;line-height:1.4}}
section.sl ul,section.sl ol{{list-style:none}}
.xarrow{{display:block;flex:none;background:transparent!important;position:relative}}
.xarrow::after{{content:"→";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#8B7A12;font:800 40px 'JetBrains Mono',monospace}}
.xcheck{{display:inline-block;flex:none;position:relative}}
.xcheck::after{{content:"✓";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:currentColor;font:800 26px 'JetBrains Mono',monospace}}
.playbtn{{position:absolute;right:128px;bottom:150px;display:flex;align-items:center;gap:14px;background:#F5D623;color:#0c0b09;border:0;border-radius:6px;padding:18px 26px;font:800 24px 'JetBrains Mono',monospace;letter-spacing:.04em;cursor:pointer}}
.playbtn span{{font-size:22px}}
.vid{{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center;padding:20px}}
.vid.on{{display:flex}}
.vid video{{width:min(1200px,100%);aspect-ratio:16/9;background:#000;border:1px solid #2a2520}}
.vid button{{position:absolute;top:16px;right:20px;background:none;border:1px solid #605848;color:#f0ece4;font:600 13px 'JetBrains Mono',monospace;padding:8px 14px;cursor:pointer}}
.hint{{position:fixed;right:16px;bottom:14px;z-index:20;font:600 10px 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#605848}}
@media (max-width:700px){{.hint{{display:none}}.bar{{font-size:10px}}.bar .sec{{display:none}}}}
</style>
</head>
<body>
<div class="prog" id="prog"></div>
<div class="bar"><span><b>Organized<i>AI</i></b><span class="sec"> · DealCon · The FDE playbook</span></span><span><span id="count">01 / {len(order)}</span><a href="https://dealcon-workshop.jordan-691.workers.dev/#home">Build one now</a></span></div>
<main>
{body}</main>
<div class="vid" id="vid"><button type="button" onclick="closeVid()">Close ✕</button><video id="v" src="/dealcon/rollup-playbook.mp4" controls playsinline preload="none"></video></div>
<div class="hint">← → to move</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script>
(function(){{
  var stages=[].slice.call(document.querySelectorAll('.stage')),n=stages.length,cur=0;
  function fit(){{var w=document.documentElement.clientWidth,s=w/1920;
    stages.forEach(function(st){{st.style.height=(1080*s)+'px';st.firstElementChild.style.transform='scale('+s+')';}});}}
  fit();addEventListener('resize',fit);
  var cnt=document.getElementById('count'),prog=document.getElementById('prog');
  function pad(x){{return(x<10?'0':'')+x}}
  var io=new IntersectionObserver(function(es){{es.forEach(function(e){{if(e.isIntersecting){{cur=+e.target.dataset.i;cnt.textContent=pad(cur+1)+' / '+pad(n);reveal(e.target);}}}})}},{{threshold:.5}});
  stages.forEach(function(s){{io.observe(s)}});
  var seen=new WeakSet();
  function reveal(st){{if(seen.has(st)||!window.gsap||matchMedia('(prefers-reduced-motion: reduce)').matches)return;seen.add(st);
    var kids=st.querySelectorAll('section.sl > *:not([style*="position:absolute"])');
    gsap.from(kids,{{y:18,opacity:0,duration:.5,stagger:.06,ease:'power2.out',clearProps:'transform,opacity'}});}}
  addEventListener('scroll',function(){{var h=document.documentElement;prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'}},{{passive:true}});
  function go(i){{i=Math.max(0,Math.min(n-1,i));stages[i].scrollIntoView({{behavior:'smooth',block:'start'}})}}
  addEventListener('keydown',function(e){{if(document.getElementById('vid').classList.contains('on')){{if(e.key==='Escape')closeVid();return}}
    if(['ArrowRight','ArrowDown','PageDown',' '].indexOf(e.key)>-1){{e.preventDefault();go(cur+1)}}
    if(['ArrowLeft','ArrowUp','PageUp'].indexOf(e.key)>-1){{e.preventDefault();go(cur-1)}}
    if(e.key==='Home'){{e.preventDefault();go(0)}}if(e.key==='End'){{e.preventDefault();go(n-1)}}}});
  window.openVid=function(){{document.getElementById('vid').classList.add('on');var v=document.getElementById('v');v.play&&v.play().catch(function(){{}})}};
  window.closeVid=function(){{var v=document.getElementById('v');v.pause();document.getElementById('vid').classList.remove('on')}};
}})();
</script>
</body>
</html>
'''
open(OUT, 'w').write(page)
print(len(order), 'slides ->', OUT)
