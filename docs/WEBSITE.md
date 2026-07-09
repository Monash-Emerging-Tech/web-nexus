# Website plan — sitemap, brief, and roadmap

> Working plan for the web-nexus rebuild. Combines the Notion "Web Redesign" brief, the
> whiteboard planning sessions, and current repo state. Last updated: 2026-07-09.

## The brief (from Notion "Web Redesign")

> "MNET needs a website that really shows off the VR / futuristic ethos of MNET. So a website
> that's webXR compatible is our goal (see [Spatial Fusion](https://spatialfusion.io/) as an
> example). Website should be optimised for mobile and ideally will include immersive XR
> experiences."

- **WebXR-first**, mobile-optimised, immersive.
- **Notion + LinkedIn automation** to dynamically fetch team progress onto the website.
- **Featured projects:** Stanford, Bali, MBEST.
- Caching via ISR / `unstable_cache` (currently 1 h) so Notion API speed never matters.
- Hosting: Vercel (deploys from `prod` branch — there is no `dev` branch right now, despite the
  brief's original feature/dev flow).
- Design source: Figma "MNET-Website-Master"; animations: framer-motion + gsap (already
  installed; the brief's anime.js suggestion is superseded).

## Sitemap — four sections out of the cube

The 3D cube hero navigates to four sections:

### 1. About Us (`/about-us`)
- **Our Story** — the big "what the team does": emerging simulation technologies.
- **History** — timeline format (founding → Makerspace home → first outreach → collaborations →
  conferences → current projects → site relaunch).
- **Values / Mascot / Ethos** — team values, why the platypus is the mascot, team ethos.
- **The Team** — academic advisors, leads, members by department (Notion-driven; LinkedIn links
  on cards).
- **Join Us** CTA.

### 2. Collaborators (`/collaborators`)
Single page, four sub-sections:
1. **Main Partners** — Embodied Visualisation (EmVis) and eSolutions VARS.
2. **Our Support Network** — the Digital Makerspace network and the Faculty of IT (and
   Engineering) that support us.
3. **Partners We've Worked With** — MBEST, MPP, MSB, MCAV, MAC, IA Labs, SMEE, CCA,
   Monash College, MSDI, …
4. **Donate & Work With Us** — sponsorship/donation pitch + contact CTA.

### 3. Outreach (`/outreach`)
1. **Major Events** — flagship events (Tech Futures, O-Week, showcases).
2. **External Outreach** — edu workshops, high-school programs (MacRob, SPARK, Minaret,
   Open Day).
3. **Conferences** — IEEE VR, SXSW, PAX, TGX, AWE, game jams, UnitedXR, ImmersiveX.
4. **Internal Socials** — social events run inside the team.

### 4. Portfolios (`/portfolios`)
Houses **everything we do**. Driven by the Notion Portfolios DB (`Web Status = Active` is the
publish flag; card fields: One Liner / Cover / Department / Project Type / Tech Used).
**Deferred — do not touch specifics until About Us, Home, Collaborators, and Outreach ship.**

### Home (`/`)
Full-screen 3D ContourMap hero (4 scroll pages, cube nav labels) → below the hero:
**Featured Projects** (Stanford, Bali, MBEST from Notion) → **Past Events** → full footer.

## Build order (user-confirmed)

1. ✅ Phase 0 — this docs folder, README, constitution draft
2. Phase 1 — About Us build-out
3. Phase 2 — Home page sections (projects/events) + metadata
4. Phase 3 — Collaborators restructure
5. Phase 4 — Outreach restructure
6. Last — Portfolios

Push to `prod` after each phase; iterate as reference sites get supplied.

## Current repo state (as of 2026-07-09)

- Next.js 15 App Router, React 19, Tailwind v4 (`@theme` tokens in `src/app/globals.css`,
  no tailwind.config), TypeScript. Notion CMS layer in `src/lib/notion/` with DUMMY_ fail-soft
  fallbacks and 1 h `unstable_cache`.
- 3D hero: `src/components/Hero.tsx` → `src/components/ContourMap/` (R3F, ScrollControls ×4
  pages, performance tiers, memory-flashback orbs fed by Notion images). **Do not restructure.**
- Navbar: `Navbar.tsx` re-exports `OldNavbar` (scramble-text MENU). The immersive
  `NavbarContent.tsx` menu is built but unmounted — future work.
- Known quirks: both npm and pnpm lockfiles committed; `src/content/home.ts` is legacy (only
  `homeContent.nav` is used, by OldNavbar); Notion S3 image URLs expire ~1 h (matches cache TTL).

## Future work / backlog

- **Outreach phase 4** as above.
- **Portfolios:** slug-based URLs (currently Notion UUIDs; TODO in `src/lib/notion/pages.ts`),
  card fields One Liner / Cover / Web Status, sort/filter by equipment type.
- **Featured flag in Notion:** replace name-matching in `getFeaturedPortfolios()` with a real
  "Featured" checkbox property on the Portfolios DB for editorial control.
- **Equipment list** on the site, updated via Notion.
- **Upcoming events** on the site, updated via Notion (Events DB).
- **LinkedIn on Notion:** team data enrichment (LinkedIn URLs already flow through members DB;
  photo scraping was removed deliberately — don't reintroduce).
- Immersive navbar (`NavbarContent.tsx`) decision: ship or delete.
- Datavis-flavoured pages drawing on the DVP chart library (see `docs/DVP-DATAVIS.md`).
- Mascot section artwork; confirm platypus origin story with the team.
- OffBit font licensing check (trial versions currently shipped).
