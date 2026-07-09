import Image from "next/image";
import ProjectInfo from "./ProjectInfo";

type Section = {
  title: string;
  items: string[];
};

type ProjectHeroProps = {
  title: string;
  description: string;
  image: string;
  sections: Section[];
};

export default function ProjectHero({
  title,
  description,
  image,
  sections,
}: ProjectHeroProps) {
  return (
    <section className="flex justify-between items-start gap-[110px]">
        <div>
            <h1 className="w-[498px] text-[28.32px] font-bold leading-normal text-white font-offbit-101">
            {title}
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-white/70">
            {description}
            </p>

            <div className="mt-12">
            <ProjectInfo sections={sections} />
            </div>
        </div>

        <div className="w-[502.68px] h-[372.996px] rounded-[12.826px] overflow-hidden">
            <Image
                src={image}
                alt={title}
                width={503}
                height={373}
                className="w-full h-full object-cover"
            />
        </div>
    </section>
  );
}