"use server"

import { Member } from "@/lib/notion/types";
import { getAcademicAdvisors, getLeads, getMembersByDepartment, getSeniorMembers } from "@/lib/notion/members";
import Image from "next/image";
import Footer from "@/components/Footer";
import Nav from "@/components/navbar_test/Nav";

enum TeamLeadOrder {
	"Team Lead",
	"Project Lead",
	"Operation Lead",
	"Marketing Lead",
	"Education Lead",
}

const TeamPage = async () => {
	// Switching to server component for initial data fetch for faster load
	const leads: Member[] = (await getLeads())
		.sort((a, b) => TeamLeadOrder[a.role as keyof typeof TeamLeadOrder] - TeamLeadOrder[b.role as keyof typeof TeamLeadOrder]);
	
	const marketingMembers: Member[] = (await getMembersByDepartment("Marketing"));
	const educationMembers: Member[] = (await getMembersByDepartment("Education"));
	const projectsMembers: Member[] = (await getMembersByDepartment("Projects"));
	const operationsMembers: Member[] = (await getMembersByDepartment("Operations"));
	
	const seniorMembers: Member[] = await getSeniorMembers();
	const academicAdvisors: Member[] = await getAcademicAdvisors();

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
			<Nav />
			<div className="pt-[40vh] px-16 py-16">
				<h1 className="text-white font-offbit-101 font-bold text-7xl">Meet the team</h1>
			</div>
			<div className="w-full h-full bg-[#DB003B] flex flex-col items-center justify-center md:px-16 py-16 md:gap-6 gap-2">
				<div className="w-full flex flex-row items-center justify-between gap-24 mb-16">
					<div className="flex-2">
						<h1 className="text-white text-4xl md:text-6xl font-offbit font-bold">Leads</h1>
						<p className="text-white text-xl font-semibold font-offbit mt-2">
							They do cool stuffs :p
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
						{teamLeads
							.map((lead) => (
							<div key={lead.id} className="flex-1 bg-transparent rounded-lg p-6 flex flex-col items-center gap-2">
								<img 
									src={"https://placehold.co/150x150.png"}
									alt={lead.name}
									className="w-40 h-40 rounded-full object-cover border-4 border-[#030CAB]"
								/>
								<div className="flex flex-col items-center">
									<p className="text-white text-2xl font-offbit font-bold text-center">{lead.name}</p>
									<p className="text-gray-400 text-lg font-offbit">{lead.role}</p>
								</div>
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
							{row
								.map((lead) => (
								<div key={lead.id} 
									className="bg-transparent rounded-lg p-6 flex flex-col items-center gap-2">
									<img 
										src={"https://placehold.co/150x150.png"}
										alt={lead.name}
										className="w-40 h-40 rounded-full object-cover border-4 border-[#030CAB]"
									/>
									<div className="flex flex-col items-center">
										<p className="text-white text-2xl font-offbit font-bold">{lead.name}</p>
										<p className="text-gray-400 text-lg font-offbit">{lead.role}</p>
									</div>
								</div>
							))}
						</div>
					))}
				</div>
				<div className="md:hidden grid grid-cols-2 w-full">
					{
						leads.map((lead) => (
							<div key={lead.id} className="flex-1 bg-transparent rounded-lg p-6 flex flex-col items-center gap-2">
								<img
									src={"https://placehold.co/150x150.png"}
									alt={lead.name}
									className="w-24 h-24 rounded-full object-cover border-4 border-[#030CAB]"
								/>
								<div className="flex flex-col items-center">
									<p className="text-white text-lg font-offbit font-bold text-center">{lead.name}</p>
									<p className="text-gray-400 text-sm font-offbit">{lead.role}</p>
								</div>
							</div>
						))
					}
				</div>
			</div>
			<div className="w-full h-full bg-[#030CAB] flex flex-col items-center justify-center md:px-16 py-16 md:gap-6 gap-2">
				<div className="w-full flex flex-row items-center justify-between gap-24 mb-16">
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
							They also do cool stuffs :p
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
							{row
								.map((member) => (
								<div key={member.id} 
									className="bg-transparent rounded-lg p-6 flex flex-col items-center gap-2">
									<img 
										src={"https://placehold.co/150x150.png"}
										alt={member.name}
										className="w-32 h-32 rounded-full object-cover border-4 border-[#0E0E0E]"
									/>
									<div className="flex flex-col items-center">
										<p className="text-white text-2xl font-offbit font-bold text-center">{member.name}</p>
										<p className="text-gray-400 text-lg font-offbit">{member.role}</p>
									</div>
								</div>
							))}
						</div>
					))}
				</div>
				<div className="md:hidden grid grid-cols-2 w-full">
					{
						seniorMembers.map((lead) => (
							<div key={lead.id} className="flex-1 bg-transparent rounded-lg p-6 flex flex-col items-center gap-2">
								<img
									src={"https://placehold.co/150x150.png"}
									alt={lead.name}
									className="w-24 h-24 rounded-full object-cover border-4 border-[#0E0E0E]"
								/>
								<div className="flex flex-col items-center">
									<p className="text-white text-lg font-offbit font-bold text-center">{lead.name}</p>
									<p className="text-gray-400 text-sm font-offbit">{lead.role}</p>
								</div>
							</div>
						))
					}
				</div>
			</div>
			<div className="w-full h-full bg-[#2D2D2D] flex flex-col items-center justify-center md:px-16 py-16 md:gap-6 gap-2">
				<div className="w-full flex flex-row items-center justify-between gap-24 mb-16">
					<div className="flex-2">
						<h1 className="text-white text-4xl md:text-6xl font-offbit font-bold">Academic Advisors</h1>
						<p className="text-white text-xl font-semibold font-offbit mt-2">
							Idk what they do ¯\_(ツ)_/¯
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
						{academicAdvisors
							.map((advicor) => (
							<div key={advicor.id} className="flex-1 bg-transparent rounded-lg p-6 flex flex-col items-center gap-2">
								<img 
									src={"https://placehold.co/150x150.png"}
									alt={advicor.name}
									className="w-40 h-40 rounded-full object-cover border-4 border-[#DB003B]"
								/>
								<div className="flex flex-col items-center">
									<p className="text-white text-2xl font-offbit font-bold text-center">{advicor.name}</p>
									<p className="text-gray-400 text-lg font-offbit">{advicor.role}</p>
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="md:hidden grid grid-cols-3 w-full">
					{
						academicAdvisors.map((lead) => (
							<div key={lead.id} className="flex-1 bg-transparent rounded-lg p-6 flex flex-col items-center gap-2">
								<img
									src={"https://placehold.co/150x150.png"}
									alt={lead.name}
									className="w-24 h-24 rounded-full object-cover border-4 border-[#DB003B]"
								/>
								<div className="flex flex-col items-center">
									<p className="text-white text-lg font-offbit font-bold text-center">{lead.name}</p>
								</div>
							</div>
						))
					}
				</div>
			</div>
			<div className="w-full h-full flex flex-col items-center justify-center md:px-16 py-16 md:gap-10 gap-4">
				<h1 className="font-offbit-101 font-bold text-4xl md:text-7xl text-white">
					Team Structure
				</h1>
				<div className="w-full self-baseline flex flex-col gap-4">
					<p className="text-white text-xl md:text-4xl font-offbit font-semibold">
						Team Leads
					</p>
					<div className="w-full grid grid-cols-5">
						{
							teamLeads.map((lead) => (
								<p key={lead.id} className="text-white text-lg md:text-xl font-offbit-101 font-semibold">
									{lead.icon}{lead.name}
								</p>
							))
						}
					</div>
				</div>
				<div className="w-full self-baseline flex flex-col gap-4">
					<p className="text-white text-xl md:text-4xl font-offbit font-semibold">
						Marketing
					</p>
					<div className="w-full grid grid-cols-5 gap-2">
						{
							marketingMembers.map((member) => (
								<p key={member.id} className="text-white text-lg md:text-xl font-offbit-101 font-semibold">
									{member.icon}{member.name}
								</p>
							))
						}
					</div>
				</div>
				<div className="w-full self-baseline flex flex-col gap-4">
					<p className="text-white text-xl md:text-4xl font-offbit font-semibold">
						Operations
					</p>
					<div className="w-full grid grid-cols-5 gap-2">
						{
							operationsMembers.map((member) => (
								<p key={member.id} className="text-white text-lg md:text-xl font-offbit-101 font-semibold">
									{member.icon}{member.name}
								</p>
							))
						}
					</div>
				</div>
				<div className="w-full self-baseline flex flex-col gap-4">
					<p className="text-white text-xl md:text-4xl font-offbit font-semibold">
						Education
					</p>
					<div className="w-full grid grid-cols-5 gap-2">
						{
							educationMembers.map((member) => (
								<p key={member.id} className="text-white text-lg md:text-xl font-offbit-101 font-semibold">
									{member.icon}{member.name}
								</p>
							))
						}
					</div>
				</div>
				<div className="w-full self-baseline flex flex-col gap-4">
					<p className="text-white text-xl md:text-4xl font-offbit font-semibold">
						Projects
					</p>
					<div className="w-full grid grid-cols-6 gap-2">
						{
							projectsMembers.map((member) => (
								<p key={member.id} className="text-white text-lg md:text-xl font-offbit-101 font-semibold">
									{member.icon}{member.name}
								</p>
							))
						}
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
}

export default TeamPage;