# web-nexus

The website of **MNET — Monash Nexus for Emerging Technologies** (https://monashemerging.tech):
a WebXR-flavoured Next.js site with a 3D cube/contour hero and content pulled live from the
team's Notion workspace.

## Docs

Start here before developing — these files are the working source of truth:

- [docs/MNET.md](docs/MNET.md) — who MNET is: mission, departments, facilities, partners, brand, Notion schema
- [docs/WEBSITE.md](docs/WEBSITE.md) — sitemap, redesign brief, build order, backlog
- [docs/LEGACY-SITE.md](docs/LEGACY-SITE.md) — content/feature inventory of the old PHP site
- [docs/DVP-DATAVIS.md](docs/DVP-DATAVIS.md) — D3 chart library available for future extraction

## Getting started

```bash
npm install
cp sample.env .env.local   # optional — see below
npm run dev
```

Open http://localhost:3000.

**Notion env vars are optional in development.** Without `NOTION_API_KEY` /
`NOTION_PORTFOLIOS_DB_ID` / `NOTION_MEMBERS_DB_ID` (see `sample.env`), the data layer in
`src/lib/notion/` falls back to built-in dummy content — the console will say so. Don't mistake
dummy rosters/projects for production data.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 (tokens in
`src/app/globals.css`) · react-three-fiber/drei (3D hero in `src/components/ContourMap/`) ·
framer-motion + GSAP · Notion API (`@notionhq/client`) with 1 h `unstable_cache`.

## Deploying

Pushing to `prod` deploys via Vercel. `next build` runs ESLint and TypeScript checks — the push
fails the deploy if they don't pass, so run `npm run lint && npm run build` before pushing.

Member photos are synced from Notion covers with `node scripts/fetch-notion-covers.js`
(reads `.env.local`, writes `public/img/members/{page-id}.jpg`).
