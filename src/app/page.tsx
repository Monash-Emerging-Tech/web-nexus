import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Hero from "@/components/hero";
import EventsHolder from "@/components/events/PastEvents_Home";

export default function Home() {
  return (
    <div className="bg-black min-h-screen w-full">
      <NavBar />
      <div className="relative">
        <Hero />
        <EventsHolder />
      </div>
      <Footer />
    </div>
  );
}
