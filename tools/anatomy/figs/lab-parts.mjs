// Shared isometric parts for the Build Lab walkthrough figures (talk.organizedai.vip/NASA).
// Built with Anatomy's kit (MIT, wheresryan22/anatomy, see ../LICENSE).
import * as k from "../kit/iso-kit.mjs";

export const FONT_LINK = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&display=swap">';

export const CSS = `<style>
.iso{--anatomy-page:transparent;--anatomy-paper:#15130f;--anatomy-face:#1d1a15;--anatomy-top:#201c16;--anatomy-shade-0:#0f0d0a;--anatomy-shade-1:#13110d;--anatomy-shade-2:#171410;--anatomy-shade-3:#1b1813;--anatomy-lit-top:#2b261c;--anatomy-lit-shade:#1f1b14;--anatomy-hi:#ece5d6;--anatomy-mid:#8c826f;--anatomy-lo:#5a5143;--anatomy-faint:#3a342b;--anatomy-lit:#F5D623;--anatomy-halo:#030302;--anatomy-dot:#f0ece4}
html,body{background:transparent!important;overflow:hidden}
.iso-page{width:100%!important;margin:0!important}
.iso-stage svg{display:block;width:100%;height:auto;overflow:visible}
.ft{font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-weight:600;letter-spacing:.02em}
.fb{font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-weight:800;letter-spacing:.02em}
.tx-hi{fill:#f0ece4}.tx-mid{fill:#a09888}.tx-lo{fill:#6a604f}.tx-cyan{fill:#22d3ee}.tx-amber{fill:#C4943D}.tx-green{fill:#4ade80}.tx-yellow{fill:#F5D623}.tx-dark{fill:#0c0b09}
.rf-glass{fill:#0a0907;stroke:#3a342b;stroke-width:.5px}
.rf-door{fill:#0d0b08;stroke:#5a5143;stroke-width:.6px}
.rf-plate{fill:#0d0b08;stroke:#5a5143;stroke-width:.5px}
.rf-btn{fill:#F5D623}
.rf-chip{fill:none;stroke:#4ade80;stroke-width:.6px}
.rf-paper{fill:#1b1813;stroke:#5a5143;stroke-width:.5px}
.rf-field{fill:#0d0b08;stroke:#3a342b;stroke-width:.5px}
.gl-cyan{fill:#22d3ee}.gl-amber{fill:#C4943D}.gl-green{fill:#4ade80}.gl-yellow{fill:#F5D623}
.st-cyan{stroke:#22d3ee}.st-amber{stroke:#C4943D}.st-green{stroke:#4ade80}.st-yellow{stroke:#F5D623}
.pk-req .iso-top{fill:#fff3a6}.pk-req .iso-shade[data-shade="0"],.pk-req .iso-shade[data-shade="1"]{fill:#b89f10}.pk-req .iso-shade[data-shade="2"],.pk-req .iso-shade[data-shade="3"]{fill:#F5D623}.pk-req .iso-fill{fill:#F5D623}.pk-req .iso-edge{stroke:#fff8cc}
.pk-res .iso-top{fill:#c9ffdc}.pk-res .iso-shade[data-shade="0"],.pk-res .iso-shade[data-shade="1"]{fill:#2a9a55}.pk-res .iso-shade[data-shade="2"],.pk-res .iso-shade[data-shade="3"]{fill:#4ade80}.pk-res .iso-fill{fill:#4ade80}.pk-res .iso-edge{stroke:#d8ffe6}
.lit-green .iso-top{fill:#1f3a29}.lit-green .iso-edge{stroke:#4ade80}
.halo-y{fill:#F5D623;opacity:.55}.halo-g{fill:#4ade80;opacity:.55}
.lbl-k{font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:800;letter-spacing:.12em}
.lbl-v{font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:600;fill:#a09888}
.lead{fill:none;stroke-width:1px;stroke-dasharray:2 4;opacity:.8}
.tag rect{fill:#0c0b09;stroke-width:1.4px}
.tag text{font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:800;letter-spacing:.04em}
.puff{fill:#d9d1c1}
.cursor path{fill:#f0ece4;stroke:#0c0b09;stroke-width:1.4px;stroke-linejoin:round}
[data-lbl]{transition:opacity .4s}
</style>`;

const f2 = (v) => Math.round(v * 100) / 100;

