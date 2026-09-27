import { homeContent } from "@/content/home";

// The four site sections, derived from the MENU links in homeContent.nav so
// the menu, the navbar "you are here" label, the page transition and the tab
// titles all share one source of names and routes.

export interface Section {
  label: string;
  href: string;
}

export const SECTIONS: Section[] = homeContent.nav.menuGroups[0].links
  .filter((link) => link.href.startsWith("/"))
  .map(({ label, href }) => ({ label, href }));

// Routes that belong to a section without living under its href.
const SECTION_ALIASES: Record<string, string> = {
  "/projects": "/portfolios",
};

/** The section a pathname belongs to, or null (home and anything else). */
export const getSection = (pathname: string | null | undefined): Section | null => {
  if (!pathname) return null;
  const root = `/${pathname.split("/")[1] ?? ""}`;
  const href = SECTION_ALIASES[root] ?? root;
  return SECTIONS.find((section) => section.href === href) ?? null;
};

/** Tab title for a section layout, e.g. "Outreach | Monash Nexus for ...". */
export const sectionTitle = (href: string) => {
  const section = SECTIONS.find((s) => s.href === href);
  return `${section?.label ?? ""} | Monash Nexus for Emerging Technologies`;
};
