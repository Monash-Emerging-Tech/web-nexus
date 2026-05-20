"use server"

import EventsPage from "@/components/events/EventsPage";
import { getPastEventPortfolios, getUpcomingEventPortfolios } from "@/lib/notion/portfolios";

const EventsRoute = async () => {
  const pastEvents = await getPastEventPortfolios();
  const futureEvents = await getUpcomingEventPortfolios();

  return (
    <EventsPage pastEvents={pastEvents} futureEvents={futureEvents} />
  );
}

export default EventsRoute;
