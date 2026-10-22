import "./style.css";

/*
  Cryogenic Feed Purification. Anatomy Explainer.
  Deterministic, frame-driven: render(frame) is a pure function of frame index.
  34 s x 30 fps = 1,020 frames, indexed 0-1019.
  Conceptual schematic. Not a design, simulation, or operating procedure.
  No dimensions, materials, settings, efficiencies, or vendor internals are asserted.
*/

const TOTAL = 1020;
const FPS = 30;
const W = 1280;
const H = 720;

const C = {
  stage: "#0B1019",
  steel: "#344257",
  steel2: "#46597A",
  steelDark: "#223047",
  ink: "#E8EEF7",
  muted: "#9FB0C9",
  faint: "#64769A",
  cyan: "#00E5FF",
  gold: "#FFD166",
  violet: "#9D4EDD",
  red: "#FF5D73",
  green: "#3DDC97",
  white: "#EAF6FF",
};

type Chapter = {
  start: number; end: number; num: string; title: string; short: string;
  body: string; note: string;
};

const CHAPTERS: Chapter[] = [
  {
    start: 0, end: 149, num: "01",
    title: "Reveal: two vessels stand between the feed and the cold",
    short: "Reveal the assembly",
    body: "Compressed feed air arrives from upstream equipment off frame. Before it can be cooled, it passes through adsorbent vessels. One vessel works while the other waits or regenerates. That pairing is the whole strategy: purification never has to stop for the bed to recover.",
    note: "Frames 0-149 · 0-5 s · Scale changed for legibility · Conceptual schematic",
  },
  {
    start: 150, end: 299, num: "02",
    title: "Remove: water and carbon dioxide stay behind",
    short: "Remove H2O + CO2",
    body: "Inside the active vessel, the adsorbent bed captures water and carbon dioxide from the passing feed. The bulk air moves on. The contaminants do not. Nothing is destroyed here. Mass is accounted for: what leaves in the purified stream plus what the bed retains equals what entered.",
    note: "Frames 150-299 · 5-10 s · Sectional close-up · Bed shown as layers, not a material specification",
  },
  {
    start: 300, end: 509, num: "03",
    title: "Track: purified feed earns its way to the cold box",
    short: "Track purified feed",
    body: "Follow the cyan path. Feed that has passed the bed travels to the cold box, where low-temperature separation equipment can operate without the two contaminants that would otherwise freeze out first. Control overlays in violet track state, not flow. Gold marks energy and actuation, not product.",
    note: "Frames 300-509 · 10-17 s · Primary causal path highlighted · Inputs, outputs, control kept distinct",
  },
  {
    start: 510, end: 749, num: "04",
    title: "Regenerate: the second vessel resets, conceptually",
    short: "Regeneration state",
    body: "A loaded bed cannot adsorb forever. In the separate regeneration state, a heated purge stream flows in reverse and carries desorbed water and carbon dioxide out to vent. The inset is qualitative. It shows the shape of capacity falling and recovering, not measured plant data. Recipes vary by adsorbent and cycle design, so none is given here.",
    note: "Frames 510-749 · 17-25 s · Time compressed · Inset is a mathematical diagram, not measured data",
  },
  {
    start: 750, end: 1019, num: "05",
    title: "Protect: the cold box never meets what it cannot handle",
    short: "Protect downstream",
    body: "Pull back. If water or carbon dioxide reached low-temperature equipment, they would be the first components to freeze and accumulate, restricting passages and forcing a shutdown to warm and clear. Upstream adsorption is therefore not polish. It is protection. Limits remain visible: adsorbents and cycles vary, and no total removal guarantee is made.",
    note: "Frames 750-1019 · 25-34 s · Stable overview · Losses, limits, and uncertainty retained",
  },
];

