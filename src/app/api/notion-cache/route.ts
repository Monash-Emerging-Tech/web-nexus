import { NextResponse } from "next/server";
import { getPortfolios } from "@/lib/notion/portfolios";
import {
  getLeads,
  getAcademicAdvisors,
  getSeniorMembers,
  getActiveMembers,
} from "@/lib/notion/members";

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

    return NextResponse.json({
      portfolios,
      leads,
      advisors,
      seniorMembers,
      activeMembers,
    });
  } catch (error) {
    console.error("Notion cache route generic error:", error);
    const message = error instanceof Error ? error.message : "Failed to query Notion";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
