import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Projects from "@/components/Projects";
import Hero from "@/components/Hero";
import EventsHolder from "@/components/events/PastEvents_Home";

export default function Home() {
  return (
    <div className="bg-black min-h-screen w-full">
      <NavBar />
      <div className="relative">
        <Hero />
        <div className="bg-[url(/img/wireframe_1.png)] bg-[length:120%] bg-no-repeat bg-[position:-100px_50px] ">
          <Projects />
          <EventsHolder />
        </div>
      </div>
      <Footer />
    </div>
  );
}
