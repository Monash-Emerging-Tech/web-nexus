"use server"

import BlockHandler from "@/components/notion/BlockHandler";
import { getBlogBySlug } from "@/lib/notion/pages";
import { PageObject } from "@/lib/notion/types";
import { notFound } from "next/navigation";
import ProjectHero from "@/components/projects/ProjectHero";
import ProjectInfo from "@/components/projects/ProjectInfo";
import Navbar from "@/components/NavBar";

export default async function Page({ params } : { params: { slug: string } }) {
	const { slug: projectSlug } = await params;

	//to be used when we have notion data, for now we will use placeholder data
	//const projectData: PageObject | null = await getBlogBySlug({ slug: projectSlug });

	// if (!projectData) {
	// 	notFound();
	// }

	const projectPlaceholder = {
		title: "Wastewater Treatment Digital Twinning",
		description:
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		image: "/img/Nav-Team.JPG",

		sections: [
		{
			title: "Project Type",
			items: [
			"Wastewater Treatment",
			"Digital Twinning",
			"VR",
			"3D",
			],
		},
		{
			title: "Team Members",
			items: [
			"Member Name",
			"Member Name",
			"Member Name",
			],
		},
		{
			title: "Tech Used",
			items: [
			"Unity",
			"Autodesk Maya",
			"Substance Painter",
			],
		},
		],
	};

	return (
		//Naailah - I will be editing this section for projects detail page
		<>
		<Navbar />
		<main className="relative isolate flex min-h-screen overflow-hidden bg-black px-8 py-12 pt-32 text-white items-center">
			<img
				src="/img/projects-bg-2.png"
				alt=""
				className="
				absolute
				top-0
				left-0
				-z-10
				w-full
				opacity-80
				pointer-events-none
				select-none
				"
			/>

			<div className="mx-auto flex max-w-7xl flex-col gap-2">
				<ProjectHero
				title={projectPlaceholder.title}
				description={projectPlaceholder.description}
				image={projectPlaceholder.image}
				sections={projectPlaceholder.sections}
				/>
      		</div>

			<img
				src="/img/projects-bg.png"
				alt=""
				className="
				absolute
				bottom-0
				left-0
				-z-10
				w-full
				opacity-80
				pointer-events-none
				select-none
				"
			/>
    	</main>
		</>
	);
}