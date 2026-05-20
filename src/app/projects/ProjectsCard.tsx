import React from "react";

const ProjectsCard = () => {
    return (
        <div className="border-2 border-[#DC003B] rounded-3xl p-4 flex flex-col">

            {/* Project Card Heading */}
            <div className="flex flex-col">
            <h2 className="text-white text-[2em] font-offbit-dot font-bold">MNET Geoguessr</h2>

            <p style={{fontSize: "1.6em"}}
                className="text-whie-text font-offbit">Location guessing game for the Monash campus, on web and VR
            </p>
            </div>

            {/* Project Image */}
            <div className="w-full aspect-video overflow-hidden rounded-xl">
            <img 
                src="/img/About-Focus-Temp.jpg" 
                className="w-full h-full object-cover" 
                alt={"Project Name"}
            />
            </div>

            {/* Description Tags */}
            <div className="flex justify-between items-center mt-auto">
            <span className="text-[1.6em] text-white font-offbit font-bold">Prototyping • VR • Digital Twin • 3D</span>

            {/* GitHub Icon */}
            <a href="https://github.com/Monash-Emerging-Tech" 
                style={{ marginLeft: 'auto', color: 'white', fontSize: '2.5em' }} 
                aria-label="Github"><i className="fab fa-github"></i>
            </a>
            </div>

        </div>
    );
};

export default ProjectsCard;