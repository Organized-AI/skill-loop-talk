// One request's trip through the Space Fact Machine, hop by hop: the browser, door 5173 (Vite),
// door 8000 (FastAPI) and the six checked facts. Built with Anatomy's kit (MIT, wheresryan22/anatomy,
// see ../LICENSE) for talk.organizedai.vip/NASA.
// usage: node trip.mjs --out=../../../public/NASA/fig-trip.html
// The page reads ?hop=1..4 (which hop to play) and ?t=<seconds> (freeze at that moment, for stills).
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import { kitScript } from "../scripts/inline-kit.mjs";
import { parts, CSS, DEFS, FONT_LINK } from "./lab-parts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = (process.argv.find((v) => v.startsWith("--out=")) || "").slice(6) || join(HERE, "trip.html");

const WIDTH = 1000;
const HEIGHT = 640;
const HEADROOM = 120;
const PLINTH = { x: -250, y: -62, w: 500, d: 142 };

const P = k.fitProjection(
  [...k.boxCorners(PLINTH, -8, 0), [-230, 4, 86], [100, -50, 76]],
  WIDTH,
  HEIGHT,
  { pad: 20, headroom: HEADROOM, azimuth: 62 },
);
const X = parts(P);
const f2 = (v) => Math.round(v * 100) / 100;

const mon = X.monitor({ x: -230, y: 10 });
const vite = X.house({ x: -100, y: -50, door: "5173", tone: "cyan" });
const api = X.house({ x: 26, y: -50, door: "8000", tone: "amber", chimney: true });
const deck = X.cards({ x: 130, y: -44 });

const TRACK = 48;
const W = {
  btn: [mon.button[0], mon.button[1] + 3, mon.button[2]],
  screenFoot: [mon.button[0], TRACK, 0],
  v: [vite.door[0], vite.door[1] + 2, 0],
  vFront: [vite.door[0], TRACK, 0],
  a: [api.door[0], api.door[1] + 2, 0],
  aFront: [api.door[0], TRACK, 0],
  aOut: [api.door[0], api.door[1] + 18, 0],
};
const scr = (p) => X.at(p);
const PATHS = {
  1: [W.btn, W.screenFoot, W.vFront, W.v].map(scr),
  2: [W.v, W.vFront, W.aFront, W.a].map(scr),
  4: [W.aOut, W.aFront, W.vFront, [W.v[0], W.v[1] + 6, 0], W.vFront, W.screenFoot, W.btn].map(scr),
};
const card = deck.list[1];
const lift = k.axisVector(P, [0, 0, 1]);
const DATA = {
  origin: scr([0, 0, 0]),
  paths: PATHS,
  btn: scr(W.btn),
  aOut: scr(W.aOut),
  a: scr(W.a),
  card: scr(card.center),
  doorA: scr([api.door[0], api.door[1] + 1, 14]),
  chimney: scr(api.chimney),
  up: lift,
};

const puffs = Array.from({ length: 5 }, (_, i) => `<circle class="puff" data-puff="${i}" cx="${DATA.chimney[0]}" cy="${DATA.chimney[1]}" r="4" style="opacity:0" filter="url(#lp-soft)"/>`).join("");
const cursor = `<g class="cursor" data-el="cursor" style="opacity:0"><path d="M0 0L0 26L7 19.5L12 31L17 29L12 17.5L21 17.5Z"/></g>`;

const body = [
  DEFS,
  X.plinth(PLINTH, 8, "localhost · this computer"),
  X.L(k.lineOnTop([-200, TRACK], [200, TRACK], 0, P), { tone: "lo", dashed: true }),
  mon.svg,
  vite.svg,
  api.svg,
  deck.svg,
  puffs,
  X.label("browser", [mon.button[0], 4, mon.top + 2], { dy: -54, key: "BROWSER", value: "you click here", color: "#F5D623" }),
  X.label("v", vite.top, { dy: -78, key: "DOOR 5173", value: "Vite", color: "#22d3ee" }),
  X.label("a", [api.top[0], api.top[1], api.top[2] + 18], { dy: -60, key: "DOOR 8000", value: "FastAPI", color: "#C4943D" }),
  X.label("facts", [card.center[0] + 8, card.center[1] + 8, 2], { dx: 40, dy: -92, key: "6 FACTS", value: "checked list", color: "#4ade80" }),
  X.packet("req"),
  X.packet("res"),
  X.tag("req", "GET /api/fact", "#F5D623"),
  X.tag("proxy", "/api → door 8000", "#22d3ee"),
  X.tag("res", "200 OK · JSON", "#4ade80"),
  cursor,
].join("");

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "One computer, labelled localhost. On it: a monitor showing the Space Fact Machine page with a Launch! button, a building with door 5173 (Vite), a building with door 8000 (FastAPI) and six fact cards. A yellow request travels from the button to door 5173, on to door 8000, a fact card is picked and packed, and a green response travels back to the screen, which shows the fact and its source.",
  body,
});

