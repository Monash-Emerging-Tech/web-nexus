"use client";

import EventsCard from "@/components/events/EventsCard";
import { Portfolio } from "@/lib/notion/types";

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="pt-6 md:pt-8 pr-6 pl-6 md:pr-24 md:pl-12 flex flex-col mb-2 md:mb-4">
    <div className={"text-[3rem] md:text-[5rem] font-offbit-101 font-bold text-left"}>
      {title}
    </div>
  </div>
);

const EventsPage = ({ pastEvents = [], futureEvents = [] } : { pastEvents : Portfolio[], futureEvents: Portfolio[] }) => {
  return (
    <div className="mb-25">
      <div className="bg-[url(/img/events-background.png)] bg-cover bg-bottom w-full h-[30vh] md:h-[40vh] flex items-end">
        <div className="px-6 md:px-12 pb-6 m-auto pt-32">
          <h1 className="text-[4rem] md:text-[6rem] text-center font-offbit-dot font-bold">OUTREACH</h1>
        </div>
      </div>

      <SectionHeader
        title="UPCOMING OUTREACH:"
      />
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-10 px-6 md:px-10 pt-3 md:pt-4 pb-6 md:pb-8 items-stretch">
        {futureEvents.length > 0 ? (
          futureEvents.map((event, index) => (
            <EventsCard style={index % 2 === 0 ? "gradient" : "altBlue"} data={event} key={`up-${event.id}`} />
          ))
        ) : (
          <p className="text-white/60 font-offbit text-xl col-span-3 text-center py-8">
            No upcoming events - stay tuned!
          </p>
        )}
      </div>

      <SectionHeader
        title="PAST OUTREACH:"
      />
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-10 px-6 md:px-10 pt-3 md:pt-4 pb-6 md:pb-8 items-stretch">
        {pastEvents.map((event) => (
          <EventsCard style="gradient" data={event} key={`past-${event.id}`} />
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
