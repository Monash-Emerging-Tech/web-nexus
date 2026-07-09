import React from "react";
import Image from "next/image";
import fs from "fs";
import path from "path";
import { Member } from "@/lib/notion/types";
import {
  getAcademicAdvisors,
  getLeads,
  getMembersByDepartment,
} from "@/lib/notion/members";
import OurValues from "@/components/OurValues/OurValues";

enum TeamLeadOrder {
  "Team Lead",
  "Project Lead",
  "Operation Lead",
  "Marketing Lead",
  "Education Lead",
}

interface MemberWithPhoto extends Member {
  photo: string;
}

// Read the local member-photo directory once per render instead of one
// existsSync call per member.
const getLocalMemberPhotos = (): Set<string> => {
  try {
    const dir = path.join(process.cwd(), "public", "img", "members");
    return new Set(fs.readdirSync(dir));
  } catch {
    return new Set();
  }
};

const resolveMemberPhoto = (
  member: Member,
  localPhotos: Set<string>,
): MemberWithPhoto => {
  let photo = member.icon;

  if (localPhotos.has(`${member.id}.jpg`)) {
    photo = `/img/members/${member.id}.jpg`;
  }

  if (
    !photo ||
    photo.length <= 2 ||
    (!photo.startsWith("http") && !photo.startsWith("/"))
  ) {
    photo = "https://placehold.co/150x150.png";
  }
  return {
    ...member,
    photo,
  };
};

