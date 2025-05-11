import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <>
      <div className="bg-black h-full w-full">
        <NavBar />
        <Hero />
      </div>
      <Footer />
    </>
  );
}
