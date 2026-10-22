/**
 * Deterministic 1,020-Frame (34.00s @ 30fps) Simulation & Camera State Engine
 * Vertical: Industrial Gases & Cryogenics — Cryogenic Feed Purification (PPU)
 *
 * Reference Scope:
 * Conceptual schematic based on Air Products cryogenic air separation process architecture.
 * All plots, particle trajectories, valve timings, and thermal fronts are qualitative
 * mathematical diagrams, not experimentally validated observations or certified vendor recipes.
 */

export const FPS = 30;
export const DURATION_SECONDS = 34;
export const TOTAL_FRAMES = 1020; // Indexed 0..1019

export type ActId = 1 | 2 | 3 | 4 | 5;

export interface ActDefinition {
  id: ActId;
  title: string;
  shortTitle: string;
  startFrame: number;
  endFrame: number;
  timeRangeLabel: string;
  cameraDirective: string;
  mechanismFocus: string;
  scaleDisclosures: string[];
  accountingFocus: string;
}

export const ACTS: ActDefinition[] = [
  {
    id: 1,
    title: 'Act I — Upstream Pre-Purification Assembly',
    shortTitle: 'I. Assembly & Push',
    startFrame: 0,
    endFrame: 149,
    timeRangeLabel: '0.0s – 5.0s (Frames 0–149)',
    cameraDirective:
      'Reveal abstract adsorbent vessels upstream of cold box. Establish the full assembly, then make a measured three-quarter push toward the active region.',
    mechanismFocus:
      'Atmospheric air compressed and aftercooled enters the dual-bed Pre-Purification Unit (PPU) upstream of the insulated cryogenic cold box.',
    scaleDisclosures: [
      'GEOMETRY: Conceptual Orthographic & Isometric Cutaway',
      'PARTICLES: Slow-Motion Explanatory Overlay (Not Molecular Scale)',
    ],
    accountingFocus:
      'Feed Mass Entry: N₂ + O₂ + Ar bulk carrier + trace H₂O(g) + trace CO₂(g).',
  },
  {
    id: 2,
    title: 'Act II — Selective H₂O & CO₂ Adsorption Fronts',
    shortTitle: 'II. H₂O & CO₂ Removal',
    startFrame: 150,
    endFrame: 299,
    timeRangeLabel: '5.0s – 10.0s (Frames 150–299)',
    cameraDirective:
      'Remove selected water and CO₂. Use a sectional close-up and identify only the components required for this mechanism.',
    mechanismFocus:
      'Sectional cutaway of Vessel A (Online Adsorption). Graded desiccant/alumina lower zone traps moisture (H₂O) first; upper molecular-sieve zone captures carbon dioxide (CO₂) before the Mass Transfer Zone (MTZ) reaches the vessel outlet.',
    scaleDisclosures: [
      'SCALE CHANGE: 2.35× Sectional Close-Up on Vessel A Packed Bed',
      'TIME COMPRESSION: Multi-hour adsorption loading front compressed into 5s',
    ],
    accountingFocus:
      'Mass Accounting: ṁ_feed = ṁ_purified_gas + dm_adsorbed(H₂O, CO₂)/dt. Exothermic heat of adsorption (+ΔH_ads) warms the moving front.',
  },
  {
    id: 3,
    title: 'Act III — Purified Feed & Control Interlock Path',
    shortTitle: 'III. Purified Pathway',
    startFrame: 300,
    endFrame: 509,
    timeRangeLabel: '10.0s – 17.0s (Frames 300–509)',
    cameraDirective:
      'Track purified feed. Track the primary causal pathway, keeping inputs, outputs, and control overlays distinct.',
    mechanismFocus:
      'Contaminant-free dry air exits Vessel A top header, traverses the particulate afterfilter and outlet manifold (cyan), while differential-pressure and trace-CO₂ analyzer telemetry (violet) verify purity before cold-box admission.',
    scaleDisclosures: [
      'COLOR OVERLAY: Cyan (#00E5FF) = Primary Transport | Violet (#9D4EDD) = Control/State',
      'PLOT TYPE: Qualitative Mathematical Breakthrough Curve (Non-Empirical)',
    ],
    accountingFocus:
      'Pressure & Signal Accounting: ΔP_bed frictional loss across packed media; continuous analyzer interlock state = PERMIT_COLD_BOX_ENTRY.',
  },
  {
    id: 4,
    title: 'Act IV — Conceptual Thermal-Swing Regeneration',
    shortTitle: 'IV. Regeneration State',
    startFrame: 510,
    endFrame: 749,
    timeRangeLabel: '17.0s – 25.0s (Frames 510–749)',
    cameraDirective:
      'Show separate regeneration state conceptually. Follow the resulting response with readable labels and a separate qualitative inset if useful.',
    mechanismFocus:
      'While Vessel A remains online, Vessel B undergoes depressurization, heated dry waste-nitrogen purge (gold energy overlay), and cooling/repressurization so beds can alternate without interrupting downstream cryogenic flow.',
    scaleDisclosures: [
      'TIME COMPRESSION: Thermal pulse & cooling cycle compressed ~1,000:1',
      'TECHNICAL LIMIT: Adsorbents and cycles vary; no regeneration recipe claimed',
    ],
    accountingFocus:
      'Energy & Purge Accounting: Q̇_heater (Gold #FFD166) supplies desorption enthalpy (-ΔH_des) to strip bound CO₂ and H₂O into the waste vent stream.',
  },
  {
    id: 5,
    title: 'Act V — Downstream Cold-Box Freeze-Out Protection',
    shortTitle: 'V. Cold-Box Protection',
    startFrame: 750,
    endFrame: 1019,
    timeRangeLabel: '25.0s – 34.0s (Frames 750–1019)',
    cameraDirective:
      'Protect downstream low-temperature equipment. Pull back to a stable system overview; retain visible losses, limits, or uncertainty where relevant.',
    mechanismFocus:
      'Purified air enters the Brazed Aluminum Heat Exchanger (BAHX) micro-passages and cryogenic distillation column inside the cold box without ice or dry-ice plugging. Retains visible ΔP loss, purge gas overhead, and breakthrough uncertainty band.',
    scaleDisclosures: [
      'STABLE OVERVIEW: Full PPU + Cryogenic Cold Box System Architecture',
      'LIMITS RETAINED: No total contaminant-removal guarantee; visible ΔP & purge losses',
    ],
    accountingFocus:
      'System Balance: Feed = Product N₂ + Waste Regen Gas + Adsorbed Inventory; Energy = Compression + Regen Heater + Refrigeration Work + Irreversible Losses.',
  },
];

