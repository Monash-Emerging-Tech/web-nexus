"use server"

import React from "react";
import { Portfolio } from "@/lib/notion/types";
import { getActivePortfolios } from "@/lib/notion/portfolios";
import EventsCard from "@/components/events/EventsCard";

const ProjectsPage = async () => {
  const projectData: Portfolio[] = await getActivePortfolios();

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-[25vh] md:pt-[30vh] pb-16">
      <div className="container mx-auto">
        <h2 className="h-[160px] text-header font-bold text-neutral-100 text-left font-offbit-dot">
          Projects
        </h2>
        <p className="text-left pb-4 text-subheader font-offbit font-bold">
          A slice of our work
        </p>
        <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-10">
          {projectData.map((project) => (
            <EventsCard style="gradient" data={project} key={project.id} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsPage;
