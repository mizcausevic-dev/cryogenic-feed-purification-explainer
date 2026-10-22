export const MEDIUM_ARTICLE_META = {
  title:
    'Why Cryogenic Air Separation Plants Freeze Solid Without Upstream Feed Purification: Building a 1,020-Frame Deterministic Anatomy Explainer',
  subtitle:
    'How layered adsorbent beds remove water vapor and carbon dioxide upstream of the cold box, why thermal regeneration must run in parallel without interrupting flow, and how to engineer a zero-drift 34-second technical visualization in TypeScript and Canvas.',
  readingTime: '11 min read',
  publishedDate: 'October 22, 2026',
  vertical: 'Industrial Gases & Cryogenics',
  primaryReferenceUrl:
    'https://www.airproducts.com/supply-modes/gen-gas-on-site/onsite-nitrogen-generation/cryogenic-nitrogen-plant',
  primaryReferenceTitle: 'Air Products — Cryogenic Nitrogen Plant (On-Site Gas Generation)',
  seoKeywords: [
    'Cryogenic Feed Purification',
    'Pre-Purification Unit PPU',
    'Cryogenic Air Separation Unit ASU',
    'Molecular Sieve Adsorber',
    'Brazed Aluminum Heat Exchanger Freeze-Out',
    'Temperature Swing Adsorption TSA',
    'Deterministic Motion Explainer',
  ],
};

export interface ArticleSection {
  id: string;
  heading: string;
  eyebrow: string;
  paragraphs: string[];
  bulletPoints?: { label: string; detail: string }[];
  codeSnippet?: {
    caption: string;
    language: string;
    code: string;
  };
  calloutBox?: {
    badge: string;
    title: string;
    body: string;
  };
}

