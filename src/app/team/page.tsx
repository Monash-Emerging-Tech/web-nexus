"use server"

import { Member } from "@/lib/notion/types";
import { getAcademicAdvisors, getLeads, getMembersByDepartment, getSeniorMembers } from "@/lib/notion/members";
import { getLinkedInProfilePic } from "@/lib/linkedinScraper";
import Image from "next/image";

import fs from "fs";
import path from "path";

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

const resolveMemberPhoto = async (member: Member): Promise<MemberWithPhoto> => {
	let photo = member.icon;
	
	// First check if the image has been downloaded locally
	const localImagePath = path.join(process.cwd(), "public", "img", "members", `${member.id}.jpg`);
	if (fs.existsSync(localImagePath)) {
		photo = `/img/members/${member.id}.jpg`;
	} else if (member.linkedin) {
		// Fallback to runtime scraping if not downloaded
		const scraped = await getLinkedInProfilePic(member.linkedin);
		if (scraped) {
			photo = scraped;
		}
	}
	
	if (!photo || photo.length <= 2 || !photo.startsWith("http") && !photo.startsWith("/")) {
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
	borderColorClass = "border-[#030CAB]"
}: {
	member: MemberWithPhoto;
	size?: "normal" | "small";
	borderColorClass?: string;
}) => {
	const imgSizeClass = size === "small" ? "w-32 h-32 md:w-32 md:h-32" : "w-40 h-40 md:w-40 md:h-40";
	const mobileImgSizeClass = "w-24 h-24";

	const cardContent = (
		<div className="flex flex-col items-center gap-2 group transition-all duration-300">
			{/* Desktop Image */}
			<div className={`hidden md:block relative rounded-full overflow-hidden border-4 ${borderColorClass} transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1`}>
				<img
					src={member.photo}
					alt={member.name}
					className={`${imgSizeClass} rounded-full object-cover`}
				/>
			</div>
			{/* Mobile Image */}
			<div className={`md:hidden relative rounded-full overflow-hidden border-4 ${borderColorClass}`}>
				<img
					src={member.photo}
					alt={member.name}
					className={`${mobileImgSizeClass} rounded-full object-cover`}
				/>
			</div>
			<div className="flex flex-col items-center">
				<p className="text-white text-lg md:text-2xl font-offbit font-bold text-center group-hover:text-[#DB003B] transition-colors duration-300">
					{member.name}
				</p>
				<p className="text-gray-400 text-sm md:text-lg font-offbit">{member.role}</p>
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

const TeamPage = async () => {
	const rawLeads: Member[] = await getLeads();
	const filterPlatypus = (m: Member) => !m.name.toLowerCase().includes("platypus");
	
	const sortedLeads = rawLeads
		.filter(filterPlatypus)
		.sort((a, b) => TeamLeadOrder[a.role as keyof typeof TeamLeadOrder] - TeamLeadOrder[b.role as keyof typeof TeamLeadOrder]);

	const rawMarketing = (await getMembersByDepartment("Marketing")).filter(filterPlatypus);
	const rawEducation = (await getMembersByDepartment("Education")).filter(filterPlatypus);
	const rawProjects = (await getMembersByDepartment("Projects")).filter(filterPlatypus);
	const rawOperations = (await getMembersByDepartment("Operations")).filter(filterPlatypus);
	const rawSeniors = (await getSeniorMembers()).filter(filterPlatypus);
	const rawAdvisors = (await getAcademicAdvisors()).filter(filterPlatypus);

	// Resolve LinkedIn images on the server side
	const leads = await Promise.all(sortedLeads.map(resolveMemberPhoto));
	const marketingMembers = await Promise.all(rawMarketing.map(resolveMemberPhoto));
	const educationMembers = await Promise.all(rawEducation.map(resolveMemberPhoto));
	const projectsMembers = await Promise.all(rawProjects.map(resolveMemberPhoto));
	const operationsMembers = await Promise.all(rawOperations.map(resolveMemberPhoto));
	const seniorMembers = await Promise.all(rawSeniors.map(resolveMemberPhoto));
	const academicAdvisors = await Promise.all(rawAdvisors.map(resolveMemberPhoto));

	const teamLeads = leads.filter(lead => lead.role.toLowerCase().startsWith("team"));
	const departmentLeads = leads.filter(lead => !lead.role.toLowerCase().startsWith("team"));

	const deptRows = []
	for (let i = 0; i < departmentLeads.length; i += 4) {
		deptRows.push(departmentLeads.slice(i, i + 4));
	}

	const seniorRows = []
	for (let i = 0; i < seniorMembers.length; i += 5) {
		seniorRows.push(seniorMembers.slice(i, i + 5));
	}

	return (
		<div className="bg-[#0E0E0E] min-h-screen w-full flex flex-col">
			<div className="pt-[25vh] md:pt-[30vh] px-8 md:px-16 py-8 md:py-16">
				<h1 className="text-white font-offbit-101 font-bold text-4xl md:text-7xl">Meet the team</h1>
			</div>
			<div className="w-full h-full bg-[#DB003B] flex flex-col items-center justify-center px-8 md:px-16 py-8 md:py-16 md:gap-6 gap-2">
				<div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-12 md:gap-24 md:mb-16">
					<div className="flex-2">
						<h1 className="text-white text-4xl md:text-6xl font-offbit font-bold">Leads</h1>
						<p className="text-white text-xl font-semibold font-offbit mt-2">
							The TorchBearers of MNET
						</p>
					</div>
					<Image
						src="/img/Team_Leads.jpg"
						alt="Team Leads"
						width={400}
						height={400}
						className="flex-1 aspect-[4/3] rounded-lg object-cover border-4 border-[#E0E0E0]"
					/>
				</div>
				<div className="hidden md:flex flex-col items-center justify-center">
					<div className={`grid items-center`}
						style={{
							gridTemplateColumns: `repeat(${teamLeads.length}, minmax(0, 1fr))`,
							width: `${(teamLeads.length / 4) * 100}%`,
						}}
					>
						{teamLeads.map((lead) => (
							<div key={lead.id} className="flex-1 bg-transparent p-6">
								<MemberCard member={lead} borderColorClass="border-[#030CAB]" />
							</div>
						))}
					</div>
					{deptRows.map((row, rowIndex) => (
						<div key={rowIndex} className={`grid justify-items-center`}
							style={{
								gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
								width: `${(row.length / 4) * 100}%`,
							}}
						>
							{row.map((lead) => (
								<div key={lead.id} className="bg-transparent p-6">
									<MemberCard member={lead} borderColorClass="border-[#030CAB]" />
								</div>
							))}
						</div>
					))}
				</div>
				<div className="md:hidden grid grid-cols-2 w-full gap-4">
					{leads.map((lead) => (
						<div key={lead.id} className="flex-1 bg-transparent p-2">
							<MemberCard member={lead} borderColorClass="border-[#030CAB]" />
						</div>
					))}
				</div>
			</div>
			<div className="w-full h-full bg-[#030CAB] flex flex-col items-center justify-center px-8 md:px-16 py-8 md:py-16 md:gap-6 gap-2">
				<div className="w-full flex flex-col-reverse md:flex-row items-start md:items-center justify-between gap-12 md:gap-24 md:mb-16">
					<Image
						src="/img/Senior-Members-Temp.jpg"
						alt="Team Leads"
						width={400}
						height={400}
						className="flex-1 aspect-[4/3] rounded-lg object-cover border-4 border-[#E0E0E0]"
					/>
					<div className="flex-2 text-right">
						<h1 className="text-white text-4xl md:text-6xl font-offbit font-bold">Senior Members</h1>
						<p className="text-white text-xl font-semibold font-offbit mt-2">
							Proud MNETizens who've been pushing the frontiers of Emerging Technology for Semesters
						</p>
					</div>
				</div>
				<div className="hidden md:flex flex-col items-center justify-center">
					{seniorRows.map((row, rowIndex) => (
						<div key={rowIndex} className={`grid justify-items-center`}
							style={{
								gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
								width: `${(row.length / 5) * 100}%`,
							}}
						>
							{row.map((member) => (
								<div key={member.id} className="bg-transparent p-6">
									<MemberCard member={member} size="small" borderColorClass="border-[#0E0E0E]" />
								</div>
							))}
						</div>
					))}
				</div>
				<div className="md:hidden grid grid-cols-2 w-full gap-4">
					{seniorMembers.map((lead) => (
						<div key={lead.id} className="flex-1 bg-transparent p-2">
							<MemberCard member={lead} borderColorClass="border-[#0E0E0E]" />
						</div>
					))}
				</div>
			</div>
			<div className="w-full h-full bg-[#2D2D2D] flex flex-col items-center justify-center px-8 md:px-16 py-8 md:py-16 md:gap-6 gap-2">
				<div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-12 md:gap-24 md:mb-16">
					<div className="flex-2">
						<h1 className="text-white text-4xl md:text-6xl font-offbit font-bold">Academic Advisors</h1>
						<p className="text-white text-xl font-semibold font-offbit mt-2">
							The Guides who help us reach the tech frontier.
						</p>
					</div>
					<Image
						src="/img/Team_Leads.jpg"
						alt="Team Leads"
						width={400}
						height={400}
						className="flex-1 aspect-[4/3] rounded-lg object-cover border-4 border-[#E0E0E0]"
					/>
				</div>
				<div className="hidden md:flex flex-col items-center justify-center w-full">
					<div className={`grid items-center w-full`}
						style={{
							gridTemplateColumns: `repeat(${academicAdvisors.length}, minmax(0, 1fr))`,
							width: `${(academicAdvisors.length / 3) * 90}%`,
						}}
					>
						{academicAdvisors.map((advisor) => (
							<div key={advisor.id} className="flex-1 bg-transparent p-6">
								<MemberCard member={advisor} borderColorClass="border-[#DB003B]" />
							</div>
						))}
					</div>
				</div>
				<div className="md:hidden grid grid-cols-2 w-full gap-4">
					{academicAdvisors.map((lead) => (
						<div key={lead.id} className="flex-1 bg-transparent p-2">
							<MemberCard member={lead} borderColorClass="border-[#DB003B]" />
						</div>
					))}
				</div>
			</div>
			<div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-16 py-8 md:py-16 md:gap-12 gap-6">
				<h1 className="font-offbit-101 font-bold text-4xl md:text-7xl text-white">
					Team Structure
				</h1>
				<div className="w-full self-baseline flex flex-col items-center gap-2 md:gap-4">
					<p className="text-white text-3xl md:text-4xl font-offbit font-semibold">
						Team Leads
					</p>
					<div className="w-full text-center flex flex-col md:grid md:grid-cols-5 gap-2">
						{teamLeads.map((lead) => (
							<p key={lead.id} className="text-white text-lg md:text-xl font-offbit-101 font-semibold">
								{lead.icon}{lead.name}
							</p>
						))}
					</div>
				</div>
				<div className="w-full self-baseline flex flex-col items-center gap-2 md:gap-4">
					<p className="text-white text-3xl md:text-4xl font-offbit font-semibold">
						Marketing
					</p>
					<div className="w-full text-center flex flex-col md:grid md:grid-cols-5 gap-2">
						{marketingMembers.map((member) => (
							<p key={member.id} className="text-white text-lg md:text-xl font-offbit-101 font-semibold">
								{member.icon}{member.name}
							</p>
						))}
					</div>
				</div>
				<div className="w-full self-baseline flex flex-col items-center gap-2 md:gap-4">
					<p className="text-white text-3xl md:text-4xl font-offbit font-semibold">
						Operations
					</p>
					<div className="w-full text-center flex flex-col md:grid md:grid-cols-5 gap-2">
						{operationsMembers.map((member) => (
							<p key={member.id} className="text-white text-lg md:text-xl font-offbit-101 font-semibold">
								{member.icon}{member.name}
							</p>
						))}
					</div>
				</div>
				<div className="w-full self-baseline flex flex-col items-center gap-2 md:gap-4">
					<p className="text-white text-3xl md:text-4xl font-offbit font-semibold">
						Education
					</p>
					<div className="w-full text-center flex flex-col md:grid md:grid-cols-5 gap-2">
						{educationMembers.map((member) => (
							<p key={member.id} className="text-white text-lg md:text-xl font-offbit-101 font-semibold">
								{member.icon}{member.name}
							</p>
						))}
					</div>
				</div>
				<div className="w-full self-baseline flex flex-col items-center gap-2 md:gap-4">
					<p className="text-white text-3xl md:text-4xl font-offbit font-semibold">
						Projects
					</p>
					<div className="w-full text-center flex flex-col md:grid md:grid-cols-6 gap-2">
						{projectsMembers.map((member) => (
							<p key={member.id} className="text-white text-lg md:text-xl font-offbit-101 font-semibold">
								{member.icon}{member.name}
							</p>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default TeamPage;