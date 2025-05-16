import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EventsHolder from "@/components/events/PastEvents_Home";

export default function Home() {
  return (
    <>
      <div className="bg-black h-full p-4">
        <NavBar />
        <EventsHolder />
      </div>
      <Footer />
    </>
  );
}
