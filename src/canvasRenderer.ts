/**
 * Deterministic Canvas Renderer for the 34-second (1,020-frame) Cryogenic Feed Purification Explainer.
 *
 * Palette Rules (Strict):
 * - Stage Background: #0B1019
 * - Neutral Structural Materials: #344257 (with tonal depth #1E293B .. #475569)
 * - Primary Transport / Purified Signal: #00E5FF (Cyan)
 * - Energy / Actuation / Thermal Desorption: #FFD166 (Gold)
 * - Control / State / Telemetry / Uncertainty: #9D4EDD (Violet)
 *
 * Colors are explanatory overlays, not literal optical emission.
 */

import {
  type QualitativeTelemetry,
  clamp,
  lerp,
  smoothstep,
} from './simulationEngine';

export interface RenderOptions {
  showGrid: boolean;
  showLabels: boolean;
  showAccountingOverlay: boolean;
  showUncertaintyBands: boolean;
  highlightedNode: string | null;
}

const PALETTE = {
  stageBg: '#0B1019',
  stagePanel: '#101826',
  materialDark: '#1E2736',
  materialBase: '#344257',
  materialLight: '#4B5E78',
  materialStroke: '#647996',
  cyan: '#00E5FF',
  cyanSoft: 'rgba(0, 229, 255, 0.20)',
  cyanGlow: 'rgba(0, 229, 255, 0.45)',
  gold: '#FFD166',
  goldSoft: 'rgba(255, 209, 102, 0.22)',
  goldGlow: 'rgba(255, 209, 102, 0.48)',
  violet: '#9D4EDD',
  violetSoft: 'rgba(157, 78, 221, 0.22)',
  violetGlow: 'rgba(157, 78, 221, 0.50)',
  textBright: '#F1F5F9',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  h2oTag: '#38BDF8', // Sub-tint of cyan for moisture front differentiation
  co2Tag: '#C084FC', // Sub-tint of violet for CO2 front differentiation
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/**
 * Draws an orthographic 3D-projected cylinder top/bottom cap for three-quarter perspective feel.
 */
function drawIsoVesselCap(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: string,
  stroke: string,
  lineWidth = 1.5
) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

/**
 * Draws a deterministic valve symbol at (x, y) with actuation state overlay.
 */
function drawValve(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tag: string,
  state: 'OPEN' | 'CLOSED' | 'MODULATING' | 'TRANSITION',
  orientation: 'H' | 'V' = 'H',
  alpha = 1
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  if (orientation === 'V') {
    ctx.rotate(Math.PI / 2);
  }

  const isOpen = state === 'OPEN' || state === 'MODULATING';
  const strokeColor =
    state === 'MODULATING'
      ? PALETTE.gold
      : isOpen
        ? PALETTE.cyan
        : PALETTE.violet;

  // Bowtie valve body
  ctx.beginPath();
  ctx.moveTo(-13, -8);
  ctx.lineTo(13, 8);
  ctx.lineTo(13, -8);
  ctx.lineTo(-13, 8);
  ctx.closePath();
  ctx.fillStyle = isOpen ? 'rgba(0, 229, 255, 0.18)' : '#151D2A';
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Actuator stem + dome (Gold actuation energy or Violet state control)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -16);
  ctx.strokeStyle = PALETTE.violet;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  drawRoundedRect(ctx, -9, -23, 18, 7, 3);
  ctx.fillStyle = state === 'MODULATING' ? PALETTE.gold : PALETTE.materialBase;
  ctx.fill();
  ctx.strokeStyle = state === 'MODULATING' ? PALETTE.gold : PALETTE.violet;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  if (orientation === 'V') {
    ctx.rotate(-Math.PI / 2);
  }

  // Valve Tag
  ctx.font = '600 9.5px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.textBright;
  ctx.textAlign = 'center';
  ctx.fillText(tag, 0, 20);

  ctx.font = '500 8px "JetBrains Mono", monospace';
  ctx.fillStyle = strokeColor;
  ctx.fillText(state, 0, 29);

  ctx.restore();
}

/**
 * Draws technical callout leader line with crisp pill label.
 */
