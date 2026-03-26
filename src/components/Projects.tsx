"use client"

import React from "react";
import ProjectCard from "./ProjectCard";
import { Portfolio } from "@/lib/notion/types";

const Projects = ({data} : {data: Portfolio[]}) => {

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <h2 className="h-[160px] text-header font-bold text-neutral-100 text-left font-offbit-dot">
          Projects
        </h2>
        <p className="text-left pb-4 text-subheader font-offbit font-bold">
          A slice of our work
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(410px,_1fr))] gap-10">
          {data.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
