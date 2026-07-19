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
  const hasUpcomingEvents = futureEvents.length > 0;

  return (
    <section
      className={`
        px-4
        sm:px-6
        lg:px-8
        pb-16
        ${
          hasUpcomingEvents
            ? "pt-[25vh] md:pt-[30vh]"
            : "pt-[18vh] md:pt-[22vh]"
        }
      `}
    >
      <div className="container mx-auto">
        {/* Main page heading */}
        <h1
          className={`
            text-5xl
            sm:text-6xl
            md:text-header
            font-bold
            text-neutral-100
            text-left
            font-offbit-dot
            mb-12
            md:mb-16
            ${
              hasUpcomingEvents
                ? "h-auto md:h-[160px]"
                : "h-auto"
            }
          `}
        >
          Outreach
        </h1>

        {/* Upcoming outreach */}
        <div className={hasUpcomingEvents ? "mb-16" : "mb-12"}>
          <h2 className="text-3xl sm:text-[2.5rem] md:text-[4rem] font-offbit-dot font-bold text-neutral-100 mb-6">
            Upcoming Outreach
          </h2>

          {hasUpcomingEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-stretch overflow-visible">
              {futureEvents.map((event) => (
                <EventsCard data={event} key={`up-${event.id}`} />
              ))}
            </div>
          ) : (
            <div
              className="
                max-w-2xl
                rounded-3xl
                border
                border-white/15
                bg-white/[0.04]
                px-6
                py-8
                md:px-8
                md:py-10
                justify-center
              "
            >
              <p className="text-white text-2xl md:text-3xl font-offbit font-bold">
                Nothing scheduled just yet.
              </p>

              <p className="mt-3 text-white/60 text-lg md:text-xl font-offbit leading-relaxed">
                New events, workshops and community sessions will appear here
                when they are announced.
              </p>

              {pastEvents.length > 0 && (
                <a
                  href="#past-outreach"
                  className="
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    text-lg
                    font-offbit
                    font-bold
                    text-[#DC003B]
                    transition-opacity
                    duration-300
                    hover:opacity-75
                  "
                >
                  Explore past outreach
                  <span aria-hidden="true">↓</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Past outreach */}
        <div id="past-outreach" className="scroll-mt-28">
          <h2 className="text-3xl sm:text-[2.5rem] md:text-[4rem] font-offbit-dot font-bold text-neutral-100 mb-6">
            Past Outreach
          </h2>

          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-stretch overflow-visible">
              {pastEvents.map((event) => (
                <EventsCard data={event} key={`past-${event.id}`} />
              ))}
            </div>
          ) : (
            <div
              className="
                max-w-2xl
                rounded-3xl
                border
                border-white/10
                bg-white/[0.03]
                px-6
                py-8
                md:px-8
                md:py-10
              "
            >
              <p className="text-white/60 font-offbit text-lg md:text-xl">
                No past outreach events are available yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventsPage;