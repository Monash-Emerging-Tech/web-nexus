"use server"

import Hero, { UpcomingEvent } from "@/components/Hero";
import { getPortfolios } from "@/lib/notion/portfolios";

const Home = async () => {
  let upcomingEvent: UpcomingEvent | null = null;
  try {
    const upcoming = await getPortfolios({
      department: "Marketing",
      timeWindow: "upcoming",
      limit: 1,
    });
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
    <Hero upcomingEvent={upcomingEvent} />
  );
}

export default Home;
