import Link from "next/link";
import { Portfolio } from "@/lib/notion/types";
import EventsCard from "./EventsCard";

function EventsHolder({data}: {data: Portfolio[]}) {

  return (
    <section className="mb-25">
      <div className="pt-10 px-4 md:pr-24 md:pl-12 flex flex-col">
        <div
          className={
            "text-5xl md:text-header font-offbit-dot font-bold text-right md:translate-y-6"
          }
        >
          Past Events
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-2">
          <div className="text-xl md:text-[1.75rem] font-offbit font-bold text-left md:-translate-y-2">
            Stay in touch for future events!
            <br /> &nbsp; @MonashEmergingTech
          </div>
          <div className="text-2xl md:text-subheader font-offbit font-bold text-right">
            Inspire. Connect. Innovate.
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 p-6 md:p-10 pb-0 items-stretch">
        {data.map((event, index) => (
          <EventsCard data={event} key={index} />
        ))}
      </div>
      <div className="flex justify-end px-6 md:px-10 pt-8">
        <Link
          href="/outreach"
          className="font-offbit text-xl font-bold text-white transition-colors duration-300 hover:text-[#DC003B]"
        >
          See all events →
        </Link>
      </div>
    </section>
  );
}

export default EventsHolder;
