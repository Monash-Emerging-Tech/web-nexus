type Section = {
  title: string;
  items: string[];
};

type ProjectInfoProps = {
  sections: Section[];
};

export default function ProjectInfo({ sections }: ProjectInfoProps) {
  return (
    <section className="grid w-[497px] grid-cols-2 gap-x-12 gap-y-5">
      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="mb-2 font-offbit-101 text-[16px] font-bold leading-none text-white">
            {section.title}
          </h2>

          <ul className="space-y-0.5 text-[14px] leading-[18px] text-white">
            {section.items.map((item, index) => (
              <li key={`${section.title}-${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}