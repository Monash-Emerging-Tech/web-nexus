import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPortfolios } from "@/lib/notion/portfolios";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about-us",
    "/outreach",
    "/portfolios",
    "/collaborators",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  let portfolioRoutes: MetadataRoute.Sitemap = [];
  try {
    const portfolios = await getPortfolios({ department: "Projects" });
    portfolioRoutes = portfolios
      .filter((p) => !p.id.startsWith("dummy"))
      .map((p) => ({
        url: `${SITE_URL}/portfolios/${p.id}`,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }));
  } catch (error) {
    console.error("Error building portfolio sitemap entries:", error);
  }

  return [...staticRoutes, ...portfolioRoutes];
}
