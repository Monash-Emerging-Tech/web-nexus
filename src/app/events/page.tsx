// "use server"

// import Footer from "@/components/Footer";
// import EventsPage from "@/components/events/EventsPage";
// import { getPastEventPortfolios, getUpcomingEventPortfolios } from "@/lib/notion/portfolios";
// import Nav from "@/components/navbar_test/Nav";

// const EventsRoute = async () => {
//   const pastEvents = await getPastEventPortfolios();
//   const futureEvents = await getUpcomingEventPortfolios();

//   return (
//     <div className="bg-black min-h-screen w-full">
//       <Nav />
//       <EventsPage pastEvents={pastEvents} futureEvents={futureEvents} />
//       <Footer />
//     </div>
//   );
// }

// export default EventsRoute;

"use client";

import EventsCard from "@/components/events/EventsCard";
import { Portfolio } from "@/lib/notion/types";

const mockUpcoming: Portfolio[] = [
  {
    id: "1",
    name: "MNET x MAC Spline Workshop",
    oneliner: "temp",
    tags: ["test", "mac"],
    tech: [],
    members: [],
    githubUrl: undefined,
    status: undefined,
    description:
      "Partnered with Monash's largest IT student club to deliver a workshop teaching the fundamentals of 3D on the web.",
    date: { start: "not tomorrow", end: undefined },
    imageUrl: "https://placehold.co/640x360.png",
  },
  {
    id: "2",
    name: "SXSW Sydney",
    oneliner: "temp",
    tags: ["text", "sxsw"],
    tech: [],
    members: [],
    githubUrl: undefined,
    status: undefined,
    description:
      "Ran a booth at one of the premier innovation conferences in the Southern Hemisphere, showcasing MNET projects to attendees from 40+ countries.",
    date: { start: "today", end: undefined },
    imageUrl: "https://placehold.co/640x360.png",
  },
  {
    id: "3",
    name: "Tech Futures Industry Night",
    oneliner: "temp",
    tags: ["test", "industry"],
    tech: [],
    members: [],
    githubUrl: undefined,
    status: undefined,
    description:
      "Worked with Monash Deep Neuron to organize a networking event with cutting-edge companies, featuring 2 panelists, industry partners, and over 500 student attendees.",
    date: { start: "not yesterday", end: undefined },
    imageUrl: "https://placehold.co/640x360.png",
  },
];

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="pt-6 md:pt-8 pr-6 pl-6 md:pr-24 md:pl-12 flex flex-col mb-2 md:mb-4">
    <div className={"text-[3rem] md:text-[5rem] font-offbit-101 font-bold text-left"}>
      {title}
    </div>
  </div>
);

const EventsPage = ({ pastEvents = [], futureEvents = [] } : { pastEvents : Portfolio[], futureEvents: Portfolio[] }) => {
  return (
    <div className="mb-25">
      <div className="bg-[url(/img/events-background.png)] bg-cover bg-bottom w-full h-[30vh] md:h-[40vh] flex items-end">
        <div className="px-6 md:px-12 pb-6 m-auto pt-32">
          <h1 className="text-[4rem] md:text-[6rem] text-center font-offbit-dot font-bold">EVENTS</h1>
        </div>
      </div>

      <SectionHeader
        title="UPCOMING EVENTS:"
        
      />
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-10 px-6 md:px-10 pt-3 md:pt-4 pb-6 md:pb-8 items-stretch">
        {/* Use mock data for now until Notion data is exists */}
        {mockUpcoming.map((event, index) => (
          <EventsCard style={index % 2 === 0 ? "gradient" : "altBlue"} data={event} key={`up-${index}`} />
        ))}

        {futureEvents.map((event, index) => (
          <EventsCard style={index % 2 === 0 ? "gradient" : "altBlue"} data={event} key={`up-${index}`} />
        ))}
      </div>

      <SectionHeader
        title="PAST EVENTS:"
        
      />
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-10 px-6 md:px-10 pt-3 md:pt-4 pb-6 md:pb-8 items-stretch">
        {pastEvents.map((event, index) => (
          <EventsCard style="gradient" data={event} key={`past-${index}`} />
        ))}
      </div>
    </div>
  );
};

export default EventsPage;