function chapterFor(f: number): Chapter {
  return CHAPTERS.find((c) => f >= c.start && f <= c.end) ?? CHAPTERS[CHAPTERS.length - 1];
}
function clamp(v: number, a = 0, b = 1) { return Math.min(b, Math.max(a, v)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function smooth(t: number) { const x = clamp(t); return x * x * (3 - 2 * x); }
function easeInOut(t: number) { const x = clamp(t); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
function seg(f: number, a: number, b: number) { return clamp((f - a) / (b - a)); }

// Deterministic PRNG so every frame renders identically on every machine.
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- Scene geometry (conceptual, not to scale) ---------------- */
const VESSEL_A = { x: 372, y: 188, w: 148, h: 330 };
const VESSEL_B = { x: 560, y: 188, w: 148, h: 330 };
const COLDBOX = { x: 918, y: 168, w: 268, h: 370 };
const INLET = { x: 58, y: 468 };
const OUTLET_Y = 238;

type Particle = { lane: number; off: number; speed: number; kind: "air" | "h2o" | "co2"; r: number; stickY: number; wob: number };
const rand = mulberry32(20261022);
const PARTICLES: Particle[] = Array.from({ length: 110 }, (_, i) => {
  const pick = rand();
  const kind: Particle["kind"] = pick < 0.68 ? "air" : pick < 0.85 ? "h2o" : "co2";
  return {
    lane: rand(), off: rand(), speed: 0.55 + rand() * 0.5, kind,
    r: kind === "air" ? 3.2 : 4.4,
    stickY: 0.18 + rand() * 0.52, wob: rand() * Math.PI * 2,
  };
});
void PARTICLES[0];

const app = document.getElementById("app")!;
app.innerHTML = `
<div class="wrap">
  <div class="topbar">
    <div class="brand"><span class="dot"></span><span><b>KINETIC GAIN</b> &nbsp;ANATOMY EXPLAINER SERIES</span></div>
    <div class="pill">Industrial Gases &amp; Cryogenics &nbsp;·&nbsp; <strong>34 s · 30 fps · 1,020 frames</strong></div>
  </div>

  <header class="hero">
    <p class="eyebrow">Cryogenic feed purification · Prepurification upstream of the cold box</p>
    <h1>Clean the air <span class="accent">before</span><br/>you <span class="gold">cool it.</span></h1>
    <p class="lede">Water and carbon dioxide are minor parts of feed air and major problems at low temperature. This explainer follows one mechanism end to end: <strong>adsorb them upstream, track the purified feed, regenerate the spare vessel, and keep the cold box out of trouble.</strong> Conceptual schematic throughout. No operating instructions, no invented performance claims.</p>
  </header>

  <section class="player" aria-label="Motion explainer player">
    <div class="stage-wrap"><canvas id="stage" width="${W}" height="${H}" aria-label="Animated schematic of adsorbent vessels upstream of a cryogenic cold box"></canvas></div>
    <div class="transport">
      <div class="transport-row">
        <button class="btn primary" id="playBtn" type="button">Pause</button>
        <button class="btn" id="restartBtn" type="button">Restart</button>
        <button class="btn" id="labelsBtn" type="button" aria-pressed="true">Labels on</button>
        <button class="btn" id="speedBtn" type="button">1× speed</button>
        <button class="btn gold" id="exportBtn" type="button">Export frame PNG</button>
        <div class="readout" aria-live="off">
          <span>FRAME <b id="frameOut">0</b> / 1019</span>
          <span>TIME <b id="timeOut">0.00 s</b> / 34.00 s</span>
          <span>CHAPTER <b id="chapOut">01</b> / 05</span>
        </div>
      </div>
      <input class="scrub" id="scrub" type="range" min="0" max="1019" step="1" value="0" aria-label="Scrub through all 1020 frames" />
      <div class="chapters" id="chapters"></div>
      <div class="progress" aria-hidden="true"><i id="progressBar"></i></div>
    </div>
  </section>

  <div class="caption" aria-live="polite">
    <div class="meta" id="capMeta"></div>
    <h2 id="capTitle"></h2>
    <p id="capBody"></p>
  </div>

  <div class="kpis">
    <div class="kpi"><b>1,020</b><span>Frames · indexed 0-1019 · deterministic render</span></div>
    <div class="kpi"><b>34 s</b><span>Duration at 30 fps · scrub to any frame</span></div>
    <div class="kpi"><b>2</b><span>Contaminants tracked · water + carbon dioxide</span></div>
    <div class="kpi"><b>0</b><span>Invented settings, dimensions, or efficiency claims</span></div>
  </div>

  <div class="grid">
    <article class="card">
      <h3>How to read the colours</h3>
      <div class="legend">
        <div class="legend-row"><span class="swatch" style="background:${C.cyan}"></span><span><strong style="color:var(--ink)">Cyan</strong> · primary transport or signal. Purified feed path, product direction.</span></div>
        <div class="legend-row"><span class="swatch" style="background:${C.gold}"></span><span><strong style="color:var(--ink)">Gold</strong> · energy or actuation. Heat input and purge energy during regeneration.</span></div>
        <div class="legend-row"><span class="swatch" style="background:${C.violet}"></span><span><strong style="color:var(--ink)">Violet</strong> · control or state. Valve state, cycle state, instrumentation overlays.</span></div>
        <div class="legend-row"><span class="swatch" style="background:${C.steel2}"></span><span><strong style="color:var(--ink)">Neutral steel</strong> · physically plausible structure. Vessels, piping, cold box enclosure.</span></div>
        <div class="legend-row"><span class="swatch" style="background:${C.white};border:1px solid #7aa"></span><span><strong style="color:var(--ink)">White droplets / rose markers</strong> · water and carbon dioxide tracers. Explanatory overlays, not literal emission.</span></div>
      </div>
      <div class="notice"><strong style="color:#FFD166">Technical limit.</strong> Adsorbents and cycles vary by design. This explainer gives no regeneration recipe and no total contaminant-removal guarantee. Graphs are qualitative unless labelled as measured, and nothing here is measured plant data.</div>
    </article>
    <article class="card">
      <h3>Mass accounting, kept visible</h3>
      <p>The animation never makes contaminants disappear. At every moment the accounting reads the same way:</p>
      <ul>
        <li><strong style="color:var(--ink)">During adsorption:</strong> feed in = purified feed out + contaminants retained on the bed.</li>
        <li><strong style="color:var(--ink)">During regeneration:</strong> retained contaminants leave with the purge stream to vent.</li>
        <li><strong style="color:var(--ink)">Across a full cycle:</strong> the bed returns close to its starting state. Capacity is borrowed and repaid, not created.</li>
      </ul>
      <p>That single discipline is what separates an explainer from a magic trick. If a stream is not drawn leaving, it is drawn staying.</p>
    </article>
  </div>

  <section class="section" id="product">
    <h2>The product, in ten lines</h2>
    <p>Required summary for every build in this series: what it is, who it serves, and how it earns its place after launch.</p>
    <div class="ten">
      <article><b>01 · What the product is</b><p>A frame-coded, browser-based anatomy explainer of cryogenic feed purification: 1,020 deterministic frames rendered from code, scrubbable to any instant, with a companion long-form article.</p></article>
      <article><b>02 · Who it is for</b><p>Plant engineers, technical buyers, students, and sales teams in industrial gases who need the prepurification mechanism understood correctly in under a minute.</p></article>
      <article><b>03 · Why it wins</b><p>It shows the mechanism instead of describing equipment. Twin vessels, one causal path, visible mass accounting, and stated limits. Nothing to install, nothing to misquote.</p></article>
      <article><b>04 · How it is structured</b><p>Five timed chapters mapped to fixed frame ranges: reveal, remove, track, regenerate, protect. Each chapter keeps inputs, outputs, and control overlays visually distinct.</p></article>
      <article><b>05 · How users discover it</b><p>Search and answer engines via semantic HTML, Article schema, descriptive metadata, and the companion article targeting feed purification and cold box protection intent.</p></article>
      <article><b>06 · How users engage</b><p>Play, pause, scrub to any frame, jump by chapter, toggle labels, change speed, and export any frame as a PNG for briefings and training decks.</p></article>
      <article><b>07 · How users convert</b><p>The page ends at one decision: talk to Kinetic Gain about a technical explainer for your own process. Event name <code>self_serve_cta_click</code> is the canonical conversion signal when analytics are connected.</p></article>
      <article><b>08 · How it makes money</b><p>As a portfolio asset and lead surface for paid explainer commissions, technical content retainers, and engineering communications work. The asset itself is free to view.</p></article>
      <article><b>09 · How it should launch</b><p>Static build on GitHub Pages, repository public with About and topics set, article published to Medium with the hero image, then one distribution post per channel with UTMs on external links only.</p></article>
      <article><b>10 · How it improves after launch</b><p>Add chapters only when a recurring question appears across properties, replace qualitative insets if real consented data becomes available, and keep the frame map stable so citations to frames stay valid.</p></article>
    </div>
  </section>

  <section class="section">
    <h2>Source and scope</h2>
    <p>Mechanism reference: Air Products, cryogenic air separation and on-site nitrogen generation (<a href="https://www.airproducts.com/supply-modes/gen-gas-on-site/onsite-nitrogen-generation/cryogenic-nitrogen-plant" target="_blank" rel="noopener">airproducts.com</a>). The reference supports the underlying process architecture: compression and purification upstream of low-temperature separation. Camera moves, palette, cutaways, and timing in this piece are original illustrative directions, not experimentally validated observations.</p>
    <p>This brief is not a certified design, simulation result, or claim about a specific commercial implementation. It contains no operational instructions for hazardous equipment. Scale is changed for legibility, regeneration is time-compressed, and particle motion is slowed relative to any real process. Each change is labelled on screen where it occurs.</p>
    <p style="margin-top:18px"><a class="btn gold" style="display:inline-block;text-decoration:none" href="https://kineticgain.com" target="_blank" rel="noopener" data-event="self_serve_cta_click">Commission an explainer for your process →</a></p>
  </section>

  <footer>
    Built as code, not video: every frame is rendered from <code>src/main.ts</code> as a pure function of its frame index, so frame citations are stable and reproducible. Repurposing note: the same five-chapter frame engine re-skins to any dual-bed or guard-bed process (dryers, hydrogen purification, biogas upgrading) by swapping the scene geometry and captions, not the timing system.<br/>
    © 2026 Kinetic Gain LLC · Anatomy Explainer Series · Conceptual schematic. Verify all process decisions against your own design basis and licensed engineering review.
  </footer>
</div>`;

const canvas = document.getElementById("stage") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
const scrub = document.getElementById("scrub") as HTMLInputElement;
const frameOut = document.getElementById("frameOut")!;
const timeOut = document.getElementById("timeOut")!;
const chapOut = document.getElementById("chapOut")!;
const capMeta = document.getElementById("capMeta")!;
const capTitle = document.getElementById("capTitle")!;
const capBody = document.getElementById("capBody")!;
const progressBar = document.getElementById("progressBar") as HTMLElement;
const chaptersEl = document.getElementById("chapters")!;

CHAPTERS.forEach((c) => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "chapter"; b.dataset.start = String(c.start);
  b.innerHTML = `<small>${c.num} · ${c.start}-${c.end}</small><span>${c.short}</span>`;
  b.addEventListener("click", () => { state.frame = c.start; state.playing = false; playBtn.textContent = "Play"; sync(); });
  chaptersEl.appendChild(b);
});
const chapterBtns = Array.from(chaptersEl.querySelectorAll(".chapter"));

const state = { frame: 0, playing: true, labels: true, speed: 1, last: performance.now(), acc: 0 };
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) { state.playing = false; playBtn.textContent = "Play"; }

playBtn.addEventListener("click", () => { state.playing = !state.playing; playBtn.textContent = state.playing ? "Pause" : "Play"; });
document.getElementById("restartBtn")!.addEventListener("click", () => { state.frame = 0; sync(); });
const labelsBtn = document.getElementById("labelsBtn") as HTMLButtonElement;
labelsBtn.addEventListener("click", () => {
  state.labels = !state.labels;
  labelsBtn.textContent = state.labels ? "Labels on" : "Labels off";
  labelsBtn.setAttribute("aria-pressed", String(state.labels)); sync();
});
const speedBtn = document.getElementById("speedBtn") as HTMLButtonElement;
speedBtn.addEventListener("click", () => {
  state.speed = state.speed === 1 ? 2 : state.speed === 2 ? 0.5 : 1;
  speedBtn.textContent = `${state.speed}× speed`; sync();
});
document.getElementById("exportBtn")!.addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = `cryo-feed-purification-frame-${String(Math.round(state.frame)).padStart(4, "0")}-Cursor.png`;
  a.href = canvas.toDataURL("image/png"); a.click();
});
scrub.addEventListener("input", () => { state.frame = Number(scrub.value); state.playing = false; playBtn.textContent = "Play"; sync(); });
window.addEventListener("keydown", (e) => {
  if ((e.target as HTMLElement)?.tagName === "INPUT") return;
  if (e.code === "Space") { e.preventDefault(); playBtn.click(); }
  if (e.code === "ArrowRight") { state.frame = clamp(state.frame + 1, 0, TOTAL - 1); sync(); }
  if (e.code === "ArrowLeft") { state.frame = clamp(state.frame - 1, 0, TOTAL - 1); sync(); }
});