function drawCallout(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  title: string,
  subtitle: string,
  accentColor: string,
  align: 'left' | 'right' = 'left',
  alpha = 1
) {
  if (alpha <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  // Anchor dot
  ctx.beginPath();
  ctx.arc(ax, ay, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(ax, ay, 7, 0, Math.PI * 2);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Elbow leader line
  const elbowX = align === 'left' ? bx - 14 : bx + 14;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(elbowX, by);
  ctx.lineTo(bx, by);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // Label card
  const cardW = Math.max(title.length * 6.5, subtitle.length * 5.6) + 22;
  const cardH = 36;
  const cardX = align === 'left' ? bx : bx - cardW;
  const cardY = by - cardH / 2;

  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 5);
  ctx.fillStyle = 'rgba(11, 16, 25, 0.92)';
  ctx.fill();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Left accent bar
  ctx.fillStyle = accentColor;
  ctx.fillRect(cardX, cardY + 4, 3, cardH - 8);

  ctx.textAlign = 'left';
  ctx.font = '700 10.5px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.textBright;
  ctx.fillText(title, cardX + 10, cardY + 14);

  ctx.font = '500 9px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.textMuted;
  ctx.fillText(subtitle, cardX + 10, cardY + 27);

  ctx.restore();
}

/**
 * Renders the complete 1600x900 technical stage for a given deterministic frame state.
 */
export function renderExplainerFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: QualitativeTelemetry,
  options: RenderOptions
) {
  const { frame, act, camera } = state;

  // Base stage coordinates are authored at 1600 x 900 and scaled uniformly
  const STAGE_W = 1600;
  const STAGE_H = 900;
  const scaleX = width / STAGE_W;
  const scaleY = height / STAGE_H;

  ctx.save();
  ctx.scale(scaleX, scaleY);

  // 1. Dark Technical Stage Background (#0B1019)
  ctx.fillStyle = PALETTE.stageBg;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);

  // Subtle ambient radial depth on the stage
  const bgGrad = ctx.createRadialGradient(800, 450, 80, 800, 450, 920);
  bgGrad.addColorStop(0, '#121B2B');
  bgGrad.addColorStop(1, '#0B1019');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);

  // 2. Camera Transform (Pan + Zoom + Three-Quarter Orthographic Offset)
  ctx.save();
  ctx.translate(STAGE_W / 2, STAGE_H / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.cx, -camera.cy);

  // Perspective parallax vectors derived from pitchDeg and yawDeg
  const isoDx = Math.sin((camera.yawDeg * Math.PI) / 180) * 28;
  const isoDy = Math.sin((camera.pitchDeg * Math.PI) / 180) * 22;

  // Technical Orthographic Grid
  if (options.showGrid) {
    ctx.save();
    ctx.strokeStyle = 'rgba(100, 121, 150, 0.11)';
    ctx.lineWidth = 1 / camera.zoom;
    const gridStep = 40;
    for (let x = -200; x <= STAGE_W + 200; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, -100);
      ctx.lineTo(x, STAGE_H + 100);
      ctx.stroke();
    }
    for (let y = -100; y <= STAGE_H + 100; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(-200, y);
      ctx.lineTo(STAGE_W + 200, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Opacity of non-Vessel-A context (dimmed during Act II sectional close-up)
  const surroundingAlpha = clamp(1 - camera.isolateVesselA, 0.14, 1);

  // ============================================================================
  // SECTION A: UPSTREAM FEED AIR COMPRESSION & AFTERCOOLER TRAIN (X: 70..320)
  // ============================================================================
  ctx.save();
  ctx.globalAlpha = surroundingAlpha;

  // Main Air Compressor (MAC) + Aftercooler Skid + Moisture Separator
  const skidX = 85;
  const skidY = 540;
  const skidW = 215;
  const skidH = 195;

  // Isometric shadow / baseplate
  drawRoundedRect(ctx, skidX + isoDx * 0.4, skidY + isoDy * 0.4, skidW, skidH, 10);
  ctx.fillStyle = '#0E1522';
  ctx.fill();

  drawRoundedRect(ctx, skidX, skidY, skidW, skidH, 10);
  ctx.fillStyle = PALETTE.materialDark;
  ctx.fill();
  ctx.strokeStyle =
    options.highlightedNode === 'feed-train' ? PALETTE.cyan : PALETTE.materialStroke;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Compressor + Aftercooler internal schematic blocks
  drawRoundedRect(ctx, skidX + 16, skidY + 38, 82, 86, 6);
  ctx.fillStyle = PALETTE.materialBase;
  ctx.fill();
  ctx.strokeStyle = PALETTE.materialLight;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Spinning compressor impeller blades (Gold actuation energy)
  ctx.save();
  ctx.translate(skidX + 57, skidY + 81);
  ctx.rotate((frame * 0.14) % (Math.PI * 2));
  for (let b = 0; b < 6; b++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(22, -6);
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.gold;
  ctx.fill();
  ctx.restore();

  // Aftercooler & KO Drum (Knock-out liquid water drain)
  drawRoundedRect(ctx, skidX + 114, skidY + 38, 84, 110, 8);
  ctx.fillStyle = PALETTE.materialBase;
  ctx.fill();
  ctx.strokeStyle = PALETTE.materialLight;
  ctx.stroke();

  // Cooling coil zig-zag inside aftercooler
  ctx.beginPath();
  ctx.moveTo(skidX + 128, skidY + 58);
  for (let row = 0; row < 5; row++) {
    const xPos = row % 2 === 0 ? skidX + 184 : skidX + 128;
    ctx.lineTo(xPos, skidY + 66 + row * 12);
  }
  ctx.strokeStyle = PALETTE.cyan;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Condensed bulk liquid water sump at bottom of KO drum
  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.fillRect(skidX + 116, skidY + 128, 80, 18);

  ctx.font = '700 11px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.textBright;
  ctx.textAlign = 'left';
  ctx.fillText('FEED AIR TRAIN (MAC + AFTERCOOLER)', skidX + 14, skidY + 22);

  ctx.font = '500 9.5px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.textMuted;
  ctx.fillText('RAW AIR: N₂/O₂/Ar + H₂O(g) + CO₂(g)', skidX + 14, skidY + 168);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText('WORK IN: +W_comp (Gold Overlay)', skidX + 14, skidY + 183);

  ctx.restore();

  // ============================================================================
  // SECTION B: PIPING MANIFOLDS (FEED, PURIFIED HEADER, REGEN LOOP)
  // ============================================================================
  // 1. Feed Manifold from Aftercooler (300, 610) to Vessel A bottom (470, 690) and Vessel B bottom (740, 690)
  ctx.save();
  ctx.globalAlpha = surroundingAlpha;

  // Pipe from skid to split junction
  ctx.beginPath();
  ctx.moveTo(300, 610);
  ctx.lineTo(360, 610);
  ctx.lineTo(360, 725);
  ctx.lineTo(740, 725);
  ctx.lineTo(740, 665);
  ctx.strokeStyle = PALETTE.materialBase;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Active Feed Branch to Vessel A (Cyan + Contaminant trace)
  ctx.beginPath();
  ctx.moveTo(300, 610);
  ctx.lineTo(360, 610);
  ctx.lineTo(360, 725);
  ctx.lineTo(470, 725);
  ctx.lineTo(470, 665);
  ctx.strokeStyle = PALETTE.cyan;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Deterministic feed particles moving along the inlet pipe into Vessel A
  for (let i = 0; i < 12; i++) {
    const p = ((frame * 0.015 + i / 12) % 1);
    let px = 300;
    let py = 610;
    if (p < 0.22) {
      px = lerp(300, 360, p / 0.22);
      py = 610;
    } else if (p < 0.55) {
      px = 360;
      py = lerp(610, 725, (p - 0.22) / 0.33);
    } else if (p < 0.82) {
      px = lerp(360, 470, (p - 0.55) / 0.27);
      py = 725;
    } else {
      px = 470;
      py = lerp(725, 665, (p - 0.82) / 0.18);
    }
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    // Mix of Cyan (N2/O2), H2O blue, and Violet CO2 dots in raw feed
    ctx.fillStyle = i % 3 === 0 ? PALETTE.violet : i % 2 === 0 ? PALETTE.gold : PALETTE.cyan;
    ctx.fill();
  }

  ctx.restore();

  // ============================================================================
  // SECTION C: ADSORBENT VESSEL A — ONLINE ADSORPTION (X: 390..550, Y: 290..665)
  // ============================================================================
  const vAx = 390;
  const vAy = 295;
  const vAw = 160;
  const vAh = 365;
  const vAcx = vAx + vAw / 2; // 470

  ctx.save();
  // Isometric 3D offset back-shell for three-quarter depth
  drawIsoVesselCap(
    ctx,
    vAcx + isoDx * 0.45,
    vAy + isoDy * 0.45,
    vAw / 2,
    24,
    PALETTE.materialDark,
    PALETTE.materialStroke,
    1.5
  );
  drawRoundedRect(
    ctx,
    vAx + isoDx * 0.45,
    vAy + isoDy * 0.45,
    vAw,
    vAh,
    22
  );
  ctx.fillStyle = '#151E2C';
  ctx.fill();

  // Vessel A Bottom Dish & Top Dish
  drawIsoVesselCap(
    ctx,
    vAcx,
    vAy + vAh - 12,
    vAw / 2,
    24,
    PALETTE.materialBase,
    PALETTE.cyan,
    2
  );

  // Main Cylindrical Cutaway Body
  drawRoundedRect(ctx, vAx, vAy, vAw, vAh, 20);
  ctx.fillStyle = '#121A28';
  ctx.fill();
  ctx.strokeStyle =
    act.id === 2 || options.highlightedNode === 'vessel-a'
      ? PALETTE.cyan
      : PALETTE.materialStroke;
  ctx.lineWidth = act.id === 2 ? 3 : 2.2;
  ctx.stroke();

  drawIsoVesselCap(
    ctx,
    vAcx,
    vAy + 12,
    vAw / 2,
    22,
    '#1A2536',
    PALETTE.cyan,
    1.8
  );

  // Internal Bed Zones inside Vessel A:
  // 1. Bottom Inlet Distributor Screen (Y: 615..635)
  // 2. Lower Bed: Activated Alumina / Graded Desiccant — Selective H2O Removal (Y: 490..615)
  // 3. Upper Bed: 13X Zeolite Molecular Sieve — Selective CO2 & Trace Hydrocarbon Removal (Y: 345..490)
  // 4. Top Hold-Down Screen & Outlet Plenum (Y: 315..345)

  const bedLeft = vAx + 12;
  const bedW = vAw - 24;

  // Lower Zone: H2O Desiccant Layer (Y: 490..615)
  const h2oZoneTop = 490;
  const h2oZoneBottom = 615;
  const h2oZoneH = h2oZoneBottom - h2oZoneTop;

  const h2oGrad = ctx.createLinearGradient(0, h2oZoneBottom, 0, h2oZoneTop);
  h2oGrad.addColorStop(0, 'rgba(0, 229, 255, 0.36)');
  h2oGrad.addColorStop(clamp(state.vesselAH2OLoading, 0.2, 0.95), 'rgba(56, 189, 248, 0.22)');
  h2oGrad.addColorStop(1, 'rgba(52, 66, 87, 0.35)');
  ctx.fillStyle = h2oGrad;
  ctx.fillRect(bedLeft, h2oZoneTop, bedW, h2oZoneH);

  // Upper Zone: CO2 Molecular Sieve Layer (Y: 345..490)
  const co2ZoneTop = 345;
  const co2ZoneBottom = 490;
  const co2ZoneH = co2ZoneBottom - co2ZoneTop;

  const co2Grad = ctx.createLinearGradient(0, co2ZoneBottom, 0, co2ZoneTop);
  co2Grad.addColorStop(0, 'rgba(157, 78, 221, 0.38)');
  co2Grad.addColorStop(clamp(state.vesselACO2Loading, 0.15, 0.9), 'rgba(157, 78, 221, 0.16)');
  co2Grad.addColorStop(1, 'rgba(52, 66, 87, 0.28)');
  ctx.fillStyle = co2Grad;
  ctx.fillRect(bedLeft, co2ZoneTop, bedW, co2ZoneH);

  // Deterministic Packed-Bed Adsorbent Beads Lattice (Revealed clearly in sectional view)
  const beadCols = 11;
  const beadRows = 18;
  const cellW = bedW / beadCols;
  const cellH = (h2oZoneBottom - co2ZoneTop) / beadRows;

  for (let r = 0; r < beadRows; r++) {
    const rowY = h2oZoneBottom - (r + 0.5) * cellH;
    const normHeight = r / (beadRows - 1); // 0 at bottom inlet, 1 at top outlet
    const isLowerAlumina = rowY >= h2oZoneTop;

    for (let c = 0; c < beadCols; c++) {
      const stagger = r % 2 === 0 ? 0 : cellW * 0.25;
      const colX = bedLeft + (c + 0.4) * cellW + stagger;
      if (colX > bedLeft + bedW - 4) continue;

      ctx.beginPath();
      ctx.arc(colX, rowY, isLowerAlumina ? 3.8 : 3.2, 0, Math.PI * 2);

      // Determine if bead has captured H2O (lower zone) or CO2 (middle zone) or remains clean (upper guard zone)
      if (isLowerAlumina) {
        const loaded = normHeight < state.vesselAH2OLoading * 0.55;
        ctx.fillStyle = loaded ? '#38BDF8' : PALETTE.materialBase;
        ctx.strokeStyle = loaded ? PALETTE.cyan : PALETTE.materialLight;
      } else {
        const co2FrontHeight = 0.44 + state.vesselACO2Loading * 0.34;
        const loadedCO2 = normHeight < co2FrontHeight;
        ctx.fillStyle = loadedCO2 ? PALETTE.violet : '#263244';
        ctx.strokeStyle = loadedCO2 ? '#C084FC' : PALETTE.materialLight;
      }
      ctx.lineWidth = 0.9;
      ctx.fill();
      ctx.stroke();
    }
  }

  // Mass Transfer Zone (MTZ) Active Wavefront Indicator + Exothermic Heat of Adsorption (+ΔH_ads in Gold)
  const mtzY = lerp(h2oZoneBottom - 30, co2ZoneTop + 38, state.vesselAMTZPosition);
  ctx.save();
  const mtzGrad = ctx.createLinearGradient(0, mtzY - 18, 0, mtzY + 18);
  mtzGrad.addColorStop(0, 'rgba(255, 209, 102, 0)');
  mtzGrad.addColorStop(0.5, 'rgba(255, 209, 102, 0.35)');
  mtzGrad.addColorStop(1, 'rgba(255, 209, 102, 0)');
  ctx.fillStyle = mtzGrad;
  ctx.fillRect(bedLeft, mtzY - 18, bedW, 36);

  ctx.beginPath();
  ctx.setLineDash([5, 4]);
  ctx.moveTo(bedLeft, mtzY);
  ctx.lineTo(bedLeft + bedW, mtzY);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Zone Divider Line (Alumina vs Molecular Sieve) & Support Screens
  ctx.beginPath();
  ctx.moveTo(bedLeft, h2oZoneTop);
  ctx.lineTo(bedLeft + bedW, h2oZoneTop);
  ctx.strokeStyle = PALETTE.materialStroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Rising gas molecules inside Vessel A:
  // - Cyan particles (N2/O2) traverse all the way from bottom (635) to top outlet (300)
  // - H2O particles (Gold-ringed blue) get trapped in the lower alumina layer (490..615)
  // - CO2 particles (Violet) get trapped in the middle molecular sieve layer (400..490)
  for (let pIdx = 0; pIdx < 24; pIdx++) {
    const lane = (pIdx % 6) / 5;
    const px = lerp(bedLeft + 14, bedLeft + bedW - 14, lane) + Math.sin(frame * 0.08 + pIdx) * 3;
    const cycle = (frame * 0.014 + pIdx * 0.13) % 1;

    if (pIdx % 3 === 0) {
      // Primary N2 / O2 carrier gas (Cyan #00E5FF) -> passes unimpeded to top outlet
      const py = lerp(640, 305, cycle);
      ctx.beginPath();
      ctx.arc(px, py, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.cyan;
      ctx.fill();
    } else if (pIdx % 3 === 1) {
      // H2O vapor molecule -> enters at bottom, decelerates and binds in Lower Alumina Zone
      const trapY = lerp(605, 505, (pIdx % 5) / 4);
      const py = lerp(640, trapY, smoothstep(0, 0.65, cycle));
      const boundAlpha = cycle > 0.65 ? 1 - (cycle - 0.65) / 0.35 : 1;
      ctx.save();
      ctx.globalAlpha = boundAlpha;
      ctx.beginPath();
      ctx.arc(px, py, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.h2oTag;
      ctx.fill();
      ctx.strokeStyle = PALETTE.gold; // Heat of adsorption release on binding
      ctx.lineWidth = cycle > 0.55 ? 1.5 : 0.6;
      ctx.stroke();
      ctx.restore();
    } else {
      // CO2 molecule (Violet #9D4EDD) -> passes through lower zone, gets trapped in Upper Zeolite 13X Zone
      const trapY = lerp(480, 395, (pIdx % 4) / 3);
      const py = lerp(640, trapY, smoothstep(0, 0.78, cycle));
      const boundAlpha = cycle > 0.78 ? 1 - (cycle - 0.78) / 0.22 : 1;
      ctx.save();
      ctx.globalAlpha = boundAlpha;
      ctx.beginPath();
      ctx.rect(px - 3.2, py - 3.2, 6.4, 6.4);
      ctx.fillStyle = PALETTE.violet;
      ctx.fill();
      ctx.strokeStyle = '#E9D5FF';
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Vessel A Header Badge
  ctx.font = '700 12px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.textBright;
  ctx.textAlign = 'center';
  ctx.fillText('VESSEL A (ONLINE)', vAcx, vAy - 22);
  ctx.font = '600 9.5px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.cyan;
  ctx.fillText('STATE: ADSORBING FEED', vAcx, vAy - 9);

  ctx.restore();

  // Act II Specific Sectional Callouts (Frames 150–299 or when labels active)
  const act2CalloutAlpha =
    act.id === 2
      ? smoothstep(155, 180, frame) * (1 - smoothstep(280, 299, frame))
      : options.showLabels
        ? 0.72
        : 0;

  if (act2CalloutAlpha > 0.05) {
    drawCallout(
      ctx,
      vAx + 28,
      560,
      vAx - 38,
      565,
      'STAGE 1: GRADED ALUMINA / DESICCANT',
      'Bulk & trace H₂O(g) trapped first (+ΔH_ads)',
      PALETTE.cyan,
      'right',
      act2CalloutAlpha
    );
    drawCallout(
      ctx,
      vAx + 28,
      435,
      vAx - 38,
      435,
      'STAGE 2: MOLECULAR SIEVE (13X ZEOLITE)',
      'Selective CO₂ & trace C₂H₂ capture',
      PALETTE.violet,
      'right',
      act2CalloutAlpha
    );
    drawCallout(
      ctx,
      vAx + vAw - 18,
      mtzY,
      vAx + vAw + 28,
      mtzY,
      'ACTIVE MASS TRANSFER ZONE (MTZ)',
      'Moving adsorption wavefront & thermal pulse',
      PALETTE.gold,
      'left',
      act2CalloutAlpha
    );
    drawCallout(
      ctx,
      vAcx,
      325,
      vAx - 38,
      325,
      'GUARD ZONE & TOP SCREEN',
      'Prevents CO₂ breakthrough prior to bed switch',
      PALETTE.cyan,
      'right',
      act2CalloutAlpha
    );
  }

  // ============================================================================
  // SECTION D: ADSORBENT VESSEL B — REGENERATION STATE (X: 660..820, Y: 295..660)
  // ============================================================================
  const vBx = 660;
  const vBy = 295;
  const vBw = 160;
  const vBh = 365;
  const vBcx = vBx + vBw / 2; // 740

  ctx.save();
  ctx.globalAlpha = surroundingAlpha;

  // Isometric 3D back-shell
  drawIsoVesselCap(
    ctx,
    vBcx + isoDx * 0.45,
    vBy + isoDy * 0.45,
    vBw / 2,
    24,
    PALETTE.materialDark,
    PALETTE.materialStroke,
    1.5
  );
  drawRoundedRect(
    ctx,
    vBx + isoDx * 0.45,
    vBy + isoDy * 0.45,
    vBw,
    vBh,
    22
  );
  ctx.fillStyle = '#151E2C';
  ctx.fill();

  // Vessel B Body
  drawIsoVesselCap(
    ctx,
    vBcx,
    vBy + vBh - 12,
    vBw / 2,
    24,
    PALETTE.materialBase,
    PALETTE.gold,
    1.8
  );

  drawRoundedRect(ctx, vBx, vBy, vBw, vBh, 20);
  ctx.fillStyle = '#121A28';
  ctx.fill();
  ctx.strokeStyle =
    act.id === 4 || options.highlightedNode === 'vessel-b'
      ? PALETTE.gold
      : PALETTE.materialStroke;
  ctx.lineWidth = act.id === 4 ? 3 : 2.2;
  ctx.stroke();

  drawIsoVesselCap(
    ctx,
    vBcx,
    vBy + 12,
    vBw / 2,
    22,
    '#1A2536',
    PALETTE.gold,
    1.8
  );

  // Vessel B Packed Bed with Counter-Current Thermal Desorption Wave (Gold #FFD166)
  const bBedLeft = vBx + 12;
  const bBedW = vBw - 24;
  const regenWaveY = lerp(co2ZoneTop, h2oZoneBottom, state.vesselBTempPulse);

  const regenGrad = ctx.createLinearGradient(0, co2ZoneTop, 0, h2oZoneBottom);
  regenGrad.addColorStop(0, 'rgba(255, 209, 102, 0.42)');
  regenGrad.addColorStop(clamp(state.vesselBTempPulse, 0.15, 0.9), 'rgba(255, 209, 102, 0.24)');
  regenGrad.addColorStop(1, 'rgba(157, 78, 221, 0.20)');
  ctx.fillStyle = regenGrad;
  ctx.fillRect(bBedLeft, co2ZoneTop, bBedW, h2oZoneBottom - co2ZoneTop);

  // Packed beads in Vessel B being stripped of CO2 and H2O
  for (let r = 0; r < beadRows; r++) {
    const rowY = h2oZoneBottom - (r + 0.5) * cellH;
    const isHeated = rowY <= regenWaveY + 25;
    for (let c = 0; c < beadCols; c++) {
      const stagger = r % 2 === 0 ? 0 : cellW * 0.25;
      const colX = bBedLeft + (c + 0.4) * cellW + stagger;
      if (colX > bBedLeft + bBedW - 4) continue;
      ctx.beginPath();
      ctx.arc(colX, rowY, 3.3, 0, Math.PI * 2);
      ctx.fillStyle = isHeated ? 'rgba(255, 209, 102, 0.55)' : PALETTE.materialBase;
      ctx.strokeStyle = isHeated ? PALETTE.gold : PALETTE.materialLight;
      ctx.lineWidth = 0.8;
      ctx.fill();
      ctx.stroke();
    }
  }

  // Counter-current downward purge arrows + desorbed H2O/CO2 escaping out the bottom vent
  for (let pIdx = 0; pIdx < 20; pIdx++) {
    const lane = (pIdx % 5) / 4;
    const px = lerp(bBedLeft + 16, bBedLeft + bBedW - 16, lane);
    const cycle = (frame * 0.016 + pIdx * 0.15) % 1;
    // Moves TOP (310) -> BOTTOM (655) during counter-current purge
    const py = lerp(315, 655, cycle);

    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    // Gold purge energy + stripped Violet CO2 + Blue H2O exiting bottom
    ctx.fillStyle =
      pIdx % 3 === 0 ? PALETTE.gold : pIdx % 3 === 1 ? PALETTE.violet : PALETTE.h2oTag;
    ctx.fill();
  }

  // Vessel B Header Badge
  ctx.font = '700 12px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.textBright;
  ctx.textAlign = 'center';
  ctx.fillText('VESSEL B (REGEN / STANDBY)', vBcx, vBy - 22);
  ctx.font = '600 9.5px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText(`PHASE: ${state.vesselBRegenPhase}`, vBcx, vBy - 9);

  // Regeneration Heater & Waste Nitrogen Purge Loop (X: 845..985, Y: 320..475)
  const htrX = 855;
  const htrY = 335;
  const htrW = 125;
  const htrH = 115;

  drawRoundedRect(ctx, htrX, htrY, htrW, htrH, 8);
  ctx.fillStyle = PALETTE.materialDark;
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Electric / Steam Heating Elements inside Regeneration Heater (Gold #FFD166)
  ctx.beginPath();
  ctx.moveTo(htrX + 18, htrY + 48);
  for (let s = 0; s < 6; s++) {
    ctx.lineTo(htrX + 26 + s * 15, s % 2 === 0 ? htrY + 34 : htrY + 72);
  }
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  ctx.font = '700 10px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.textBright;
  ctx.textAlign = 'left';
  ctx.fillText('REGEN HEATER', htrX + 12, htrY + 18);
  ctx.font = '500 8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText('INPUT: +Q̇_desorb', htrX + 12, htrY + 92);
  ctx.fillStyle = PALETTE.textMuted;
  ctx.fillText('DRY WASTE N₂ PURGE', htrX + 12, htrY + 105);

  // Pipe from Cold Box Waste N2 return -> Regen Heater -> Vessel B Top
  ctx.beginPath();
  ctx.moveTo(1100, 360);
  ctx.lineTo(htrX + htrW, 360);
  ctx.moveTo(htrX, 360);
  ctx.lineTo(vBcx, 360);
  ctx.lineTo(vBcx, vBy);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 3;
  ctx.setLineDash([7, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Bottom Desorption Vent Manifold from Vessel B -> Atmosphere / Silencer
  ctx.beginPath();
  ctx.moveTo(vBcx, vBy + vBh);
  ctx.lineTo(vBcx, 770);
  ctx.lineTo(940, 770);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 3.2;
  ctx.stroke();

  ctx.font = '600 9.5px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.gold;
  ctx.textAlign = 'left';
  ctx.fillText('REGEN EXHAUST VENT (H₂O + CO₂ + N₂ PURGE LOSS)', 755, 790);

  ctx.restore();

  // ============================================================================
  // SECTION E: PURIFIED FEED HEADER, AFTERFILTER & ANALYZER (Act III Focus)
  // ============================================================================
  ctx.save();
  ctx.globalAlpha = surroundingAlpha;

  // Outlet pipe from Vessel A top (470, 295) -> Header (Y: 215) -> Particulate Afterfilter (885, 215) -> Cold Box (1100, 260)
  ctx.beginPath();
  ctx.moveTo(vAcx, vAy);
  ctx.lineTo(vAcx, 215);
  ctx.lineTo(1100, 215);
  ctx.lineTo(1100, 285);
  ctx.strokeStyle = PALETTE.materialBase;
  ctx.lineWidth = 12;
  ctx.stroke();

  // Cyan Primary Transport Signal Overlay inside Purified Pipe
  ctx.beginPath();
  ctx.moveTo(vAcx, vAy);
  ctx.lineTo(vAcx, 215);
  ctx.lineTo(1100, 215);
  ctx.lineTo(1100, 285);
  ctx.strokeStyle = PALETTE.cyan;
  ctx.lineWidth = act.id === 3 ? 5.5 : 3.8;
  ctx.stroke();

  // Deterministic Purified Gas Particles (Strictly Cyan #00E5FF — zero H2O/CO2)
  for (let i = 0; i < 18; i++) {
    const t = (frame * 0.014 + i / 18) % 1;
    let px = vAcx;
    let py = vAy;
    if (t < 0.12) {
      px = vAcx;
      py = lerp(vAy, 215, t / 0.12);
    } else if (t < 0.9) {
      px = lerp(vAcx, 1100, (t - 0.12) / 0.78);
      py = 215;
    } else {
      px = 1100;
      py = lerp(215, 285, (t - 0.9) / 0.1);
    }
    ctx.beginPath();
    ctx.arc(px, py, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.cyan;
    ctx.fill();
  }

  // Particulate Afterfilter Vessel (X: 895, Y: 182)
  drawRoundedRect(ctx, 895, 180, 95, 72, 8);
  ctx.fillStyle = PALETTE.materialDark;
  ctx.fill();
  ctx.strokeStyle = PALETTE.cyan;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Filter pleats
  for (let f = 0; f < 5; f++) {
    ctx.beginPath();
    ctx.moveTo(912 + f * 14, 195);
    ctx.lineTo(912 + f * 14, 236);
    ctx.strokeStyle = PALETTE.materialLight;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.font = '700 9.5px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.textBright;
  ctx.textAlign = 'center';
  ctx.fillText('DUST FILTER', 942, 172);

  // Control & Telemetry Interlock Console (Violet #9D4EDD Overlay)
  const ctrlX = 565;
  const ctrlY = 115;
  const ctrlW = 290;
  const ctrlH = 74;

  drawRoundedRect(ctx, ctrlX, ctrlY, ctrlW, ctrlH, 8);
  ctx.fillStyle = 'rgba(16, 24, 38, 0.94)';
  ctx.fill();
  ctx.strokeStyle = PALETTE.violet;
  ctx.lineWidth = act.id === 3 ? 2.5 : 1.6;
  ctx.stroke();

  ctx.font = '700 10.5px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.violet;
  ctx.textAlign = 'left';
  ctx.fillText('CONTROL & PURITY INTERLOCK (VIOLET OVERLAY)', ctrlX + 12, ctrlY + 18);

  ctx.font = '500 9px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.textBright;
  ctx.fillText('AI-201 (Trace CO₂ / Dewpoint): WITHIN SPEC', ctrlX + 12, ctrlY + 36);
  ctx.fillText('PDI-202 (Bed ΔP Loss): MONITORED (NON-ZERO)', ctrlX + 12, ctrlY + 51);
  ctx.fillStyle = PALETTE.cyan;
  ctx.fillText('INTERLOCK STATE: PERMIT COLD-BOX ADMISSION', ctrlX + 12, ctrlY + 65);

  // Dashed Violet signal lines from Analyzer & Valves to Control Console
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  // Analyzer tap at (830, 215)
  ctx.moveTo(830, 215);
  ctx.lineTo(830, 152);
  ctx.lineTo(ctrlX + ctrlW, 152);
  // ΔP tap from Vessel A
  ctx.moveTo(vAx + vAw, 340);
  ctx.lineTo(605, 340);
  ctx.lineTo(605, ctrlY + ctrlH);
  // Valve actuation bus to KV-101/201
  ctx.moveTo(ctrlX + 40, ctrlY + ctrlH);
  ctx.lineTo(ctrlX + 40, 250);
  ctx.strokeStyle = PALETTE.violet;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);

  // Switching Valves with State Overlays
  drawValve(ctx, 470, 692, 'KV-101', state.valves.KV101_feedA, 'V', surroundingAlpha);
  drawValve(ctx, 740, 692, 'KV-102', state.valves.KV102_feedB, 'V', surroundingAlpha);
  drawValve(ctx, 525, 215, 'KV-201', state.valves.KV201_outA, 'H', surroundingAlpha);
  drawValve(ctx, 845, 360, 'KV-301', state.valves.KV301_regenInB, 'H', surroundingAlpha);
  drawValve(ctx, 795, 770, 'KV-302', state.valves.KV302_ventB, 'H', surroundingAlpha);

  ctx.restore();

  // ============================================================================
  // SECTION F: DOWNSTREAM CRYOGENIC COLD BOX (BAHX & DISTILLATION COLUMN)
  // ============================================================================
  const cbX = 1070;
  const cbY = 165;
  const cbW = 445;
  const cbH = 615;

  ctx.save();
  ctx.globalAlpha = surroundingAlpha;

  // Isometric 3D shadow housing for Cold Box
  drawRoundedRect(ctx, cbX + isoDx * 0.5, cbY + isoDy * 0.5, cbW, cbH, 12);
  ctx.fillStyle = '#0D1420';
  ctx.fill();

  // Insulated Cold Box Outer Casing
  drawRoundedRect(ctx, cbX, cbY, cbW, cbH, 12);
  ctx.fillStyle = '#131D2D';
  ctx.fill();
  ctx.strokeStyle =
    act.id === 5 || options.highlightedNode === 'cold-box'
      ? PALETTE.cyan
      : PALETTE.materialStroke;
  ctx.lineWidth = act.id === 5 ? 3 : 2.2;
  ctx.stroke();

  ctx.font = '700 13px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.textBright;
  ctx.textAlign = 'left';
  ctx.fillText('DOWNSTREAM CRYOGENIC COLD BOX (PROTECTED)', cbX + 18, cbY + 26);

  ctx.font = '500 9.5px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.cyan;
  ctx.fillText('REF: AIR PRODUCTS CRYOGENIC AIR SEPARATION ARCHITECTURE', cbX + 18, cbY + 42);

  // Cold Box Internals:
  // 1. Primary Heat Exchanger (BAHX — Brazed Aluminum Plate-Fin Micro-Passages)
  const bahxX = cbX + 26;
  const bahxY = cbY + 78;
  const bahxW = 165;
  const bahxH = 310;

  drawRoundedRect(ctx, bahxX, bahxY, bahxW, bahxH, 6);
  ctx.fillStyle = PALETTE.materialDark;
  ctx.fill();
  ctx.strokeStyle = PALETTE.cyan;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // BAHX Micro-Fin Passages (Protected from H2O ice & CO2 dry-ice plugging)
  const finCount = 11;
  for (let f = 1; f < finCount; f++) {
    const fx = bahxX + (f * bahxW) / finCount;
    ctx.beginPath();
    ctx.moveTo(fx, bahxY + 26);
    ctx.lineTo(fx, bahxY + bahxH - 18);
    ctx.strokeStyle = f % 2 === 0 ? 'rgba(0, 229, 255, 0.45)' : 'rgba(100, 121, 150, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Smooth purified feed particles descending through BAHX micro-channels
  for (let m = 0; m < 15; m++) {
    const col = m % 5;
    const fx = bahxX + 22 + col * 30;
    const fy = lerp(bahxY + 30, bahxY + bahxH - 22, (frame * 0.015 + m * 0.17) % 1);
    ctx.beginPath();
    ctx.arc(fx, fy, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.cyan;
    ctx.fill();
  }

  ctx.font = '700 10.5px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.textBright;
  ctx.fillText('PRIMARY HEAT EXCHANGER', bahxX + 10, bahxY + 18);
  ctx.font = '500 8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.cyan;
  ctx.fillText('Micro-passages clear of solid', bahxX + 10, bahxY + bahxH + 16);
  ctx.fillText('H₂O ice / CO₂ dry-ice freeze-out', bahxX + 10, bahxY + bahxH + 28);

  // Turboexpander / Cryogenic Expansion Module (Energy extraction in Gold)
  const expX = bahxX + 18;
  const expY = bahxY + bahxH + 54;
  drawRoundedRect(ctx, expX, expY, 130, 68, 6);
  ctx.fillStyle = PALETTE.materialBase;
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '700 9.5px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText('EXPANDER / REFRIGERATION', expX + 8, expY + 18);
  ctx.font = '500 8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.textMuted;
  ctx.fillText('High-speed rotor protected', expX + 8, expY + 34);
  ctx.fillText('from solid particle erosion', expX + 8, expY + 47);

  // 2. Cryogenic Distillation Column + Main Condenser/Reboiler (X: cbX + 235)
  const colX = cbX + 245;
  const colY = cbY + 72;
  const colW = 155;
  const colH = 445;

  drawIsoVesselCap(ctx, colX + colW / 2, colY + colH - 10, colW / 2, 18, PALETTE.materialBase, PALETTE.cyan, 1.5);
  drawRoundedRect(ctx, colX, colY, colW, colH, 24);
  ctx.fillStyle = '#0F1826';
  ctx.fill();
  ctx.strokeStyle = PALETTE.cyan;
  ctx.lineWidth = 2;
  ctx.stroke();
  drawIsoVesselCap(ctx, colX + colW / 2, colY + 10, colW / 2, 18, '#19263B', PALETTE.cyan, 1.5);

  // Structured packing / distillation sieve trays inside column
  for (let tray = 0; tray < 9; tray++) {
    const ty = colY + 58 + tray * 38;
    ctx.beginPath();
    ctx.moveTo(colX + 14, ty);
    ctx.lineTo(colX + colW - 14, ty);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.32)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  // Cryogenic liquid pool at bottom of distillation column
  ctx.fillStyle = 'rgba(0, 229, 255, 0.28)';
  ctx.fillRect(colX + 10, colY + colH - 68, colW - 20, 52);

  // Connection from BAHX bottom to Column bottom feed
  ctx.beginPath();
  ctx.moveTo(bahxX + bahxW, bahxY + bahxH - 30);
  ctx.lineTo(colX, bahxY + bahxH - 30);
  ctx.strokeStyle = PALETTE.cyan;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // High-Purity Product Nitrogen Outlet at Top of Column
  ctx.beginPath();
  ctx.moveTo(colX + colW / 2, colY);
  ctx.lineTo(colX + colW / 2, cbY + 52);
  ctx.lineTo(cbX + cbW + 25, cbY + 52);
  ctx.strokeStyle = PALETTE.cyan;
  ctx.lineWidth = 4.5;
  ctx.stroke();

  ctx.font = '700 10.5px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.textBright;
  ctx.fillText('DISTILLATION COLUMN', colX + 14, colY + 34);
  ctx.font = '600 9px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.cyan;
  ctx.fillText('PRODUCT: HIGH-PURITY N₂', colX + 14, cbY + 64);

  // Visible Losses, Limits & Uncertainty Ledger inside Cold Box Bottom (Act V Requirement)
  const limX = cbX + 22;
  const limY = cbY + 532;
  const limW = cbW - 44;
  const limH = 68;

  drawRoundedRect(ctx, limX, limY, limW, limH, 6);
  ctx.fillStyle = 'rgba(157, 78, 221, 0.12)';
  ctx.fill();
  ctx.strokeStyle = PALETTE.violet;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.font = '700 9.5px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.violet;
  ctx.fillText('RETAINED SYSTEM LOSSES, LIMITS & UNCERTAINTY', limX + 10, limY + 16);
  ctx.font = '500 8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.textBright;
  ctx.fillText(
    '• ΔP Loss across PPU beds + afterfilter | Purge waste N₂ fraction consumed in regen',
    limX + 10,
    limY + 33
  );
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText(
    '• LIMIT: Adsorbents & cycles vary. No regeneration recipe or 100% removal guarantee.',
    limX + 10,
    limY + 48
  );
  ctx.fillStyle = PALETTE.textMuted;
  ctx.fillText(
    '• UNCERTAINTY: Feed humidity/CO₂ spikes shift MTZ breakthrough margin (see plot).',
    limX + 10,
    limY + 61
  );

  ctx.restore();

  // ============================================================================
  // SECTION G: ACT IV QUALITATIVE REGENERATION INSET (Frames 510–749)
  // ============================================================================
  if (camera.insetRegenOpacity > 0.02) {
    ctx.save();
    ctx.globalAlpha = camera.insetRegenOpacity;

    const insX = 835;
    const insY = 485;
    const insW = 295;
    const insH = 215;

    drawRoundedRect(ctx, insX, insY, insW, insH, 10);
    ctx.fillStyle = 'rgba(11, 16, 25, 0.96)';
    ctx.fill();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '700 11px "Space Grotesk", sans-serif';
    ctx.fillStyle = PALETTE.gold;
    ctx.textAlign = 'left';
    ctx.fillText('QUALITATIVE INSET: THERMAL REGEN CYCLE', insX + 14, insY + 20);

    ctx.font = '500 8.5px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.textMuted;
    ctx.fillText('MATHEMATICAL DIAGRAM (NON-EMPIRICAL / NO RECIPE)', insX + 14, insY + 34);

    // Plot Axes inside Inset
    const px0 = insX + 38;
    const py0 = insY + 165;
    const pw = insW - 56;
    const ph = 112;

    ctx.beginPath();
    ctx.moveTo(px0, py0 - ph);
    ctx.lineTo(px0, py0);
    ctx.lineTo(px0 + pw, py0);
    ctx.strokeStyle = PALETTE.materialStroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Qualitative Thermal Pulse Curve (Gold #FFD166)
    ctx.beginPath();
    for (let s = 0; s <= 40; s++) {
      const u = s / 40;
      const x = px0 + u * pw;
      const thermalBell = Math.exp(-Math.pow((u - 0.38) / 0.22, 2));
      const y = py0 - thermalBell * (ph - 16);
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Qualitative Desorbed Contaminant Elution Curve (Violet #9D4EDD) with Uncertainty Band
    if (options.showUncertaintyBands) {
      ctx.beginPath();
      for (let s = 0; s <= 40; s++) {
        const u = s / 40;
        const x = px0 + u * pw;
        const elute = Math.exp(-Math.pow((u - 0.48) / 0.24, 2)) * 0.85;
        const y = py0 - (elute + 0.1) * (ph - 16);
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let s = 40; s >= 0; s--) {
        const u = s / 40;
        const x = px0 + u * pw;
        const elute = Math.exp(-Math.pow((u - 0.48) / 0.24, 2)) * 0.85;
        const y = py0 - Math.max(0, elute - 0.1) * (ph - 16);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(157, 78, 221, 0.20)';
      ctx.fill();
    }

    ctx.beginPath();
    for (let s = 0; s <= 40; s++) {
      const u = s / 40;
      const x = px0 + u * pw;
      const elute = Math.exp(-Math.pow((u - 0.48) / 0.24, 2)) * 0.85;
      const y = py0 - elute * (ph - 16);
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = PALETTE.violet;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current Frame Playhead Marker inside Act IV Inset
    const act4Cursor = clamp((frame - 510) / (749 - 510), 0, 1);
    const cursorX = px0 + act4Cursor * pw;
    ctx.beginPath();
    ctx.moveTo(cursorX, py0 - ph);
    ctx.lineTo(cursorX, py0);
    ctx.strokeStyle = PALETTE.cyan;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Legend labels inside inset
    ctx.font = '500 8.5px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.gold;
    ctx.fillText('— Heater Thermal Pulse (T_regen)', px0, insY + 185);
    ctx.fillStyle = PALETTE.violet;
    ctx.fillText('— Desorbed H₂O/CO₂ Vent Flux (±band)', px0, insY + 199);

    ctx.restore();
  }

  ctx.restore(); // End Camera Transform

  // ============================================================================
  // SECTION H: SCREEN-SPACE HUD OVERLAYS (DETERMINISTIC FRAME LOCKED)
  // ============================================================================

  // 1. Top-Left Act & Timecode Telemetry Banner
  ctx.save();
  drawRoundedRect(ctx, 24, 20, 620, 78, 8);
  ctx.fillStyle = 'rgba(11, 16, 25, 0.90)';
  ctx.fill();
  ctx.strokeStyle = PALETTE.materialStroke;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Act Badge
  drawRoundedRect(ctx, 36, 32, 82, 24, 4);
  ctx.fillStyle = PALETTE.cyanSoft;
  ctx.fill();
  ctx.strokeStyle = PALETTE.cyan;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.cyan;
  ctx.textAlign = 'center';
  ctx.fillText(`ACT 0${act.id} / 05`, 77, 48);

  ctx.textAlign = 'left';
  ctx.font = '700 14px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.textBright;
  ctx.fillText(act.title, 130, 48);

  ctx.font = '500 10.5px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.textMuted;
  ctx.fillText(
    `FRAME: ${String(frame).padStart(4, '0')} / 1019  |  TIME: ${state.timeSeconds.toFixed(2)}s / 34.00s @ 30 FPS  |  CAM ZOOM: ${camera.zoom.toFixed(2)}×`,
    36,
    78
  );
  ctx.restore();

  // 2. Top-Right Scale, Slow-Motion, and Time-Compression Disclosure Badges
  ctx.save();
  const badges = act.scaleDisclosures;
  badges.forEach((badgeText, idx) => {
    const bw = 465;
    const bh = 28;
    const bx = STAGE_W - bw - 24;
    const by = 20 + idx * 34;

    drawRoundedRect(ctx, bx, by, bw, bh, 5);
    ctx.fillStyle = 'rgba(16, 24, 38, 0.90)';
    ctx.fill();
    ctx.strokeStyle = idx === 0 ? PALETTE.gold : PALETTE.violet;
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.font = '600 9.5px "JetBrains Mono", monospace';
    ctx.fillStyle = idx === 0 ? PALETTE.gold : '#D8B4FE';
    ctx.textAlign = 'left';
    ctx.fillText(badgeText, bx + 12, by + 18);
  });
  ctx.restore();

  // 3. Bottom-Left Mass, Pressure & Energy Accounting Bar
  if (options.showAccountingOverlay) {
    ctx.save();
    const accX = 24;
    const accY = STAGE_H - 96;
    const accW = 910;
    const accH = 74;

    drawRoundedRect(ctx, accX, accY, accW, accH, 8);
    ctx.fillStyle = 'rgba(11, 16, 25, 0.92)';
    ctx.fill();
    ctx.strokeStyle = PALETTE.materialStroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = '700 10.5px "Space Grotesk", sans-serif';
    ctx.fillStyle = PALETTE.gold;
    ctx.textAlign = 'left';
    ctx.fillText(
      'CONSERVATION & ACCOUNTING LEDGER (MASS / ENERGY / SIGNAL OVERLAYS)',
      accX + 14,
      accY + 20
    );

    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.textBright;
    ctx.fillText(act.accountingFocus, accX + 14, accY + 40);

    // Color semantics key inline
    ctx.fillStyle = PALETTE.cyan;
    ctx.fillText('● CYAN (#00E5FF): Primary Transport / Dry Feed', accX + 14, accY + 60);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillText('● GOLD (#FFD166): Energy / Thermal Actuation', accX + 315, accY + 60);
    ctx.fillStyle = PALETTE.violet;
    ctx.fillText('● VIOLET (#9D4EDD): Control State / Adsorbed CO₂ / Uncertainty', accX + 595, accY + 60);

    ctx.restore();
  }

  // 4. Bottom-Right Qualitative Mathematical Breakthrough & Loss Diagram
  ctx.save();
  const diagX = 955;
  const diagY = STAGE_H - 150;
  const diagW = 621;
  const diagH = 128;

  drawRoundedRect(ctx, diagX, diagY, diagW, diagH, 8);
  ctx.fillStyle = 'rgba(11, 16, 25, 0.92)';
  ctx.fill();
  ctx.strokeStyle = PALETTE.materialStroke;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.font = '700 10.5px "Space Grotesk", sans-serif';
  ctx.fillStyle = PALETTE.textBright;
  ctx.textAlign = 'left';
  ctx.fillText(
    'QUALITATIVE MATHEMATICAL DIAGRAM: AXIAL BED FRONT & BREAKTHROUGH MARGIN',
    diagX + 14,
    diagY + 18
  );

  ctx.font = '500 8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.textMuted;
  ctx.fillText(
    'Non-empirical conceptual profiles | Shaded envelope = feed-variability uncertainty band',
    diagX + 14,
    diagY + 32
  );

  // Mini axial bed graph (X: Axial position z/L from Inlet 0 to Outlet 1)
  const gx = diagX + 46;
  const gy = diagY + 106;
  const gw = 335;
  const gh = 62;

  ctx.beginPath();
  ctx.moveTo(gx, gy - gh);
  ctx.lineTo(gx, gy);
  ctx.lineTo(gx + gw, gy);
  ctx.strokeStyle = PALETTE.materialLight;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Uncertainty band around CO2 Mass Transfer Zone front
  const frontCenter = state.vesselAMTZPosition;
  const bandHalf = state.uncertaintyBandWidth * 0.45;

  if (options.showUncertaintyBands) {
    ctx.beginPath();
    for (let i = 0; i <= 50; i++) {
      const z = i / 50;
      const x = gx + z * gw;
      const cUpper = 1 / (1 + Math.exp((z - (frontCenter + bandHalf)) * 14));
      const y = gy - cUpper * (gh - 8);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = 50; i >= 0; i--) {
      const z = i / 50;
      const x = gx + z * gw;
      const cLower = 1 / (1 + Math.exp((z - (frontCenter - bandHalf)) * 14));
      const y = gy - cLower * (gh - 8);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(157, 78, 221, 0.24)';
    ctx.fill();
  }

  // H2O Sigmoidal Front (Lower Bed)
  ctx.beginPath();
  for (let i = 0; i <= 50; i++) {
    const z = i / 50;
    const x = gx + z * gw;
    const cH2O = 1 / (1 + Math.exp((z - frontCenter * 0.62) * 18));
    const y = gy - cH2O * (gh - 8);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = PALETTE.cyan;
  ctx.lineWidth = 2;
  ctx.stroke();

  // CO2 Sigmoidal Front (Upper Bed)
  ctx.beginPath();
  for (let i = 0; i <= 50; i++) {
    const z = i / 50;
    const x = gx + z * gw;
    const cCO2 = 1 / (1 + Math.exp((z - frontCenter) * 14));
    const y = gy - cCO2 * (gh - 8);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = PALETTE.violet;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Outlet guard line at z/L = 0.92
  const guardX = gx + 0.92 * gw;
  ctx.beginPath();
  ctx.setLineDash([3, 3]);
  ctx.moveTo(guardX, gy - gh);
  ctx.lineTo(guardX, gy);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = '500 8px "JetBrains Mono", monospace';
  ctx.fillStyle = PALETTE.textMuted;
  ctx.fillText('z/L=0 (Inlet)', gx, gy + 14);
  ctx.fillText('z/L=1 (Cold Box Guard)', gx + gw - 105, gy + 14);

  // Right side of diagram card: Qualitative Bars for Losses & Safety Margin
  const barX = diagX + 402;
  const barW = 200;

  const drawQualBar = (
    y: number,
    label: string,
    val: number,
    color: string
  ) => {
    ctx.font = '500 8.5px "JetBrains Mono", monospace';
    ctx.fillStyle = PALETTE.textBright;
    ctx.fillText(label, barX, y);
    drawRoundedRect(ctx, barX, y + 4, barW, 8, 3);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    drawRoundedRect(ctx, barX, y + 4, barW * clamp(val, 0.05, 1), 8, 3);
    ctx.fillStyle = color;
    ctx.fill();
  };

  drawQualBar(diagY + 46, 'Cold-Box Freeze Protection Margin', state.coldBoxSafetyMargin, PALETTE.cyan);
  drawQualBar(diagY + 72, 'Packed-Bed ΔP Friction Loss', state.bedDeltaPNormalized, PALETTE.gold);
  drawQualBar(diagY + 98, 'Breakthrough Uncertainty Envelope', state.uncertaintyBandWidth * 2.4, PALETTE.violet);

  ctx.restore();

  ctx.restore(); // End root scale
}
