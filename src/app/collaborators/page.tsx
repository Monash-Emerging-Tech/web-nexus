import React from "react";
import Image from "next/image";

interface ImageCard {
  name: string;
  image: string;
  accent: string;
  website?: string;
  description: React.ReactNode;
}

// 1. Main partner orgs — our closest working relationships at Monash.
const mainPartners: ImageCard[] = [
  {
    name: "eSolutions VARS Labs",
    image: "/img/facilities/esolutions-vars-labs.jpg",
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
        The Embodied Visualisation group in the Faculty of IT is MNET&apos;s closest research
        partner. Their Immersive Analytics Lab is our gateway to immersive visualisation
        research, and the group is led by Dr Tim Dwyer — our Academic Advisor.
      </>
    )
  },
  {
    name: "Smart Manufacturing Hub",
    image: "/img/facilities/smart-manufacturing-hub.jpg",
    accent: "#EC4899",
    website: "https://maps.monash.edu/#v=1&zlevel=1&center=145.134272,-37.909748&zoom=19.5&campusid=159&sharepoitype=poi&sharepoi=1000829064",

    description: (
      <>
        eSolutions is Monash&apos;s IT hub, responsible for all things IT on campus. Their
        Virtual and Augmented Reality Services (VARS) team is our main partner for XR hardware,
        labs, and services across the university.
      </>
    )
  }
];

// 2. The support network — spaces and faculties that keep MNET running.
const supportNetwork: ImageCard[] = [
  {
    name: "Digital Makerspace",
    image: "/img/facilities/digital-makerspace.jpg",
    accent: "#DB003B",
    website: "https://maps.monash.edu/#v=1&zlevel=1&center=145.135015,-37.90986&zoom=19.74&campusid=159&sharepoitype=poi&sharepoi=1155405",
    description: (
      <>
        MNET&apos;s home at Monash — a central hub supporting digitally focused student teams
        from the faculties of Engineering and Information Technology.
      </>
    )
  },
  {
    name: "Design and Build Studio",
    image: "/img/facilities/design-build-studio.jpg",
    accent: "#F5A623",
    description: (
      <>
        The Design and Build Studios offer support for Engineering undergraduate teaching, faculty research and Monash Companies on Campus.
      </>
    )
  },
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
        A dedicated space in Woodside for Games Development and Virtual Reality, featuring
        dedicated PCs, Prusa printers and VR headsets. Managed by Josh Olsen from the Faculty of IT.
      </>
    )
  },
  {
    name: "Design and Build Studio",
    image: "/img/facilities/design-build-studio.png",
    accent: "#F5A623",
    description: (
      <>
        The Design and Build Studios offer support for Engineering undergraduate teaching,
        faculty research and Monash Companies on Campus.
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
        Monash Smart Manufacturing (MSM) offers an end to end digitally connected, collaborative
        manufacturing system that responds to its environment and monitored processes in real-time.
      </>
    )
  }
];

// 3. Student teams, clubs and groups we've shipped work with.
const pastPartners: { name: string; work: string }[] = [
  { name: "Monash Boring (MBEST)", work: "Digital prototyping in VR and Unity" },
  { name: "Monash Pilot Processes (MPP)", work: "Digital twin development" },
  { name: "Monash Sustainable Buildings (MSB)", work: "Visualisation and AR for sustainability" },
  { name: "Monash Association of Coding (MAC)", work: "3D fundamentals workshops" },
  { name: "MCAV", work: "Autonomous vehicle visualisation collabs" },
  { name: "IA Labs", work: "Immersive analytics projects" },
  { name: "Monash College", work: "Career expos and student showcases" },
  { name: "SMEE", work: "Engineering outreach" },
  { name: "CCA", work: "Creative collaborations" },
  { name: "MSDI", work: "Sustainable development projects" },
];

