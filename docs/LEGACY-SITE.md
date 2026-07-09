# Legacy site inventory (`Monash-Emerging-Tech/web`)

> Content and feature inventory of the old PHP site (local checkout:
> `/Users/rkal0017/Documents/GitHub/web`, branch `production`). Use this when porting content
> or recreating signature effects. Last updated: 2026-07-09.

## Stack

Plain PHP with heredoc "components" echoed by `index.php`; Tailwind CSS v3 compiled manually
(`inputstyles.css` → `compiledstyles.css`); Apache/XAMPP; deploy via GitHub Action hitting a
`deploy.php` webhook on push to `production`. Single scrolling page + `apply.php` (Airtable
embed). No data files — every list is hardcoded in component markup.

## Verbatim brand copy

| Where | Copy |
| --- | --- |
| Meta description | "A dynamic student team dedicated to exploring and advancing the frontiers of technology, our mission is to push the boundaries of innovation." |
| Hero | "MONASH NEXUS FOR EMERGING TECHNOLOGIES" / "A Monash University research and education group." |
| Starfield section | "Expanding all horizons." |
| Projects section | "A slice of our work, expanding the horizons of technology." |
| Education section | "Providing the next generation with the skills to lead." |
| Footer | "MNET" ⇄ "MONASH NEXUS FOR EMERGING TECHNOLOGIES" · "JOIN US, BUILD THE FUTURE" |
| Hero keywords | Virtual Reality · 3D Modelling · Motion Capture · Web Development · Augmented Reality · World Building · Quantum Computing · Virtual Productions · Digital Twinning · Game Development · Human Computer Interaction · Robotics |

## Structured content (ready to become data)

### Projects (`components/index/projects.php`)
1. **Monash Boring (MBEST) x MNET — Digital Prototyping** — tags: VR, Visualisation, Unity, 3D — media: `img/projects/mbest.mp4`
2. **Monash Pilot Processes (MPP) x MNET — Digital Twin** — tags: Prototyping, VR, Digital Twin, 3D — `img/projects/MPP.webp`
3. **Monash Sustainable Buildings (MSB) x MNET — Visualisation and AR** — tags: Sustainability, AR, Data Visualisation, 3D — `img/projects/MSB.webp`
4. **Embodied Visualisation x MNET — Globes: Explore Historical Maps** — tags: VR, Visualisation, Unity, 3D — `img/projects/phone-xr.webp`

### Equipment (`components/index/equipment.php`)
Apple Vision Pro · Meta Quest Pro · Microsoft HoloLens 2 · Insta360 Pro 2 · Vive Tracker 3.0
(images in `img/equipment/`, each linked to vendor product page)

### Education / outreach events (`components/index/education.php`)
1. **MNET x MAC Spline Workshop** — 7/5/2024 — "Worked with Monash University's largest I.T
   student club to deliver a workshop teaching the fundamentals of 3D."
2. **MacRob High School Outreach Program** — 7/6/2024 — "Facilitated immersive VR demos for
   Mac.Rob Girls' High School students in experimental economics at MonLEE excursion day."

### Socials / contact (`components/navbar.php`, `components/footer.php`)
mnet@monash.edu · LinkedIn `company/monashemergingtech` · Instagram/Facebook
@monashemergingtech · Discord `discord.gg/hFxzMnxgbK` · apply: `team.monashemerging.tech/apply`,
Airtable form, Google Form. Implicit partner links in nav: Monash Smart Manufacturing,
Embodied Visualisation, VARS.

## Design tokens

- Primary red **`#DC003B`** (~3,200 uses); variant `#DC013A`; gradient `#DC003B → #5f031bee`
  on Values/Equipment sections; blue accent `#040dc1` (MENU); shader palette `#f20544`,
  `#4F47E6`, `#040FD9`, `#040DBF`; dark border `#2C2C2D`; black background.
- **OffBit Trial** fonts (6 weights, `.woff`) — ⚠ trial license, verify before continued
  production use (the new site ships these too).
- Logo `img/logo.webp/png`; Monash co-brand `img/monash-logo.*`; full favicon set at root.

## Signature effects (reference implementations)

| Effect | Where | Notes |
| --- | --- | --- |
| WebGL flowing-noise shader hero | `components/index/hero.php:84-131` | `shader-art` web component, custom GLSL |
| Typing/erasing keyword cycle | `hero.php:25-55` | vanilla JS |
| Cube swarm starfield, scroll-pinned | `components/index/starfield.php` | `threejs-toys` swarmBackground + GSAP ScrollTrigger (new site already has an R3F starfield) |
| Scramble-text MENU⇄CLOSE | `components/navbar.php:128-165` | ported conceptually to OldNavbar in new site |
| Numeric 0→100 loader | `components/loader.php` | credited "Faye @ https://faye.lol/" |
| Vanta.NET background | `projects.php:143-154` | tinted brand red |
| Custom cursor | `context-cursor.js` | mouse-only via detect-it; new site's copy of this file is absent (referenced but missing) |
| 3D flip cards (Values) | `components/index/values.php` | card backs were never filled in — no values copy exists on the old site |
| Ticker marquee | `index.php:102-130` | "Scroll down" in 6 languages |

## Gaps in the old site (things the new site must add, not port)

- No About narrative beyond one meta sentence.
- No team roster in code (two orphaned headshots: Jackie Ho, Rohan Kalanje).
- No history/timeline, no sponsors/partners section, no values copy.
- 3D models `models/quest3.glb`, `models/shiba.gltf` present but unused.
