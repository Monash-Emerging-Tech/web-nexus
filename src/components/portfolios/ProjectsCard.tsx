import React from "react";
import Link from "next/link";
import Image from "next/image";
import { GitHubIcon } from "@/components/icons/SocialIcons";
import { Portfolio } from "@/lib/notion/types";

interface ProjectsCardProps {
  data: Portfolio;
}

const ProjectsCard: React.FC<ProjectsCardProps> = ({ data }) => {
  return (
    <div className="relative group h-full">
      <div className="border-2 border-[#DC003B] rounded-3xl p-4 flex flex-col h-full bg-white/5 backdrop-blur-md transition-all duration-300 group-hover:scale-[1.02] group-hover:bg-white/10 group-hover:shadow-[0_0_20px_rgba(220,0,59,0.3)]">
        {/* Project Card Heading */}
        <div className="flex flex-col mb-4">
          <h2 className="text-white text-[2em] font-offbit-dot font-bold group-hover:text-[#DC003B] transition-colors duration-300">
            <Link href="#" className="after:absolute after:inset-0 after:z-0">
              {data.name}
            </Link>
          </h2>
          <p style={{ fontSize: "1.4em" }} className="text-white/80 font-offbit mt-2 line-clamp-2">
            {data.oneliner || data.description}
          </p>
        </div>

        {/* Project Image */}
        <div className="w-full aspect-video overflow-hidden rounded-xl mb-4 relative bg-neutral-900">
          <Image
            src={data.imageUrl || "/img/About-Focus-Temp.JPG"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 30vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={data.name}
            priority={data.status === "Featured"}
          />
        </div>

        {/* Description Tags */}
        <div className="flex justify-between items-center mt-auto pt-2 z-10">
          <span className="text-[1.2em] text-white/60 font-offbit font-bold line-clamp-1">
            {data.tags.join(" • ")}
          </span>

          {/* GitHub Icon */}
          {data.githubUrl && (
            <a
              href={data.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 'auto', color: 'white', fontSize: '2em' }}
              aria-label="Github"
              className="hover:text-[#DC003B] transition-colors duration-300 relative z-20"
            >
              <GitHubIcon className="w-[1em] h-[1em] inline-block align-[-0.125em]" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsCard;