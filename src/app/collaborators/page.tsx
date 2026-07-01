"use server"

import React from "react";
import Image from "next/image";

interface Partner {
  name: string;
  role: string;
  logo: string;
  description: string;
  website: string;
}

const partners: Partner[] = [
  {
    name: "Monash University",
    role: "Academic & Institutional Partner",
    logo: "/img/logo.png",
    description: "Providing world-class academic resources, research facilities, and institutional support to enable groundbreaking XR exploration.",
    website: "https://www.monash.edu"
  },
  {
    name: "Monash Faculty of IT",
    role: "Sponsor & Advisor",
    logo: "/img/logo.png",
    description: "Supporting student initiatives with leading researchers, cutting-edge labs, and industry-connected mentorship.",
    website: "https://www.monash.edu/it"
  },
  {
    name: "Monash Engineering",
    role: "Technical Collaborator",
    logo: "/img/logo.png",
    description: "Partnering on interdisciplinary projects requiring advanced hardware integration, product design, and prototyping.",
    website: "https://www.monash.edu/engineering"
  }
];

export default async function CollaboratorsPage() {
  return (
    <div className="bg-[#0E0E0E] min-h-screen w-full flex flex-col text-white">
      {/* Hero section */}
      <section className="pt-[25vh] md:pt-[30vh] px-8 md:px-16 py-12 md:py-20 flex flex-col max-w-7xl mx-auto w-full gap-6">
        <h1 className="text-white font-offbit-101 font-bold text-5xl md:text-8xl uppercase tracking-wider">
          Collaborators
        </h1>
        <p className="text-white/60 font-offbit font-bold text-lg md:text-2xl max-w-3xl leading-relaxed">
          Pioneering the future of technology through powerful partnerships. We collaborate with industry leaders, academic faculties, and student teams to deliver outstanding immersive experiences.
        </p>
      </section>

      {/* Grid of Partners */}
      <section className="px-8 md:px-16 py-12 md:py-24 bg-gradient-to-b from-[#0E0E0E] to-[#030CAB]/20 w-full">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <h2 className="font-offbit-dot text-4xl md:text-6xl font-bold uppercase tracking-wide">
            Our Partners
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {partners.map((partner) => (
              <a 
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                key={partner.name}
                className="group relative flex flex-col bg-[#1A1A1E] border border-white/10 hover:border-[#DB003B] rounded-2xl p-8 transition-all duration-300 hover:scale-[1.03] shadow-xl pointer-events-auto cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#DB003B] rounded-full filter blur-[50px] opacity-10 group-hover:opacity-30 transition-opacity duration-500" />
                
                <div className="flex items-center justify-between mb-6 z-10">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-black/40 flex items-center justify-center p-2 border border-white/5">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={64}
                      height={64}
                      className="object-contain brightness-90 group-hover:brightness-100 transition-all duration-300"
                    />
                  </div>
                  <span className="text-[#DB003B] text-2xl font-bold group-hover:translate-x-1 transition-transform duration-300">
                    &rarr;
                  </span>
                </div>

                <h3 className="text-2xl font-offbit font-bold mb-2 group-hover:text-[#DB003B] transition-colors duration-300">
                  {partner.name}
                </h3>
                <p className="text-gray-400 text-sm font-offbit mb-4">
                  {partner.role}
                </p>
                <p className="text-white/70 text-base leading-relaxed font-sans mt-2">
                  {partner.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-8 md:px-16 py-16 md:py-32 flex flex-col items-center justify-center text-center max-w-5xl mx-auto w-full gap-8">
        <h2 className="text-4xl md:text-6xl font-offbit font-bold uppercase">
          Build the Future with Us
        </h2>
        <p className="text-white/75 text-lg md:text-xl font-sans max-w-2xl leading-relaxed">
          Whether you are an industry player looking to innovate, a researcher seeking developer collaboration, or a student team wanting to integrate immersive components, we would love to connect.
        </p>
        <a 
          href="mailto:mnet@monash.edu"
          className="text-white font-offbit font-bold bg-[#DB003B] hover:bg-[#b00030] transition-colors duration-300 px-10 py-4 rounded-xl text-lg shadow-lg"
        >
          GET IN TOUCH
        </a>
      </section>
    </div>
  );
}
