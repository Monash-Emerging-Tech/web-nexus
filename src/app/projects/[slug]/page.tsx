"use server"

import BlockHandler from "@/components/notion/BlockHandler";
import { getBlogBySlug } from "@/lib/notion/pages";
import { PageObject } from "@/lib/notion/types";
import { notFound } from "next/navigation";

export default async function Page({ params } : { params: { slug: string } }) {
	const { slug: projectSlug } = await params;

	const projectData: PageObject | null = await getBlogBySlug({ slug: projectSlug });

	if (!projectData) {
		notFound();
	}

	return (
		<div className='bg-white text-black w-full h-min-screen gap-4 flex flex-col items-center justify-start'>
			<div className='relative w-full h-[40vh]'>
				<span className='absolute left-0 bottom-0 z-10 text-white text-5xl font-offbit-101 font-semibold px-16 py-6'>
				{projectData.title}
				</span>
				<img
				src={
					projectData.cover?.type === "external"
					? projectData.cover.external.url
					: projectData.cover?.type === "file"
						? projectData.cover.file.url
						: '/img/Nav-Team.JPG'
				}
				alt={"Blog Icon"}
				className="w-full h-full object-cover brightness-60"
				/>
			</div>
			<div className='w-3/4 flex flex-col gap-4'>
				{projectData.content.map((component) => (
				<BlockHandler key={component.id} component={component} />
				))}
			</div>
		</div>
	);
}