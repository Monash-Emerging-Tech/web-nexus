// Static mascot + ethos section for the About Us page.
// Mepo's origin verified 2026-07-10 from Notion (Publications meeting notes,
// Members DB) and team records — see docs/MNET.md.

const MascotEthos = () => (
  <section className="w-full bg-[#0B0B0B] px-6 py-16 md:px-12 md:py-24">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 md:flex-row md:items-center md:gap-16">
      <div className="flex-1">
        <h2 className="font-offbit-dot text-5xl font-bold uppercase tracking-wider text-white md:text-6xl">
          Meet Mepo
        </h2>
        <p className="mt-6 font-offbit text-lg leading-relaxed text-white/80 md:text-xl">
          Our mascot is Mepo the platypus - named on 15 July 2025, the day our
          founder handed the team to its second generation of leads. The name
          takes one letter from each of our four departments:{" "}
          <span className="font-bold text-white">M</span>arketing,{" "}
          <span className="font-bold text-white">E</span>ducation,{" "}
          <span className="font-bold text-white">P</span>rojects,{" "}
          <span className="font-bold text-white">O</span>perations.
        </p>
        <p className="mt-4 font-offbit text-lg leading-relaxed text-white/80 md:text-xl">
          Why a platypus? MNET is about the crossing from the digital ocean to
          the physical landscape - and no animal moves between worlds like the
          platypus. It senses electricity with its bill, chews with gravel,
          sweats milk and glows under UV. A dozen strange talents in one
          creature, just like the dozen technologies in one team.
        </p>
        <p className="mt-4 font-offbit text-lg leading-relaxed text-white/80 md:text-xl">
          You&apos;ll find Mepo wandering through our projects - most literally
          in Platypus Forest, our virtual home for showcasing what the team
          builds. (In our members database, The Platypus is listed as a Team
          Lead. We don&apos;t make the rules.)
        </p>
      </div>
      <div className="flex-1">
        <div className="rounded-2xl border-4 border-[#DC003B] bg-black p-8 md:p-10">
          <p className="font-offbit-dot text-2xl font-bold uppercase tracking-widest text-[#DC003B]">
            Our Ethos
          </p>
          <p className="mt-4 font-offbit text-2xl font-bold leading-snug text-white md:text-3xl">
            Expanding all horizons.
          </p>
          <p className="mt-4 font-offbit text-lg leading-relaxed text-white/70">
            We push each other outside our comfort zones in a supportive
            environment. Leadership isn&apos;t an exclusive club - prove
            yourself and join us at the table. And when we leave, we leave the
            team stronger than we found it.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default MascotEthos;
