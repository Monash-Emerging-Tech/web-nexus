import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import React from "react";
import ProjectCard from "@/components/ProjectCard";
export const revalidate = 86400;

export default async function ProjectsPage() {
  return (
    <div className="bg-black min-h-screen w-full">
      <NavBar />
      <div className="relative pt-32">
        <Projects />
      </div>
      <Footer />
    </div>
  );
}

const Projects = () => {
  return (
    <section className="px-4 sm:px-6 lg:px-8 bg-black">
      <div className="container mx-auto">
        <h2 className="h-[160px] text-header font-bold text-neutral-100 text-left font-offbit-dot">
          Projects
        </h2>
        <p className="text-left pb-4 text-subheader font-offbit font-bold">
          A slice of our work
        </p>
        <div className="grid grid-cols-2 gap-10">
          {projectsData.map((project, index) => (
            <ProjectCard
              key={index}
              title={project.title}
              description={project.description}
              imageUrl={project.imageUrl}
              tags={project.tags}
              githubUrl={project.githubUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
};


const projectsData = [
  {
    title: "Wastewater Treatment Digital Twinning",
    description:
      "Building a digital twin of a wastewater treatment pilot plant.",
    imageUrl: "https://picsum.photos/seed/wastewater/600/400",
    tags: ["Prototyping", "VR", "Digital Twin", "3D"],
    githubUrl: "https://github.com/monash-nexus/example-project-1",
  },
  {
    title: "MNET Geoguessr",
    description: "Location guessing game for the Monash campus, on web and VR.",
    imageUrl: "https://picsum.photos/seed/geoguessr/600/400",
    tags: ["Gaming", "VR", "Web Dev", "GIS"],
    githubUrl: "https://github.com/monash-nexus/example-project-2",
  },
  {
    title: "Bali Digital Heritage Initiative",
    description:
      "Digital archive of temples and lontar manuscripts for preservation.",
    imageUrl: "https://picsum.photos/seed/baliheritage/600/400",
    tags: ["Digital Humanities", "Archive", "3D Scan", "Preservation"],
    githubUrl: "https://github.com/monash-nexus/example-project-3",
  },
  {
    title: "Tunnel Boring Machine Visualization",
    description:
      "Visualising MBEST's Tunnel Boring Machine operations and data.",
    imageUrl: "https://picsum.photos/seed/tunnelboring/600/400",
    tags: ["Visualization", "VR", "Unity", "Industry 4.0"],
    githubUrl: "https://github.com/monash-nexus/example-project-4",
  },
];

