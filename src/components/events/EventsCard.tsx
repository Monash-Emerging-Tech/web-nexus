import Image from 'next/image'
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority";
import { Portfolio } from '@/lib/notion/types';

const eventsHolderStyles = cva(
  "relative rounded-3xl font-offbit backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:shadow-[0_0_20px_rgba(220,0,59,0.2)]",
  {
    variants: {
      style: {
        gradient: "mnet-border bg-white/5 after:rounded-2xl after:border-5 after:border-transparent",
        altRed: "border-5 bg-[#DC003B]/20 border-[#DC003B]",
        altBlue: "border-5 bg-[#030CAB]/20 border-[#030CAB]",
      }
    }
  }
);



function EventsCard({
  style,
  data
} : VariantProps<typeof eventsHolderStyles> & { data : Portfolio }) {
  const badgeClass = "bg-[#DC003B]";

  const displayDate = data.date.end ?? data.date.start;

  return (
    <Link href={`/projects/${data.id}`} className="relative block h-full group">
      <div className={cn(eventsHolderStyles({ style }), "h-full")}>
        <div className="absolute pt-7 z-10">
          <p className={`${badgeClass} pt-2 pb-2 pl-4 pr-4 text-2xl font-bold`}>
            {data.tags.length > 0 ? data.tags[0] : "Unknown"}
          </p>
        </div>
        <div className="p-8 flex flex-col gap-2 h-full justify-start">
          <div className="w-full h-[200px] overflow-hidden rounded-3xl mb-2 relative bg-neutral-900">
            <img
              src={data.imageUrl ?? "https://placehold.co/600x400.png"}
              alt={data.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          {displayDate && (
            <p className="text-lg text-white/60">{displayDate.split("T")[0]}</p>
          )}
          <h1 className="text-3xl font-bold group-hover:text-[#DC003B] transition-colors duration-300">{data.name}</h1>
          <p className="text-xl line-clamp-3 text-white/80">{data.description}</p>
        </div>
      </div>
    </Link>
  )
}

export default EventsCard;