const MemberCard = ({
  member,
  size = "normal",
  borderColorClass = "border-[#030CAB]",
}: {
  member: MemberWithPhoto;
  size?: "normal" | "small";
  borderColorClass?: string;
}) => {
  const widthVal = size === "small" ? 128 : 160;
  const heightVal = size === "small" ? 128 : 160;
  const mobileWidthVal = 96;
  const mobileHeightVal = 96;

  const cardContent = (
    <div className="flex flex-col items-center gap-2 group transition-all duration-300">
      <div
        className={`hidden md:block relative rounded-full overflow-hidden border-4 ${borderColorClass} transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1`}
      >
        <Image
          src={member.photo}
          alt={member.name}
          width={widthVal}
          height={heightVal}
          className="rounded-full object-cover w-32 h-32 md:w-40 md:h-40"
        />
      </div>
      <div
        className={`md:hidden relative rounded-full overflow-hidden border-4 ${borderColorClass}`}
      >
        <Image
          src={member.photo}
          alt={member.name}
          width={mobileWidthVal}
          height={mobileHeightVal}
          className="rounded-full object-cover w-24 h-24"
        />
      </div>
      <div className="flex flex-col items-center">
        <p className="text-white text-lg md:text-2xl font-offbit font-bold text-center group-hover:text-[#DB003B] transition-colors duration-300">
          {member.name}
        </p>
        <p className="text-gray-400 text-sm md:text-lg font-offbit">
          {member.role}
        </p>
      </div>
    </div>
  );

  if (member.linkedin) {
    return (
      <a
        href={member.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline"
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

export default async function AboutUsPage() {
  const filterPlatypus = (m: Member) =>
    !m.name.toLowerCase().includes("platypus");

  const [
    rawLeads,
    rawMarketingRaw,
    rawEducationRaw,
    rawProjectsRaw,
    rawOperationsRaw,
    rawAdvisorsRaw,
  ] = await Promise.all([
    getLeads(),
    getMembersByDepartment("Marketing"),
    getMembersByDepartment("Education"),
    getMembersByDepartment("Projects"),
    getMembersByDepartment("Operations"),
    getAcademicAdvisors(),
  ]);

  const sortedLeads = rawLeads
    .filter(filterPlatypus)
    .sort(
      (a, b) =>
        TeamLeadOrder[a.role as keyof typeof TeamLeadOrder] -
        TeamLeadOrder[b.role as keyof typeof TeamLeadOrder],
    );

  const rawMarketing = rawMarketingRaw.filter(filterPlatypus);
  const rawEducation = rawEducationRaw.filter(filterPlatypus);
  const rawProjects = rawProjectsRaw.filter(filterPlatypus);
  const rawOperations = rawOperationsRaw.filter(filterPlatypus);
  const rawAdvisors = rawAdvisorsRaw.filter(filterPlatypus);

  const localPhotos = getLocalMemberPhotos();
  const withPhoto = (m: Member) => resolveMemberPhoto(m, localPhotos);

  const leads = sortedLeads.map(withPhoto);
  const marketingMembers = rawMarketing.map(withPhoto);
  const educationMembers = rawEducation.map(withPhoto);
  const projectsMembers = rawProjects.map(withPhoto);
  const operationsMembers = rawOperations.map(withPhoto);
  const academicAdvisors = rawAdvisors.map(withPhoto);

  const teamLeads = leads.filter((lead) =>
    lead.role.toLowerCase().startsWith("team"),
  );
  const departmentLeads = leads.filter(
    (lead) => !lead.role.toLowerCase().startsWith("team"),
  );

  return (
    <div className="w-full h-full flex flex-col bg-black">
      {/* 1. Our Story Section */}
      <section className="flex flex-col p-[4vw] pb-0 md:p-[8vw] pt-[20vh] md:pt-[25vh] gap-6 md:gap-8 items-center justify-center">
        <h1 className="text-white text-5xl md:text-7xl font-offbit-dot font-bold text-center uppercase tracking-wider">
          Our Story
        </h1>
        <p className="text-white/80 text-lg md:text-xl font-offbit text-center max-w-4xl leading-relaxed">
          Monash Nexus for Emerging Technologies (MNET) is Monash
          University&apos;s premier student-led initiative dedicated to pushing
          the boundaries of Extended Reality (XR) and immersive technology. We
          foster a community of innovators, developers, and creators aiming to
          bridge the gap between academic theory and real-world implementation.
        </p>
        <div className="w-full flex flex-col md:flex-row gap-6 items-stretch justify-center p-4 max-w-6xl mt-4">
          <div className="flex-1 min-w-0">
            <Image
              src="/img/About-Team.jpg"
              alt="About Team"
              width={1000}
              height={800}
              className="w-full h-full aspect-video rounded-3xl object-cover object-[10%_20%] border-[#DC003B] border-4 shadow-2xl"
            />
          </div>
          <div className="flex-1 max-w-xs flex flex-col gap-4 items-center justify-center">
            <Image
              src="/img/About-Showcase-Temp.jpg"
              alt="Showcase"
              width={1000}
              height={800}
              className="w-full h-1/2 rounded-3xl object-cover border-[#DC003B] border-4 shadow-lg"
            />
            <Image
              src="/img/About-Focus-Temp.jpg"
              alt="Team Focus"
              width={1000}
              height={800}
              className="w-full h-1/2 rounded-3xl object-cover border-[#DC003B] border-4 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* 2. Our Values Section */}
      <div className="w-full mt-12">
        <OurValues />
      </div>

      {/* 3. Meet the Team Sections */}
      <section className="w-full mt-12">
        <div className="px-8 md:px-16 py-8 md:py-16 text-center">
          <h2 className="text-white font-offbit-101 font-bold text-5xl md:text-7xl uppercase tracking-wider">
            The Team
          </h2>
        </div>

        {/* Academic Advisors */}
        <div className="w-full bg-[#2D2D2D] flex flex-col items-center justify-center px-8 md:px-16 py-12 md:py-16 gap-6">
          <div className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-16 mb-8">
            <div className="flex-1">
              <h3 className="text-white text-4xl md:text-6xl text-center font-offbit font-bold">
                Academic Advisors
              </h3>
              <p className="text-white text-center text-xl font-semibold font-offbit mt-2">
                The mentors who guide us toward the tech frontier.
              </p>
            </div>
          </div>
          <div className="hidden md:flex flex-wrap items-start justify-center gap-6 w-full max-w-7xl">
            {academicAdvisors.map((advisor) => (
              <div key={advisor.id} className="bg-transparent p-4">
                <MemberCard
                  member={advisor}
                  borderColorClass="border-[#DB003B]"
                />
              </div>
            ))}
          </div>
          <div className="md:hidden grid grid-cols-2 w-full gap-4">
            {academicAdvisors.map((lead) => (
              <div key={lead.id} className="bg-transparent p-2">
                <MemberCard member={lead} borderColorClass="border-[#DB003B]" />
              </div>
            ))}
          </div>
        </div>

        {/* Team Leads */}
        <div className="w-full bg-[#030CAB] flex flex-col items-center justify-center px-8 md:px-16 py-12 md:py-16 gap-6">
          <div className="w-full max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-16 mb-8">
            <div className="flex-1">
              <h3 className="text-white text-center text-4xl md:text-6xl font-offbit font-bold">
                Leads
              </h3>
              <p className="text-white text-center text-xl font-semibold font-offbit mt-2">
                The Torchbearers of MNET
              </p>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center justify-center w-full max-w-7xl">
            <div className="flex flex-wrap items-start justify-center gap-6">
              {teamLeads.map((lead) => (
                <div key={lead.id} className="bg-transparent p-4">
                  <MemberCard member={lead} borderColorClass="border-white" />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-start justify-center gap-6 mt-6">
              {departmentLeads.map((lead) => (
                <div key={lead.id} className="bg-transparent p-4">
                  <MemberCard member={lead} borderColorClass="border-white" />
                </div>
              ))}
            </div>
          </div>
          <div className="md:hidden grid grid-cols-2 w-full gap-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-transparent p-2">
                <MemberCard member={lead} borderColorClass="border-white" />
              </div>
            ))}
          </div>
        </div>

        {/* Meet the Team List */}
        <div className="w-full flex flex-col items-center justify-center px-4 md:px-16 py-12 md:py-16 gap-10 max-w-7xl mx-auto">
          <h3 className="font-offbit-101 font-bold text-4xl md:text-6xl text-white">
            Meet the Team
          </h3>

          <div className="w-full flex flex-col gap-8">
            <div className="w-full flex flex-col items-center gap-2 md:gap-4 border-b border-white/10 pb-6">
              <p className="text-white text-3xl font-offbit font-semibold">
                Team Leads
              </p>
              <div className="w-full text-center flex flex-col md:grid md:grid-cols-5 gap-2">
                {teamLeads.map((lead) => (
                  <p
                    key={lead.id}
                    className="text-white/80 text-lg font-offbit-101 font-semibold"
                  >
                    {lead.name}
                  </p>
                ))}
              </div>
            </div>

            <div className="w-full flex flex-col items-center gap-2 md:gap-4 border-b border-white/10 pb-6">
              <p className="text-white text-3xl font-offbit font-semibold">
                Marketing
              </p>
              <div className="w-full text-center flex flex-col md:grid md:grid-cols-5 gap-2">
                {marketingMembers.map((member) => (
                  <p
                    key={member.id}
                    className="text-white/80 text-lg font-offbit-101 font-semibold"
                  >
                    {member.name}
                  </p>
                ))}
              </div>
            </div>

            <div className="w-full flex flex-col items-center gap-2 md:gap-4 border-b border-white/10 pb-6">
              <p className="text-white text-3xl font-offbit font-semibold">
                Operations
              </p>
              <div className="w-full text-center flex flex-col md:grid md:grid-cols-5 gap-2">
                {operationsMembers.map((member) => (
                  <p
                    key={member.id}
                    className="text-white/80 text-lg font-offbit-101 font-semibold"
                  >
                    {member.name}
                  </p>
                ))}
              </div>
            </div>

            <div className="w-full flex flex-col items-center gap-2 md:gap-4 border-b border-white/10 pb-6">
              <p className="text-white text-3xl font-offbit font-semibold">
                Education
              </p>
              <div className="w-full text-center flex flex-col md:grid md:grid-cols-5 gap-2">
                {educationMembers.map((member) => (
                  <p
                    key={member.id}
                    className="text-white/80 text-lg font-offbit-101 font-semibold"
                  >
                    {member.name}
                  </p>
                ))}
              </div>
            </div>

            <div className="w-full flex flex-col items-center gap-2 md:gap-4">
              <p className="text-white text-3xl font-offbit font-semibold">
                Projects
              </p>
              <div className="w-full text-center flex flex-col md:grid md:grid-cols-6 gap-2">
                {projectsMembers.map((member) => (
                  <p
                    key={member.id}
                    className="text-white/80 text-lg font-offbit-101 font-semibold"
                  >
                    {member.name}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Join Us CTA */}
      <div className="w-full flex items-center justify-center py-16 md:py-24">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSej1jyIYU_dy2uJqEs5zUvNY1GUN-6eN2DqxCbb2ucnYrTI7Q/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:cursor-pointer text-2xl md:text-3xl font-offbit font-bold px-12 py-5 md:px-16 md:py-6 bg-[#DB003B] rounded-md pointer-events-auto transition-all duration-500 [transition-timing-function:cubic-bezier(0,-0.03,0,1)] hover:-translate-y-0.5 hover:bg-[#ff0044] flex items-center justify-center text-white shadow-2xl"
        >
          JOIN US
        </a>
      </div>
    </div>
  );
}
