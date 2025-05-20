import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import PastEvents_Home from "@/components/events/PastEvents_Home";

export default function Home() {
  return (
    <>
      <div className="bg-black h-full p-4">
        <NavBar />
        <PastEvents_Home />
      </div>
      <Footer />
    </>
  );
}
