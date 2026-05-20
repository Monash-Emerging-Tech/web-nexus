"use server"

import ProjectHero from "@/components/projects/ProjectHero";

export default async function Page({ params } : { params: { slug: string } }) {
	const { slug: _projectSlug } = await params;

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
		<main className="flex min-h-screen bg-black px-8 py-12 text-white items-center pt-32">
			<div className="mx-auto flex max-w-7xl flex-col gap-2">
				<ProjectHero
				title={projectPlaceholder.title}
				description={projectPlaceholder.description}
				image={projectPlaceholder.image}
				sections={projectPlaceholder.sections}
				/>
      		</div>
    	</main>
	);
}