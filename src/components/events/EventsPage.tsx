"use client";

import EventsCard, { EventData } from "@/components/events/EventsCard";

const mockUpcoming: EventData[] = [
  {
    title: "MNET x MAC Spline Workshop",
    description:
      "Partnered with Monash's largest IT student club to deliver a workshop teaching the fundamentals of 3D on the web.",
    date: { day: 7, month: 5, year: 2025 },
    type: "Workshop",
    image: "https://placehold.co/640x360.png",
  },
  {
    title: "SXSW Sydney",
    description:
      "Ran a booth at one of the premier innovation conferences in the Southern Hemisphere, showcasing MNET projects to attendees from 40+ countries.",
    date: { day: 14, month: 10, year: 2025 },
    type: "Expo",
    image: "https://placehold.co/640x360.png",
  },
  {
    title: "Tech Futures Industry Night",
    description:
      "Worked with Monash Deep Neuron to organize a networking event with cutting-edge companies, featuring 2 panelists, industry partners, and over 500 student attendees.",
    date: { day: 1, month: 6, year: 2025 },
    type: "Industry",
    image: "https://placehold.co/640x360.png",
  },
];

const mockPast: EventData[] = [
  {
    title: "MNET x MAC Spline Workshop",
    description:
      "Partnered with Monash's largest IT student club to deliver a workshop teaching the fundamentals of 3D on the web.",
    date: { day: 7, month: 5, year: 2024 },
    type: "Workshop",
    image: "https://placehold.co/640x360.png",
  },
  {
    title: "SXSW Sydney",
    description:
      "Ran a booth at one of the premier innovation conferences in the Southern Hemisphere, showcasing MNET projects to attendees from 40+ countries.",
    date: { day: 14, month: 10, year: 2024 },
    type: "Expo",
    image: "https://placehold.co/640x360.png",
  },
  {
    title: "Tech Futures Industry Night",
    description:
      "Worked with Monash Deep Neuron to organize a networking event with cutting-edge companies, featuring 2 panelists, industry partners, and over 500 student attendees.",
    date: { day: 1, month: 6, year: 2024 },
    type: "Industry",
    image: "https://placehold.co/640x360.png",
  },
  {
    title: "MNET x MAC Spline Workshop",
    description:
      "Partnered with Monash's largest IT student club to deliver a workshop teaching the fundamentals of 3D on the web.",
    date: { day: 7, month: 5, year: 2023 },
    type: "Workshop",
    image: "https://placehold.co/640x360.png",
  },
  {
    title: "SXSW Sydney",
    description:
      "Ran a booth at one of the premier innovation conferences in the Southern Hemisphere, showcasing MNET projects to attendees from 40+ countries.",
    date: { day: 14, month: 10, year: 2023 },
    type: "Expo",
    image: "https://placehold.co/640x360.png",
  },
  {
    title: "Tech Futures Industry Night",
    description:
      "Worked with Monash Deep Neuron to organize a networking event with cutting-edge companies, featuring 2 panelists, industry partners, and over 500 student attendees.",
    date: { day: 1, month: 6, year: 2023 },
    type: "Industry",
    image: "https://placehold.co/640x360.png",
  },
];

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="pt-10 pr-6 pl-6 md:pr-24 md:pl-12 flex flex-col">
    <div className={"text-[4rem] md:text-[6rem] font-offbit-101 font-bold text-left"}>
      {title}
    </div>
  </div>
);

const EventsPage: React.FC = () => {
  return (
    <div className="mb-25">
      <div className="bg-[url(/img/events-background.png)] bg-cover bg-bottom w-full h-[30vh] md:h-[40vh] flex items-end">
        <div className="px-6 md:px-12 pb-6 m-auto pt-32">
          <h1 className="text-[3rem] md:text-[6rem] text-center font-offbit-dot font-bold">EVENTS</h1>
        </div>
      </div>

      <SectionHeader
        title="UPCOMING EVENTS:"
        
      />
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-12 p-6 md:p-10 items-stretch">
        {mockUpcoming.map((event, index) => (
          <EventsCard style={index % 2 === 0 ? "gradient" : "altBlue"} data={event} key={`up-${index}`} />
        ))}
      </div>

      <SectionHeader
        title="PAST EVENTS:"
        
      />
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-12 p-6 md:p-10 pt-6 items-stretch">
        {mockPast.map((event, index) => (
          <EventsCard style="gradient" data={event} key={`past-${index}`} />
        ))}
      </div>
    </div>
  );
};

export default EventsPage;