export interface CameraState {
  cx: number; // Focus X in 1600x900 stage coordinates
  cy: number; // Focus Y in 1600x900 stage coordinates
  zoom: number; // Zoom multiplier (1.0 = full 1600x900 stage)
  pitchDeg: number; // Subtle orthographic three-quarter pitch angle (degrees)
  yawDeg: number; // Subtle orthographic three-quarter yaw angle (degrees)
  isolateVesselA: number; // 0..1 opacity reduction for non-essential surroundings in Act II
  insetRegenOpacity: number; // 0..1 visibility of qualitative regeneration inset in Act IV
  coldBoxCutawayOpacity: number; // 0..1 visibility of BAHX & column internals in Act V
}

export interface ValveStates {
  KV101_feedA: 'OPEN' | 'CLOSED' | 'TRANSITION';
  KV102_feedB: 'OPEN' | 'CLOSED' | 'TRANSITION';
  KV201_outA: 'OPEN' | 'CLOSED' | 'TRANSITION';
  KV202_outB: 'OPEN' | 'CLOSED' | 'TRANSITION';
  KV301_regenInB: 'OPEN' | 'CLOSED' | 'MODULATING';
  KV302_ventB: 'OPEN' | 'CLOSED' | 'TRANSITION';
}

export interface QualitativeTelemetry {
  frame: number;
  timeSeconds: number;
  act: ActDefinition;
  actProgress: number; // 0..1 within current act
  overallProgress: number; // 0..1 across 0..1019
  camera: CameraState;
  valves: ValveStates;
  // Qualitative normalized curves (0..1, explicitly mathematical diagrams)
  vesselAH2OLoading: number; // Lower bed saturation fraction
  vesselACO2Loading: number; // Upper bed saturation fraction
  vesselAMTZPosition: number; // Normalized height of active mass transfer front (0 = bottom, 1 = top)
  vesselBRegenPhase: 'DEPRESSURIZE' | 'THERMAL_DESORB' | 'COOLING_STANDBY' | 'EQUALIZE';
  vesselBTempPulse: number; // 0..1 qualitative thermal front intensity
  vesselBDesorbedFlux: number; // 0..1 qualitative contaminant strip flux
  heaterDutyNormalized: number; // 0..1 Gold energy actuation
  bedDeltaPNormalized: number; // 0..1 qualitative pressure drop loss
  purgeLossFraction: number; // Qualitative fraction of dry gas consumed for regeneration
  uncertaintyBandWidth: number; // Qualitative breakthrough uncertainty band (0..1)
  coldBoxSafetyMargin: number; // Qualitative margin above freeze-out plugging threshold
}

