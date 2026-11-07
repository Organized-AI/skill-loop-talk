/* Motion layer for talk.organizedai.vip/NASA: scroll mode (like DealCon) plus a Present mode
   with warp / 3D push / iris transitions, and a custom GSAP entrance for every slide.
   Everything degrades: no GSAP or reduced motion = the plain deck, still navigable. */
(function () {
  window.dataLayer = window.dataLayer || [];
  function track(ev, p) { try { p = p || {}; p.event = ev; p.deck = 'nasa-build-lab'; window.dataLayer.push(p); } catch (e) {} }
  function q(s, r) { return (r || document).querySelector(s); }
  function qa(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function kids(el) { return el ? [].slice.call(el.children) : []; }

  var stages = qa('.stage'), n = stages.length, cur = 0, present = false, busy = false, wasFs = false;
  var cnt = q('#count'), prog = q('#prog'), pcount = q('#pcount');
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function pad(x) { return (x < 10 ? '0' : '') + x; }
  function setCount() { cnt.textContent = pad(cur + 1) + ' / ' + pad(n); if (pcount) pcount.textContent = cnt.textContent; if (present) prog.style.width = ((cur + 1) / n * 100) + '%'; }

  /* ---------- layout ---------- */
  function fit() {
    if (present) {
      var W = innerWidth, H = innerHeight, s = Math.min(W / 1920, H / 1080), l = (W - 1920 * s) / 2, t = (H - 1080 * s) / 2;
      stages.forEach(function (st) { st.style.height = ''; st.firstElementChild.style.transform = 'translate(' + l + 'px,' + t + 'px) scale(' + s + ')'; });
    } else {
      var w = document.documentElement.clientWidth, k = w / 1920;
      stages.forEach(function (st) { st.style.height = (1080 * k) + 'px'; st.firstElementChild.style.transform = 'scale(' + k + ')'; });
    }
    sizeCanvas(stars); sizeCanvas(warp);
  }

  /* ---------- canvases: ambient stars (present mode) and the warp burst ---------- */
  var stars = q('#stars'), warp = q('#warp'), DPR = Math.min(2, window.devicePixelRatio || 1);
  function sizeCanvas(c) { if (!c) return; c.width = innerWidth * DPR; c.height = innerHeight * DPR; }
  var field = [];
  for (var i = 0; i < 160; i++) field.push({ x: Math.random(), y: Math.random(), z: Math.random() * 0.8 + 0.2 });
  var starRaf = 0;
  function drawStars() {
    var c = stars, g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
    field.forEach(function (s) {
      s.y += 0.00025 * s.z; if (s.y > 1) s.y = 0;
      g.fillStyle = 'rgba(240,236,228,' + (0.25 + s.z * 0.5) + ')';
      g.fillRect(s.x * c.width, s.y * c.height, 1.6 * DPR * s.z, 1.6 * DPR * s.z);
    });
    starRaf = present ? requestAnimationFrame(drawStars) : 0;
  }
  function warpBurst(dur) {
    if (!window.gsap || RM) return;
    var c = warp, g = c.getContext('2d'), cx = c.width / 2, cy = c.height / 2, pts = [], st = { k: 0 };
    for (var i = 0; i < 260; i++) { var a = Math.random() * Math.PI * 2; pts.push({ a: a, d: Math.random() * 60 * DPR + 4, v: Math.random() * 0.06 + 0.05, col: ['#f0ece4', '#F5D623', '#22d3ee'][i % 3] }); }
    c.style.display = 'block';
    function frame() {
      g.clearRect(0, 0, c.width, c.height);
      pts.forEach(function (p) {
        var d0 = p.d; p.d *= 1 + p.v * (0.6 + st.k * 1.8);
        g.strokeStyle = p.col; g.globalAlpha = Math.min(1, st.k * 1.4); g.lineWidth = 2 * DPR;
        g.beginPath(); g.moveTo(cx + Math.cos(p.a) * d0, cy + Math.sin(p.a) * d0); g.lineTo(cx + Math.cos(p.a) * p.d, cy + Math.sin(p.a) * p.d); g.stroke();
      });
      g.globalAlpha = 1;
    }
    gsap.ticker.add(frame);
    gsap.timeline({ onComplete: function () { gsap.ticker.remove(frame); g.clearRect(0, 0, c.width, c.height); c.style.display = 'none'; } })
      .to(st, { k: 1, duration: dur * 0.45, ease: 'power2.in' }).to(st, { k: 0, duration: dur * 0.55, ease: 'power2.out' });
  }

  /* ---------- per-slide entrances ---------- */
  var REC = {};
  var SVG_ROCKET = '<svg viewBox="0 0 64 128" width="72" height="144" aria-hidden="true"><path class="fl" d="M24 92 Q32 128 40 92Z" fill="#F5D623"/><path d="M32 4 C48 20 52 44 50 80 L14 80 C12 44 16 20 32 4Z" fill="#f0ece4"/><circle cx="32" cy="42" r="9" fill="#22d3ee" stroke="#0c0b09" stroke-width="3"/><path d="M14 62 L2 92 L16 86Z M50 62 L62 92 L48 86Z" fill="#F5D623"/><path d="M20 80 L44 80 L40 92 L24 92Z" fill="#C4943D"/></svg>';
  var CONF = ['#F5D623', '#22d3ee', '#4ade80', '#C4943D', '#f0ece4'];
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function reset(id) {
    var r = REC[id], s = document.getElementById(id);
    if (!r) return;
    r.loops.forEach(function (l) { l.revert(); });
    if (r.tl) r.tl.revert();
    r.splits.slice().reverse().forEach(function (sp) { sp.revert(); });
    r.added.forEach(function (e) { e.remove(); });
    (r.html || []).forEach(function (x) { x.el.innerHTML = x.html; });
    (r.cleanup || []).forEach(function (fn) { try { fn(); } catch (e) {} });
    qa('[data-txt]', s).forEach(function (el) { el.textContent = el.getAttribute('data-txt'); });
    delete REC[id];
  }
  function add(r, sec, html, cls) { var d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; sec.appendChild(d); r.added.push(d); return d; }
  function scr(r, tl, el, at, chars, dur) {
    if (!el || !window.ScrambleTextPlugin) return;
    var t = el.getAttribute('data-txt'); if (t == null) { t = el.textContent; el.setAttribute('data-txt', t); }
    tl.call(function () { el.textContent = ' '; }, null, 0);
    tl.to(el, { duration: dur || 0.9, scrambleText: { text: t, chars: chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', speed: 0.8 } }, at);
  }
  function split(r, el, type) { if (!window.SplitText || !el) return null; var sp = new SplitText(el, { type: type, tag: 'span' }); r.splits.push(sp); return sp; }
  function head(r, tl, el, at) {
    var sp = split(r, el, 'words,chars'); if (!sp) return at;
    tl.from(sp.chars, { yPercent: 120, opacity: 0, rotation: function () { return rnd(-30, 30); }, duration: 0.6, stagger: 0.016, ease: 'back.out(2.2)' }, at);
    var end = at + 0.6 + sp.chars.length * 0.016;
    qa('.hlt', el).forEach(function (h) {
      tl.to(h, { backgroundSize: '100% 6px', duration: 0.5, ease: 'power2.inOut' }, end);
      tl.to(h, { textShadow: '0 0 30px rgba(245,214,35,.85)', duration: 0.25, yoyo: true, repeat: 1 }, end);
    });
    return end;
  }
  function eyebrow(r, tl, s) { var eb = qa('p', s).filter(function (p) { return p.style.letterSpacing === '4px'; })[0]; scr(r, tl, eb, 0.05, null, 0.9); }
  function footer(r, tl, s) {
    var pins = kids(s).filter(function (el) { return el.tagName === 'P' && el.style.position === 'absolute'; });
    tl.from(pins, { y: 30, opacity: 0, duration: 0.5, stagger: 0.1 }, 0.3);
    if (pins[1]) scr(r, tl, pins[1], 0.4, '0123456789', 0.7);
  }
  function shake(tl, s, at) { tl.to(s, { keyframes: { x: [0, -14, 12, -8, 5, 0] }, duration: 0.38, ease: 'none' }, at); }
  function sparks(r, s, x, y, col) {
    var d = document.createElement('div'); d.className = 'spark'; var z = rnd(6, 14);
    d.style.width = d.style.height = z + 'px'; d.style.background = col || '#F5D623'; d.style.boxShadow = '0 0 12px ' + (col || '#F5D623');
    s.appendChild(d); r.added.push(d);
    gsap.fromTo(d, { x: x - z / 2 + rnd(-8, 8), y: y - z / 2, opacity: 1, scale: 1 }, { y: '+=' + rnd(30, 90), x: '+=' + rnd(-30, 30), opacity: 0, scale: 0.2, duration: rnd(0.5, 0.9), ease: 'power2.out', onComplete: function () { d.remove(); } });
  }
  function launchRocket(r, tl, s, x0, y0, x1, y1, at, dur) {
    var rk = add(r, s, SVG_ROCKET, 'rocket'); var last = 0;
    gsap.set(rk, { x: x0 - 36, y: y0, opacity: 0, rotation: Math.atan2(x1 - x0, y0 - y1) * 180 / Math.PI });
    tl.set(rk, { opacity: 1 }, at);
    tl.to(rk, { x: x1 - 36, y: y1, duration: dur, ease: 'power2.in', onUpdate: function () {
      var now = performance.now(); if (now - last < 28) return; last = now;
      sparks(r, s, gsap.getProperty(rk, 'x') + 36, gsap.getProperty(rk, 'y') + 136, Math.random() < 0.5 ? '#F5D623' : '#C4943D');
    } }, at);
    r.loops.push(gsap.to(q('.fl', rk), { scaleY: 1.5, transformOrigin: '50% 0%', duration: 0.08, yoyo: true, repeat: -1 }));
  }

  var ENTER = {
    cover: function (s, r, tl) {
      var left = kids(s)[0], fig = kids(s)[1], chips = kids(kids(left)[3]), play = q('.playbtn', s);
      head(r, tl, q('h1', s), 0.2);
      tl.from(kids(left)[2], { y: 30, opacity: 0, duration: 0.6 }, 0.9);
      tl.from(chips, { scale: 0, rotation: -16, opacity: 0, duration: 0.5, stagger: 0.09, ease: 'back.out(3)' }, 1.2);
      tl.from(fig, { x: 180, y: 40, rotationY: -28, transformPerspective: 1400, opacity: 0, duration: 1.1, ease: 'power3.out' }, 0.35);
      if (play) tl.from(play, { scale: 0, opacity: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' }, 2.0);
      launchRocket(r, tl, s, 260, 1180, 980, -260, 1.1, 1.8);
      var chase = gsap.timeline({ repeat: -1, repeatDelay: 2.2, delay: 3 });
      chips.forEach(function (c) { var col = c.style.color; chase.to(c, { backgroundColor: col, color: '#0c0b09', duration: 0.14 }).to(c, { backgroundColor: 'rgba(0,0,0,0)', color: col, duration: 0.3 }); });
      r.loops.push(chase);
      r.loops.push(gsap.to(fig, { y: -10, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 }));
    },
    mission: function (s, r, tl) {
      var row = kids(s).filter(function (el) { return el.tagName === 'DIV'; })[0], cards = kids(row), pill = kids(s).filter(function (el) { return el.tagName === 'P' && el.style.position !== 'absolute'; }).pop();
      head(r, tl, q('h2', s), 0.2);
      tl.from(cards, { rotationX: -100, transformOrigin: '50% 0%', transformPerspective: 1000, opacity: 0, duration: 0.95, stagger: 0.2, ease: 'back.out(1.5)' }, 0.7);
      cards.forEach(function (c, i) {
        scr(r, tl, kids(c)[0], 1.0 + i * 0.2, '0123456789#:×', 1.0);
        tl.from(kids(c)[1], { y: 20, opacity: 0, duration: 0.5 }, 1.4 + i * 0.2);
      });
      tl.from(pill, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.6, ease: 'power3.inOut' }, 2.3);
      scr(r, tl, pill, 2.5, null, 0.8);
      r.loops.push(gsap.to(cards[1], { boxShadow: '0 0 60px rgba(245,214,35,.35)', duration: 1.3, yoyo: true, repeat: -1, delay: 2.4 }));
      r.loops.push(gsap.to(kids(cards[1])[0], { textShadow: '0 0 30px rgba(245,214,35,.8)', duration: 1.3, yoyo: true, repeat: -1, delay: 2.4 }));
    },
    lab: function (s, r, tl) {
      var rows = kids(s).filter(function (el) { return el.tagName === 'DIV'; }), cards = kids(rows[0]), bar = rows[1];
      head(r, tl, q('h2', s), 0.2);
      tl.from(cards, { y: 300, opacity: 0, rotation: function (i) { return [-16, -6, 6, 16][i]; }, duration: 1, stagger: 0.14, ease: 'back.out(1.6)' }, 0.55);
      cards.forEach(function (c, i) { scr(r, tl, kids(c)[0], 0.8 + i * 0.14, null, 0.6); tl.from(kids(c)[2], { x: -30, opacity: 0, duration: 0.45 }, 1.7 + i * 0.16); });
      bar.style.position = 'relative'; bar.style.overflow = 'hidden';
      tl.from(bar, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.75, ease: 'power3.inOut' }, 2.3);
      tl.from(kids(bar), { opacity: 0, y: 12, duration: 0.4, stagger: 0.1 }, 2.8);
      var sw = add(r, bar, '', 'sweep');
      r.loops.push(gsap.fromTo(sw, { xPercent: -100 }, { xPercent: 100, duration: 1.6, repeat: -1, repeatDelay: 1.6, ease: 'power2.inOut', delay: 3.2 }));
      r.loops.push(gsap.to(cards, { y: -8, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 0.25 }, delay: 3 }));
    },
    build: function (s, r, tl) {
      var left = kids(s)[0], fig = kids(s)[1], grid = kids(left)[2], legend = kids(left)[3], cards = kids(grid);
      head(r, tl, q('h2', s), 0.2);
      tl.from(fig, { x: 160, rotationY: -24, transformPerspective: 1400, opacity: 0, duration: 1.1, ease: 'power3.out' }, 0.3);
      tl.fromTo(cards, { opacity: 0.1, scale: 0.92 }, { opacity: 0.1, scale: 0.92, duration: 0.01 }, 0);
      var t0 = 0.9, step = 0.3;
      cards.forEach(function (c, i) {
        var t = t0 + i * step;
        tl.to(c, { opacity: 1, scale: 1, duration: 0.32, ease: 'back.out(2.6)' }, t);
        tl.fromTo(c, { boxShadow: '0 0 0 rgba(245,214,35,0)' }, { boxShadow: '0 0 40px rgba(245,214,35,.6)', duration: 0.18, yoyo: true, repeat: 1 }, t);
        scr(r, tl, kids(c)[0], t, '0123456789', 0.35);
      });
      var c5 = cards[4], c8 = cards[7], t5 = t0 + 4 * step + 0.3, t8 = t0 + 7 * step + 0.3;
      c5.style.position = 'relative';
      var stamp = add(r, c5, 'APPROVED', 'stamp');
      tl.fromTo(stamp, { scale: 3.4, rotation: -28, opacity: 0 }, { scale: 1, rotation: -8, opacity: 1, duration: 0.32, ease: 'power4.in' }, t5);
      shake(tl, grid, t5 + 0.32);
      var x8 = c8.offsetLeft + c8.offsetWidth * 0.7, y8 = c8.offsetTop - 60;
      tl.to(c8, { boxShadow: '0 0 60px rgba(74,222,128,.55)', duration: 0.3, yoyo: true, repeat: 3 }, t8);
      launchRocket(r, tl, s, x8, y8, x8 + 40, -320, t8 + 0.15, 1.4);
      tl.from(legend, { y: 20, opacity: 0, duration: 0.5 }, t8 + 0.4);
      r.loops.push(gsap.to(qa('span', legend), { textShadow: '0 0 18px currentColor', duration: 0.6, yoyo: true, repeat: -1, stagger: 0.6, delay: t8 + 1 }));
    },
    launch: function (s, r, tl) {
      var rows = kids(s).filter(function (el) { return el.tagName === 'DIV'; }), row = rows[0], boxes = kids(row).filter(function (el) { return el.tagName === 'DIV'; }),
        arrows = qa('.xarrow', row), json = kids(rows[1])[0], fig = kids(rows[1])[1], jl = qa('p', json);
      head(r, tl, q('h2', s), 0.2);
      boxes.forEach(function (b, i) { tl.from(b, { y: 70, scale: 0.75, opacity: 0, duration: 0.55, ease: 'back.out(2)' }, 0.6 + i * 0.28); if (arrows[i]) tl.from(arrows[i], { scaleX: 0, transformOrigin: '0% 50%', opacity: 0, duration: 0.3 }, 0.85 + i * 0.28); });
      tl.from(fig, { x: 160, rotationY: -26, transformPerspective: 1400, opacity: 0, duration: 1, ease: 'power3.out' }, 1.2);
      tl.from(json, { y: 40, opacity: 0, duration: 0.5 }, 1.6);
      jl.forEach(function (p, i) { tl.fromTo(p, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.4, ease: 'steps(18)' }, 1.8 + i * 0.16); });
      var pk = add(r, s, '', 'packet');
      var cs = boxes.map(function (b) { return { x: b.offsetLeft + b.offsetWidth / 2, y: b.offsetTop + 1.5 }; });
      gsap.set(pk, { x: cs[0].x, y: cs[0].y, opacity: 0 });
      var loop = gsap.timeline({ repeat: -1, repeatDelay: 0.9, delay: 3.1 });
      loop.set(pk, { x: cs[0].x, y: cs[0].y, backgroundColor: '#F5D623', boxShadow: '0 0 26px 10px rgba(245,214,35,.55)', opacity: 1, scale: 1 });
      for (var i = 1; i < cs.length; i++) {
        loop.to(pk, { x: cs[i].x, duration: 0.55, ease: 'power1.inOut' });
        loop.fromTo(boxes[i], { boxShadow: '0 0 0 rgba(34,211,238,0)' }, { boxShadow: '0 0 44px rgba(34,211,238,.55)', duration: 0.16, yoyo: true, repeat: 1 }, '<0.45');
      }
      loop.to(pk, { backgroundColor: '#4ade80', boxShadow: '0 0 26px 10px rgba(74,222,128,.55)', scale: 1.3, duration: 0.2 });
      loop.to(pk, { x: cs[0].x, scale: 1, duration: 1.1, ease: 'power2.inOut' });
      loop.fromTo(boxes[0], { boxShadow: '0 0 0 rgba(74,222,128,0)' }, { boxShadow: '0 0 44px rgba(74,222,128,.6)', duration: 0.18, yoyo: true, repeat: 1 });
      loop.to(pk, { opacity: 0, duration: 0.25 }, '<');
      r.loops.push(loop);
    },
    words: function (s, r, tl) {
      var grid = kids(s).filter(function (el) { return el.tagName === 'DIV'; })[0], cards = kids(grid);
      head(r, tl, q('h2', s), 0.2);
      cards.forEach(function (c, i) {
        var t = 0.6 + i * 0.12;
        tl.fromTo(c, { rotationY: -180, opacity: 0, transformPerspective: 900 }, { rotationY: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.4)' }, t);
        scr(r, tl, kids(c)[1], t + 0.6, 'abcdefghijklmnopqrstuvwxyz', 0.8);
      });
      r.loops.push(gsap.timeline({ repeat: -1, repeatDelay: 4, delay: 4 }).to(cards, { rotationY: 360, transformPerspective: 900, duration: 0.9, ease: 'power2.inOut', stagger: 0.35 }).set(cards, { rotationY: 0 }));
    },
    rules: function (s, r, tl) {
      var h = q('h2', s), items = kids(kids(s).filter(function (el) { return el.tagName === 'DIV'; })[0]);
      var fl = add(r, s, '', 'flash');
      r.html.push({ el: h, html: h.innerHTML });
      h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i).map(function (part) { return '<span class="ln" style="display:block">' + part + '</span>'; }).join('');
      var lines = qa('.ln', h);
      lines.forEach(function (ln, i) {
        var t = 0.5 + i * 0.8;
        tl.fromTo(ln, { scale: 2.3, opacity: 0, filter: 'blur(16px)', transformOrigin: '0% 50%' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.42, ease: 'expo.in' }, t);
        shake(tl, s, t + 0.42);
        tl.fromTo(fl, { opacity: 0.9 }, { opacity: 0, duration: 0.6 }, t + 0.42);
      });
      var after = 0.5 + lines.length * 0.8 + 0.1;
      qa('.hlt', h).forEach(function (el) { tl.to(el, { backgroundSize: '100% 6px', duration: 0.5, ease: 'power2.inOut' }, after); });
      tl.from(items, { scale: 0, rotation: -12, opacity: 0, duration: 0.5, stagger: 0.15, ease: 'back.out(3)' }, after + 0.2);
      r.loops.push(gsap.to(qa('.hlt', h), { textShadow: '0 0 34px rgba(245,214,35,.8)', duration: 1.1, yoyo: true, repeat: -1, delay: after + 1 }));
    },
    finale: function (s, r, tl) {
      var left = kids(s)[0], fig = kids(s)[1], rowsTop = kids(kids(left)[2]), count = kids(left)[3], see = kids(left)[4];
      var cw = null; try { cw = fig.contentWindow; } catch (e) {}
      head(r, tl, q('h2', s), 0.2);
      tl.from(fig, { y: 140, opacity: 0, duration: 1.1, ease: 'power3.out' }, 0.15);
      tl.fromTo(rowsTop, { opacity: 0, x: -40 }, { opacity: 0.3, x: 0, stagger: 0.08, duration: 0.4 }, 0.8);
      tl.from(count, { scale: 0, opacity: 0, transformOrigin: '0% 50%', duration: 0.5, ease: 'back.out(3)' }, 1.2);
      tl.from(see, { opacity: 0, duration: 0.5 }, 1.6);
      tl.call(function () { try { if (cw && cw.rocketReplay) cw.rocketReplay(); } catch (e) {} }, null, 0.25);
      var txt0 = count.textContent;
      r.cleanup.push(function () { count.textContent = txt0; rowsTop.forEach(function (row) { row.removeAttribute('data-on'); }); });
      var stack = rowsTop.slice().reverse();
      r.loops.push(gsap.to({}, { duration: 1, repeat: -1, onUpdate: function () {
        var T = null, c = null;
        try { T = cw && cw.ROCKET_T; c = cw && cw.rocketClock ? cw.rocketClock() : null; } catch (e) {}
        if (!T || c == null) return;
        stack.forEach(function (row, i) {
          var on = c >= T.DROP + i * T.EACH + T.FALL - 0.1 && c < T.LOOP - 1.2;
          if (on === row.hasAttribute('data-on')) return;
          if (on) { row.setAttribute('data-on', ''); gsap.fromTo(row, { x: -16 }, { x: 0, duration: 0.4, ease: 'back.out(3)' }); } else row.removeAttribute('data-on');
        });
        var t = c < T.IGNITE - 3 ? 'STACKING' : c < T.IGNITE ? 'T–' + Math.ceil(T.IGNITE - c) : c < T.LIFT ? 'IGNITION' : 'LIFTOFF!';
        if (count.textContent !== t) { count.textContent = t; gsap.fromTo(count, { scale: 1.3 }, { scale: 1, duration: 0.35, ease: 'back.out(3)', transformOrigin: '0% 50%' }); }
      } }));
    },
    weekend: function (s, r, tl) {
      var divs = kids(s).filter(function (el) { return el.tagName === 'DIV'; }), cards = kids(divs[0]), note = kids(s).filter(function (el) { return el.tagName === 'P' && el.style.position !== 'absolute'; }).pop();
      head(r, tl, q('h2', s), 0.2);
      tl.from(cards[0], { x: -260, rotationY: 32, transformPerspective: 1200, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.6);
      tl.from(cards[1], { x: 260, rotationY: -32, transformPerspective: 1200, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.75);
      var gold = [];
      cards.forEach(function (c, ci) {
        kids(c).filter(function (el) { return el.tagName === 'DIV'; }).forEach(function (row, i) {
          var t = 1.3 + ci * 0.15 + i * 0.16;
          scr(r, tl, kids(row)[0], t, '0123456789:', 0.8);
          tl.from(kids(row)[1], { x: 30, opacity: 0, duration: 0.4 }, t + 0.2);
          if (kids(row)[1].style.color.indexOf('245, 214, 35') > -1 || kids(row)[1].style.color.toLowerCase() === '#f5d623') gold.push(kids(row)[1]);
        });
      });
      tl.from(note, { opacity: 0, duration: 0.5 }, 2.6);
      r.loops.push(gsap.to(gold, { textShadow: '0 0 22px rgba(245,214,35,.9)', duration: 0.9, yoyo: true, repeat: -1, delay: 3 }));
    },
    close: function (s, r, tl) {
      var left = kids(s)[0], card = kids(s)[1], stepsEl = kids(kids(left)[2]), img = q('img', card);
      head(r, tl, q('h2', s), 0.2);
      stepsEl.forEach(function (st, i) { var t = 1.1 + i * 0.35; scr(r, tl, kids(st)[0], t, '0123456789', 0.5); tl.from(kids(st)[1], { x: 50, opacity: 0, duration: 0.5, ease: 'power3.out' }, t); });
      card.style.position = 'relative';
      tl.from(card, { rotationY: 95, transformPerspective: 1200, opacity: 0, duration: 1, ease: 'back.out(1.4)' }, 0.6);
      var sl = add(r, card, '', 'scanline');
      gsap.set(sl, { left: img.offsetLeft, width: img.offsetWidth, top: img.offsetTop, opacity: 0 });
      r.loops.push(gsap.fromTo(sl, { y: 0, opacity: 0.9 }, { y: img.offsetHeight - 4, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.7 }));
      var cx = card.offsetLeft + card.offsetWidth / 2, cy = card.offsetTop + card.offsetHeight / 2;
      tl.call(function () {
        for (var i = 0; i < 80; i++) {
          var c = document.createElement('div'); c.className = 'confetti'; c.style.background = CONF[i % CONF.length]; s.appendChild(c); r.added.push(c);
          var up = rnd(180, 520), dx = rnd(-760, 520), d = rnd(1.4, 2.4);
          gsap.set(c, { x: cx, y: cy, rotation: rnd(0, 360) });
          gsap.to(c, { x: cx + dx, rotation: '+=' + rnd(-900, 900), duration: d, ease: 'power1.out' });
          gsap.to(c, { y: cy - up, duration: d * 0.4, ease: 'power2.out' });
          gsap.to(c, { y: cy - up + rnd(600, 900), duration: d * 0.6, delay: d * 0.4, ease: 'power2.in' });
          gsap.to(c, { opacity: 0, duration: 0.4, delay: d - 0.4 });
        }
      }, null, 2.4);
    },
    steps: function (s, r, tl) {
      var grid = kids(s).filter(function (el) { return el.tagName === 'DIV'; })[0], panels = kids(grid);
      head(r, tl, q('h2', s), 0.2);
      panels.forEach(function (p, i) {
        var t = 0.6 + i * 0.5;
        tl.from(p, { rotationX: -90, transformOrigin: '50% 0%', transformPerspective: 1200, opacity: 0, duration: 0.7, ease: 'back.out(1.6)' }, t);
        scr(r, tl, kids(kids(p)[0])[0], t + 0.2, '0123456789', 0.6);
        tl.from(kids(p)[1], { x: 60, opacity: 0, duration: 0.5, ease: 'power3.out' }, t + 0.35);
      });
      // 1–2: the prompt types itself
      var sp = split(r, kids(kids(panels[0])[1])[1], 'chars');
      if (sp) tl.from(sp.chars, { opacity: 0, duration: 0.01, stagger: 0.018 }, 1.0);
      // 3–4: Approve waits for us
      var ap = kids(kids(kids(panels[1])[1])[2])[0];
      r.loops.push(gsap.to(ap, { boxShadow: '0 0 26px rgba(245,214,35,.85)', duration: 0.7, yoyo: true, repeat: -1, delay: 2.4 }));
      // 5–6: hands up, stamp
      var m3 = kids(panels[2])[1], stamp = kids(kids(m3)[0])[1], tiles = kids(kids(m3)[1]), t3 = 2.2;
      tl.from(tiles, { scale: 0, opacity: 0, duration: 0.28, stagger: 0.1, ease: 'back.out(3)' }, t3);
      tl.fromTo(stamp, { scale: 3, rotation: -24, opacity: 0 }, { scale: 1, rotation: -6, opacity: 1, duration: 0.3, ease: 'power4.in' }, t3 + 0.75);
      shake(tl, panels[2], t3 + 1.05);
      // 7–8: code lands, page reloads, the rocket flies
      var m4 = kids(panels[3])[1], bk = kids(kids(m4)[1]), rel = bk[1], emo = bk[2], t4 = 3.3;
      tl.from(qa('p', kids(m4)[0]).slice(1), { x: -20, opacity: 0, duration: 0.3, stagger: 0.15 }, t4 - 0.6);
      tl.from(rel, { rotation: -360, opacity: 0, duration: 0.6, ease: 'power2.out' }, t4 - 0.2);
      var ex = emo.offsetLeft + emo.offsetWidth / 2, ey = emo.offsetTop;
      tl.to(emo, { y: -30, opacity: 0, duration: 0.25 }, t4 + 0.3);
      launchRocket(r, tl, s, ex, ey - 60, ex + 80, -320, t4 + 0.3, 1.3);
      tl.to(emo, { y: 0, opacity: 1, duration: 0.4 }, t4 + 2.2);
    },
    stops: function (s, r, tl) {
      var divs = kids(s).filter(function (el) { return el.tagName === 'DIV'; }), cards = kids(divs[0]), bar = divs[1];
      head(r, tl, q('h2', s), 0.2);
      cards.forEach(function (c, i) {
        var t = 0.6 + i * 0.4;
        tl.from(c, { y: 140, opacity: 0, rotation: [-7, -2, 2, 7][i], duration: 0.7, ease: 'back.out(1.8)' }, t);
        scr(r, tl, kids(c)[0], t + 0.15, null, 0.6);
        tl.from(kids(c)[2], { scale: 0.6, opacity: 0, duration: 0.45, ease: 'back.out(2.5)' }, t + 0.35);
      });
      tl.from(bar, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.6, ease: 'power3.inOut' }, 2.4);
      tl.from(kids(bar), { opacity: 0, y: 10, duration: 0.35, stagger: 0.1 }, 2.8);
      // one order runs the whole trip: click, order, cook, serve, then back to the page
      var pk = add(r, s, '', 'packet'), btn = kids(kids(cards[0])[2])[1], pick = kids(kids(cards[2])[2])[1];
      var cs = cards.map(function (c) { return { x: c.offsetLeft + c.offsetWidth / 2, y: c.offsetTop + 1.5 }; });
      gsap.set(pk, { x: cs[0].x, y: cs[0].y, opacity: 0 });
      var loop = gsap.timeline({ repeat: -1, repeatDelay: 1, delay: 3 });
      loop.fromTo(btn, { scale: 1 }, { scale: 0.88, duration: 0.12, yoyo: true, repeat: 1 });
      loop.set(pk, { x: cs[0].x, y: cs[0].y, backgroundColor: '#F5D623', boxShadow: '0 0 26px 10px rgba(245,214,35,.55)', opacity: 1, scale: 1 });
      for (var i = 1; i < cs.length; i++) {
        loop.to(pk, { x: cs[i].x, duration: 0.6, ease: 'power1.inOut' });
        loop.fromTo(cards[i], { boxShadow: '0 0 0 rgba(34,211,238,0)' }, { boxShadow: '0 0 44px rgba(34,211,238,.5)', duration: 0.18, yoyo: true, repeat: 1 }, '<0.45');
        if (i === 2) loop.fromTo(pick, { scale: 1 }, { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1 }, '<');
      }
      loop.to(pk, { backgroundColor: '#4ade80', boxShadow: '0 0 26px 10px rgba(74,222,128,.55)', scale: 1.3, duration: 0.2 });
      loop.to(pk, { x: cs[0].x, scale: 1, duration: 1.2, ease: 'power2.inOut' });
      loop.fromTo(cards[0], { boxShadow: '0 0 0 rgba(74,222,128,0)' }, { boxShadow: '0 0 44px rgba(74,222,128,.6)', duration: 0.18, yoyo: true, repeat: 1 });
      loop.to(pk, { opacity: 0, duration: 0.25 }, '<');
      r.loops.push(loop);
    },
    levelup: function (s, r, tl) {
      var divs = kids(s).filter(function (el) { return el.tagName === 'DIV'; }), pill = kids(divs[0])[1], cards = kids(divs[1]), bar = divs[2];
      var COL = ['#22d3ee', '#C4943D', '#4ade80'];
      head(r, tl, q('h2', s), 0.2);
      tl.from(pill, { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(3)' }, 0.5);
      cards.forEach(function (c, i) {
        var t = 0.7 + i * 0.35, ks = kids(c), tryBox = ks[ks.length - 2], res = ks[ks.length - 1];
        tl.from(c, { y: 260, rotationX: -40, transformPerspective: 1200, opacity: 0, duration: 0.9, ease: 'back.out(1.5)' }, t);
        scr(r, tl, ks[0], t + 0.2, null, 0.7);
        tl.call(function () { for (var k = 0; k < 12; k++) sparks(r, s, c.offsetLeft + rnd(30, c.offsetWidth - 30), c.offsetTop, COL[i]); }, null, t + 0.7);
        tl.fromTo(kids(tryBox)[1], { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'steps(24)' }, t + 1.0);
        tl.from(res, { x: 40, opacity: 0, duration: 0.5 }, t + 1.5);
      });
      tl.from(bar, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.6, ease: 'power3.inOut' }, 2.9);
      tl.from(kids(bar), { opacity: 0, y: 10, duration: 0.35, stagger: 0.1 }, 3.3);
      var resBoxes = cards.map(function (c) { var ks = kids(c); return ks[ks.length - 1]; });
      r.loops.push(gsap.timeline({ repeat: -1, repeatDelay: 1.5, delay: 3.8 }).to(resBoxes, { boxShadow: '0 0 30px rgba(245,214,35,.5)', duration: 0.4, yoyo: true, repeat: 1, stagger: 0.5 }));
    }
  };

  function enter(id) {
    if (!window.gsap || RM) return;
    reset(id);
    var s = document.getElementById(id); if (!s || !ENTER[id]) return;
    var r = REC[id] = { tl: null, splits: [], added: [], loops: [], html: [], cleanup: [] };
    var tl = r.tl = gsap.timeline();
    eyebrow(r, tl, s); footer(r, tl, s);
    try { ENTER[id](s, r, tl); } catch (e) { if (window.console) console.warn('motion', id, e); }
  }

  /* ---------- scroll mode ---------- */
  var seen = {};
  var io = new IntersectionObserver(function (es) {
    if (present) return;
    es.forEach(function (e) {
      var id = e.target.dataset.id, r = REC[id];
      if (r) r.loops.forEach(function (l) { e.isIntersecting ? l.resume() : l.pause(); });
      if (e.isIntersecting && e.intersectionRatio >= 0.5) {
        cur = +e.target.dataset.i; setCount();
        if (!seen[id]) { seen[id] = 1; track('deck_slide_view', { slide: id, index: cur + 1 }); enter(id); }
      }
    });
  }, { threshold: [0, 0.5] });

  addEventListener('scroll', function () { if (present) return; var h = document.documentElement; prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%'; }, { passive: true });
  function go(i) { i = Math.max(0, Math.min(n - 1, i)); stages[i].scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); }

  /* ---------- present mode ---------- */
  var TR = ['warp', 'push', 'iris', 'push', 'iris', 'push', 'warp', 'iris', 'push', 'warp'];
  function show(i, dir) {
    if (busy || i === cur || i < 0 || i >= n) return;
    var a = stages[cur], b = stages[i], type = (!window.gsap || RM) ? 'cut' : TR[i % TR.length];
    cur = i; setCount(); track('deck_slide_view', { slide: b.dataset.id, index: i + 1, mode: 'present' });
    if (type === 'cut') { a.classList.remove('cur'); b.classList.add('cur'); return; }
    busy = true; b.classList.add('vis'); enter(b.dataset.id);
    var tl = gsap.timeline({ onComplete: function () {
      a.classList.remove('cur', 'vis'); b.classList.remove('vis'); b.classList.add('cur');
      gsap.set([a, b], { clearProps: 'transform,opacity,filter,clipPath,zIndex' }); reset(a.dataset.id); busy = false;
    } });
    if (type === 'warp') {
      warpBurst(1.1);
      tl.to(a, { scale: 0.55, opacity: 0, filter: 'blur(10px)', duration: 0.55, ease: 'power3.in' }, 0)
        .fromTo(b, { scale: 1.7, opacity: 0, filter: 'blur(18px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.85, ease: 'expo.out' }, 0.35);
    } else if (type === 'push') {
      tl.to(a, { xPercent: -70 * dir, rotationY: 40 * dir, opacity: 0, duration: 0.75, ease: 'power3.inOut' }, 0)
        .fromTo(b, { xPercent: 70 * dir, rotationY: -40 * dir, opacity: 0 }, { xPercent: 0, rotationY: 0, opacity: 1, duration: 0.75, ease: 'power3.inOut' }, 0.06);
    } else {
      gsap.set(b, { zIndex: 2 });
      tl.fromTo(b, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 0.8, ease: 'power3.inOut' }, 0)
        .to(a, { scale: 0.88, opacity: 0.25, duration: 0.8, ease: 'power2.inOut' }, 0);
    }
  }
  function enterPresent() {
    if (present) return; present = true; track('deck_present');
    document.body.classList.add('present');
    stages.forEach(function (st) { st.classList.remove('cur', 'vis'); });
    stages[cur].classList.add('cur'); fit(); setCount();
    var el = document.documentElement;
    if (el.requestFullscreen) { el.requestFullscreen().then(function () { wasFs = true; }).catch(function () {}); }
    if (!RM) drawStars();
    enter(stages[cur].dataset.id);
  }
  function exitPresent() {
    if (!present) return; present = false; wasFs = false;
    document.body.classList.remove('present');
    stages.forEach(function (st) { st.classList.remove('cur', 'vis'); if (window.gsap) gsap.set(st, { clearProps: 'transform,opacity,filter,clipPath,zIndex' }); });
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    fit(); stages[cur].scrollIntoView({ block: 'start' });
  }
  document.addEventListener('fullscreenchange', function () { if (!document.fullscreenElement && wasFs && present) exitPresent(); });
  var pb = q('#presentBtn'); if (pb) pb.addEventListener('click', enterPresent);
  var pe = q('#pexit'); if (pe) pe.addEventListener('click', exitPresent);
  q('main').addEventListener('click', function (e) {
    if (!present || e.target.closest('a,button,video')) return;
    show(cur + (e.clientX < innerWidth * 0.25 ? -1 : 1), e.clientX < innerWidth * 0.25 ? -1 : 1);
  });
  var tx = null;
  addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', function (e) { if (!present || tx == null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); tx = null; }, { passive: true });

  /* ---------- keys and the film ---------- */
  addEventListener('keydown', function (e) {
    if (q('#vid').classList.contains('on')) { if (e.key === 'Escape') closeVid(); return; }
    var fwd = ['ArrowRight', 'ArrowDown', 'PageDown', ' '].indexOf(e.key) > -1, back = ['ArrowLeft', 'ArrowUp', 'PageUp'].indexOf(e.key) > -1;
    if (e.key === 'p' || e.key === 'P') { e.preventDefault(); present ? exitPresent() : enterPresent(); return; }
    if (present) {
      if (e.key === 'Escape') { exitPresent(); return; }
      if (fwd) { e.preventDefault(); show(cur + 1, 1); } if (back) { e.preventDefault(); show(cur - 1, -1); }
      if (e.key === 'Home') { e.preventDefault(); show(0, -1); } if (e.key === 'End') { e.preventDefault(); show(n - 1, 1); }
      return;
    }
    if (fwd) { e.preventDefault(); go(cur + 1); } if (back) { e.preventDefault(); go(cur - 1); }
    if (e.key === 'Home') { e.preventDefault(); go(0); } if (e.key === 'End') { e.preventDefault(); go(n - 1); }
  });
  window.openVid = function () { track('deck_film_play'); q('#vid').classList.add('on'); var v = q('#v'); v.play && v.play().catch(function () {}); };
  window.closeVid = function () { var v = q('#v'); v.pause(); q('#vid').classList.remove('on'); };
  document.addEventListener('click', function (e) { var a = e.target.closest('[data-track]'); if (a) track('deck_event_click', { from: a.closest('.stage') ? 'slide' : 'bar' }); });

  /* ---------- start ---------- */
  function start() {
    if (window.gsap) {
      if (window.SplitText) gsap.registerPlugin(SplitText);
      if (window.ScrambleTextPlugin) gsap.registerPlugin(ScrambleTextPlugin);
    }
    qa('section.sl h1 span, section.sl h2 span').forEach(function (sp) {
      var c = (sp.style.color || '').toLowerCase();
      if (c.indexOf('245, 214, 35') > -1 || c.indexOf('34, 211, 238') > -1 || c === '#f5d623' || c === '#22d3ee') sp.classList.add('hlt');
    });
    fit(); addEventListener('resize', fit);
    stages.forEach(function (s) { io.observe(s); });
    if (/[?&]present\b/.test(location.search)) enterPresent();
  }
  function boot() { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