/* ---------------- Drawing helpers ---------------- */
function rr(x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function line(x1: number, y1: number, x2: number, y2: number, color: string, w = 2, dash: number[] = []) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
function label(x: number, y: number, title: string, sub = "", color = C.cyan, align: CanvasTextAlign = "left") {
  if (!state.labels) return;
  ctx.save(); ctx.textAlign = align;
  ctx.font = "600 15px 'Space Grotesk', sans-serif"; ctx.fillStyle = C.ink; ctx.fillText(title, x, y);
  if (sub) { ctx.font = "12px 'JetBrains Mono', monospace"; ctx.fillStyle = C.muted; ctx.fillText(sub, x, y + 17); }
  ctx.fillStyle = color; ctx.fillRect(align === "right" ? x - 26 : x, y - 18, 18, 3);
  ctx.restore();
}
function pipePath(points: [number, number][], color: string, w = 10, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore();
}
function valve(x: number, y: number, open: number, tag: string) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = C.steelDark; ctx.strokeStyle = C.steel2; ctx.lineWidth = 1.5;
  rr(-13, -10, 26, 20, 4); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = C.violet; ctx.lineWidth = 2.5;
  const a = lerp(-0.7, 0.7, open);
  ctx.beginPath(); ctx.moveTo(Math.cos(a) * -8, Math.sin(a) * -8); ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 8); ctx.stroke();
  ctx.fillStyle = C.violet; ctx.beginPath(); ctx.arc(0, -16, 3.4, 0, Math.PI * 2); ctx.fill();
  if (state.labels) { ctx.font = "10px 'JetBrains Mono', monospace"; ctx.fillStyle = C.muted; ctx.textAlign = "center"; ctx.fillText(tag, 0, 26); }
  ctx.restore();
}
function drawVessel(v: typeof VESSEL_A, name: string, mode: "adsorb" | "standby" | "regen", f: number, loading: number) {
  ctx.save();
  // shell
  const grad = ctx.createLinearGradient(v.x, 0, v.x + v.w, 0);
  grad.addColorStop(0, "#2A3850"); grad.addColorStop(0.45, "#3D5173"); grad.addColorStop(1, "#26344B");
  ctx.fillStyle = grad; rr(v.x, v.y, v.w, v.h, 58); ctx.fill();
  ctx.strokeStyle = "rgba(232,238,247,.28)"; ctx.lineWidth = 1.5; ctx.stroke();
  // bed layers (conceptual strata, not a material spec)
  const bedY = v.y + 74, bedH = v.h - 148;
  const layers = ["#4A3B63", "#5B4A75", "#6A5987", "#7A6899"];
  layers.forEach((col, i) => {
    ctx.fillStyle = col; ctx.globalAlpha = 0.85;
    const lh = bedH / layers.length;
    rr(v.x + 12, bedY + i * lh + 2, v.w - 24, lh - 4, 8); ctx.fill();
  });
  ctx.globalAlpha = 1;
  // retained contaminant loading, bottom-up
  const loadH = bedH * clamp(loading);
  if (loadH > 2) {
    ctx.save(); rr(v.x + 12, bedY, v.w - 24, bedH, 10); ctx.clip();
    const lg = ctx.createLinearGradient(0, bedY + bedH - loadH, 0, bedY + bedH);
    lg.addColorStop(0, "rgba(255,93,115,.12)"); lg.addColorStop(1, "rgba(255,93,115,.5)");
    ctx.fillStyle = lg; ctx.fillRect(v.x + 12, bedY + bedH - loadH, v.w - 24, loadH);
    ctx.restore();
  }
  // supports + heads
  ctx.fillStyle = C.steel; ctx.fillRect(v.x + 18, v.y + v.h - 6, 12, 30); ctx.fillRect(v.x + v.w - 30, v.y + v.h - 6, 12, 30);
  ctx.fillStyle = "rgba(11,16,25,.55)"; rr(v.x + 10, v.y + 10, v.w - 20, 34, 16); ctx.fill();
  ctx.font = "700 15px 'Space Grotesk', sans-serif"; ctx.fillStyle = C.ink; ctx.textAlign = "center";
  ctx.fillText(name, v.x + v.w / 2, v.y + 32);
  // state chip
  const chip = mode === "adsorb" ? "ADSORBING" : mode === "regen" ? "REGENERATING" : "STANDBY";
  const chipCol = mode === "adsorb" ? C.cyan : mode === "regen" ? C.gold : C.violet;
  ctx.font = "600 9.5px 'JetBrains Mono', monospace";
  const tw = ctx.measureText(chip).width + 16;
  ctx.fillStyle = "rgba(11,16,25,.8)"; rr(v.x + v.w / 2 - tw / 2, v.y + v.h - 46, tw, 18, 9); ctx.fill();
  ctx.strokeStyle = chipCol; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = chipCol; ctx.fillText(chip, v.x + v.w / 2, v.y + v.h - 33);
  void f;
  ctx.restore();
}
function drawColdBox(f: number, active: number) {
  const b = COLDBOX;
  ctx.save();
  ctx.fillStyle = "#1B2942"; rr(b.x, b.y, b.w, b.h, 18); ctx.fill();
  ctx.strokeStyle = "rgba(0,229,255,.35)"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.font = "700 15px 'Space Grotesk', sans-serif"; ctx.fillStyle = C.ink; ctx.textAlign = "left";
  ctx.fillText("COLD BOX", b.x + 18, b.y + 30);
  ctx.font = "11px 'JetBrains Mono', monospace"; ctx.fillStyle = C.muted;
  ctx.fillText("low-temperature separation", b.x + 18, b.y + 48);
  // heat exchanger zigzag
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.35 + 0.55 * active;
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) { const x = b.x + 26 + i * 34; const y = b.y + 92 + (i % 2 ? 26 : 0); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke(); ctx.globalAlpha = 1;
  // column with trays
  const cx = b.x + 58, cy = b.y + 150, cw = 74, ch = 168;
  ctx.fillStyle = "#24334F"; rr(cx, cy, cw, ch, 26); ctx.fill(); ctx.strokeStyle = "rgba(232,238,247,.25)"; ctx.stroke();
  for (let i = 1; i < 6; i++) { line(cx + 10, cy + i * (ch / 6), cx + cw - 10, cy + i * (ch / 6), "rgba(159,176,201,.35)", 1.5); }
  // rising purified vapour dots inside column
  for (let i = 0; i < 10; i++) {
    const p = ((f * 0.004 * (0.7 + (i % 3) * 0.2) + i * 0.13) % 1);
    ctx.fillStyle = `rgba(0,229,255,${0.25 + 0.6 * active * (1 - p)})`;
    ctx.beginPath(); ctx.arc(cx + 16 + (i % 4) * 14, cy + ch - 14 - p * (ch - 28), 2.6, 0, Math.PI * 2); ctx.fill();
  }
  // second smaller column / expander block abstract
  ctx.fillStyle = "#24334F"; rr(b.x + 158, b.y + 168, 82, 118, 12); ctx.fill(); ctx.strokeStyle = "rgba(232,238,247,.2)"; ctx.stroke();
  ctx.font = "11px 'JetBrains Mono', monospace"; ctx.fillStyle = C.muted; ctx.textAlign = "center";
  ctx.fillText("separation", b.x + 199, b.y + 222); ctx.fillText("internals", b.x + 199, b.y + 238);
  ctx.fillText("(schematic)", b.x + 199, b.y + 254);
  ctx.restore();
}
function particleColor(k: Particle["kind"]) { return k === "air" ? "rgba(140,200,230,.75)" : k === "h2o" ? C.white : C.red; }