export function clamp(val: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, val));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function getActForFrame(frame: number): ActDefinition {
  const f = clamp(Math.floor(frame), 0, TOTAL_FRAMES - 1);
  for (const act of ACTS) {
    if (f >= act.startFrame && f <= act.endFrame) {
      return act;
    }
  }
  return ACTS[ACTS.length - 1];
}

/**
 * Computes the complete deterministic state for any frame index 0..1019.
 * Zero randomness or time-dependent drift: f(frame) is a pure mathematical function.
 */
export function computeFrameState(rawFrame: number): QualitativeTelemetry {
  const frame = clamp(Math.floor(rawFrame), 0, TOTAL_FRAMES - 1);
  const timeSeconds = frame / FPS;
  const act = getActForFrame(frame);
  const actSpan = act.endFrame - act.startFrame + 1;
  const actProgress = clamp((frame - act.startFrame) / Math.max(1, actSpan - 1), 0, 1);
  const overallProgress = frame / (TOTAL_FRAMES - 1);

  // Camera Choreography across the 5 acts (Stage coordinate space: 1600 x 900)
  // Full overview center: (800, 450), zoom: 1.0
  // Vessel A active region center: (475, 470)
  // Purified header & analyzer manifold center: (735, 285)
  // Vessel B regeneration & heater loop center: (720, 495)
  // Cold box + full overview center: (830, 445)
  let cx = 800;
  let cy = 450;
  let zoom = 1.0;
  let pitchDeg = 6;
  let yawDeg = -8;
  let isolateVesselA = 0;
  let insetRegenOpacity = 0;
  let coldBoxCutawayOpacity = 0.35;

  if (frame <= 149) {
    // Act I (0-149): Establish full assembly (0-55), then measured three-quarter push toward active region (55-149)
    const pushT = smoothstep(50, 149, frame);
    cx = lerp(800, 545, pushT);
    cy = lerp(450, 465, pushT);
    zoom = lerp(0.98, 1.48, pushT);
    pitchDeg = lerp(4, 14, pushT);
    yawDeg = lerp(-4, -15, pushT);
    isolateVesselA = smoothstep(115, 149, frame) * 0.45;
    coldBoxCutawayOpacity = lerp(0.45, 0.2, pushT);
  } else if (frame <= 299) {
    // Act II (150-299): Sectional close-up on Vessel A (H2O & CO2 removal)
    const enterT = smoothstep(150, 190, frame);
    const exitT = smoothstep(265, 299, frame);
    cx = lerp(545, 468, enterT);
    cy = lerp(465, 480, enterT);
    zoom = lerp(1.48, 2.22, enterT);
    pitchDeg = lerp(14, 8, enterT);
    yawDeg = lerp(-15, -6, enterT);
    isolateVesselA = lerp(0.45, 0.88, enterT) * (1 - exitT * 0.55);
    coldBoxCutawayOpacity = 0.12;
  } else if (frame <= 509) {
    // Act III (300-509): Track purified feed from Vessel A top outlet through filter & analyzer to cold box inlet
    const panToHeader = smoothstep(300, 355, frame);
    const trackFlow = smoothstep(355, 485, frame);
    const cxStart = lerp(468, 560, panToHeader);
    const cyStart = lerp(480, 275, panToHeader);
    cx = lerp(cxStart, 890, trackFlow);
    cy = lerp(cyStart, 315, trackFlow);
    zoom = lerp(2.22, 1.56, panToHeader) - trackFlow * 0.14;
    pitchDeg = lerp(8, 11, panToHeader);
    yawDeg = lerp(-6, -12, trackFlow);
    isolateVesselA = lerp(0.38, 0.0, panToHeader);
    coldBoxCutawayOpacity = lerp(0.25, 0.72, trackFlow);
  } else if (frame <= 749) {
    // Act IV (510-749): Separate regeneration state on Vessel B + heater loop + qualitative inset
    const moveRegen = smoothstep(510, 565, frame);
    cx = lerp(890, 745, moveRegen);
    cy = lerp(315, 495, moveRegen);
    zoom = lerp(1.42, 1.44, moveRegen);
    pitchDeg = lerp(11, 13, moveRegen);
    yawDeg = lerp(-12, 10, moveRegen);
    insetRegenOpacity = smoothstep(535, 575, frame) * (1 - smoothstep(720, 749, frame));
    coldBoxCutawayOpacity = lerp(0.72, 0.38, moveRegen);
  } else {
    // Act V (750-1019): Pull back to stable system overview; protect downstream low-temp equipment; retain visible losses & uncertainty
    const pullBack = smoothstep(750, 835, frame);
    cx = lerp(745, 815, pullBack);
    cy = lerp(495, 448, pullBack);
    zoom = lerp(1.44, 0.98, pullBack);
    pitchDeg = lerp(13, 7, pullBack);
    yawDeg = lerp(10, -7, pullBack);
    insetRegenOpacity = 0;
    coldBoxCutawayOpacity = lerp(0.38, 0.96, pullBack);
  }

  // Qualitative Adsorption Loading in Vessel A (Compressed cycle representation)
  // H2O loads heavily in lower alumina layer (0.35 -> 0.84)
  // CO2 loads in upper molecular sieve layer (0.22 -> 0.76)
  const vesselAH2OLoading = clamp(0.36 + 0.46 * smoothstep(0, 950, frame), 0, 0.92);
  const vesselACO2Loading = clamp(0.22 + 0.52 * smoothstep(80, 980, frame), 0, 0.88);
  const vesselAMTZPosition = clamp(0.28 + 0.44 * smoothstep(100, 960, frame), 0.2, 0.78);

  // Vessel B Regeneration Sub-phases (Conceptual representation, particularly highlighted in Act IV)
  let vesselBRegenPhase: QualitativeTelemetry['vesselBRegenPhase'] = 'THERMAL_DESORB';
  if (frame < 510) {
    vesselBRegenPhase = frame < 240 ? 'DEPRESSURIZE' : 'THERMAL_DESORB';
  } else if (frame <= 665) {
    vesselBRegenPhase = 'THERMAL_DESORB';
  } else if (frame <= 749) {
    vesselBRegenPhase = 'COOLING_STANDBY';
  } else {
    vesselBRegenPhase = frame < 910 ? 'COOLING_STANDBY' : 'EQUALIZE';
  }

  // Heater duty (Gold #FFD166) peaks during thermal desorption
  const heaterDutyNormalized = clamp(
    0.25 +
      0.72 * smoothstep(220, 540, frame) * (1 - 0.68 * smoothstep(650, 740, frame)),
    0.12,
    0.98
  );

  // Thermal pulse inside Vessel B (travels top-to-bottom counter-current to feed)
  const vesselBTempPulse = clamp(
    smoothstep(260, 580, frame) * (1 - 0.45 * smoothstep(665, 790, frame)),
    0.1,
    0.96
  );

  const vesselBDesorbedFlux = clamp(
    smoothstep(320, 560, frame) * (1 - 0.65 * smoothstep(680, 820, frame)),
    0.08,
    0.95
  );

  // Visible Losses & Uncertainty (Explicitly retained in Act V)
  const bedDeltaPNormalized = clamp(
    0.34 + 0.14 * vesselAH2OLoading + 0.04 * Math.sin(frame * 0.04),
    0.2,
    0.75
  );
  const purgeLossFraction = clamp(
    0.08 + 0.06 * heaterDutyNormalized,
    0.06,
    0.16
  );
  const uncertaintyBandWidth = clamp(
    0.11 + 0.09 * smoothstep(150, 920, frame),
    0.08,
    0.24
  );
  const coldBoxSafetyMargin = clamp(
    0.92 - 0.08 * smoothstep(200, 1019, frame),
    0.78,
    0.96
  );

  const valves: ValveStates = {
    KV101_feedA: 'OPEN',
    KV102_feedB: 'CLOSED',
    KV201_outA: 'OPEN',
    KV202_outB: 'CLOSED',
    KV301_regenInB: heaterDutyNormalized > 0.45 ? 'MODULATING' : 'OPEN',
    KV302_ventB: vesselBRegenPhase === 'EQUALIZE' ? 'CLOSED' : 'OPEN',
  };

  return {
    frame,
    timeSeconds,
    act,
    actProgress,
    overallProgress,
    camera: {
      cx,
      cy,
      zoom,
      pitchDeg,
      yawDeg,
      isolateVesselA,
      insetRegenOpacity,
      coldBoxCutawayOpacity,
    },
    valves,
    vesselAH2OLoading,
    vesselACO2Loading,
    vesselAMTZPosition,
    vesselBRegenPhase,
    vesselBTempPulse,
    vesselBDesorbedFlux,
    heaterDutyNormalized,
    bedDeltaPNormalized,
    purgeLossFraction,
    uncertaintyBandWidth,
    coldBoxSafetyMargin,
  };
}
