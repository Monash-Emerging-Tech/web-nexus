"use client";

import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import "./OurValues.css";

type ValueCard = {
  title: string;
  tagline: string;
  points: [string, string, string];
  icon: ReactNode;
  tilt: NonNullable<VariantProps<typeof valueCardStyles>["tilt"]>;
};

const valueCardStyles = cva(
  "our-values-card group relative flex h-full cursor-pointer flex-col rounded-2xl border border-black/5 bg-[#f3f3f3] p-7 text-black shadow-[0_10px_24px_rgba(0,0,0,0.24)]",
  {
    variants: {
      tilt: {
        left: "tilt-left",
        middle: "rotate-0",
        right: "tilt-right",
      },
    },
  }
);

const values: ValueCard[] = [
  {
    title: "Innovation",
    tagline: "Expanding All Horizons",
    points: ["Experiment-Led", "Frontier Technology", "Built To Ship"],
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
        <path
          d="M6 16L11 11L14 14L20 8M20 8H15M20 8V13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    tilt: "left",
  },
  {
    title: "Collaboration",
    tagline: "One Tight-Knit Team",
    points: ["Across Disciplines", "Open To Everyone", "Grow Each Other"],
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
        <path
          d="M16 11C17.6569 11 19 9.65685 19 8C19 6.34315 17.6569 5 16 5C14.3431 5 13 6.34315 13 8C13 9.65685 14.3431 11 16 11Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 13C9.65685 13 11 11.6569 11 10C11 8.34315 9.65685 7 8 7C6.34315 7 5 8.34315 5 10C5 11.6569 6.34315 13 8 13Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 19V18C12 16.3431 10.6569 15 9 15H7C5.34315 15 4 16.3431 4 18V19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 19V18C19.999 16.6154 19.0594 15.4075 17.715 15.067"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    tilt: "middle",
  },
  {
    title: "Excellence",
    tagline: "Industry Standard",
    points: ["Hands-On Craft", "Real-World Impact", "Leave It Stronger"],
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
        <path
          d="M20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C13.8864 3.5 15.6292 4.12343 17.0348 5.17167"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9 12L11 14L21 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 7V11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    tilt: "right",
  },
];

function OurValues() {
  return (
    <section className="relative bg-[radial-gradient(circle_at_50%_0%,#e12d65_0%,#be003d_45%,#8c002b_100%)] px-6 py-16 md:px-12 md:py-24">
      <h2 className="mb-10 text-center font-offbit-dot text-5xl font-bold uppercase tracking-tight md:mb-12 md:text-6xl">
        Our Values
      </h2>
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
        {values.map((value) => (
          <article key={value.title} className={cn(valueCardStyles({ tilt: value.tilt }))}>
            <div className="our-values-shift relative z-10 mb-7 flex items-center justify-between">
              <h3 className="font-offbit text-4xl font-bold leading-none md:text-5xl">{value.title}</h3>
              <span className="our-values-icon">{value.icon}</span>
            </div>
            <div className="flex flex-col gap-5 font-offbit text-[2.1rem] relative z-10 md:text-[2.3rem]">
              <p className="our-values-shift border-b-[3px] border-dotted border-[#e11b52] pb-5">
                {value.tagline}
              </p>
              {value.points.map((point) => (
                <p
                  key={point}
                  className="our-values-shift border-b-[3px] border-dotted border-[#e11b52] pb-5"
                >
                  {point}
                </p>
              ))}
            </div>
            <div className="our-values-footer relative z-10 mt-8 flex items-center justify-between border-t border-black/10 pt-4 opacity-75 transition duration-500">
              <span className="text-black/70">{value.icon}</span>
              <span className="origin-center rotate-180 font-offbit text-[2.25rem] font-semibold md:text-[2.55rem]">
                {value.title}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default OurValues;
