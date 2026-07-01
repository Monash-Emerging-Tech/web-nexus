"use server"

import React from "react";
import { Portfolio } from "@/lib/notion/types";
import { getPortfolios } from "@/lib/notion/portfolios";
import ProjectsCard from "@/app/projects/ProjectsCard";

const WorkshopsPage = async () => {
  const workshopData: Portfolio[] = await getPortfolios({ department: "Education" });

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-[25vh] md:pt-[30vh] pb-16">
      <div className="container mx-auto">
        <h2 className="h-[160px] text-header font-bold text-neutral-100 text-left font-offbit-dot">
          Workshops
        </h2>
        <p className="text-left pb-4 text-subheader font-offbit font-bold">
          Our educational workshops
        </p>
        <div className="grid md:grid-cols-3 grid-cols-1 gap-6 md:gap-10">
          {workshopData.map((workshop) => (
            <ProjectsCard data={workshop} key={workshop.id} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkshopsPage;
