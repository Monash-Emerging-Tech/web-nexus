import Image from 'next/image'
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority";
import { Portfolio } from '@/lib/notion/types';

const eventsHolderStyles = cva(
  "relative rounded-3xl font-offbit backdrop-blur-md",
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
    <div className="relative">
      <div className={cn(eventsHolderStyles({ style }), "h-full")}>
        <div className="absolute pt-7">
          <p className={`${badgeClass} pt-2 pb-2 pl-4 pr-4 text-2xl font-bold`}>
            {data.tags.length > 0 ? data.tags[0] : "Unknown"}
          </p>
        </div>
        <div className="p-8 flex flex-col gap-2">
          <Image
            unoptimized
            src={data.imageUrl ?? "https://placehold.co/600x400.png"}
            alt={data.name}
            width={600}
            height={400}
            className="w-full h-auto object-cover rounded-3xl mb-2"
          />
          {displayDate && (
            <p className="text-lg">{displayDate.split("T")[0]}</p>
          )}
          <h1 className="text-3xl font-bold">{data.name}</h1>
          <p className="text-xl">{data.description}</p>
        </div>
      </div>
    </div>
  )
}

export default EventsCard;