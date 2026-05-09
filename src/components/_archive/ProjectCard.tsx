import { Portfolio } from "@/lib/notion/types";
import React from "react";

const ProjectCard = ({project} : {project : Portfolio}) => {
  return (
    <div className=" rounded-[10px] bg-black shadow-lg overflow-hidden border border-[#DB003B] py-3.75 px-3 flex flex-col h-full">
      {/* Title */}
      <h3 className="font-offbit-dot font-bold text-xl text-white ">{project.name}</h3>

      {/* Description */}
      <p className="font-offbit text-white text-sm  flex-grow">{project.oneliner}</p>
      {/* Image Container */}
      <div
        style={{ aspectRatio: "384.28 / 213.27" }}
        className="w-auto  mb-3 overflow-hidden "
      >
        <img
          src={project.imageUrl ?? "https://placehold.co/600x400.png"}
          alt={project.name}
          className="w-full h-full object-cover "
        />
      </div>

      {/* Tags and GitHub icon */}
      <div className="mt-auto flex justify-between items-center ">
        {/* Tags */}
        <div className="text-sm text-white font-offbit font-bold">
          {project.tags.join(" · ")}
        </div>
        {/* GitHub Icon */}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:brightness-75 transition-colors duration-200 z-10"
            aria-label={`GitHub repository for ${project.name}`}
          >
            <i className="fab fa-github text-2xl"></i>
          </a>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
