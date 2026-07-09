"use server"

import React from "react";
import Image from "next/image";

interface ImageCard {
  name: string;
  image: string;
  accent: string;
  website?: string;
  description: React.ReactNode;
}

const collaborators: ImageCard[] = [
  {
    name: "eSolutions VARS Labs",
    image: "/img/facilities/esolutions-vars-labs.png",
    accent: "#7B2FF7",
    website: "https://maps.monash.edu/#v=1&zlevel=2&center=145.130285,-37.914441&zoom=20.63&campusid=159&sharepoitype=poi&sharepoi=1189861",
    description: (
      <>
        eSolutions is Monash&apos;s IT hub, responsible for all things IT on campus. The Virtual and Augmented Reality Services team is our main contact within this group.
      </>
    )
  },
  {
    name: "Embodied Visualisation Lab",
    image: "/img/facilities/embodied-visualisation-lab.jpg",
    accent: "#2ECC71",
    website: "https://maps.monash.edu/#v=1&zlevel=1&center=145.133444,-37.910169&zoom=18.71&campusid=159&sharepoitype=poi&sharepoi=1000447848",
    description: (
      <>
        The Immersive Analytics Lab is the formal physical lab of the Embodied Visualisation group. It is managed by Dr Tim Dwyer, who is our Academic Advisor.
      </>
    )
  },
  {
    name: "Smart Manufacturing Hub",
    image: "/img/facilities/smart-manufacturing-hub.png",
    accent: "#EC4899",
    website: "https://maps.monash.edu/#v=1&zlevel=1&center=145.134272,-37.909748&zoom=19.5&campusid=159&sharepoitype=poi&sharepoi=1000829064",
    description: (
      <>
        Monash Smart Manufacturing (MSM) offers an end to end digitally connected, collaborative manufacturing system that interacts and responds to the changing environment and monitored processes in real-time.
      </>
    )
  }
];

const facilities: ImageCard[] = [
  {
    name: "Digital Makerspace",
    image: "/img/facilities/digital-makerspace.jpg",
    accent: "#DB003B",
    website: "https://maps.monash.edu/#v=1&zlevel=1&center=145.135015,-37.90986&zoom=19.74&campusid=159&sharepoitype=poi&sharepoi=1155405",
    description: (
      <>
        MNET&apos;s home at Monash — a central hub supporting digitally focused student teams from the faculties of Engineering and Information Technology.
      </>
    )
  },
  {
    name: "Design and Build Studio",
    image: "/img/facilities/design-build-studio.png",
    accent: "#F5A623",
    description: (
      <>
        The Design and Build Studios offer support for Engineering undergraduate teaching, faculty research and Monash Companies on Campus.
      </>
    )
  },
  {
    name: "Mixed Reality Studio",
    image: "/img/facilities/mixed-reality-studio.jpg",
    accent: "#2F80ED",
    website: "https://maps.monash.edu/#v=1&zlevel=1&center=145.135043,-37.909359&zoom=20.87&campusid=159&sharepoitype=poi&sharepoi=1155415",
    description: (
      <>
        A dedicated space in Woodside for Games Development and Virtual Reality, featuring dedicated PCs, Prusa printers and VR headsets. Managed by Josh Olsen from the Faculty of IT.
      </>
    )
  }
];

function ImageCardGrid({ items }: { items: ImageCard[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
      {items.map((item) => {
        const Wrapper = item.website ? "a" : "div";
        const linkProps = item.website
          ? { href: item.website, target: "_blank", rel: "noopener noreferrer" }
          : {};

        return (
          <Wrapper
            key={item.name}
            {...linkProps}
            className="group relative flex flex-col bg-[#1A1A1E] border border-white/10 hover:border-white/30 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] shadow-xl"
          >
            <div className="relative w-full h-56">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col p-8 gap-3">
              <h3
                className="text-2xl font-offbit font-bold"
                style={{ color: item.accent }}
              >
                {item.name}
              </h3>
              <p className="text-white/70 text-base leading-relaxed font-sans">
                {item.description}
              </p>
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
}

export default async function CollaboratorsPage() {
  return (
    <div className="bg-[#0E0E0E] min-h-screen w-full flex flex-col text-white">
      {/* Hero section */}
      <section className="pt-[25vh] md:pt-[30vh] px-8 md:px-16 py-12 md:py-20 flex flex-col max-w-7xl mx-auto w-full gap-6">
        <h1 className="text-white font-offbit-101 font-bold text-5xl md:text-8xl uppercase tracking-wider">
          Collaborations
        </h1>
        <p className="text-white/60 font-offbit font-bold text-lg md:text-2xl max-w-3xl leading-relaxed">
          Collaboration is a core value at MNET. We believe the best immersive technology comes from academia, industry, and student innovation meeting in the same room — so we partner with university labs, research groups, and industry teams to give our members real facilities, mentorship, and the chance to build technology that reaches beyond the classroom.
        </p>
      </section>

      {/* Grid of Collaborators */}
      <section className="px-8 md:px-16 py-12 md:py-24 bg-gradient-to-b from-[#0E0E0E] to-[#030CAB]/20 w-full">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h2 className="font-offbit-dot text-4xl md:text-6xl font-bold uppercase tracking-wide">
              Our Collaborators
            </h2>
            <p className="text-white/60 font-offbit font-bold text-lg md:text-xl max-w-3xl leading-relaxed">
              The labs and groups across Monash we work alongside to push immersive technology forward.
            </p>
          </div>

          <ImageCardGrid items={collaborators} />
        </div>
      </section>

      {/* Grid of Facilities */}
      <section className="px-8 md:px-16 py-12 md:py-24 w-full">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h2 className="font-offbit-dot text-4xl md:text-6xl font-bold uppercase tracking-wide">
              Our Facilities
            </h2>
            <p className="text-white/60 font-offbit font-bold text-lg md:text-xl max-w-3xl leading-relaxed">
              The physical spaces across Monash that support MNET&apos;s design, build, and research work.
            </p>
          </div>

          <ImageCardGrid items={facilities} />
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
