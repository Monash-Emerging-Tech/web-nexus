type Section = {
  title: string;
  items: string[];
};

type ProjectInfoProps = {
  sections: Section[];
};

export default function ProjectInfo({ sections }: ProjectInfoProps) {
  return (
    <section className="grid w-full grid-cols-1 gap-4 md:w-[497px] md:grid-cols-2 md:gap-x-12 md:gap-y-5">
      {sections.map((section) => (
        <div key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 md:border-0 md:bg-transparent md:p-0">
          <h2 className="mb-2 font-offbit-101 text-[16px] font-bold leading-none text-white">
            {section.title}
          </h2>

          <ul className="space-y-0.5 font-[family:var(--font-exo2)] text-[14px] leading-[18px] text-white">
            {section.items.map((item, index) => (
              <li key={`${section.title}-${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}