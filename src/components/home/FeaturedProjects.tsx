import Link from "next/link";
import { Portfolio } from "@/lib/notion/types";
import ProjectsCard from "@/components/portfolios/ProjectsCard";

const FeaturedProjects = ({ data }: { data: Portfolio[] }) => {
  if (data.length === 0) return null;

  return (
    <section id="our-work" className="container mx-auto px-4 pt-16 sm:px-6 md:pt-24 lg:px-8">
      <div className="flex flex-col pb-8 md:pb-12">
        <h2 className="text-5xl md:text-header font-offbit-dot font-bold">
          Projects
        </h2>
        <p className="text-2xl md:text-subheader font-offbit font-bold text-white/80">
          A slice of our work, expanding the horizons of technology.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-10 items-stretch">
        {data.map((project) => (
          <ProjectsCard data={project} key={project.id} />
        ))}
      </div>
      <div className="flex justify-end pt-8">
        <Link
          href="/portfolios"
          className="font-offbit text-xl font-bold text-white transition-colors duration-300 hover:text-[#DC003B]"
        >
          View all projects →
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProjects;
