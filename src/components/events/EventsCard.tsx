import Image from "next/image";
import Link from "next/link";
import { Portfolio } from "@/lib/notion/types";

function EventsCard({ data }: { data: Portfolio }) {
  const displayDate = data.date?.end ?? data.date?.start;
  const description = data.oneliner || data.description;

  return (
    <article className="relative group h-full w-full overflow-visible hover:z-50">
      <div
        className="
          relative
          border-2
          border-[#DC003B]
          rounded-3xl
          p-4
          flex
          flex-col
          h-full
          overflow-visible
          bg-white/5
          backdrop-blur-md
          transition-all
          duration-300
          group-hover:scale-[1.02]
          group-hover:bg-white/10
          group-hover:shadow-[0_0_20px_rgba(220,0,59,0.3)]
        "
      >
        {/* Event heading */}
        <div className="flex flex-col mb-4 overflow-visible">
          <h2
            className="
              text-white
              text-[2em]
              font-offbit-dot
              font-bold
              group-hover:text-[#DC003B]
              transition-colors
              duration-300
            "
          >
            <Link
              href="#"
              className="after:absolute after:inset-0 after:z-0"
            >
              {data.name}
            </Link>
          </h2>

          <p className="text-white/80 font-offbit mt-2 text-[1.4em] line-clamp-2">
            {description}
          </p>
        </div>

        {/* Event image */}
        <div
          className="
            relative
            mb-4
            aspect-video
            w-full
            overflow-hidden
            rounded-xl
            bg-neutral-900
          "
        >
          <Image
            src={data.imageUrl || "/img/About-Focus-Temp.JPG"}
            alt={data.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 30vw"
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />
        </div>

        {/* Event details */}
        <div className="relative z-20 mt-auto flex items-center justify-between pt-2">
          {displayDate && (
            <span
              className="
                ml-auto
                whitespace-nowrap
                text-[1.2em]
                text-white/60
                font-offbit
                font-bold
              "
            >
              {new Date(displayDate).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default EventsCard;