import { NextResponse } from "next/server";
import { getPortfolios } from "@/lib/notion/portfolios";
import {
  getLeads,
  getAcademicAdvisors,
  getSeniorMembers,
  getActiveMembers,
} from "@/lib/notion/members";

// This route only exists so the client can warm the browser image cache for
// the hero flashback effect. It intentionally returns image URLs only — no
// member names, roles, quotes, or LinkedIn URLs — so it can't be scraped for
// personal data.
export async function GET() {
  try {
    const [portfolios, leads, advisors, seniorMembers, activeMembers] = await Promise.all([
      getPortfolios().catch((err) => {
        console.error("Error fetching portfolios in cache route:", err);
        return [];
      }),
      getLeads().catch((err) => {
        console.error("Error fetching leads in cache route:", err);
        return [];
      }),
      getAcademicAdvisors().catch((err) => {
        console.error("Error fetching advisors in cache route:", err);
        return [];
      }),
      getSeniorMembers().catch((err) => {
        console.error("Error fetching senior members in cache route:", err);
        return [];
      }),
      getActiveMembers().catch((err) => {
        console.error("Error fetching active members in cache route:", err);
        return [];
      }),
    ]);

    const imageUrls = new Set<string>();
    portfolios.forEach((p) => {
      if (p.imageUrl) imageUrls.add(p.imageUrl);
    });
    [leads, advisors, seniorMembers, activeMembers].forEach((group) => {
      group.forEach((m) => {
        if (m.icon && (m.icon.startsWith("http") || m.icon.startsWith("/"))) {
          imageUrls.add(m.icon);
        }
      });
    });

    return NextResponse.json(
      { imageUrls: Array.from(imageUrls) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1500, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Notion cache route generic error:", error);
    return NextResponse.json({ error: "Failed to load image cache" }, { status: 500 });
  }
}
