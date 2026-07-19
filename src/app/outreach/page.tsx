import EventsPage from "@/components/events/EventsPage";
import { getPortfolios } from "@/lib/notion/portfolios";

const OutreachRoute = async () => {
  const [pastEvents, futureEvents] = await Promise.all([
    getPortfolios({ department: ["Marketing", "Operations"], timeWindow: "past" }),
    getPortfolios({ department: ["Marketing", "Operations"], timeWindow: "upcoming" }),
  ]);

  return (
    <EventsPage pastEvents={pastEvents} futureEvents={futureEvents} />
  );
}

export default OutreachRoute;
