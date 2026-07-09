// Static mascot + ethos section for the About Us page.
// NOTE: the "why the platypus" origin copy is a draft — confirm with the team
// before treating it as canon (see docs/MNET.md).

const MascotEthos = () => (
  <section className="w-full bg-[#0B0B0B] px-6 py-16 md:px-12 md:py-24">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 md:flex-row md:items-center md:gap-16">
      <div className="flex-1">
        <h2 className="font-offbit-dot text-5xl font-bold uppercase tracking-wider text-white md:text-6xl">
          Why the Platypus?
        </h2>
        <p className="mt-6 font-offbit text-lg leading-relaxed text-white/80 md:text-xl">
          Our mascot is the platypus — a creature so strange that the first
          scientists to see one thought it was a hoax. Part duck, part beaver,
          part otter, it refuses to fit a category. So do we. MNET blends
          engineering, information technology, design and art into one team,
          and builds things that don&apos;t fit neatly into any single
          discipline.
        </p>
        <p className="mt-4 font-offbit text-lg leading-relaxed text-white/80 md:text-xl">
          You&apos;ll find our platypus wandering through our projects — most
          literally in Platypus Forest, our virtual home for showcasing what
          the team builds.
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
            environment. Leadership isn&apos;t an exclusive club — prove
            yourself and join us at the table. And when we leave, we leave the
            team stronger than we found it.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default MascotEthos;
