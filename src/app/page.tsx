import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <>
      <div className="bg-black h-full p-4">
        <NavBar />
        <Hero />
      </div>
      <Footer />
    </>
  );
}