function cameraFor(f: number): { s: number; cx: number; cy: number } {
  // keyframes: [frame, scale, focusX, focusY]
  const keys: [number, number, number, number][] = [
    [0, 1.0, 640, 360], [90, 1.04, 640, 360], [149, 1.28, 520, 350],
    [175, 1.88, 446, 342], [299, 1.88, 446, 342],
    [330, 1.45, 620, 330], [430, 1.35, 830, 320], [509, 1.3, 900, 320],
    [545, 1.5, 634, 360], [749, 1.5, 634, 360],
    [800, 1.08, 640, 360], [1019, 1.0, 640, 360],
  ];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, s0, x0, y0] = keys[i]; const [f1, s1, x1, y1] = keys[i + 1];
    if (f >= f0 && f <= f1) { const t = easeInOut((f - f0) / Math.max(1, f1 - f0)); return { s: lerp(s0, s1, t), cx: lerp(x0, x1, t), cy: lerp(y0, y1, t) }; }
  }
  return { s: 1, cx: 640, cy: 360 };
}

function render(f: number) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = C.stage; ctx.fillRect(0, 0, W, H);
  // blueprint grid
  ctx.strokeStyle = "rgba(159,176,201,.055)"; ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 44) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 44) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  const ch = chapterFor(f);
  const cam = cameraFor(f);
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -cam.cy);

  const inCh2 = f >= 150 && f <= 299;
  const inCh3 = f >= 300 && f <= 509;
  const inCh4 = f >= 510 && f <= 749;
  const inCh5 = f >= 750;
  const loadA = inCh4 || inCh5 ? 0.82 : clamp(0.12 + seg(f, 0, 700) * 0.68);
  const loadB = inCh4 ? lerp(0.85, 0.12, seg(f, 540, 730)) : inCh5 ? 0.14 : 0.1;

  // pipes (behind vessels)
  pipePath([[INLET.x, INLET.y], [300, INLET.y], [300, 430], [VESSEL_A.x + 30, 430], [VESSEL_A.x + 30, VESSEL_A.y + VESSEL_A.h]], C.steel, 12);
  pipePath([[300, INLET.y], [640, INLET.y], [640, 430], [VESSEL_B.x + 118, 430], [VESSEL_B.x + 118, VESSEL_B.y + VESSEL_B.h]], C.steel, 12);
  pipePath([[VESSEL_A.x + VESSEL_A.w - 30, VESSEL_A.y], [VESSEL_A.x + VESSEL_A.w - 30, OUTLET_Y - 40], [790, OUTLET_Y - 40], [790, OUTLET_Y], [COLDBOX.x, OUTLET_Y]], C.steel, 12);
  pipePath([[VESSEL_B.x + 30, VESSEL_B.y], [VESSEL_B.x + 30, OUTLET_Y - 68], [790, OUTLET_Y - 68]], C.steel, 9);
  // product out
  pipePath([[COLDBOX.x + COLDBOX.w, 300], [1232, 300]], C.steel, 10);
  pipePath([[COLDBOX.x + COLDBOX.w, 380], [1232, 380]], C.steel, 10);
  // regen vent (chapter 4)
  if (inCh4 || inCh5) pipePath([[VESSEL_B.x + 118, VESSEL_B.y + VESSEL_B.h], [640, 560], [640, 610], [560, 610]], inCh4 ? C.gold : C.steel, inCh4 ? 8 : 9);

  // cyan purified path highlight
  const pathAlpha = inCh3 ? 0.95 : 0.35;
  pipePath([[VESSEL_A.x + VESSEL_A.w - 30, OUTLET_Y - 40], [790, OUTLET_Y - 40], [790, OUTLET_Y], [COLDBOX.x + 10, OUTLET_Y]], C.cyan, 4, pathAlpha);

  drawVessel(VESSEL_A, "VESSEL A", "adsorb", f, loadA);
  drawVessel(VESSEL_B, "VESSEL B", inCh4 ? "regen" : "standby", f, loadB);
  drawColdBox(f, inCh3 || inCh5 ? 1 : 0.45);

  // valves
  valve(300, 430, inCh4 ? 0.15 : 0.9, "V-101");
  valve(640, 430, inCh4 ? 0.9 : 0.15, "V-102");
  valve(790, OUTLET_Y - 40, 0.9, "V-103");
  valve(640, 560, inCh4 ? 0.85 : 0.1, "VENT");

  // feed particles rising through Vessel A (adsorption)
  if (!inCh4) {
    for (const p of PARTICLES) {
      const prog = (f * 0.0032 * p.speed + p.off) % 1;
      const x = VESSEL_A.x + 22 + p.lane * (VESSEL_A.w - 44) + Math.sin(f * 0.05 + p.wob) * 2;
      const bedTop = VESSEL_A.y + 74, bedBot = VESSEL_A.y + VESSEL_A.h - 74;
      let y = lerp(bedBot + 56, bedTop - 30, prog);
      let alpha = 1;
      if (p.kind !== "air") {
        const stickProg = 0.25 + p.stickY * 0.4;
        if (prog > stickProg) { y = lerp(bedBot + 56, bedTop - 30, stickProg); alpha = inCh2 ? 1 : 0.9; }
      }
      if (prog < 0.06) alpha = prog / 0.06;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particleColor(p.kind);
      ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
      if (p.kind === "h2o") { ctx.fillStyle = "rgba(11,16,25,.65)"; ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }
  // purified particles travelling to cold box (chapter 3 emphasis)
  {
    const n = inCh3 ? 34 : 16;
    for (let i = 0; i < n; i++) {
      const p = (f * 0.0045 + i / n) % 1;
      let x: number, y: number;
      if (p < 0.35) { x = lerp(VESSEL_A.x + VESSEL_A.w - 30, 790, p / 0.35); y = OUTLET_Y - 40; }
      else if (p < 0.5) { x = 790; y = lerp(OUTLET_Y - 40, OUTLET_Y, (p - 0.35) / 0.15); }
      else { x = lerp(790, COLDBOX.x + 30, (p - 0.5) / 0.5); y = OUTLET_Y; }
      ctx.fillStyle = C.cyan; ctx.globalAlpha = inCh3 ? 0.95 : 0.5;
      ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  // regeneration: gold purge down through B, contaminants out to vent
  if (inCh4) {
    const t = seg(f, 530, 740);
    for (let i = 0; i < 30; i++) {
      const p = (f * 0.005 + i / 30) % 1;
      const x = VESSEL_B.x + 22 + ((i * 37) % 100) / 100 * (VESSEL_B.w - 44);
      const y = lerp(VESSEL_B.y + 50, VESSEL_B.y + VESSEL_B.h - 40, p);
      ctx.fillStyle = C.gold; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 16; i++) {
      const p = (f * 0.004 + i / 16) % 1;
      const x = lerp(640, 560, p), y = 610;
      ctx.fillStyle = i % 2 ? C.white : C.red; ctx.globalAlpha = 0.9 * (1 - t * 0.3);
      ctx.beginPath(); ctx.arc(x, y + Math.sin(p * 9 + i) * 4, 3.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // heat input symbol
    ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5;
    const hx = VESSEL_B.x + VESSEL_B.w + 26, hy = VESSEL_B.y + 130;
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) { const xx = hx + (i % 2 ? 16 : 0), yy = hy + i * 16; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.stroke(); ctx.restore();
  }

  // freeze-risk ghost in chapter 5: dashed red alternate path, blocked
  if (inCh5) {
    const t = seg(f, 770, 900);
    ctx.save(); ctx.globalAlpha = 0.85 * t;
    line(520, 150, 900, 150, C.red, 2, [7, 7]);
    ctx.fillStyle = C.red; ctx.font = "600 11px 'JetBrains Mono', monospace"; ctx.textAlign = "center";
    ctx.fillText("IF UNREMOVED: FIRST TO FREEZE AT LOW TEMPERATURE", 710, 138);
    // block mark at adsorber
    ctx.strokeStyle = C.green; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(446, 150, 13, 0, Math.PI * 2); ctx.stroke();
    line(437, 159, 455, 141, C.green, 4);
    ctx.restore();
  }

  /* Labels (world space) */
  if (state.labels) {
    label(INLET.x, INLET.y - 22, "FEED AIR IN", "from upstream compression + cooling", C.cyan);
    if (cam.s < 1.45) label(VESSEL_A.x - 8, VESSEL_A.y - 18, "ADSORBENT VESSELS", "twin-bed arrangement (conceptual)", C.violet);
    if (cam.s < 1.45) label(COLDBOX.x + 6, COLDBOX.y - 18, "COLD BOX", "protected downstream equipment", C.cyan);
    label(1196, 288, "PRODUCTS OUT", "", C.cyan, "right");
    if (inCh2) {
      label(VESSEL_A.x + VESSEL_A.w + 26, 330, "INSIDE THE BED", "H2O + CO2 retained", C.gold);
      label(VESSEL_A.x + VESSEL_A.w + 26, 356, "", "bulk air passes on", C.gold);
      line(VESSEL_A.x + VESSEL_A.w, 340, VESSEL_A.x + VESSEL_A.w + 22, 336, C.gold, 1.5);
    }
    if (inCh4) {
      label(VESSEL_B.x - 10, 640, "PURGE TO VENT", "desorbed H2O + CO2 leave here", C.gold);
      label(VESSEL_B.x + VESSEL_B.w + 30, 452, "HEAT INPUT", "energy in (gold)", C.gold);
    }
  }
  ctx.restore();

  /* -------- Screen-space overlays -------- */
  ctx.save();
  // top bar
  ctx.fillStyle = "rgba(7,11,20,.82)"; rr(18, 16, W - 36, 54, 12); ctx.fill();
  ctx.strokeStyle = "rgba(159,176,201,.18)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.font = "700 16px 'Space Grotesk', sans-serif"; ctx.fillStyle = C.ink; ctx.textAlign = "left";
  ctx.fillText(`CH ${ch.num} — ${ch.title}`, 36, 40);
  ctx.font = "11px 'JetBrains Mono', monospace"; ctx.fillStyle = C.muted;
  ctx.fillText(ch.note.toUpperCase(), 36, 59);
  ctx.textAlign = "right"; ctx.fillStyle = C.cyan;
  ctx.font = "600 13px 'JetBrains Mono', monospace";
  ctx.fillText(`FRAME ${String(Math.round(f)).padStart(4, "0")} / 1019 · ${(f / FPS).toFixed(2)}s`, W - 36, 40);
  ctx.fillStyle = C.faint; ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.fillText("CONCEPTUAL SCHEMATIC · NOT TO SCALE · SLOW MOTION", W - 36, 59);

  // mass accounting strip
  const my = H - 64;
  ctx.fillStyle = "rgba(7,11,20,.82)"; rr(18, my, W - 36, 46, 12); ctx.fill();
  ctx.strokeStyle = "rgba(159,176,201,.16)"; ctx.stroke();
  ctx.font = "600 10.5px 'JetBrains Mono', monospace"; ctx.fillStyle = C.faint; ctx.textAlign = "left";
  ctx.fillText("MASS ACCOUNTING (QUALITATIVE WIDTHS)", 36, my + 18);
  const retained = inCh4 ? lerp(0.72, 0.18, seg(f, 540, 730)) : clamp(0.18 + seg(f, 0, 700) * 0.54);
  const outW = (1 - retained) * 520;
  ctx.fillStyle = C.cyan; rr(36, my + 24, Math.max(8, outW), 10, 5); ctx.fill();
  ctx.fillStyle = C.red; rr(44 + outW, my + 24, Math.max(8, retained * 520), 10, 5); ctx.fill();
  ctx.fillStyle = C.muted; ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.fillText(inCh4 ? "PURGE OUT + DESORBED CONTAMINANTS → VENT · BED CAPACITY RECOVERING" : "PURIFIED OUT (CYAN) + RETAINED ON BED (ROSE) = FEED IN", 640, my + 33);

  // qualitative inset during regeneration
  if (inCh4) {
    const ix = W - 356, iy = 92, iw = 320, ih = 178;
    ctx.fillStyle = "rgba(7,11,20,.9)"; rr(ix, iy, iw, ih, 14); ctx.fill();
    ctx.strokeStyle = "rgba(157,78,221,.55)"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = "700 12px 'Space Grotesk', sans-serif"; ctx.fillStyle = C.ink; ctx.textAlign = "left";
    ctx.fillText("QUALITATIVE INSET — NOT MEASURED", ix + 16, iy + 24);
    ctx.font = "10px 'JetBrains Mono', monospace"; ctx.fillStyle = C.faint;
    ctx.fillText("mathematical diagram · no plant data · no units", ix + 16, iy + 40);
    line(ix + 18, iy + ih - 28, ix + iw - 16, iy + ih - 28, "rgba(159,176,201,.4)", 1);
    line(ix + 18, iy + 52, ix + 18, iy + ih - 28, "rgba(159,176,201,.4)", 1);
    // capacity recovery curve
    ctx.strokeStyle = C.violet; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const px = ix + 20 + (i / 60) * (iw - 44);
      const py = iy + ih - 32 - (1 - Math.exp(-i / 16)) * 78;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    // loading fall curve
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const px = ix + 20 + (i / 60) * (iw - 44);
      const py = iy + 58 + (1 - Math.exp(-i / 15)) * 66;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.font = "10.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = C.violet; ctx.fillText("available capacity ↑ (conceptual)", ix + 24, iy + 66);
    ctx.fillStyle = C.gold; ctx.fillText("bed loading ↓ (conceptual)", ix + 24, iy + ih - 38);
    const prog = seg(f, 530, 740);
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(ix + 20 + prog * (iw - 44), iy + ih - 32 - (1 - Math.exp(-(prog * 60) / 16)) * 78, 4, 0, Math.PI * 2); ctx.fill();
  }

  // limits box in final chapter
  if (inCh5) {
    const t = smooth(seg(f, 820, 920));
    ctx.globalAlpha = t;
    const lx = 22, ly = 92, lw = 330, lh = 138;
    ctx.fillStyle = "rgba(7,11,20,.9)"; rr(lx, ly, lw, lh, 14); ctx.fill();
    ctx.strokeStyle = "rgba(255,209,102,.5)"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = "700 12px 'Space Grotesk', sans-serif"; ctx.fillStyle = C.gold; ctx.textAlign = "left";
    ctx.fillText("LIMITS, KEPT VISIBLE", lx + 16, ly + 26);
    ctx.font = "12px 'Space Grotesk', sans-serif"; ctx.fillStyle = C.muted;
    const lines = ["Adsorbents and cycles vary by design.", "No regeneration recipe is given.", "No total removal guarantee is made.", "Breakthrough ends the useful cycle.", "Protection is the function. Not polish."];
    lines.forEach((s, i) => ctx.fillText("·  " + s, lx + 16, ly + 52 + i * 17));
    ctx.globalAlpha = 1;
  }

  // chapter progress ticks
  CHAPTERS.forEach((c, i) => {
    const x = 18 + i * ((W - 36) / 5);
    ctx.fillStyle = f >= c.start && f <= c.end ? C.cyan : "rgba(159,176,201,.25)";
    rr(x + 2, 78, (W - 36) / 5 - 6, 4, 2); ctx.fill();
  });
  ctx.restore();
}

function sync() {
  const f = Math.round(state.frame);
  render(f);
  frameOut.textContent = String(f);
  timeOut.textContent = `${(f / FPS).toFixed(2)} s`;
  const ch = chapterFor(f);
  chapOut.textContent = ch.num;
  capMeta.textContent = ch.note;
  capTitle.textContent = ch.title;
  capBody.textContent = ch.body;
  scrub.value = String(f);
  progressBar.style.width = `${(f / (TOTAL - 1)) * 100}%`;
  chapterBtns.forEach((b, i) => b.classList.toggle("active", CHAPTERS[i] === ch));
}

function loop(now: number) {
  const dt = Math.min(100, now - state.last); state.last = now;
  if (state.playing) {
    state.acc += (dt / 1000) * FPS * state.speed;
    while (state.acc >= 1) { state.acc -= 1; state.frame = (state.frame + 1) % TOTAL; }
    sync();
  }
  requestAnimationFrame(loop);
}
sync();
requestAnimationFrame((t) => { state.last = t; requestAnimationFrame(loop); });