export const ARTICLE_SECTIONS: ArticleSection[] = [
  {
    id: 'bluf-freeze-out-mechanism',
    eyebrow: '01 / THE PHYSICAL CONSTRAINT',
    heading: 'The Unforgiving Physics of the Cryogenic Cold Box',
    paragraphs: [
      'A cryogenic air separation unit (ASU) distills atmospheric air into high-purity nitrogen, oxygen, and argon by cooling compressed feed air until it liquefies. That liquefaction takes place inside an insulated enclosure known as the cold box. Before air can reach distillation temperatures, however, it must pass through a primary heat exchanger with millimeter-scale internal passages.',
      'Atmospheric air always carries trace water vapor (H2O) and carbon dioxide (CO2). At ambient temperatures these species are benign gases. Inside a cryogenic heat exchanger, both cross their triple points and transition directly into solid phase. Water freezes at 273.15 K (0 °C), and carbon dioxide deposits as dry ice frost at cryogenic temperatures depending on partial pressure. If either contaminant enters the cold box uncaptured, solid frost accumulates on heat-exchanger fins and distillation trays, raising differential pressure, starving downstream flow, and forcing an expensive plant derime (warming and purging the cold box).',
      'Upstream feed purification is therefore the non-negotiable gatekeeper of every cryogenic nitrogen or oxygen plant. As documented in the Air Products cryogenic nitrogen plant process architecture, compressed and cooled atmospheric air must pass through a switching-bed Pre-Purification Unit (PPU) that strips moisture, carbon dioxide, and trace hydrocarbons before the feed ever touches the primary heat exchanger.',
    ],
    calloutBox: {
      badge: 'EVIDENCE & SCOPE',
      title: 'Grounded Process Basis vs. Illustrative Geometry',
      body: 'Process sequence Basis: Air Products cryogenic air separation architecture (compression, aftercooling/moisture separation, dual-vessel adsorbent purification, primary heat exchange, turboexpansion, and cryogenic distillation). Adsorbent formulations, bed aspect ratios, and regeneration schedules vary across plant designs; this explainer uses a labeled conceptual schematic and qualitative mathematical curves rather than claiming a proprietary vendor recipe or a 100% contaminant-removal guarantee.',
    },
  },
  {
    id: 'five-act-choreography',
    eyebrow: '02 / FRAME-EXACT CHOREOGRAPHY',
    heading: 'Structuring a 34-Second (1,020-Frame) Technical Anatomy Film',
    paragraphs: [
      'Most industrial process animations fail in one of two ways: either they decorate the screen with glowing particle confetti that obscures the causal path, or they present a static P&ID diagram with no sense of mass transfer, thermal fronts, or cycle state. To make cryogenic feed purification legible to engineers and technical decision-makers, we locked the visualization to a deterministic 1,020-frame timeline at 30 frames per second (34.00 seconds total).',
      'Every visual attribute on the stage is a pure function of the integer frame index f in [0, 1019]. Scrubbing backward or forward, stepping a single frame, or jumping between acts evaluates the exact same mathematical state with zero integration drift. Color is restricted to explanatory overlays on a dark technical stage (#0B1019) with neutral structural vessels (#344257): Cyan (#00E5FF) tracks primary gas transport, Gold (#FFD166) represents energy input and thermal actuation, and Violet (#9D4EDD) encodes control states, adsorbed CO2 inventory, and breakthrough uncertainty.',
    ],
    bulletPoints: [
      {
        label: 'Frames 0–149 (0–5s) | Act I — Upstream Assembly & Three-Quarter Push',
        detail:
          'Establishes the full train: main air compression, aftercooling with bulk liquid knock-out, the dual adsorbent vessels (Vessel A online, Vessel B regenerating), and the downstream cold box. At frame 50, the camera executes a smoothstep three-quarter orthographic push toward the active adsorption region.',
      },
      {
        label: 'Frames 150–299 (5–10s) | Act II — Sectional Close-Up of H2O and CO2 Removal',
        detail:
          'Isolates Vessel A in a 2.22x sectional cutaway, dimming non-essential surroundings. Reveals the graded bed architecture: the lower desiccant/alumina zone removes bulk and trace moisture first, protecting the upper molecular-sieve zeolite zone so its micropores remain dedicated to carbon dioxide capture.',
      },
      {
        label: 'Frames 300–509 (10–17s) | Act III — Purified Feed & Control Interlock Path',
        detail:
          'Tracks the dry, CO2-free gas exiting the top of Vessel A through the dust afterfilter and into the cold-box header. Separates the primary transport stream (cyan) from the differential-pressure and trace-CO2 analyzer control loop (violet) that holds the cold-box entry permissive.',
      },
      {
        label: 'Frames 510–749 (17–25s) | Act IV — Separate Regeneration State & Qualitative Inset',
        detail:
          'Pans to Vessel B and the regeneration heater loop. Dry waste nitrogen returning from the cold box is heated (gold energy overlay) and routed counter-currently (top-to-bottom) through Vessel B to desorb bound CO2 and H2O without pushing moisture through the sensitive upper sieve layer. A synchronized qualitative inset plots the thermal pulse and elution wave.',
      },
      {
        label: 'Frames 750–1019 (25–34s) | Act V — Downstream Cold-Box Protection & Retained Limits',
        detail:
          'Pulls back to a stable system-wide overview showing the protected Brazed Aluminum Heat Exchanger (BAHX), turboexpander, and distillation column producing high-purity nitrogen, while explicitly retaining packed-bed pressure drop (ΔP), regeneration purge gas consumption, and breakthrough uncertainty margins.',
      },
    ],
  },
  {
    id: 'layered-bed-thermodynamics',
    eyebrow: '03 / ADSORPTION MECHANICS',
    heading: 'Why Adsorbent Vessels Use Layered Zones and Counter-Current Purge',
    paragraphs: [
      'A common misconception in simplified process diagrams is treating an adsorber vessel as a uniform bucket of pellets. In reality, zeolitic molecular sieves (such as 13X) have a much stronger electrostatic affinity for polar water molecules than for quadrupolar carbon dioxide molecules. If raw saturated air hits bare molecular sieve directly, water displaces CO2 from active sites, releases high exothermic heat of adsorption (+ΔH_ads), and accelerates hydrothermal aging during hot regeneration.',
      'To prevent competitive displacement, industrial pre-purification beds are typically layered. Wet compressed air enters at the bottom distributor and first encounters a moisture-tolerant desiccant layer (such as activated alumina) that captures the bulk water vapor front. Only after the gas is substantially dried does it enter the upper molecular-sieve layer, where CO2 and trace unsaturated hydrocarbons (like acetylene, C2H2) are adsorbed.',
      'When that vessel approaches its allowable Mass Transfer Zone (MTZ) margin—well before CO2 breaks through the top guard zone—automated switching valves transfer the feed to the standby vessel. Regeneration then proceeds counter-currently: heated dry waste nitrogen from the cold box enters at the top of the offline vessel, sweeping desorbed CO2 and H2O downward out the bottom vent so liquid or high-humidity vapor is never driven upward through the clean molecular sieve.',
    ],
    codeSnippet: {
      caption: 'Deterministic frame evaluation for camera choreography and axial Mass Transfer Zone (MTZ) fronts (src/simulationEngine.ts)',
      language: 'typescript',
      code: `export function computeFrameState(rawFrame: number): QualitativeTelemetry {
  const frame = clamp(Math.floor(rawFrame), 0, TOTAL_FRAMES - 1);
  const timeSeconds = frame / FPS;
  const act = getActForFrame(frame);

  // Pure function of frame index: zero stateful integration drift
  const vesselAH2OLoading = clamp(0.36 + 0.46 * smoothstep(0, 950, frame), 0, 0.92);
  const vesselACO2Loading = clamp(0.22 + 0.52 * smoothstep(80, 980, frame), 0, 0.88);
  const vesselAMTZPosition = clamp(0.28 + 0.44 * smoothstep(100, 960, frame), 0.2, 0.78);

  // Retained uncertainty envelope and frictional pressure drop loss
  const bedDeltaPNormalized = clamp(0.34 + 0.14 * vesselAH2OLoading, 0.2, 0.75);
  const uncertaintyBandWidth = clamp(0.11 + 0.09 * smoothstep(150, 920, frame), 0.08, 0.24);
  return { frame, timeSeconds, act, vesselAH2OLoading, vesselACO2Loading, vesselAMTZPosition, bedDeltaPNormalized, uncertaintyBandWidth /* ... */ };
}`,
    },
  },
  {
    id: 'accounting-and-limits',
    eyebrow: '04 / ENGINEERING HONESTY & TECHNICAL LIMITS',
    heading: 'Accounting for Mass, Energy, Pressure Losses, and Breakthrough Uncertainty',
    paragraphs: [
      'A trustworthy engineering explainer must show what the system costs to run and where its boundaries lie. Purification is never free: forcing compressed air through a packed bed of adsorbent beads and a downstream dust filter incurs a continuous frictional pressure drop (ΔP_bed), which translates directly into main air compressor shaft work.',
      'Similarly, thermal regeneration requires both thermal energy input (+Q_heater, shown in Gold #FFD166) to overcome the desorption enthalpy (-ΔH_des) and a dry purge gas stream (waste nitrogen from the cold box) that vents captured H2O and CO2 back to atmosphere. Finally, ambient feed conditions fluctuate: a sudden spike in ambient temperature or cooling-water temperature raises the water load entering the PPU, widening the uncertainty band around the Mass Transfer Zone front.',
      'By keeping the axial breakthrough diagram, uncertainty envelope, and conservation ledger visible through Frame 1,019, the viewer sees not just how the cold box is protected, but why continuous analyzer monitoring and conservative cycle switching are essential in industrial gas operations.',
    ],
  },
];
