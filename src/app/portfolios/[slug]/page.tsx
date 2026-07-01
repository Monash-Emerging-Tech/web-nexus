"use server"

import { notFound } from "next/navigation";
import ProjectHero from "@/components/projects/ProjectHero";
import BlockHandler from "@/components/notion/BlockHandler";
import { getPortfolioById } from "@/lib/notion/portfolios";
import { getBlogBySlug } from "@/lib/notion/pages";

export default async function Page({ params } : { params: { slug: string } }) {
	const { slug: projectSlug } = await params;

	// Fetch portfolio metadata properties
	const portfolioData = await getPortfolioById(projectSlug);
	if (!portfolioData) {
		notFound();
	}

	// Fetch full page rich content blocks from Notion
	const pageContent = await getBlogBySlug({ slug: projectSlug });

	// Map metadata properties to the sections expected by ProjectHero
	const sections = [
		{
			title: "Project Type",
			items: portfolioData.tags.length > 0 ? portfolioData.tags : ["N/A"],
		},
		{
			title: "Team Members",
			items: portfolioData.members.length > 0 ? portfolioData.members : ["MNET Team"],
		},
		{
			title: "Tech Used",
			items: portfolioData.tech.length > 0 ? portfolioData.tech : ["N/A"],
		},
	];

	return (
		<main className="flex min-h-screen flex-col bg-black px-4 sm:px-8 py-12 text-white items-center pt-32 pb-24">
			<div className="mx-auto flex max-w-7xl w-full flex-col gap-12">
				<ProjectHero
					title={portfolioData.name}
					description={portfolioData.oneliner || portfolioData.description}
					image={portfolioData.imageUrl || "/img/Nav-Team.JPG"}
					sections={sections}
				/>

				{/* Render Notion rich block contents if present */}
				{pageContent && pageContent.content && pageContent.content.length > 0 && (
					<div className="mt-8 border-t border-white/10 pt-12 flex flex-col gap-6 max-w-4xl">
						<h2 className="text-3xl font-bold font-offbit-dot mb-4">Project Details</h2>
						<div className="flex flex-col gap-4 text-white/80 leading-relaxed font-sans [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_p]:text-base [&_li]:text-base [&_a]:text-[#DC003B] [&_a]:underline">
							{pageContent.content.map((component) => (
								<BlockHandler 
									key={component.id} 
									component={component} 
									classNameDef={{
										paragraph: "text-base font-normal text-white/80 mb-2 leading-8",
										heading: "mt-6 text-xl font-bold text-white mb-2 font-offbit-101",
										bulleted_list_item: "list-item list-disc ml-6 text-white/85 mb-1",
									}}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</main>
	);
}