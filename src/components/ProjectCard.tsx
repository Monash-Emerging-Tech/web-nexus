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
    
    <div className=" bg-neutral-900 rounded-lg shadow-lg overflow-hidden border border-[#DB003A] p-5 flex flex-col h-full">
      {/* Title */}
      <h3 className="font-offbit-dot font-bold text-2xl text-neutral-100 mb-2">{title}</h3>

      {/* Description */}
      <p className="font-offbit text-neutral-300 text-sm mb-4 flex-grow">{description}</p>
      {/* Image Container */}
      <div className="w-full h-48 mb-4 overflow-hidden rounded-md">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105" />
      </div>

      

      {/* Tags and GitHub icon */}
      <div className="mt-auto flex justify-between items-center pt-3 border-t border-neutral-700/50">
        {/* Tags */}
        <div className="text-xs text-neutral-400 font-offbit font-bold">
          {tags.join(' · ')}
        </div>
        {/* GitHub Icon */}
        <a 
          href={githubUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-neutral-300 hover:brightness-75 transition-colors duration-200"
          aria-label={`GitHub repository for ${title}`}
        >
          <i className="fab fa-github text-2xl"></i>
        </a>
      </div>
    </div>
  );
};

export default ProjectCard; 