const live = `
const D = ${JSON.stringify(DATA)};
const qs = new URLSearchParams(location.search);
const HOP = Math.min(4, Math.max(1, +(qs.get("hop") || 1)));
const FREEZE = qs.has("t") ? +qs.get("t") : null;
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const $ = (s) => svg.querySelector(s);
const $$ = (s) => [...svg.querySelectorAll(s)];
const pk = { req: $('[data-pk="req"]'), res: $('[data-pk="res"]') };
const tg = { req: $('[data-tag="req"]'), proxy: $('[data-tag="proxy"]'), res: $('[data-tag="res"]') };
const door = { v: $('[data-door="5173"]'), a: $('[data-door="8000"]') };
const fact = $('[data-el="fact"]'), flash = $('[data-el="btnflash"]'), cur = $('[data-el="cursor"]');
const cards = $$("[data-card]"), hls = $$("[data-cardhl]"), puffs = $$("[data-puff]");
const ACTIVE = { 1: ["browser", "v"], 2: ["v", "a"], 3: ["a", "facts"], 4: ["browser", "v", "a"] }[HOP];
$$("[data-lbl]").forEach((el) => { el.style.opacity = ACTIVE.indexOf(el.dataset.lbl) < 0 ? 0.32 : 1; });
const LOOP = { 1: 5, 2: 4.6, 3: 5.6, 4: 5.8 }[HOP];
const clamp = (v) => Math.min(1, Math.max(0, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const io = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
const pulse = (t, a, b) => { const u = seg(t, a, b); return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI); };
function along(pts, u) {
  const lens = []; let total = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); total += l; }
  let d = u * total;
  for (let i = 0; i < lens.length; i++) { if (d <= lens[i] || i === lens.length - 1) { const f = lens[i] ? Math.min(1, d / lens[i]) : 1; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; } d -= lens[i]; }
  return pts[pts.length - 1];
}
function place(el, p, o, s) { el.setAttribute("transform", "translate(" + (p[0] - D.origin[0]).toFixed(1) + " " + (p[1] - D.origin[1]).toFixed(1) + ")" + (s != null && s !== 1 ? " translate(" + D.origin[0] + " " + D.origin[1] + ") scale(" + s.toFixed(3) + ") translate(" + -D.origin[0] + " " + -D.origin[1] + ")" : "")); el.style.opacity = o.toFixed(3); }
function tagAt(el, p, o) { el.setAttribute("transform", "translate(" + p[0].toFixed(1) + " " + (p[1] - 40).toFixed(1) + ")"); el.style.opacity = o.toFixed(3); }
function hide() { Object.values(pk).forEach((e) => (e.style.opacity = 0)); Object.values(tg).forEach((e) => (e.style.opacity = 0)); door.v.style.opacity = 0; door.a.style.opacity = 0; flash.style.opacity = 0; cur.style.opacity = 0; fact.style.opacity = 0; hls.forEach((e) => (e.style.opacity = 0)); cards.forEach((e) => { e.removeAttribute("transform"); e.style.opacity = 1; }); puffs.forEach((e) => (e.style.opacity = 0)); }
function smoke(t, a, b) {
  puffs.forEach((el, i) => {
    const s = ((t - a) / 1.6 + i / puffs.length) % 1;
    if (t < a || t > b) { el.style.opacity = 0; return; }
    el.setAttribute("cx", (D.chimney[0] + s * 10).toFixed(1));
    el.setAttribute("cy", (D.chimney[1] - s * 46).toFixed(1));
    el.setAttribute("r", (3 + s * 7).toFixed(1));
    el.style.opacity = (Math.sin(s * Math.PI) * 0.5).toFixed(3);
  });
}
const POSE = {
  1(t) {
    const from = [D.btn[0] + 90, D.btn[1] + 70], to = [D.btn[0] + 4, D.btn[1] + 2];
    const m = io(seg(t, 0.1, 0.9));
    cur.setAttribute("transform", "translate(" + (from[0] + (to[0] - from[0]) * m).toFixed(1) + " " + (from[1] + (to[1] - from[1]) * m).toFixed(1) + ") scale(" + (t > 0.9 && t < 1.1 ? 0.84 : 1) + ")");
    cur.style.opacity = (seg(t, 0.05, 0.3) * (1 - seg(t, 1.8, 2.1))).toFixed(3);
    flash.style.opacity = pulse(t, 0.9, 1.4).toFixed(3);
    const u = io(seg(t, 1.2, 3.3));
    const p = along(D.paths[1], u);
    const o = seg(t, 1.0, 1.2) * (1 - seg(t, 3.2, 3.45));
    place(pk.req, p, o, 0.4 + 0.6 * seg(t, 1.0, 1.25));
    tagAt(tg.req, p, seg(t, 1.1, 1.35) * (1 - seg(t, 3.2, 3.5)));
    door.v.style.opacity = (pulse(t, 3.2, 4.4) * 0.85).toFixed(3);
  },
  2(t) {
    door.v.style.opacity = (pulse(t, -0.5, 0.6) * 0.85).toFixed(3);
    const u = io(seg(t, 0.35, 2.6));
    const p = along(D.paths[2], u);
    place(pk.req, p, seg(t, 0.1, 0.35) * (1 - seg(t, 2.5, 2.75)));
    tagAt(tg.proxy, p, seg(t, 0.25, 0.5) * (1 - seg(t, 2.5, 2.8)));
    door.a.style.opacity = (pulse(t, 2.55, 3.8) * 0.85).toFixed(3);
  },
  3(t) {
    door.a.style.opacity = (0.25 + 0.6 * (1 - seg(t, 0, 0.5))).toFixed(3) * (1 - seg(t, 4.8, 5.4));
    smoke(t, 0.2, 4.6);
    const pick = 1;
    hls.forEach((el, i) => {
      let on = 0;
      if (t > 0.4 && t < 1.9) on = Math.floor((t - 0.4) / 0.13) % 6 === i ? 1 : 0;
      if (t >= 1.9 && i === pick) on = 1 - seg(t, 3.0, 3.3);
      el.style.opacity = on;
    });
    const c = cards[pick];
    const up = io(seg(t, 1.9, 2.5)) * 30, fly = io(seg(t, 2.55, 3.25));
    const dx = (D.doorA[0] - D.card[0]) * fly, dy = (D.doorA[1] - D.card[1]) * fly;
    c.setAttribute("transform", "translate(" + (D.up[0] * up * (1 - fly) + dx).toFixed(1) + " " + (D.up[1] * up * (1 - fly) + dy).toFixed(1) + ")");
    c.style.opacity = (1 - seg(t, 3.05, 3.3)).toFixed(3);
    const o = seg(t, 3.25, 3.45) * (1 - seg(t, 5.2, 5.5));
    const p = [D.a[0] + (D.aOut[0] - D.a[0]) * io(seg(t, 3.3, 3.9)), D.a[1] + (D.aOut[1] - D.a[1]) * io(seg(t, 3.3, 3.9))];
    place(pk.res, p, o, 0.3 + 0.7 * seg(t, 3.25, 3.6));
    tagAt(tg.res, p, seg(t, 3.4, 3.65) * (1 - seg(t, 5.2, 5.5)));
  },
  4(t) {
    const u = io(seg(t, 0.2, 3.5));
    const p = along(D.paths[4], u);
    place(pk.res, p, seg(t, 0, 0.2) * (1 - seg(t, 3.45, 3.7)));
    tagAt(tg.res, p, seg(t, 0, 0.25) * (1 - seg(t, 3.4, 3.7)));
    door.v.style.opacity = (pulse(t, 1.35, 2.2) * 0.85).toFixed(3);
    flash.style.opacity = pulse(t, 3.4, 3.9).toFixed(3);
    fact.style.opacity = (FREEZE != null ? 1 : seg(t, 3.45, 3.85) * (1 - seg(t, 5.4, 5.75))).toFixed(3);
  },
};
let clock = 0, last = 0, frame = 0, visible = false;
function draw(t) { hide(); POSE[HOP](t); }
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
  last = now;
  clock = (clock + dt) % LOOP;
  draw(clock);
  frame = visible ? requestAnimationFrame(tick) : 0;
}
function run() { if (FREEZE == null && !frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } }
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "80px 0px" }).observe(stage);
stage.addEventListener("click", () => { clock = 0; run(); });
addEventListener("keydown", (event) => {
  if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "p", "P", "Escape"].indexOf(event.key) < 0) return;
  try { if (window.parent !== window) { event.preventDefault(); window.parent.dispatchEvent(new KeyboardEvent("keydown", { key: event.key })); } } catch (e) {}
});
window.tripReplay = () => { clock = 0; run(); };
draw(FREEZE != null ? FREEZE : still.matches ? { 1: 2.2, 2: 1.6, 3: 2.3, 4: 3.6 }[HOP] : 0);
`;

const page = FONT_LINK + CSS + `<div class="iso-stage" tabindex="0" role="group" aria-label="One request's trip through the Space Fact Machine. Select it to replay.">${svg}</div>`;
writeFileSync(OUT, k.pageHtml({ title: "One request, hop by hop", theme: "dark", body: page, script: kitScript() + live, width: WIDTH }));
console.log("wrote", OUT);
