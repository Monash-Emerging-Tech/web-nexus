import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EventsPage from "@/components/events/EventsPage";

export default function EventsRoute() {
  return (
    <div className="bg-black min-h-screen w-full">
      <NavBar />
      <EventsPage />
      <Footer />
    </div>
  );
}

