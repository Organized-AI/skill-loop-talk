// A rocket built stage by stage on its pad, then launched. Built with Anatomy's kit
// (MIT, wheresryan22/anatomy, see ../LICENSE) for talk.organizedai.vip/NASA.
// usage: node rocket.mjs --out=../../../public/NASA/fig-rocket.html
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";
import { kitScript } from "../scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = (process.argv.find((v) => v.startsWith("--out=")) || "").slice(6) || join(HERE, "rocket.html");

const WIDTH = 560;
const HEIGHT = 820;
const HEADROOM = 200;

const PAD = { x: -96, y: -96, w: 192, d: 192, r: 10 };
const PAD_H = 12;
const FOOT_H = 5;
const TOWER = { x: -82, y: -12, w: 24, d: 24 };
const TOWER_TOP = 300;
const ROCKET_TIP = 300;
const R_TANK = 22;
const BASE = 37;

const P = k.fitProjection(
  [...k.boxCorners(PAD, -PAD_H - FOOT_H, 0), [TOWER.x, TOWER.y, TOWER_TOP + 32], [TOWER.x + TOWER.w, TOWER.y + TOWER.d, TOWER_TOP + 32], [0, 0, ROCKET_TIP]],
  WIDTH,
  HEIGHT,
  { pad: 26, headroom: HEADROOM, azimuth: 45 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const F = G.frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const depth = (p) => k.depthOf(p, P);
const f2 = (v) => Math.round(v * 100) / 100;
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/* ---------- pad ---------- */
function pad() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PAD, -PAD_H - FOOT_H, PAD_H, P)}"/>`];
  for (const [x, y] of k.corners(PAD, 20).sort((a, b) => depth([...a, 0]) - depth([...b, 0]))) {
    out.push(S(k.cylinder(x, y, 7, -PAD_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PAD_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PAD, -PAD_H, PAD_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PAD, 5), 0, P), { tone: "lo" }));
  const trench = { x: -16, y: -60, w: 32, d: 120, r: 3 };
  out.push(S(k.slabOf(trench, -0.01, 0.02, P, 4), { tone: "lo", flat: true }));
  out.push(L(k.planOutline(k.insetPlan(trench, 3), 0, P, 4), { tone: "faint" }));
  out.push(L(Array.from({ length: 9 }, (_, i) => k.lineOnTop([trench.x + 4, trench.y + 12 + i * 12], [trench.x + trench.w - 4, trench.y + 12 + i * 12], 0, P)).join(""), { tone: "faint" }));
  const ticks = k.topTicks(-80, 80, 5, 5, 84, 0, [2.2, 4], P, "x");
  out.push(L(k.lineOnTop([-80, 84], [80, 84], 0, P), { tone: "lo" }), L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  const screws = k.corners(PAD, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const label = { x: 40, y: 60, w: 42, d: 12, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(L([30, 22, 26].map((w, i) => k.lineOnTop([label.x + 4, label.y + 3 + i * 3], [label.x + 4 + w, label.y + 3 + i * 3], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([label.x + label.w - 3, label.y + label.d / 2, 0.8])], { size: 0.45 }));
  return out.join("");
}

/* hold-down posts the skirt rests on */
const POSTS = [45, 135, 225, 315].map((deg) => { const a = (deg * Math.PI) / 180; return [Math.cos(a) * 25, Math.sin(a) * 25]; });
const rocketDepth = depth([0, 0, 20]);
function post([x, y]) {
  return [
    S(k.cylinder(x, y, 5, 0, 1.4, P, 24), { tone: "lo" }),
    S(k.cylinder(x, y, 3.2, 1.4, BASE - 4.4, P, 24), { tone: "mid" }),
    S(k.cylinder(x, y, 4.4, BASE - 3, 3, P, 24, 0.4), { tone: "mid" }),
  ].join("");
}
const backPosts = POSTS.filter(([x, y]) => depth([x, y, 20]) < rocketDepth).sort((a, b) => depth([...a, 0]) - depth([...b, 0]));
const frontPosts = POSTS.filter(([x, y]) => depth([x, y, 20]) >= rocketDepth).sort((a, b) => depth([...a, 0]) - depth([...b, 0]));

/* ---------- tower ---------- */
function tower() {
  const out = [];
  const foot = { x: TOWER.x - 5, y: TOWER.y - 5, w: TOWER.w + 10, d: TOWER.d + 10, r: 2 };
  out.push(`<path class="iso-halo" d="${k.haloOf(foot, 0, 3, P)}"/>`);
  out.push(S(k.slabOf(foot, 0, 3, P, 3, 0.4), { tone: "lo" }));
  out.push(D(k.corners(foot, 2.4).map(([x, y]) => at([x, y, 3])), { size: 0.45 }));
  const cs = [[TOWER.x, TOWER.y], [TOWER.x + TOWER.w, TOWER.y], [TOWER.x + TOWER.w, TOWER.y + TOWER.d], [TOWER.x, TOWER.y + TOWER.d]];
  const postOf = ([x, y]) => S(k.slabOf({ x: x - 1.4, y: y - 1.4, w: 2.8, d: 2.8, r: 0.3 }, 3, TOWER_TOP - 3, P, 2), { tone: "mid" });
  const sorted = [...cs].sort((a, b) => depth([...a, 0]) - depth([...b, 0]));
  out.push(postOf(sorted[0]));
  const items = [];
  for (let z = 30; z <= TOWER_TOP; z += 30) {
    items.push({ d: depth([TOWER.x + TOWER.w / 2, TOWER.y, z]), svg: S(k.slabOf({ x: TOWER.x, y: TOWER.y - 1, w: TOWER.w, d: 2, r: 0.2 }, z - 2.4, 2.4, P, 2), { tone: "lo" }) });
    items.push({ d: depth([TOWER.x, TOWER.y + TOWER.d / 2, z]), svg: S(k.slabOf({ x: TOWER.x - 1, y: TOWER.y, w: 2, d: TOWER.d, r: 0.2 }, z - 2.4, 2.4, P, 2), { tone: "lo" }) });
  }
  items.sort((a, b) => a.d - b.d).forEach((it) => out.push(it.svg));
  out.push(postOf(sorted[1]), postOf(sorted[2]));
  const fx = TOWER.x + TOWER.w + 1.4;
  const fy = TOWER.y + TOWER.d + 1.4;
  const braces = [];
  for (let z = 0; z < TOWER_TOP - 10; z += 30) {
    const z0 = Math.max(3, z);
    const z1 = z + 30 - 2.4;
    braces.push(k.segment([fx, TOWER.y, z0], [fx, TOWER.y + TOWER.d, z1], P), k.segment([TOWER.x, fy, z1], [TOWER.x + TOWER.w, fy, z0], P));
  }
  out.push(L(braces.join(""), { tone: "lo" }));
  for (let z = 30; z <= TOWER_TOP; z += 30) {
    items.length = 0;
    out.push(S(k.slabOf({ x: TOWER.x + TOWER.w - 1, y: TOWER.y, w: 2, d: TOWER.d, r: 0.2 }, z - 2.4, 2.4, P, 2), { tone: "lo" }));
    out.push(S(k.slabOf({ x: TOWER.x, y: TOWER.y + TOWER.d - 1, w: TOWER.w, d: 2, r: 0.2 }, z - 2.4, 2.4, P, 2), { tone: "lo" }));
  }
  out.push(postOf(sorted[3]));
  const cx = TOWER.x + TOWER.w / 2;
  const cy = TOWER.y + TOWER.d / 2;
  out.push(S(k.slabOf({ x: TOWER.x - 2, y: TOWER.y - 2, w: TOWER.w + 4, d: TOWER.d + 4, r: 1 }, TOWER_TOP, 3, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(cx, cy, 1.1, TOWER_TOP + 3, 26, P, 12), { tone: "mid" }));
  out.push(`<g class="rk-beacon">${D([at([cx, cy, TOWER_TOP + 30])], { size: 1.1, tone: "hi" })}</g>`);
  return out.join("");
}

/* umbilical arms from the tower's front face to the rocket */
function arms() {
  return [128, 210].map((z, i) => {
    const x0 = TOWER.x + TOWER.w + 1.4;
    const x1 = -(z > 182 ? 19 : R_TANK) + 0.6;
    const arm = S(k.slabOf({ x: x0, y: -2.2, w: x1 - x0, d: 4.4, r: 0.4 }, z, 4, P, 2, 0.4), { tone: "mid" });
    const clamp = S(k.slabOf({ x: x1 - 3, y: -3.4, w: 3, d: 6.8, r: 0.6 }, z - 1.2, 6.4, P, 2), { tone: "lo" });
    const hose = L(k.segment([x0 + 2, 0, z - 0.2], [x1 - 3, 0, z - 0.2], P), { tone: "faint" });
    return `<g data-arm="${i}">${arm}${hose}${clamp}</g>`;
  }).join("");
}

/* ---------- rocket parts ---------- */
const FINS = [0, 90, 180, 270].map((deg) => {
  const a = (deg * Math.PI) / 180;
  const radial = [Math.cos(a), Math.sin(a), 0];
  const tangent = [-Math.sin(a), Math.cos(a), 0];
  const FF = G.frameOf([0, 0, 0], tangent, radial, [0, 0, 1]);
  const svg = S(G.prismOf(FF, [[R_TANK - 0.5, BASE - 2], [R_TANK + 21, BASE - 9], [R_TANK + 21, BASE + 7], [R_TANK - 0.5, BASE + 50]], -1.3, 1.3, P), { tone: "mid" });
  return { front: depth([radial[0] * 34, radial[1] * 34, 50]) > rocketDepth, svg, d: depth([radial[0] * 34, radial[1] * 34, 50]) };
});
const bell = () =>
  S(G.solidOf([[10, 13.5], [14, 12.4, 1], [22, 10, 1], [30, 8, 1], [BASE, 7.2]], F, P), { tone: "mid", inner: L(G.arcOf(F, 14, 12.4, P, { slope: -0.25 }), { tone: "faint" }) });
const skirt = () => S(G.solidOf([[BASE, 24], [50, R_TANK]], F, P), { tone: "mid", inner: L(G.arcOf(F, 44, 23, P, { slope: -0.15 }), { tone: "faint" }) });
function tank() {
  const seams = [76, 112, 148].map((s) => G.arcOf(F, s, R_TANK, P)).join("");
  const ribs = G.ribsOf(F, 50.6, 169.4, R_TANK, 24, P, { phase: 0.13, fade: [0.04, 0.45] });
  return S(G.disc(50, 170, R_TANK, F, P), { tone: "hi", inner: k.fadedSvg(ribs, { tone: "faint" }) + L(seams, { tone: "lo" }) });
}
function interstage() {
  const dots = [172.4, 179.6].flatMap((s) => G.dotsOf(F, s, R_TANK + 0.4, 36, P, { fade: [0.04, 0.42] }));
  return S(G.disc(170, 182, R_TANK + 0.4, F, P), { tone: "lo" }) + D(dots, { size: 0.42, tone: "mid" });
}
function upper() {
  const seam = G.arcOf(F, 208, 19, P);
  return S(G.disc(182, 238, 19, F, P), { tone: "hi", inner: L(seam, { tone: "lo" }) }) + `<g class="rk-band">${L(G.arcOf(F, 232, 19, P), { tone: "lit" })}</g>`;
}
function fairing() {
  const xs = [0, 0.12, 0.25, 0.38, 0.5, 0.62, 0.72, 0.81, 0.88, 0.94, 0.98];
  const prof = xs.map((x, i) => [238 + 62 * x, 19 * Math.pow(1 - x * x, 0.62), i > 0 ? 1 : 0].slice(0, i > 0 ? 3 : 2));
  prof.push([ROCKET_TIP, 0]);
  return S(G.solidOf(prof, F, P), { tone: "hi", inner: L(G.arcOf(F, 256, 19 * Math.pow(1 - (18 / 62) ** 2, 0.62), P, { slope: -0.2 }), { tone: "faint" }) });
}
const flameF = G.frameOf([0, 0, 10], [0, 0, -1], [1, 0, 0], [0, 1, 0]);
const flamePath = (scale) => G.solidOf([[0, 12 * scale], [8, 14 * scale, 1], [24, 12 * scale, 1], [44, 8 * scale, 1], [62, 3 * scale, 1], [72, 0]], flameF, P).fill;
const flame = `<g data-part="flame" style="opacity:0"><path class="rk-f0" d="${flamePath(1.25)}" filter="url(#rk-blur6)"/><path class="rk-f1" d="${flamePath(1)}" filter="url(#rk-blur2)"/><path class="rk-f2" d="${flamePath(0.55)}"/></g>`;
const glow = `<path data-part="glow" class="rk-glow" d="${k.ring(0, 0, 46, 0.2, P, 48)}" filter="url(#rk-blur10)" style="opacity:0"/>`;

/* smoke puffs on the pad, split behind and in front of the rocket */
const PUFFS = Array.from({ length: 26 }, (_, i) => {
  const a = (i / 26) * Math.PI * 2 + rand() * 0.2;
  const r0 = 16 + rand() * 10;
  const base = [Math.cos(a) * r0, Math.sin(a) * r0, 4 + rand() * 6];
  const far = [Math.cos(a) * (70 + rand() * 30), Math.sin(a) * (70 + rand() * 30), 10 + rand() * 26];
  return { a: at(base).map(f2), b: at(far).map(f2), r0: f2(6 + rand() * 6), r1: f2(26 + rand() * 22), delay: f2(rand() * 0.5), front: depth(base) > rocketDepth };
});
const puffSvg = (front) => `<g class="rk-smoke" filter="url(#rk-blur4)">${PUFFS.map((p, i) => (p.front === front ? `<circle data-puff="${i}" cx="${p.a[0]}" cy="${p.a[1]}" r="0" style="opacity:0"/>` : "")).join("")}</g>`;

/* joints flash as each stage lands */
const FLASH = [50, 170, 182, 238].map((s, i) => `<g data-flash="${i}" style="opacity:0">${L(G.arcOf(F, s, R_TANK + 1.2, P, { least: -1 }), { tone: "lit" })}</g>`).join("");

const defs = `<defs><filter id="rk-blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter><filter id="rk-blur4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2"/></filter><filter id="rk-blur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter><filter id="rk-blur10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter></defs>`;
const part = (i, inner) => `<g data-p="${i}">${inner}</g>`;
const body = [
  defs,
  pad(),
  glow,
  puffSvg(false),
  ...backPosts.map(post),
  tower(),
  arms(),
  part(0, FINS.filter((f) => !f.front).sort((a, b) => a.d - b.d).map((f) => f.svg).join("")),
  part(0, flame),
  part(0, bell()),
  ...frontPosts.map(post),
  part(0, skirt()),
  part(1, tank()),
  part(0, FINS.filter((f) => f.front).sort((a, b) => a.d - b.d).map((f) => f.svg).join("")),
  part(2, interstage()),
  part(3, upper()),
  part(4, fairing()),
  FLASH,
  puffSvg(true),
];
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "A launch pad with a lattice service tower. A rocket is stacked on it stage by stage: the engine section with its fins, the booster tank, the interstage, the upper stage and the nose cone. The arms swing back, the engine lights, smoke rolls across the pad and the rocket climbs away.",
  body,
});

const DATA = { P, up: k.axisVector(P, [0, 0, 1]), left: k.axisVector(P, [-1, 0, 0]), exit: at([0, 0, 10]).map(f2), puffs: PUFFS, flashAt: [0, 1, 2, 3] };
const live = `
const D = ${JSON.stringify(DATA)};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const parts = [...svg.querySelectorAll("[data-p]")];
const arms = [...svg.querySelectorAll("[data-arm]")];
const flame = svg.querySelector('[data-part="flame"]');
const glow = svg.querySelector('[data-part="glow"]');
const puffs = [...svg.querySelectorAll("[data-puff]")];
const flashes = [...svg.querySelectorAll("[data-flash]")];
const beacon = svg.querySelector(".rk-beacon");
const DROP = 0.3, EACH = 0.9, FALL = 0.8, ARMS = 5.2, IGNITE = 6.0, LIFT = 7.0, LOOP = 11.4, HIGH = 430, ACC = 150;
const clamp = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
function landing(t) { if (t <= 0) return 1; if (t >= 1) return 0; const u = 1 - t; return Math.pow(u, 3) - 0.035 * Math.sin(t * Math.PI) * (t > 0.7 ? 1 : 0); }
let clock = 0, last = 0, frame = 0, visible = false;
function pose(t) {
  const launch = t > LIFT ? 0.5 * ACC * (t - LIFT) * (t - LIFT) : 0;
  const shake = t > IGNITE && t < LIFT + 0.6 ? (Math.sin(t * 91) + Math.sin(t * 57)) * 0.35 : 0;
  const gone = launch > HIGH + 100;
  parts.forEach((el) => {
    const i = +el.dataset.p;
    const t0 = DROP + i * EACH;
    const fall = HIGH * landing((t - t0) / FALL);
    const dz = fall + launch;
    el.setAttribute("transform", "translate(" + (D.up[0] * dz + shake).toFixed(2) + " " + (D.up[1] * dz).toFixed(2) + ")");
    el.style.opacity = t < t0 ? 0 : gone ? 0 : smooth(t0, t0 + FALL * 0.45, t).toFixed(3);
  });
  flashes.forEach((el, i) => { const tl = DROP + (i + 1) * EACH + FALL; const v = t > tl ? Math.max(0, 1 - (t - tl) / 0.5) : 0; el.style.opacity = v.toFixed(3); el.setAttribute("transform", "translate(0 " + (D.up[1] * launch).toFixed(2) + ")"); });
  const back = smooth(ARMS, ARMS + 0.6, t) * 26;
  arms.forEach((el) => el.setAttribute("transform", "translate(" + (D.left[0] * back).toFixed(2) + " " + (D.left[1] * back).toFixed(2) + ")"));
  const on = t > IGNITE ? smooth(IGNITE, IGNITE + 0.35, t) * (1 - smooth(LOOP - 1.6, LOOP - 1.2, t)) : 0;
  const lengthOf = Math.min(1, (10 + launch) / 72);
  const flick = 1 + Math.sin(t * 47) * 0.05 + Math.sin(t * 29) * 0.04;
  const sy = Math.max(0.14, lengthOf) * flick * (0.4 + 0.6 * on);
  const sx = (0.85 + 0.15 * on) * (1 + Math.sin(t * 33) * 0.03);
  const ex = D.exit[0], ey = D.exit[1];
  flame.setAttribute("transform", "translate(" + ex + " " + ey + ") scale(" + sx.toFixed(3) + " " + sy.toFixed(3) + ") translate(" + -ex + " " + -ey + ")");
  flame.style.opacity = on.toFixed(3);
  glow.style.opacity = (on * Math.max(0, 1 - launch / 160) * (0.75 + 0.25 * flick)).toFixed(3);
  puffs.forEach((el) => {
    const p = D.puffs[+el.dataset.puff];
    const s = t - IGNITE - p.delay;
    if (s <= 0 || t > LOOP - 0.2) { el.style.opacity = 0; return; }
    const g = 1 - Math.exp(-s / 1.6);
    el.setAttribute("cx", (p.a[0] + (p.b[0] - p.a[0]) * g).toFixed(1));
    el.setAttribute("cy", (p.a[1] + (p.b[1] - p.a[1]) * g).toFixed(1));
    el.setAttribute("r", (p.r0 + (p.r1 - p.r0) * g).toFixed(1));
    el.style.opacity = (Math.min(1, s / 0.3) * Math.max(0, 1 - s / 4.6) * 0.42).toFixed(3);
  });
  if (beacon) beacon.style.opacity = t % 1 < 0.5 ? 1 : 0.25;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
  last = now;
  clock = (clock + dt) % LOOP;
  pose(clock);
  frame = visible ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } }
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "80px 0px" }).observe(stage);
stage.addEventListener("click", () => { clock = clock < ARMS ? ARMS - 0.4 : 0; run(); });
addEventListener("keydown", (event) => {
  if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].indexOf(event.key) < 0) return;
  try { if (window.parent !== window) { event.preventDefault(); window.parent.dispatchEvent(new KeyboardEvent("keydown", { key: event.key })); } } catch (e) {}
});
window.rocketReplay = () => { clock = 0; run(); };
window.rocketClock = () => clock;
window.ROCKET_T = { DROP, EACH, FALL, ARMS, IGNITE, LIFT, LOOP };
pose(still.matches ? 5.9 : 0);
`;

const css = `<style>
.iso{--anatomy-page:transparent;--anatomy-paper:#15130f;--anatomy-face:#1d1a15;--anatomy-top:#201c16;--anatomy-shade-0:#0f0d0a;--anatomy-shade-1:#13110d;--anatomy-shade-2:#171410;--anatomy-shade-3:#1b1813;--anatomy-lit-top:#2b261c;--anatomy-lit-shade:#1f1b14;--anatomy-hi:#ece5d6;--anatomy-mid:#8c826f;--anatomy-lo:#5a5143;--anatomy-faint:#3a342b;--anatomy-lit:#F5D623;--anatomy-halo:#030302;--anatomy-dot:#f0ece4}
html,body{background:transparent!important;overflow:hidden}
.iso-page{width:100%!important;margin:0!important}
.iso-stage{cursor:pointer}
.iso-stage svg{display:block;width:100%;height:auto;-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 26%);mask-image:linear-gradient(to bottom,transparent 0,#000 26%)}
.rk-f0{fill:#C4943D;opacity:.75}
.rk-f1{fill:#F5D623}
.rk-f2{fill:#fff6d6}
.rk-glow{fill:#F5D623}
.rk-smoke circle{fill:#d9d1c1}
.rk-band .iso-line{stroke-width:1.2px}
</style>`;
const page = css + `<div class="iso-stage" tabindex="0" role="group" aria-label="A rocket is stacked on its launch pad and launched. Select it to replay the launch.">${svg}</div>`;
writeFileSync(OUT, k.pageHtml({ title: "Build and launch", theme: "dark", body: page, script: kitScript() + live, width: WIDTH }));
console.log("wrote", OUT);