export function parts(P) {
  const at = (p) => k.iso(p, P).map(f2);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const slab = (plan, z, h, o = {}) => S(k.slabOf({ r: 0, ...plan }, z, h, P, o.steps || 4, o.bevel || 0), o);
  const front = (y, inner, extra = "") => `<g transform="${k.sideMatrix([0, y], 0, P, "left")}"${extra}>${inner}</g>`;
  const side = (x, inner, extra = "") => `<g transform="${k.sideMatrix([x, 0], 0, P, "right")}"${extra}>${inner}</g>`;
  const topf = (z, inner, extra = "") => `<g transform="${k.topMatrix([0, 0], z, P)}"${extra}>${inner}</g>`;
  const halo = (plan, z, h) => `<path class="iso-halo" d="${k.haloOf({ r: 0, ...plan }, z, h, P)}"/>`;

  /* a low plinth everything stands on */
  function plinth(plan, h = 8, label) {
    const out = [halo(plan, -h, h), slab(plan, -h, h, { tone: "mid", bevel: 1.2, steps: 8 })];
    out.push(L(k.planOutline(k.insetPlan({ r: 0, ...plan }, 5), 0, P), { tone: "faint" }));
    if (label) out.push(topf(0, `<text class="ft tx-lo" x="${plan.x + 10}" y="${plan.y + plan.d - 9}" font-size="6.5">${label}</text>`));
    return out.join("");
  }

  /* a monitor showing the Space Fact Machine page */
  function monitor({ x, y, w = 96, h = 66, z0 = 20, d = 6, fact = false, ids = true }) {
    const cx = x + w / 2;
    const out = [];
    out.push(slab({ x: cx - 24, y: y - d - 16, w: 48, d: 26, r: 3 }, 0, 3, { tone: "lo", bevel: 0.6, steps: 6 }));
    out.push(slab({ x: cx - 4, y: y - d - 6, w: 8, d: 5, r: 1 }, 3, z0 - 1, { tone: "lo" }));
    out.push(slab({ x, y: y - d, w, d, r: 2 }, z0, h, { tone: "mid", bevel: 0.8 }));
    const top = z0 + h;
    const bx = cx - 20, bz = z0 + 18;
    const face = [
      `<rect class="rf-glass" x="${x + 4}" y="${-(top - 4)}" width="${w - 8}" height="${h - 8}" rx="1.6"/>`,
      `<text class="fb tx-hi" x="${cx}" y="${-(top - 14)}" font-size="5.6" text-anchor="middle">SPACE FACT MACHINE</text>`,
      `<rect class="rf-btn" x="${bx}" y="${-(bz + 11)}" width="40" height="11" rx="2"/>`,
      `<text class="fb tx-dark" x="${cx}" y="${-(bz + 3.4)}" font-size="6" text-anchor="middle">Launch!</text>`,
      ids ? `<rect data-el="btnflash" x="${bx - 2}" y="${-(bz + 13)}" width="44" height="15" rx="3" fill="none" stroke="#fff8cc" stroke-width="1.6" style="opacity:0"/>` : "",
      `<g data-el="fact" style="opacity:${fact ? 1 : 0}">`,
      `<text class="ft tx-hi" x="${cx}" y="${-(top - 26)}" font-size="5" text-anchor="middle">Mars has two small moons,</text>`,
      `<text class="ft tx-hi" x="${cx}" y="${-(top - 33)}" font-size="5" text-anchor="middle">Phobos and Deimos.</text>`,
      `<rect class="rf-chip" x="${cx - 18}" y="${-(top - 36.5)}" width="36" height="7.5" rx="3.7"/>`,
      `<text class="ft tx-green" x="${cx}" y="${-(top - 42)}" font-size="4.2" text-anchor="middle">Source: NASA</text>`,
      `</g>`,
    ].join("");
    out.push(front(y + 0.05, face));
    return { svg: out.join(""), button: [cx, y + 1, bz + 5], top };
  }

  /* a small building: a program listening behind a numbered door */
  function house({ x, y, w = 74, d = 64, h = 58, door, tone, chimney = false, ids = true }) {
    const cx = x + w / 2, fy = y + d;
    const out = [halo({ x, y, w, d }, 0, h)];
    out.push(slab({ x, y, w, d, r: 2 }, 0, h, { tone: "hi", bevel: 1 }));
    if (chimney) out.push(slab({ x: x + w - 22, y: y + 8, w: 12, d: 12 }, h, 18, { tone: "mid", bevel: 0.6 }));
    out.push(L(k.planOutline(k.insetPlan({ x, y, w, d, r: 2 }, 4), h, P), { tone: "faint" }));
    const dw = 26, dh = 38;
    out.push(front(fy + 0.05, [
      `<rect class="rf-door" x="${cx - dw / 2}" y="${-dh}" width="${dw}" height="${dh}" rx="1"/>`,
      ids ? `<rect data-door="${door}" class="gl-${tone}" x="${cx - dw / 2}" y="${-dh}" width="${dw}" height="${dh}" rx="1" style="opacity:0"/>` : "",
      `<circle cx="${cx + dw / 2 - 5}" cy="${-dh / 2}" r="1.3" class="gl-${tone}"/>`,
      `<rect class="rf-plate" x="${cx - 19}" y="${-(dh + 15)}" width="38" height="12" rx="1"/>`,
      `<text class="fb tx-${tone}" x="${cx}" y="${-(dh + 6)}" font-size="8.4" text-anchor="middle">${door}</text>`,
    ].join("")));
    out.push(side(x + w + 0.05, [0, 1, 2, 3].map((i) => `<rect x="${-(y + d - 12 - i * 13)}" y="${-(h - 14)}" width="7" height="2" fill="#5a5143"/>`).join("")));
    return { svg: out.join(""), door: [cx, fy, 0], top: [cx, y + d / 2, h], chimney: chimney ? [x + w - 16, y + 14, h + 18] : null };
  }

  /* fact cards lying on the plinth, two rows of three */
  function cards({ x, y, ids = true }) {
    const out = [];
    const list = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const i = row * 3 + col;
        const plan = { x: x + col * 30, y: y + row * 24, w: 25, d: 18, r: 1 };
        const lines = [16, 12, 18].map((len, j) => k.lineOnTop([plan.x + 4, plan.y + 5 + j * 4], [plan.x + 4 + len, plan.y + 5 + j * 4], 1.8, P)).join("");
        const inner = S(k.slabOf(plan, 0, 1.8, P, 3), { tone: "mid", crease: "none" }) + L(lines, { tone: "lo", free: true });
        list.push({ i, plan, center: [plan.x + plan.w / 2, plan.y + plan.d / 2, 1] });
        out.push(ids ? `<g data-card="${i}">${inner}<path data-cardhl="${i}" d="${k.planOutline(plan, 1.8, P)}" fill="none" stroke="#4ade80" stroke-width="1.6" style="opacity:0"/></g>` : inner);
      }
    }
    return { svg: out.join(""), list };
  }

  /* a glowing cube that carries a request (yellow) or a response (green) */
  function packet(kind) {
    const s = 9;
    const cube = S(k.slabOf({ x: -s / 2, y: -s / 2, w: s, d: s, r: 0.8 }, 0, s, P, 3, 0.6), { tone: "hi", className: kind === "req" ? "pk-req" : "pk-res" });
    const c = at([0, 0, s / 2]);
    return `<g data-pk="${kind}" style="opacity:0"><circle class="${kind === "req" ? "halo-y" : "halo-g"}" cx="${c[0]}" cy="${c[1]}" r="16" filter="url(#lp-blur)"/>${cube}</g>`;
  }

  /* a label floating above a part, with a dotted leader down to it */
  function label(id, anchor, { dx = 0, dy = -70, key, value, color, size = 15 }) {
    const [ax, ay] = at(anchor);
    const lx = f2(ax + dx), ly = f2(ay + dy);
    return `<g data-lbl="${id}"><path class="lead" stroke="${color}" d="M${ax} ${ay - 4}L${lx} ${ly + 8}"/><text class="lbl-k" x="${lx}" y="${ly - size * 0.15}" fill="${color}" font-size="${size}" text-anchor="middle">${key}</text>${value ? `<text class="lbl-v" x="${lx}" y="${ly - size * 1.25}" font-size="${size * 0.8}" text-anchor="middle">${value}</text>` : ""}</g>`;
  }

  /* a pill-shaped tag that rides along with a packet */
  function tag(id, text, color, size = 15) {
    const w = f2(text.length * size * 0.62 + 22), h = f2(size * 1.9);
    return `<g class="tag" data-tag="${id}" style="opacity:0"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" stroke="${color}"/><text x="0" y="${f2(size * 0.36)}" font-size="${size}" fill="${color}" text-anchor="middle">${text}</text></g>`;
  }

  return { at, S, L, slab, front, side, topf, halo, plinth, monitor, house, cards, packet, label, tag };
}

export const DEFS = `<defs><filter id="lp-blur" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6"/></filter><filter id="lp-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>`;
