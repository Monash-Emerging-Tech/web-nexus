import * as React from "react";
import Image from 'next/image'

// Imports for handling dynamic styles
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils"


// The variants colours used by this component, gradient is used on the home page, alternate is used on the events page
const eventsHolderStyles = cva(
  "relative bg-white/5 rounded-3xl font-offbit backdrop-blur-md",
  {
    variants: {
      variant: {
        gradient: "mnet-border after:rounded-2xl after:border-5 after:border-transparent",
        alternate: "border-5 border-[#DC003B]", //TODO: Implement colour switching for the alternate varient
      }
    },
  }
);

function EventsHolder({
  variant,
  timing,
  page
}: VariantProps<typeof eventsHolderStyles> & { timing: "past" | "upcoming" } & { page: "home" | "events" }) {

	// Temp data
	const data = [
		{
		title: "MNET x MAC Spline Workshop",
		description: "Partnered with Monash's largest IT student club to deliver a workshop teaching the fundamentals of 3D on the web.",
		date: { day: 7, month: 5, year: 2024 },
		type: "Workshop",
		image: "https://placehold.co/600x400",
		},
		{
		title: "SXSW Sydney",
		description: "Ran a booth at one of the largest tech conferences in the Southern Hemisphere, showcasing MNET projects to attendees from 40+ countries.",
		date: { day: 14, month: 10, year: 2024 },
		type: "Expo",
		image: "https://placehold.co/600x400",
		}
	];

	console.log(eventsHolderStyles({ variant }));

	return (
		<div className="mb-25">
			<div className="pt-10 pr-24 pl-12 flex flex-col">
				{timing === "upcoming" ? (
					<div className={cn( page === "home" && "text-[8.5rem] font-offbit-dot font-bold text-right", page === "events" && "text-[4rem] font-offbit-101 font-bold text-left" )}>
						Upcoming Events{page === "events" && ":"}
					</div>
				) : (
					<>
						<div className={cn( page === "home" && "text-[8.5rem] font-offbit-dot font-bold text-right translate-y-6", page === "events" && "text-[4rem] font-offbit-101 font-bold text-left")}>
							Past Events{page === "events" && ":"}
						</div>
						{page === "home" && (
							<div className="flex flex-row justify-between">
								<div className="text-[1.75rem] font-offbit-101 font-bold text-left -translate-y-2">
									Stay in touch for future events!<br /> &nbsp; @MonashEmergingTech
								</div>
								<div className="text-[3.5rem] font-offbit-101 font-bold text-right">
									Inspire. Connect. Innovate.
								</div>
							</div>
						)}
					</>
				)}
			</div>
			<div className="grid grid-cols-3 gap-12 p-10 pb-0 items-stretch">
				{data.map((event, index) => (
					<div key={index} className="relative">
						<div className={cn(eventsHolderStyles({ variant }), "h-full")}>
							<div className="absolute pt-7">
								<p className="bg-[#DC003B] pt-2 pb-2 pl-4 pr-4 text-2xl font-bold">{event.type}</p>
							</div>
							<div className="p-8 flex flex-col gap-2">
								<img src={event.image} alt={event.title} className="w-full h-auto object-cover rounded-3xl mb-2" />
								<p className="text-lg">{event.date.day} / {event.date.month} / {event.date.year}</p>
								<h1 className="text-3xl font-bold">{event.title}</h1>
								<p className="text-xl">{event.description}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default EventsHolder;
