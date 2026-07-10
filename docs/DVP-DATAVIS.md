# DVP datavis project reference — "The AI Hardware Squeeze"

> Reference for extracting visualisation code/design from Rohan's FIT5147 Data Visualisation
> Project into this site. **Extract on request only** — nothing is ported yet.
> Local path: `/Users/rkal0017/Library/CloudStorage/OneDrive-MonashUniversity/Current Semester - S1 2026/FIT5147 - Data Exploration and Visualisation/Assessments/DVP`
> Last updated: 2026-07-09.

## What it is

"The AI Hardware Squeeze on Aussie Gamers' Pockets" — a single-page interactive data story
where the interface **is a gaming PC**: configure a rig, click components, each part opens a
drawer of D3 charts. Narrative: *chips tilted → prices climbed → gamers stalled* (NVIDIA/AMD/
Micron revenue tilt to AI data-centre, AUD component prices, Steam Hardware Survey trends,
Reddit sentiment). All money in AUD via RBA F11 FX.

## Tech

- Vanilla HTML/CSS/JS, **D3 v7** for everything; Three.js r128 only for an optional 3D shell.
- **No modules/bundler** — scripts attach to globals: `window.CFG` (config/palette),
  `window.U` (tooltip + SVG helpers), `window.CH` (chart scaffolding), `window.DVP_DATA` (data),
  `window.Charts` (chart registry).
- App lives in `submission/code/`; entry `index.html`; single stylesheet `css/styles.css`.

## The reusable asset: 19 chart modules (`submission/code/js/charts/`)

Every chart is a self-contained render function: `Charts.name = function (host, opts) { ... }` —
clears `host`, draws SVG with D3. None depend on Three.js. Includes: `alluvial.js` (revenue-mix
ribbon + animated silicon wafer), `beeswarm.js` (~50 lines, near drop-in), `sunburst.js` (~38
lines), `squeezeradar.js`, `costwheel.js`, `brickstack.js`, `cubestack.js`, `capacityheat.js`,
`memorycurve.js`, `standstill.js`, `tradeinkiosk.js`, `upgraderflow.js` (particle flow +
slider), `sentimenttopo.js`, `twogamers.js`, `breakerbox.js`, `gamelibrary.js`,
`evidencewall.js`, `about.js`, plus shared `_helpers.js` (= `window.CH`).

### Port recipe (vanilla IIFE → React/Next.js)

1. Convert `js/config.js` (CFG: palette/fonts/formatters/tooltip/SVG helpers) and
   `js/charts/_helpers.js` (CH: axes/frames/anim registry) to ES modules.
2. Replace `window.DVP_DATA` with JSON imports (source CSVs in `data/clean/`, snapshots in
   `data/latest/`; `build/build-data.js` shows the compile step).
3. Wrap each chart in a component: `useEffect(() => { renderChart(ref.current, opts); return
   () => CH.anim.stop(...) }, [deps])` — D3 owns its subtree, no VDOM conflict. Animated charts
   already register teardown via `CH.anim.add(stop)`.
4. Carry the CSS the chart HTML controls rely on (`.chart-controls`, `.cc-pill`, `.ram-slots`,
   `.callout` in `css/styles.css`) or restyle with Tailwind.
5. The shared tooltip expects a `#tooltip` element — replace with a component-local tooltip.
6. **Don't port:** `tower3d.js` / `tower-switch.js` (bespoke Three.js PC shell) and `fx.js`
   (CRT/cursor layer) — app-specific chrome.

## Design system (documented in `_dev_archive/_handoff/DESIGN_SYSTEM.md`)

Brutalist "dossier" aesthetic (Marathon-inspired): warm paper `#f4f1ea` / ink `#16130f`
(dark mode: `#13110d` / `#f1ece0`), crisp 2–3 px lines, no gradients/rounded cards.
**Semantic colour**: red `#e5341f` = AI/data-centre/price-up · cyan `#159cb1` = gaming/consumer/
flat-or-falling · amber `#e8b000` = other/FX/annotations; colour-blind-aware, meaning always
redundantly encoded. Type: Archivo Black (display) · IBM Plex Sans Condensed (subtitles) ·
IBM Plex Mono (numerals, tabular). Conventions: square endpoints (`U.square`), halftone area
fills (`U.halftone`), boxed mono callouts (`U.callout`), outward ticks, motion killed under
`prefers-reduced-motion`. Light/dark flip via `CFG.applyTheme()` — accents stay constant.

Note: this palette is intentionally different from MNET brand (red `#DC003B` on black). If
charts are ported, decide per-case whether to re-skin to MNET tokens or keep the dossier look
as a self-contained artefact.

## Where things live

- Handoff docs (read first): `_dev_archive/_handoff/ARCHITECTURE.md`, `DESIGN_SYSTEM.md`,
  `DATA_DICTIONARY.md`, `THREEJS_3D_NOTES.md`
- Clean data: `submission/code/data/clean/*.csv` (19 files: revenue mixes, GPU/RAM/drive
  prices, Steam survey, FX); snapshots: `data/latest/*.json`
- Fonts vendored as woff2 in `submission/code/fonts/`
