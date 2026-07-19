import React from "react";
import { Portfolio } from "@/lib/notion/types";
import { getPortfolios } from "@/lib/notion/portfolios";
import ProjectsCard from "@/components/portfolios/ProjectsCard";

const PortfoliosPage = async () => {
  const projectData: Portfolio[] = await getPortfolios({ department: ["Projects", "Education"] });

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-[25vh] md:pt-[30vh] pb-16">
      <div className="container mx-auto">
        <h2 className="h-auto md:h-[160px] text-5xl sm:text-6xl md:text-header font-bold text-neutral-100 text-left font-offbit-dot mb-4 md:mb-6">
          Portfolios
        </h2>
        <p className="text-left pb-4 text-2xl sm:text-3xl md:text-subheader font-offbit font-bold">
          A slice of our work
        </p>
        <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-10">
          {projectData.map((project) => (
            <ProjectsCard data={project} key={project.id} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfoliosPage;
