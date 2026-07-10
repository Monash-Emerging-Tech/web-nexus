"use server"

import Hero, { UpcomingEvent } from "@/components/Hero";
import Footer from "@/components/Footer";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import { getPortfolios, getFeaturedPortfolios } from "@/lib/notion/portfolios";
import { getLeads, getSeniorMembers, getActiveMembers } from "@/lib/notion/members";
import { Portfolio } from "@/lib/notion/types";

const Home = async () => {
  let flashbackUrls: string[] = [];
  let projectData: Portfolio[] = [];
  let upcomingEvent: UpcomingEvent | null = null;
  try {
    const [portfolios, leads, seniors, active, featured, upcoming] =
      await Promise.all([
        getPortfolios(),
        getLeads(),
        getSeniorMembers(),
        getActiveMembers(),
        getFeaturedPortfolios(),
        getPortfolios({ department: "Marketing", timeWindow: "upcoming", limit: 1 }),
      ]);
    projectData = featured;

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
      <div className="bg-[url(/img/wireframe_1.png)] bg-[length:120%] bg-no-repeat bg-[position:-100px_50px] pb-16">
        <FeaturedProjects data={projectData} />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
