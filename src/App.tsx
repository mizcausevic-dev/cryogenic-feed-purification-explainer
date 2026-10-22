import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Layers,
  Grid,
  Activity,
  ShieldCheck,
  BookOpen,
  ExternalLink,
  Sliders,
  AlertTriangle,
  Eye,
  Compass,
  FileCode2,
} from 'lucide-react';
import {
  ACTS,
  FPS,
  TOTAL_FRAMES,
  computeFrameState,
  type ActDefinition,
} from './simulationEngine';
import { renderExplainerFrame, type RenderOptions } from './canvasRenderer';
import { ARTICLE_SECTIONS, MEDIUM_ARTICLE_META } from './articleContent';

type ViewTab = 'explainer' | 'article' | 'architecture';

export function App() {
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<ViewTab>('explainer');

  const [renderOptions, setRenderOptions] = useState<RenderOptions>({
    showGrid: true,
    showLabels: true,
    showAccountingOverlay: true,
    showUncertaintyBands: true,
    highlightedNode: null,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const accumulatorRef = useRef<number>(0);

  const frameState = computeFrameState(currentFrame);

  // Deterministic 30 FPS playback loop
  useEffect(() => {
    if (!isPlaying) {
      lastTickRef.current = null;
      return;
    }

    let rafId: number;
    const frameIntervalMs = 1000 / (FPS * playbackSpeed);

    const step = (timestamp: number) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = timestamp;
      }
      const delta = timestamp - lastTickRef.current;
      lastTickRef.current = timestamp;
      accumulatorRef.current += delta;

      if (accumulatorRef.current >= frameIntervalMs) {
        const framesToAdvance = Math.floor(accumulatorRef.current / frameIntervalMs);
        accumulatorRef.current %= frameIntervalMs;

        setCurrentFrame((prev) => {
          const next = prev + framesToAdvance;
          if (next >= TOTAL_FRAMES) {
            return 0; // Seamless loop across 0..1019
          }
          return next;
        });
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, playbackSpeed]);

  // Render Canvas whenever currentFrame or renderOptions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderExplainerFrame(ctx, canvas.width, canvas.height, frameState, renderOptions);
  }, [frameState, renderOptions]);

  // Keyboard shortcuts (Space: play/pause, Left/Right: step frame, 1-5: jump to act)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (
      document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA'
    ) {
      return;
    }
    if (e.code === 'Space') {
      e.preventDefault();
      setIsPlaying((p) => !p);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      setIsPlaying(false);
      setCurrentFrame((f) => Math.min(TOTAL_FRAMES - 1, f + (e.shiftKey ? 10 : 1)));
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      setIsPlaying(false);
      setCurrentFrame((f) => Math.max(0, f - (e.shiftKey ? 10 : 1)));
    } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
      const idx = Number(e.code.replace('Digit', '')) - 1;
      if (ACTS[idx]) {
        setCurrentFrame(ACTS[idx].startFrame);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const jumpToAct = (act: ActDefinition) => {
    setCurrentFrame(act.startFrame);
  };

  return (
    <div className="min-h-screen bg-[#0B1019] text-[#F1F5F9] font-sans selection:bg-[#00E5FF] selection:text-[#0B1019]">
      {/* Top Navigation & Telemetry Header */}
      <header className="sticky top-0 z-30 border-b border-[#344257]/60 bg-[#0B1019]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#00E5FF]/50 bg-[#00E5FF]/10 text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#00E5FF]">
                  Industrial Gases &amp; Cryogenics
                </span>
                <span className="rounded border border-[#344257] bg-[#162032] px-1.5 py-0.5 font-mono text-[10px] text-[#94A3B8]">
                  34.0s • 30 FPS • 1,020 FRAMES (0–1019)
                </span>
              </div>
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                Cryogenic Feed Purification — Code-Driven Anatomy Explainer
              </h1>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-[#344257] bg-[#101826] p-1">
              <button
                type="button"
                onClick={() => setActiveTab('explainer')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'explainer'
                    ? 'bg-[#00E5FF] text-[#0B1019] shadow-[0_0_14px_rgba(0,229,255,0.4)]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                Interactive Stage (1,020f)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('article')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'article'
                    ? 'bg-[#00E5FF] text-[#0B1019] shadow-[0_0_14px_rgba(0,229,255,0.4)]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Medium Editorial + Hero
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('architecture')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'architecture'
                    ? 'bg-[#00E5FF] text-[#0B1019] shadow-[0_0_14px_rgba(0,229,255,0.4)]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <FileCode2 className="h-3.5 w-3.5" />
                Factual &amp; Reference Spec
              </button>
            </div>

            <a
              href="./dashboard-Claude.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-lg border border-[#9D4EDD]/60 bg-[#9D4EDD]/15 px-3 py-2 text-xs font-semibold text-[#E9D5FF] transition hover:bg-[#9D4EDD]/25 xl:flex"
            >
              <Compass className="h-3.5 w-3.5 text-[#9D4EDD]" />
              7-Theme Strategy Dashboard
              <ExternalLink className="h-3 w-3 opacity-75" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1680px] px-4 py-5 sm:px-6">
        {activeTab === 'explainer' && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            {/* Left / Center Column: 16:9 Technical Stage + Scrubber + Act Selector (9 cols on XL) */}
            <div className="space-y-4 xl:col-span-9">
              {/* Canvas Viewport Container */}
              <div className="relative overflow-hidden rounded-xl border border-[#344257] bg-[#0B1019] shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
                <canvas
                  ref={canvasRef}
                  width={1600}
                  height={900}
                  className="aspect-video w-full block cursor-crosshair"
                  onClick={() => setIsPlaying((p) => !p)}
                  title="Click stage or press Space to toggle playback"
                />

                {/* Overlay Quick-Control Pill on Bottom-Center of Stage */}
                <div className="pointer-events-none absolute top-3 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-[#344257]/80 bg-[#0B1019]/85 px-3.5 py-1 text-[11px] font-mono text-[#94A3B8] backdrop-blur-sm md:flex">
                  <span className="h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse" />
                  <span>DETERMINISTIC RENDER</span>
                  <span className="text-[#344257]">|</span>
                  <span className="text-[#FFD166]">
                    ACT {frameState.act.id}: {frameState.act.shortTitle}
                  </span>
                </div>
              </div>

              {/* Timeline Scrubber & Transport Controls */}
              <div className="rounded-xl border border-[#344257] bg-[#101826] p-4">
                {/* 5-Act Segmented Timeline Bar */}
                <div className="mb-3 grid grid-cols-5 gap-1.5">
                  {ACTS.map((act) => {
                    const isCurrent = frameState.act.id === act.id;
                    const actSpan = act.endFrame - act.startFrame + 1;
                    const fillPct =
                      currentFrame < act.startFrame
                        ? 0
                        : currentFrame > act.endFrame
                          ? 100
                          : ((currentFrame - act.startFrame) / actSpan) * 100;

                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => jumpToAct(act)}
                        className={`group relative overflow-hidden rounded-lg border p-2 text-left transition ${
                          isCurrent
                            ? 'border-[#00E5FF] bg-[#162235]'
                            : 'border-[#344257]/60 bg-[#0B1019]/70 hover:border-[#344257]'
                        }`}
                      >
                        <div
                          className="absolute bottom-0 left-0 h-1 bg-[#00E5FF] transition-all duration-75"
                          style={{ width: `${fillPct}%` }}
                        />
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span
                            className={
                              isCurrent ? 'font-bold text-[#00E5FF]' : 'text-[#94A3B8]'
                            }
                          >
                            FRAMES {act.startFrame}–{act.endFrame}
                          </span>
                          <span className="text-[#64748B]">
                            {Math.round(act.startFrame / 30)}–{Math.round((act.endFrame + 1) / 30)}s
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-xs font-semibold text-white">
                          {act.shortTitle}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Precision Frame Slider (0 .. 1019) */}
                <div className="flex items-center gap-3">
                  <span className="w-20 font-mono text-xs font-semibold text-[#00E5FF]">
                    F: {String(currentFrame).padStart(4, '0')}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={TOTAL_FRAMES - 1}
                    value={currentFrame}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setCurrentFrame(Number(e.target.value));
                    }}
                    aria-label="Frame Scrubber (0 to 1019)"
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-[#1E293B] accent-[#00E5FF]"
                  />
                  <span className="w-24 text-right font-mono text-xs text-[#94A3B8]">
                    {frameState.timeSeconds.toFixed(2)}s / 34.00s
                  </span>
                </div>

                {/* Transport Buttons + Overlay Toggles */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#344257]/50 pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlaying((p) => !p)}
                      className="flex items-center gap-1.5 rounded-lg bg-[#00E5FF] px-4 py-2 text-xs font-bold text-[#0B1019] transition hover:bg-[#00E5FF]/90"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-3.5 w-3.5 fill-current" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Play
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentFrame((f) => Math.max(0, f - 1));
                      }}
                      title="Step Backward 1 Frame (Left Arrow)"
                      className="rounded-lg border border-[#344257] bg-[#0B1019] p-2 text-[#94A3B8] hover:border-[#00E5FF] hover:text-white"
                    >
                      <SkipBack className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentFrame((f) => Math.min(TOTAL_FRAMES - 1, f + 1));
                      }}
                      title="Step Forward 1 Frame (Right Arrow)"
                      className="rounded-lg border border-[#344257] bg-[#0B1019] p-2 text-[#94A3B8] hover:border-[#00E5FF] hover:text-white"
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentFrame(0);
                        setIsPlaying(true);
                      }}
                      title="Reset to Frame 0"
                      className="flex items-center gap-1 rounded-lg border border-[#344257] bg-[#0B1019] px-2.5 py-2 text-xs text-[#94A3B8] hover:border-[#00E5FF] hover:text-white"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>

                    {/* Speed Selector */}
                    <div className="ml-2 flex items-center rounded-lg border border-[#344257] bg-[#0B1019] p-0.5 font-mono text-[11px]">
                      {[0.5, 1, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`rounded px-2 py-1 transition ${
                            playbackSpeed === spd
                              ? 'bg-[#344257] font-bold text-[#00E5FF]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          {spd}×
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Layer Visibility Toggles */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRenderOptions((o) => ({ ...o, showGrid: !o.showGrid }))
                      }
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                        renderOptions.showGrid
                          ? 'border-[#00E5FF]/60 bg-[#00E5FF]/10 text-[#00E5FF]'
                          : 'border-[#344257] bg-[#0B1019] text-[#94A3B8]'
                      }`}
                    >
                      <Grid className="h-3.5 w-3.5" />
                      Ortho Grid
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setRenderOptions((o) => ({ ...o, showLabels: !o.showLabels }))
                      }
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                        renderOptions.showLabels
                          ? 'border-[#00E5FF]/60 bg-[#00E5FF]/10 text-[#00E5FF]'
                          : 'border-[#344257] bg-[#0B1019] text-[#94A3B8]'
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Sectional Callouts
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setRenderOptions((o) => ({
                          ...o,
                          showUncertaintyBands: !o.showUncertaintyBands,
                        }))
                      }
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                        renderOptions.showUncertaintyBands
                          ? 'border-[#9D4EDD]/70 bg-[#9D4EDD]/15 text-[#E9D5FF]'
                          : 'border-[#344257] bg-[#0B1019] text-[#94A3B8]'
                      }`}
                    >
                      <Sliders className="h-3.5 w-3.5 text-[#9D4EDD]" />
                      Uncertainty Band
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setRenderOptions((o) => ({
                          ...o,
                          showAccountingOverlay: !o.showAccountingOverlay,
                        }))
                      }
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                        renderOptions.showAccountingOverlay
                          ? 'border-[#FFD166]/70 bg-[#FFD166]/15 text-[#FFD166]'
                          : 'border-[#344257] bg-[#0B1019] text-[#94A3B8]'
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-[#FFD166]" />
                      Conservation Ledger
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Act Telemetry, Explanatory Color Key & Technical Limits (3 cols on XL) */}
            <div className="space-y-4 xl:col-span-3">
              {/* Active Act Directive Card */}
              <div className="rounded-xl border border-[#344257] bg-[#101826] p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded border border-[#00E5FF]/50 bg-[#00E5FF]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#00E5FF]">
                    {frameState.act.timeRangeLabel}
                  </span>
                  <span className="font-mono text-xs text-[#94A3B8]">
                    {Math.round(frameState.actProgress * 100)}% of Act
                  </span>
                </div>

                <h2 className="mt-2 text-base font-bold text-white">
                  {frameState.act.title}
                </h2>

                <div className="mt-2 rounded-lg border border-[#344257]/70 bg-[#0B1019] p-2.5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#FFD166]">
                    Camera &amp; Staging Directive
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
                    {frameState.act.cameraDirective}
                  </p>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[#94A3B8]">
                  {frameState.act.mechanismFocus}
                </p>

                {/* Subsystem Focus Highlighter */}
                <div className="mt-4 border-t border-[#344257]/50 pt-3">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">
                    Inspect Subsystem Node
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'feed-train', label: '1. Feed Air Train' },
                      { id: 'vessel-a', label: '2. Vessel A (Adsorb)' },
                      { id: 'vessel-b', label: '3. Vessel B (Regen)' },
                      { id: 'cold-box', label: '4. Cold Box (BAHX)' },
                    ].map((node) => (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() =>
                          setRenderOptions((o) => ({
                            ...o,
                            highlightedNode:
                              o.highlightedNode === node.id ? null : node.id,
                          }))
                        }
                        className={`rounded border px-2.5 py-1.5 text-left font-mono text-[11px] transition ${
                          renderOptions.highlightedNode === node.id
                            ? 'border-[#00E5FF] bg-[#00E5FF]/15 text-[#00E5FF]'
                            : 'border-[#344257] bg-[#0B1019] text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        {node.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Explanatory Color Semantics Card */}
              <div className="rounded-xl border border-[#344257] bg-[#101826] p-4">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  Explanatory Overlay Palette
                </h3>
                <p className="mt-1 text-[11px] text-[#94A3B8]">
                  Colors represent functional physical overlays, not literal optical emission.
                </p>

                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-sm bg-[#0B1019] ring-1 ring-[#647996]" />
                    <div>
                      <span className="font-mono font-semibold text-white">
                        #0B1019 / #344257
                      </span>
                      <p className="text-[11px] text-[#94A3B8]">
                        Dark technical stage &amp; neutral pressure-vessel structural steel.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-sm bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                    <div>
                      <span className="font-mono font-semibold text-[#00E5FF]">
                        #00E5FF (Cyan)
                      </span>
                      <p className="text-[11px] text-[#94A3B8]">
                        Primary gas transport (N₂/O₂ carrier stream) &amp; lower-bed H₂O capture front.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-sm bg-[#FFD166] shadow-[0_0_8px_#FFD166]" />
                    <div>
                      <span className="font-mono font-semibold text-[#FFD166]">
                        #FFD166 (Gold)
                      </span>
                      <p className="text-[11px] text-[#94A3B8]">
                        Energy &amp; actuation: compression work, regeneration heater duty (+Q̇), &amp; adsorption heat (+ΔH).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-sm bg-[#9D4EDD] shadow-[0_0_8px_#9D4EDD]" />
                    <div>
                      <span className="font-mono font-semibold text-[#E9D5FF]">
                        #9D4EDD (Violet)
                      </span>
                      <p className="text-[11px] text-[#94A3B8]">
                        Control interlocks, valve states, selective CO₂ molecular-sieve capture, &amp; uncertainty envelope.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Limits & Reference Scope Guardrail Card */}
              <div className="rounded-xl border border-[#FFD166]/40 bg-[#101826] p-4">
                <div className="flex items-center gap-2 text-[#FFD166]">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                    Technical Limits &amp; Scope
                  </h3>
                </div>
                <ul className="mt-2.5 space-y-1.5 text-[11px] leading-relaxed text-[#CBD5E1]">
                  <li>
                    • <strong>Adsorbents &amp; cycles vary:</strong> No regeneration recipe or total contaminant-removal guarantee is claimed.
                  </li>
                  <li>
                    • <strong>Qualitative plots:</strong> Breakthrough and elution curves are mathematical diagrams illustrating causal relationships, not empirical plant logs.
                  </li>
                  <li>
                    • <strong>No operational instructions:</strong> Conceptual educational schematic only; not a certified engineering design or operating manual for pressurized or cryogenic equipment.
                  </li>
                </ul>
                <a
                  href={MEDIUM_ARTICLE_META.primaryReferenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-[#00E5FF] hover:underline"
                >
                  Basis: Air Products Cryogenic Nitrogen Plant
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'article' && (
          <article className="mx-auto max-w-4xl rounded-2xl border border-[#344257] bg-[#101826] p-6 shadow-2xl sm:p-10">
            {/* Article Header */}
            <div className="border-b border-[#344257]/70 pb-6">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#00E5FF]">
                <span className="rounded bg-[#00E5FF]/15 px-2.5 py-0.5 font-semibold">
                  {MEDIUM_ARTICLE_META.vertical}
                </span>
                <span>•</span>
                <span className="text-[#94A3B8]">{MEDIUM_ARTICLE_META.readingTime}</span>
                <span>•</span>
                <span className="text-[#94A3B8]">
                  Senior Editor / Product / Developer-Writer Edition
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                {MEDIUM_ARTICLE_META.title}
              </h1>

              <p className="mt-3 text-base leading-relaxed text-[#94A3B8] sm:text-lg">
                {MEDIUM_ARTICLE_META.subtitle}
              </p>

              {/* SEO / GEO / AEO Topic Pills */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {MEDIUM_ARTICLE_META.seoKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full border border-[#344257] bg-[#0B1019] px-2.5 py-0.5 font-mono text-[11px] text-[#CBD5E1]"
                  >
                    #{kw.replace(/\s+/g, '')}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero Image Showcase */}
            <figure className="my-8 overflow-hidden rounded-xl border border-[#344257] bg-[#0B1019]">
              <img
                src="./cryogenic-purification-hero.png"
                alt="Technical cutaway schematic of an industrial cryogenic air separation feed purification unit (PPU) upstream of a cold box on a dark #0B1019 stage."
                className="w-full object-cover"
              />
              <figcaption className="border-t border-[#344257]/60 bg-[#0B1019]/90 px-4 py-2.5 font-mono text-xs text-[#94A3B8]">
                HERO FIGURE: Conceptual anatomy of dual-vessel cryogenic feed purification (Vessel A adsorbing H₂O and CO₂; Vessel B undergoing heated dry nitrogen regeneration) protecting the downstream cold box. Explanatory color overlays only; not a certified product geometry.
              </figcaption>
            </figure>

            {/* Article Sections */}
            <div className="space-y-10">
              {ARTICLE_SECTIONS.map((sec) => (
                <section key={sec.id} className="space-y-4">
                  <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#00E5FF]">
                    {sec.eyebrow}
                  </div>
                  <h2 className="text-xl font-bold text-white sm:text-2xl">
                    {sec.heading}
                  </h2>

                  {sec.paragraphs.map((p, idx) => (
                    <p
                      key={idx}
                      className="text-sm leading-relaxed text-[#CBD5E1] sm:text-base"
                    >
                      {p}
                    </p>
                  ))}

                  {sec.bulletPoints && (
                    <div className="mt-4 space-y-3 rounded-xl border border-[#344257] bg-[#0B1019] p-4">
                      {sec.bulletPoints.map((bp, i) => (
                        <div
                          key={i}
                          className="border-l-2 border-[#00E5FF] pl-3.5"
                        >
                          <div className="font-mono text-xs font-bold text-[#FFD166]">
                            {bp.label}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1] sm:text-sm">
                            {bp.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.calloutBox && (
                    <div className="rounded-xl border border-[#9D4EDD]/60 bg-[#9D4EDD]/10 p-5">
                      <span className="rounded bg-[#9D4EDD] px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                        {sec.calloutBox.badge}
                      </span>
                      <h3 className="mt-2 text-base font-bold text-white">
                        {sec.calloutBox.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#E9D5FF] sm:text-sm">
                        {sec.calloutBox.body}
                      </p>
                    </div>
                  )}

                  {sec.codeSnippet && (
                    <div className="overflow-hidden rounded-xl border border-[#344257] bg-[#0B1019]">
                      <div className="border-b border-[#344257] bg-[#162032] px-4 py-2 font-mono text-xs text-[#94A3B8]">
                        {sec.codeSnippet.caption}
                      </div>
                      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[#00E5FF]">
                        <code>{sec.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </article>
        )}

        {activeTab === 'architecture' && (
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="rounded-xl border border-[#344257] bg-[#101826] p-6">
              <h2 className="text-xl font-bold text-white">
                Factual &amp; Production Compliance Matrix
              </h2>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Verification of every visual, timing, and epistemic guardrail specified in the brief.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#344257] font-mono text-[#00E5FF]">
                      <th className="py-2.5 pr-4">Constraint / Rule</th>
                      <th className="py-2.5 pr-4">Specification</th>
                      <th className="py-2.5">Implementation in Codebase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#344257]/40 text-[#CBD5E1]">
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-white">
                        Duration &amp; Frame Indexing
                      </td>
                      <td className="py-3 pr-4 font-mono">
                        34s; 30 fps; 1,020 frames (0–1019)
                      </td>
                      <td className="py-3">
                        <code>simulationEngine.ts</code> evaluates integer frames <code>0..1019</code> deterministically via pure mathematical interpolation.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-white">
                        Palette &amp; Overlay Semantics
                      </td>
                      <td className="py-3 pr-4 font-mono">
                        #0B1019, #344257, #00E5FF, #FFD166, #9D4EDD
                      </td>
                      <td className="py-3">
                        Enforced in <code>canvasRenderer.ts</code>. Explicitly labeled as functional overlays (transport, energy, control), not literal emission.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-white">
                        5-Act Camera Timing
                      </td>
                      <td className="py-3 pr-4 font-mono">
                        0–149, 150–299, 300–509, 510–749, 750–1019
                      </td>
                      <td className="py-3">
                        Smoothstep camera pan, zoom, sectional isolation (Act II), qualitative regeneration inset (Act IV), and full cold-box pullback (Act V).
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-white">
                        Technical Limits &amp; Epistemic Honesty
                      </td>
                      <td className="py-3 pr-4 font-mono">
                        No recipe or 100% guarantee; qualitative plots
                      </td>
                      <td className="py-3">
                        HUD disclosure badges, qualitative axial breakthrough curve with shaded uncertainty band, and retained ΔP / purge losses in Act V.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
export default App;
