# MNET — Monash Nexus for Emerging Technologies

> Source-of-truth context file for developing this website. Synthesised from the MNET Notion
> workspace, the MNET Google Drive (handover documents, draft constitution, 2025 prospectus,
> METTA-era onboarding docs, MOUs), the legacy site, and public channels.
> Last updated: 2026-07-10.

## Identity

- **Full name:** Monash Nexus for Emerging Technologies (MNET)
- **What it is:** A student team under the **Monash Student Team Initiative (MSTI)**, affiliated
  with the Faculty of Information Technology (and increasingly Engineering). Everything MNET
  does falls under the **simulation technologies** umbrella — XR / immersive media, digital
  twins, quantum computing — while staying deliberately broad: robotics and other up-and-coming
  technologies are "not out of bounds" (draft constitution). "Emerging" is read as emerging
  **from the digital realm into the physical** — hence the tagline.
- **Tagline (primary):** **"Enter the Digital Frontier"** · supporting lines: *Access, Upskill,
  Engage* (prospectus) · "Expanding all horizons." · "JOIN US, BUILD THE FUTURE"
- **Home:** The **Digital Makerspace** at Monash Clayton. Team postal address: Building 63,
  25 Exhibition Walk, Clayton VIC 3168.
- **Website:** https://monashemerging.tech · **Repo:** github.com/Monash-Emerging-Tech/web-nexus
- **Reach:** ~8,000+ combined online student following (2025 prospectus figure).

## Mission (canonical copy)

From the 2025 prospectus — the most polished statement of what MNET is; prefer this voice:

> "We are the Monash Nexus for Emerging Technologies. We are a student team focused on exposing
> students to the possibilities offered by XR, Quantum Computing, and more. As a 'nexus', we
> offer passionate and talented students the opportunity to collaborate with research labs, work
> in an industry environment, and get their hands on otherwise inaccessible technology.
> Together, we hope to inspire the next generation of innovators."

Canonical umbrella (Rohan Kalanje, founder — confirmed 2026-07-10): **everything MNET does
falls under simulation technologies.** The "emerging" in the name is the bridge — technologies
emerging from the digital realm into the physical — which is exactly the prospectus's "bringing
the real into the digital and the digital into the real", and why the tagline is **"Enter the
Digital Frontier"**.

Impact framing (prospectus): MNET strives to explore and harness emerging technologies to
reshape **"what can't be" into "what will be"** — "bringing the real into the digital and the
digital into the real". MNET serves as a nexus between **students, industry, and researchers**;
"diversity of perspective breeds innovation"; "we model ourselves off the world changers of
today to make world changers for tomorrow."
- Join form: https://docs.google.com/forms/d/e/1FAIpQLSej1jyIYU_dy2uJqEs5zUvNY1GUN-6eN2DqxCbb2ucnYrTI7Q/viewform

## Brand

- **Primary red `#DC003B`** (canonical; `#DB003B` appears in code), secondary blue `#030CAB`,
  black background. OffBit font family (⚠ trial license — verify). Glitch/scramble FX, cube
  motif (`public/assets/mnetcube.glb`), wireframe/contour 3D scenes.
- Marketing voice (handover doc): formal & polished for LinkedIn/industry; engaging &
  conversational for Instagram; student's voice — curious, knowledge-based.
- Brandkit (Canva): https://www.canva.com/design/DAGenf1I96M/D09iD-LSUJm31FbjizPjdw/edit
- Figma master: https://www.figma.com/design/UCbmdy5temruNyjVvgBUkO/MNET-Website-Master

## Notion integration reference

- **Portfolios DB** — database id `6c76fb82-07b2-4915-814f-5a57bd4b06b4`, data source
  `a916ca0f-0797-4d7f-8eb0-fde670e6142d`. Key properties: `Project name` (title), `One Liner`,
  `Description`, `Summary`, `Department` (multi), `Project Type` (3D/VR/Digital Twin/
  Prototyping/Data Visualisation), `Tech Used`, `Status`, **`Web Status` (Active/Inactive —
  publish-to-website flag)**, `GitHub Repository`, `Figma Link`, `Canva Link`, `Dates`,
  `Collaborator`, `Priority`, `Portfolio Lead(s)`, `Assignee(s)`.
- **Members DB** — names, roles, quotes, departments, icons, LinkedIn URLs; covers synced via
  `scripts/fetch-notion-covers.js` → `public/img/members/{page-id}.jpg`.
- Env vars (`sample.env`): `NOTION_API_KEY`, `NOTION_PORTFOLIOS_DB_ID`, `NOTION_MEMBERS_DB_ID`;
  all fetchers fail soft to DUMMY_ data when unset.
- Notion hubs: "Nexus Command Centre" (`2511d893-3ee3-8003-9e6f-cb664aed0bf2`), "Web Redesign"
  brief (`1e91d893-3ee3-8085-9004-dd6e6df47f53`).

## Internal references (do not publish on the site)

Deeper operational detail (finance pipelines, MOU templates, recruitment rubrics, access
transfer processes) lives in the Google Drive **Team Lead's Folder → Executives Folder**
(Handover, Supervisor Information, Reporting) and the **DRAFT MNET Constitution** doc. This
file intentionally omits staff contact details and finance codes — the repo is public.
