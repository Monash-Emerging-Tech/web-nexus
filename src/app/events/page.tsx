"use server"

import EventsPage from "@/components/events/EventsPage";
import { getPortfolios } from "@/lib/notion/portfolios";

const EventsRoute = async () => {
  const pastEvents = await getPortfolios({ department: "Marketing", timeWindow: "past" });
  const futureEvents = await getPortfolios({ department: "Marketing", timeWindow: "upcoming" });

  return (
    <EventsPage pastEvents={pastEvents} futureEvents={futureEvents} />
  );
}

export default EventsRoute;
