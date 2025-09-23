import React from 'react';

interface ProjectCardProps {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  githubUrl: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, imageUrl, tags, githubUrl }) => {
  return (
    
    <div   className=" rounded-[15px] bg-black shadow-lg overflow-hidden border border-[#DB003B] py-3.75 px-3 flex flex-col h-full">
      {/* Title */}
      <h3 className="font-offbit-dot font-bold text-xl text-white ">{title}</h3>

      {/* Description */}
      <p className="font-offbit text-white text-lg  flex-grow">{description}</p>
      {/* Image Container */}
      <div style={{ aspectRatio: '384.28 / 213.27', }} className="w-auto  mb-3 overflow-hidden ">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover " />
      </div>

      

      {/* Tags and GitHub icon */}
      <div className="mt-auto flex justify-between items-center ">
        {/* Tags */}
        <div className="text-sm text-white font-offbit font-bold">
          {tags.join(' · ')}
        </div>
        {/* GitHub Icon */}
        <a 
          href={githubUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-white hover:brightness-75 transition-colors duration-200"
          aria-label={`GitHub repository for ${title}`}
        >
          <i className="fab fa-github text-2xl"></i>
        </a>
      </div>
    </div>
  );
};

export default ProjectCard; 