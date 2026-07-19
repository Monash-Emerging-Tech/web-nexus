import Footer from "@/components/Footer";
import Projects from "@/components/Projects";
import EventsHolder from "@/components/events/PastEvents_Home";
import { Portfolio } from "@/lib/notion/types";
import { getPortfolios } from "@/lib/notion/portfolios";
import Nav from "@/components/navbar_test/Nav";
import HeroTest from "@/components/home_test/HeroTest";

const Home = async () => {
  // Switching to server component for initial data fetch for faster load
  const projectData: Portfolio[] = await getPortfolios({ department: ["Projects", "Education"], limit: 3 });
  const eventData: Portfolio[] = await getPortfolios({ department: ["Marketing", "Operations"], timeWindow: "past", limit: 3 });

  return (
    <div className="bg-black min-h-screen w-full">
      <Nav />
      <div>
        <HeroTest />
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