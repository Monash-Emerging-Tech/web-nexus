"use client";

import { useEffect, useState } from 'react';
import EventsCard from './EventsCard';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';


function EventsHolder() {
	const [emblaRef, emblaApi] = useEmblaCarousel({ watchDrag:true,  loop: true, slidesToScroll: 1 }, [Autoplay({ delay: 4000 })])
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Update the selected index when slide changes. This is used for the navigation buttons
	useEffect(() => {
		if (emblaApi) {
			emblaApi.on("select", () => {
				setSelectedIndex(emblaApi.selectedScrollSnap());
			});
		}
	}, [emblaApi]);

	// Scroll to a specific slide index and pause autoplay for 8 seconds
	const scrollTo = (index: number) => {
		if (emblaApi) {
			emblaApi.scrollTo(index);
		}
		const autoplay = emblaApi?.plugins()?.autoplay
		if (!autoplay) return
		
		autoplay.stop()

		setTimeout(() => {
			autoplay.play()
		}, 8000)
	}

	// Temp data
	const data = [
		{
		title: "MNET x MAC Spline Workshop",
		description: "Partnered with Monash's largest IT student club to deliver a workshop teaching the fundamentals of 3D on the web.",
		date: { day: 7, month: 5, year: 2024 },
		type: "Workshop",
		image: "https://placehold.co/600x400.png",
		},
		{
		title: "SXSW Sydney",
		description: "Ran a booth at one of the largest tech conferences in the Southern Hemisphere, showcasing MNET projects to attendees from 40+ countries.",
		date: { day: 14, month: 10, year: 2024 },
		type: "Expo",
		image: "https://placehold.co/600x400.png",
		}
	];

	return (
		<div className="mb-25 flex flex-col items-center justify-center w-full">
			<div className='pt-10 mt-40 flex flex-col w-full md:px-12 p-4'>
				<div className='text-[6rem]/20 md:text-[8rem]/30 lg:text-[8.5rem]/30 font-offbit-dot font-bold text-center lg:text-right'>
					Past Events
				</div>
				<div className='flex flex-row items-center justify-center gap-16 md:justify-between w-full'>
					<div className="text-[1.5rem]/8 hidden md:block font-offbit-101 font-bold text-center">
						Stay in touch for future events!<br />@MonashEmergingTech
					</div>
					<div className="text-[2rem] md:text-[3rem]/12 lg:text-[3.5rem]/16 font-offbit-101 font-bold text-center md:text-right">
						Inspire. Connect. Innovate.
					</div>
				</div>
			</div>
			{/* Events grid for larger screens */}
			<div className='hidden md:grid grid-cols-2 lg:grid-cols-3 gap-12 p-10 pb-0 items-stretch'>
				{data.map((event, index) => (
					<EventsCard style={"gradient"} data={event} key={index} />
				))}
			</div>
			
			{/* Events grid for smaller screens */}
			<div className='md:hidden overflow-hidden w-full' ref={emblaRef}>
				<div className="flex w-full" style={{ width: '100%' }}>
					{data.map((event, index) => (
						<div
							className="flex-shrink-0 flex justify-center"
							style={{ minWidth: '100%' }}
							key={index}
						>
							<EventsCard style={"gradient"} data={event} />
						</div>
					))}
				</div>
			</div>

			
			{/* Clickable buttons to navigate carousel and show index (probably too small) */}
			<div className='md:hidden flex flex-row justify-center w-full gap-4 p-4'>
				{data.map((_, index) => (
					<button 
					className={cn("h-4 cursor-pointer aspect-square rounded-full border-2 border-[#DC003B]", selectedIndex === index ? "bg-[#030CAB] border-[#030CAB]" : null)} 
					onClick={() => scrollTo(index)} key={index}></button>
				))}
			</div>
		</div>
	);
}

export default EventsHolder;
