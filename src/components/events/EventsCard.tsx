import Image from "next/image";
import Link from "next/link";
import { Portfolio } from "@/lib/notion/types";

function EventsCard({ data }: { data: Portfolio }) {
  const displayDate = data.date?.end ?? data.date?.start;

  return (
    <div className="relative group h-full">
      <div className="border-2 border-[#DC003B] rounded-3xl p-4 flex flex-col h-full bg-white/5 backdrop-blur-md transition-all duration-300 group-hover:scale-[1.02] group-hover:bg-white/10 group-hover:shadow-[0_0_20px_rgba(220,0,59,0.3)]">
        {/* Event heading */}
        <div className="flex flex-col mb-4">
          <h2 className="text-white text-[2em] font-offbit-dot font-bold group-hover:text-[#DC003B] transition-colors duration-300">
            <Link
              href={`/portfolios/${data.id}`}
              className="after:absolute after:inset-0 after:z-0"
            >
              {data.name}
            </Link>
          </h2>

          <p className="text-white/80 font-offbit mt-2 text-[1.4em] line-clamp-2">
            {data.oneliner || data.description}
          </p>
        </div>

        {/* Event image */}
        <div className="w-full aspect-video overflow-hidden rounded-xl mb-4 relative bg-neutral-900">
          <Image
            src={data.imageUrl || "/img/About-Focus-Temp.JPG"}
            alt={data.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 30vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Event details */}
        <div className="flex justify-between items-center mt-auto pt-2 relative z-10">
           {/*
            <span className="text-[1.2em] text-white/60 font-offbit font-bold line-clamp-1">
              {data.tags.length > 0 ? data.tags.join(" • ") : "Event"}
            </span>
            */}

          {displayDate && (
            <span className="text-[1.2em] text-white/60 font-offbit font-bold ml-auto whitespace-nowrap">
              {new Date(displayDate).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventsCard;