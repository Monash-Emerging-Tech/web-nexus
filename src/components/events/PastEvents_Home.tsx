import { Portfolio } from "@/lib/notion/types";
import EventsCard from "./EventsCard";

function EventsHolder({data}: {data: Portfolio[]}) {

  return (
    <section className="mb-25">
      <div className="pt-10 pr-24 pl-12 flex flex-col">
        <div
          className={
            "text-header font-offbit-dot font-bold text-right translate-y-6"
          }
        >
          Past Events
        </div>
        <div className="flex flex-row justify-between">
          <div className="text-[1.75rem] font-offbit font-bold text-left -translate-y-2">
            Stay in touch for future events!
            <br /> &nbsp; @MonashEmergingTech
          </div>
          <div className="text-subheader font-offbit font-bold text-right">
            Inspire. Connect. Innovate.
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-12 p-10 pb-0 items-stretch">
        {data.map((event, index) => (
          <EventsCard style={"gradient"} data={event} key={index} />
        ))}
      </div>
    </section>
  );
}

export default EventsHolder;
