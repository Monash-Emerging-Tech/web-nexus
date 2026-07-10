/**
 * The page pool for the home hero's lava-blob bubbles and the cube's nav
 * labels — single source of truth for route, display label and the curated
 * image that represents each page inside a blob.
 *
 * The Nav-* images are the same ones the navbar hover cards use, so the
 * visual language stays consistent across nav surfaces.
 */
export interface NavPage {
  route: string;
  label: string;
  image: string;
}

export const NAV_PAGES: NavPage[] = [
  { route: "/about-us", label: "ABOUT US", image: "/img/Nav-About-Temp.JPG" },
  { route: "/portfolios", label: "PORTFOLIO", image: "/img/Nav-Projects.png" },
  { route: "/outreach", label: "OUTREACH", image: "/img/Nav-Events.JPG" },
  {
    route: "/collaborators",
    label: "COLLABORATORS",
    image: "/img/facilities/mixed-reality-studio.jpg",
  },
];
