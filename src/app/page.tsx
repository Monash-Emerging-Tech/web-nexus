import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Projects from "@/components/Projects";
export default function Home() {
  return (
    <>
      <div className="bg-black h-full p-4">
        <NavBar />
      </div>
      <Projects />
      <Footer />
    </>
  );
}
