"use server"

import Hero, { UpcomingEvent } from "@/components/Hero";
import Footer from "@/components/Footer";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import { getPortfolios, getFeaturedPortfolios } from "@/lib/notion/portfolios";
import { Portfolio } from "@/lib/notion/types";

const Home = async () => {
  let projectData: Portfolio[] = [];
  let upcomingEvent: UpcomingEvent | null = null;
  try {
    const [featured, upcoming] = await Promise.all([
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
  } catch (error) {
    console.error("Error fetching homepage data:", error);
  }

  return (
    <div className="relative overflow-x-hidden">
      <Hero upcomingEvent={upcomingEvent} />
      <div className="bg-[url(/img/wireframe_1.png)] bg-[length:120%] bg-no-repeat bg-[position:-100px_50px] pb-16">
        <FeaturedProjects data={projectData} />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
