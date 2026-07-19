"use server"

import Hero, { UpcomingEvent } from "@/components/Hero";
import { getPortfolios } from "@/lib/notion/portfolios";
import { getLeads, getSeniorMembers, getActiveMembers } from "@/lib/notion/members";

const Home = async () => {
  let flashbackUrls: string[] = [];
  let upcomingEvent: UpcomingEvent | null = null;
  try {
    const [portfolios, leads, seniors, active, upcoming] =
      await Promise.all([
        getPortfolios(),
        getLeads(),
        getSeniorMembers(),
        getActiveMembers(),
        getPortfolios({ department: ["Marketing", "Operations"], timeWindow: "upcoming", limit: 1 }),
      ]);

    const nextEvent = upcoming[0];
    if (nextEvent?.date?.start) {
      upcomingEvent = {
        title: nextEvent.name,
        timestamp: new Date(nextEvent.date.start).getTime(),
      };
    }

    const urls = new Set<string>();
    portfolios.forEach((p) => {
      if (p.imageUrl) urls.add(p.imageUrl);
    });
    [leads, seniors, active].forEach((group) => {
      group.forEach((m) => {
        if (m.icon && (m.icon.startsWith("http") || m.icon.startsWith("/"))) {
          urls.add(m.icon);
        }
      });
    });

    flashbackUrls = Array.from(urls).filter(
      (u) => !u.includes("placehold.co") && !u.includes("placeholder")
    );
  } catch (error) {
    console.error("Error fetching homepage flashback URLs:", error);
  }

  return (
    <div className="relative overflow-x-hidden">
      <Hero flashbackUrls={flashbackUrls} upcomingEvent={upcomingEvent} />
    </div>
  );
}

export default Home;
