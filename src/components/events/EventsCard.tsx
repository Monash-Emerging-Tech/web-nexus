import Image from 'next/image'


import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority";

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

export interface EventData {
	title: string;
	description: string;
	date: {
		day: number;
		month: number;
		year: number;
	};
	type: string;
	image: string;
}

function EventsCard({
	style,
	data
} : VariantProps<typeof eventsHolderStyles> & { data : EventData }) {
	const badgeColorByType: Record<string, string> = {
		Workshop: "bg-[#DC003B]",
		Expo: "bg-[#030CAB]",
		Industry: "bg-[#8A2BE2]",
	};

	const badgeClass = badgeColorByType[data.type] ?? "bg-[#DC003B]";

	return (
		<div className="relative">
			<div className={cn(eventsHolderStyles({ style }), "h-full")}>
				<div className="absolute pt-7">
					<p className={`${badgeClass} pt-2 pb-2 pl-4 pr-4 text-2xl font-bold`}>{data.type}</p>
				</div>
				<div className="p-8 flex flex-col gap-2">
					<Image
						src={data.image}
						alt={data.title}
						width={600}
						height={400}
						className="w-full h-auto object-cover rounded-3xl mb-2"
					/>
					<p className="text-lg">{data.date.day} / {data.date.month} / {data.date.year}</p>
					<h1 className="text-3xl font-bold">{data.title}</h1>
					<p className="text-xl">{data.description}</p>
				</div>
			</div>
		</div>
	)
}

export default EventsCard;