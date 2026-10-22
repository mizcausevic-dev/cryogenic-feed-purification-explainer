# Cryogenic Feed Purification, Explained in Motion

A 34-second, code-driven anatomy explainer of cryogenic feed purification. 1,020 frames at 30 fps (frames 0–1019), drawn by one deterministic Canvas 2D function. No video file.

**Live:** https://mizcausevic-dev.github.io/cryogenic-feed-purification-explainer/
**Article:** [`medium-article-Cursor.md`](medium-article-Cursor.md) · **Hero:** [`public/hero.png`](public/hero.png)

## What it shows
1. **0–5s (0–149)** Reveal adsorbent vessels upstream of the cold box, measured push-in.
2. **5–10s (150–299)** Sectional close-up: selected H₂O and CO₂ held on adsorbent bed.
3. **10–17s (300–509)** Track purified feed (cyan) through heat exchange to cold box. Gold = energy, violet = control.
4. **17–25s (510–749)** Conceptual regeneration of off-stream vessel. No recipe. Qualitative inset only.
5. **25–34s (750–1019)** Pull back. Downstream protection, residual risk retained, stable overview end.

## Limits
Conceptual schematic, not to scale. Adsorbents and cycles vary. No regeneration recipe, dimensions, settings, efficiencies, certifications, or total-removal guarantee. Not operating instructions. Process context: [Air Products cryogenic nitrogen plant](https://www.airproducts.com/supply-modes/gen-gas-on-site/onsite-nitrogen-generation/cryogenic-nitrogen-plant).

## Run locally
```bash
npm install
npm run dev -- --port 4319 --host 127.0.0.1
npm run build   # static dist/, base './' for GitHub Pages
```

## GitHub
- **About:** Code-driven 34s anatomy explainer of cryogenic feed purification: adsorption, conceptual regeneration, cold-box protection. 1020 frames, deterministic canvas.
- **Topics:** `cryogenics` `air-separation` `industrial-gases` `adsorption` `canvas-animation` `technical-communication` `process-engineering` `vite` `typescript`

## Repurposing
Same frame engine and colour grammar (neutral plant, cyan transport, gold energy, violet control) applies to dryers, guard beds, membranes, filtration, and thermal-swing cycles in other verticals. Swap world geometry and chapter text; keep determinism, qualitative-graph labelling, and limits on screen.