function ImageCardGrid({ items, columns = 3 }: { items: ImageCard[]; columns?: 2 | 3 }) {
  return (
    <div
      className={`grid grid-cols-1 gap-8 md:gap-12 ${
        columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3 lg:grid-cols-4"
      }`}
    >
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
                sizes="(max-width: 768px) 100vw, 33vw"
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

      {/* 1. Main Partners */}
      <section className="px-8 md:px-16 py-12 md:py-24 bg-gradient-to-b from-[#0E0E0E] to-[#030CAB]/20 w-full">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h2 className="font-offbit-dot text-4xl md:text-6xl font-bold uppercase tracking-wide">
              Main Partners
            </h2>
            <p className="text-white/60 font-offbit font-bold text-lg md:text-xl max-w-3xl leading-relaxed">
              The two organisations we work with day-to-day to push immersive technology forward at Monash.
            </p>
          </div>

          <ImageCardGrid items={mainPartners} columns={2} />
        </div>
      </section>

      {/* 2. Our Support Network */}
      <section className="px-8 md:px-16 py-12 md:py-24 w-full">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h2 className="font-offbit-dot text-4xl md:text-6xl font-bold uppercase tracking-wide">
              Our Support Network
            </h2>
            <p className="text-white/60 font-offbit font-bold text-lg md:text-xl max-w-3xl leading-relaxed">
              MNET is backed by the Digital Makerspace network and the Faculties of Information
              Technology and Engineering — the spaces, hardware and people that make our design,
              build and research work possible.
            </p>
          </div>

          <ImageCardGrid items={supportNetwork} />
        </div>
      </section>

      {/* 3. Partners We've Worked With */}
      <section className="px-8 md:px-16 py-12 md:py-24 bg-gradient-to-b from-[#0E0E0E] to-[#DC003B]/10 w-full">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h2 className="font-offbit-dot text-4xl md:text-6xl font-bold uppercase tracking-wide">
              Partners We&apos;ve Worked With
            </h2>
            <p className="text-white/60 font-offbit font-bold text-lg md:text-xl max-w-3xl leading-relaxed">
              Student teams, clubs and groups across the Monash ecosystem we&apos;ve shipped
              projects, workshops and events with.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {pastPartners.map((partner) => (
              <div
                key={partner.name}
                className="flex flex-col gap-1 rounded-xl border border-white/10 bg-[#1A1A1E] p-5 transition-colors duration-300 hover:border-[#DC003B]/60"
              >
                <p className="font-offbit text-xl font-bold text-white">
                  {partner.name}
                </p>
                <p className="font-sans text-sm text-white/60">{partner.work}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Donate & Work With Us */}
      <section className="px-8 md:px-16 py-16 md:py-32 w-full">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col items-center text-center gap-4">
            <h2 className="text-4xl md:text-6xl font-offbit font-bold uppercase">
              Build the Future with Us
            </h2>
            <p className="text-white/75 text-lg md:text-xl font-sans max-w-2xl leading-relaxed">
              Whether you are an industry player looking to innovate, a researcher seeking
              developer collaboration, or a student team wanting to integrate immersive
              components — we would love to connect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="flex flex-col items-center gap-4 rounded-2xl border-4 border-[#DC003B] bg-black p-8 text-center md:p-10">
              <h3 className="font-offbit-dot text-3xl font-bold uppercase text-white">
                Work With Us
              </h3>
              <p className="font-sans text-white/70 leading-relaxed">
                Partner on a project, run a workshop with us, or bring MNET into your research
                or product. Sponsorships and industry collaborations are managed by our
                Operations team.
              </p>
              <a
                href="mailto:mnet@monash.edu?subject=Partnership%20enquiry"
                className="mt-auto text-white font-offbit font-bold bg-[#DB003B] hover:bg-[#b00030] transition-colors duration-300 px-10 py-4 rounded-xl text-lg shadow-lg"
              >
                GET IN TOUCH
              </a>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-[#1A1A1E] p-8 text-center md:p-10">
              <h3 className="font-offbit-dot text-3xl font-bold uppercase text-white">
                Support MNET
              </h3>
              <p className="font-sans text-white/70 leading-relaxed">
                Donations and sponsorships fund hardware, events and outreach — and put your
                name in front of Monash&apos;s emerging-technology talent.
              </p>
              <a
                href="mailto:mnet@monash.edu?subject=Donation%20%2F%20sponsorship%20enquiry"
                className="mt-auto text-white font-offbit font-bold border-2 border-white/40 hover:border-[#DC003B] hover:text-[#DC003B] transition-colors duration-300 px-10 py-4 rounded-xl text-lg"
              >
                DONATE / SPONSOR
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
