"use client";

import { motion } from "framer-motion";

export interface TimelineEntry {
  date: string;
  title: string;
  description: string;
}

const entryVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const TimelineCard = ({ entry }: { entry: TimelineEntry }) => (
  <div className="rounded-2xl border border-white/10 bg-[#151515] p-6 transition-colors duration-300 hover:border-[#DC003B]/60">
    <p className="font-offbit-dot text-2xl font-bold uppercase tracking-wider text-[#DC003B]">
      {entry.date}
    </p>
    <h3 className="mt-1 font-offbit text-2xl font-bold text-white md:text-3xl">
      {entry.title}
    </h3>
    <p className="mt-2 font-offbit text-lg leading-relaxed text-white/70">
      {entry.description}
    </p>
  </div>
);

const Timeline = ({ entries }: { entries: TimelineEntry[] }) => {
  return (
    <div className="relative mx-auto w-full max-w-5xl px-4">
      {/* centre line (left-aligned on mobile) */}
      <div
        aria-hidden
        className="absolute left-[11px] top-0 h-full w-[3px] bg-gradient-to-b from-[#DC003B] via-[#DC003B]/70 to-transparent md:left-1/2 md:-translate-x-1/2"
      />
      <div className="flex flex-col gap-10 md:gap-14">
        {entries.map((entry, i) => {
          const left = i % 2 === 0;
          return (
            <motion.div
              key={`${entry.date}-${entry.title}`}
              variants={entryVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative"
            >
              {/* node marker */}
              <div
                aria-hidden
                className="absolute left-[3px] top-7 h-5 w-5 rotate-45 border-2 border-[#DC003B] bg-black md:left-1/2 md:-translate-x-1/2"
              />
              <div
                className={`pl-10 md:w-1/2 md:pl-0 ${
                  left ? "md:pr-12" : "md:ml-auto md:pl-12"
                }`}
              >
                <TimelineCard entry={entry} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
