import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EventsHolder from "@/components/EventsHolder";

export default function Home() {
  return (
    <>
      <div className="bg-black h-full p-4">
        <NavBar />
        <EventsHolder variant={"gradient"} timing="past" page="home" />
      </div>
      <Footer />
    </>
  );
}
