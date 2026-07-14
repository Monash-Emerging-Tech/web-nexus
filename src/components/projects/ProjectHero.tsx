"use client";
import ProjectInfo from "./ProjectInfo";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Section = {
  title: string;
  items: string[];
};

type ProjectHeroProps = {
  title: string;
  description: string;
  images: string[];
  sections: Section[];
};

export default function ProjectHero({
  title,
  description,
  images,
  sections,
}: ProjectHeroProps) {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-[110px]">
        <div className="order-2 md:order-1">
            <h1 className="font-offbit-101 text-[26px] font-bold leading-normal text-white md:w-[498px] md:text-[28.32px]">
            {title}
            </h1>

            <p className="mt-5 font-[family:var(--font-exo2)] text-sm leading-7 text-white/70 md:mt-8 md:max-w-2xl md:text-base md:leading-8">
            {description}
            </p>

            <div className="mt-8 md:mt-12">
            <ProjectInfo sections={sections} />
            </div>
        </div>

        <div className="order-1 h-[260px] w-full overflow-hidden rounded-[12.826px] md:order-2 md:h-[372.996px] md:w-[502.68px]">
            <div className="relative h-[260px] w-full overflow-hidden rounded-[12.826px] md:h-[372.996px] md:w-[502.68px]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={images[currentImage]}
                  alt={`${title} image ${currentImage + 1}`}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{
                    duration: 0.47,
                    ease: "easeInOut",
                  }}
                  className="absolute h-full w-full object-cover"
                />
              </AnimatePresence>
            </div>
        </div>
    </section>
  );
}