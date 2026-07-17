"use client";

import EventsCard from "@/components/events/EventsCard";
import { Portfolio } from "@/lib/notion/types";

const EventsPage = ({
  pastEvents = [],
  futureEvents = [],
}: {
  pastEvents: Portfolio[];
  futureEvents: Portfolio[];
}) => {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-[25vh] md:pt-[30vh] pb-16">
      <div className="container mx-auto">
        {/* Main page heading */}
        <h1 className="h-[160px] text-header font-bold text-neutral-100 text-left font-offbit-dot">
          Outreach
        </h1>

        <p className="text-left pb-10 text-subheader font-offbit font-bold ml-1">
          Events, workshops and community engagement
        </p>

        {/* Upcoming outreach */}
        <div className="mb-16">
          <h2 className="text-[2.5rem] md:text-[4rem] font-offbit-dot font-bold text-neutral-100 mb-6">
            Upcoming Outreach
          </h2>

          <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-10 items-stretch">
            {futureEvents.length > 0 ? (
              futureEvents.map((event) => (
                <EventsCard
                  data={event}
                  key={`up-${event.id}`}
                />
              ))
            ) : (
              <p className="text-white/60 font-offbit text-xl md:col-span-3 py-8">
                No upcoming events - stay tuned!
              </p>
            )}
          </div>
        </div>

        {/* Past outreach */}
        <div>
          <h2 className="text-[2.5rem] md:text-[4rem] font-offbit-dot font-bold text-neutral-100 mb-6">
            Past Outreach
          </h2>

          <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-10 items-stretch">
            {pastEvents.length > 0 ? (
              pastEvents.map((event) => (
                <EventsCard
                  data={event}
                  key={`past-${event.id}`}
                />
              ))
            ) : (
              <p className="text-white/60 font-offbit text-xl md:col-span-3 py-8">
                No past outreach events available.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsPage;