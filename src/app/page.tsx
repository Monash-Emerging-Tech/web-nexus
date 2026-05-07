"use server"

import Footer from "@/components/Footer";
import Projects from "@/components/Projects";
import Hero from "@/components/Hero";
import EventsHolder from "@/components/events/PastEvents_Home";
import { Portfolio } from "@/lib/notion/types";
import { getFeaturedPortfolios, getPastEventPortfolios } from "@/lib/notion/portfolios";
import Nav from "@/components/navbar_test/Nav";

const Home = async () => {
  // Switching to server component for initial data fetch for faster load
  const projectData: Portfolio[] = await getFeaturedPortfolios(3);
  const eventData: Portfolio[] = await getPastEventPortfolios(3);

  return (
    <div className="bg-black min-h-screen w-full">
      <Nav />
      <div className="relative">
        <Hero />
        <div className="bg-[url(/img/wireframe_1.png)] bg-[length:120%] bg-no-repeat bg-[position:-100px_50px] ">
          <Projects data={projectData} />
          <EventsHolder data={eventData} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;