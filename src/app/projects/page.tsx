// import { getActivePortfolios } from "@/lib/notion/portfolios";
import Footer from "@/components/Footer";
import Nav from "@/components/navbar_test/Nav";
import ProjectsCard from "./ProjectsCard";


export default async function Projects() {
  // const data = await getActivePortfolios();
  return (
    <>
    <div className="Nav">
      {/* <Nav /> */}
      <div>This is the projects page</div>
      <div className="project-grid">
    </div>
    </div>
    <>
    </>
    <div className="grid grid-cols-1 md:grid-cols-2 p-6 bg-black">

      {/* Project Card Heading */}
      <ProjectsCard />
      <ProjectsCard />
      <ProjectsCard />
      <ProjectsCard />
      

      {/* Repeat for other cards... */}
    </div>


    <div className="Footer">
      <Footer />
    </div>
    </>
  );
}


