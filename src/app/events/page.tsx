"use server"

import Footer from "@/components/Footer";
import EventsPage from "@/components/events/EventsPage";
import { getPastEventPortfolios, getUpcomingEventPortfolios } from "@/lib/notion/portfolios";
import Nav from "@/components/navbar_test/Nav";

const EventsRoute = async () => {
  const pastEvents = await getPastEventPortfolios();
  const futureEvents = await getUpcomingEventPortfolios();

  return (
    <div className="bg-black min-h-screen w-full">
      <Nav />
      <EventsPage pastEvents={pastEvents} futureEvents={futureEvents} />
      <Footer />
    </div>
  );
}

export default EventsRoute;