# Cryogenic Feed Purification. 34-Second Anatomy-Style Motion Explainer

Code-driven, frame-accurate explainer of cryogenic feed purification. **34 seconds, 30 fps, 1,020 frames (0–1019).** No video file. Every frame is `draw(frame)` on a canvas.

**Live preview:** GitHub Pages (see below). **Article:** `article/medium-article-Claude.md`. **Hero:** `public/hero-cryogenic-feed-purification.png`.

## What it is
A conceptual schematic showing why adsorbent vessels sit upstream of a cryogenic cold box: remove water and CO2 before feed gets cold, track purified feed, show regeneration as a separate conceptual state, and pull back to why downstream low-temperature equipment is protected.

## Who it is for
Process engineers, training teams, technical buyers, and students who need the causal chain without an operating procedure.

## Run locally
```bash
npm install
npm run dev    # http://127.0.0.1:43127
npm run build  # static build in dist/, base './' for GitHub Pages
```

## Phases
| Frames | Time | Phase |
|---|---|---|
| 0–149 | 0–5s | Reveal vessels upstream of cold box, three-quarter push |
| 150–299 | 5–10s | Sectional close-up: H2O + CO2 retained on bed |
| 300–509 | 10–17s | Track purified feed to cold box |
| 510–749 | 17–25s | Separate regeneration state (conceptual) + qualitative inset |
| 750–1019 | 25–34s | Pull back: protect downstream, hold stable overview |

## Palette (explanatory overlays, not literal emission)
Dark stage `#0B1019`, neutral material `#344257`, cyan `#00E5FF` transport/signal, gold `#FFD166` energy/actuation, violet `#9D4EDD` control/state. BERT base fonts: Space Grotesk + JetBrains Mono.

## Deploy to GitHub Pages
This repo ships `.github/workflows/pages.yml` (builds `dist/` and deploys via Actions) and is also compatible with a `gh-pages` branch.

1. Push to your GitHub repo (`main`).
2. Repo Settings → Pages → Source: **GitHub Actions** (workflow) or branch `gh-pages` / root.
3. Workflow publishes the static build. Replace placeholder links in the article with the live Pages URL before posting to Medium.

> Note on this session: no `gh` authentication was present in the cloud environment (`gh auth status`: not logged in), so the push target available here is the connected `origin`. The code is Pages-ready; connect your GitHub remote / authenticate `gh` with your `crsr-cloud` secret in your environment to publish under your account. Do not commit the secret.

## Technical limits (on screen, by design)
Adsorbents and cycles vary. No regeneration recipe. No total contaminant-removal guarantee. Graphs are qualitative and labelled as such. No dimensions, materials, operating settings, efficiencies, certifications, or vendor internals are claimed. Not an operating procedure for hazardous equipment.

## Reference basis
Air Products, cryogenic nitrogen plant / on-site nitrogen generation: https://www.airproducts.com/supply-modes/gen-gas-on-site/onsite-nitrogen-generation/cryogenic-nitrogen-plant . Supports process architecture only. Camera, palette, cutaways, timing are original illustrative direction.

## Files
- `index.html` / `src/main.js` / `src/style.css` — deterministic frame renderer, scrub/step/export controls
- `public/hero-cryogenic-feed-purification.png` — 1600×900 hero / OG image
- `article/medium-article-Claude.md` — full Medium article (SEO title, meta, tags, CTA)
- `public/article/medium-article-Claude.html` — web version linked from the film

## GitHub About (paste in repo settings)
About: `Code-driven 34s anatomy-style explainer of cryogenic feed purification: adsorbent vessels, cold box protection, and conceptual regeneration. 1,020 frames at 30 fps.`

Topics: `cryogenics, industrial-gases, air-separation, process-engineering, canvas-animation, technical-explainer, github-pages, vite`

## Repurposing
Swap retained species and labels to explain dryers, PSA/TSA guard beds, or solvent recovery. The frame architecture, legend, and accounting stay the same.
