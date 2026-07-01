"use client";

import { useEffect, useState } from "react";
import { useScroll } from "@react-three/drei";
import ContourMap from "./ContourMap";

const OurWorkButton = () => {
  const scroll = useScroll();

  const handleClick = () => {
    if (scroll && scroll.el) {
      scroll.el.scrollTo({
        top: scroll.el.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="hover:cursor-pointer text-sm md:text-[1rem] font-offbit font-bold h-fit px-8 py-3 bg-primary rounded-md pointer-events-auto"
    >
      OUR WORK -{">"}
    </button>
  );
};

const Hero: React.FC = () => {
  const latestEvent = {
    title: "MNET x MDN Tech Futures Industries",
    timestamp: new Date("2025-05-24T03:24:00").getTime(),
  };

  const [date, setDate] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [eventActive, setEventActive] = useState(false);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const timestamp = latestEvent.timestamp;
      const now = new Date().getTime();
      const countdown = timestamp - now;

      if (countdown < 0) {
        setEventActive(false);
        setDate({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setEventActive(true);
      setDate({
        days: Math.floor(countdown / (1000 * 60 * 60 * 24)),
        hours: Math.floor((countdown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((countdown % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((countdown % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [latestEvent.timestamp]);

  useEffect(() => {
    const words = ["Virtual Reality", "Augmented Reality", "Mixed Reality", "Extended Reality"];
    let wordIndex = 0;
    let charIndex = 0;
    let removing = false;
    let timeoutId = 0;

    const run = () => {
      const currentWord = words[wordIndex] ?? "";

      if (!removing) {
        charIndex += 1;
        setTypedText(currentWord.slice(0, charIndex));

        if (charIndex >= currentWord.length) {
          removing = true;
          timeoutId = window.setTimeout(run, 1000);
          return;
        }
        timeoutId = window.setTimeout(run, 200);
        return;
      }

      charIndex -= 1;
      setTypedText(currentWord.slice(0, Math.max(charIndex, 0)));

      if (charIndex <= 0) {
        removing = false;
        wordIndex = (wordIndex + 1) % words.length;
        timeoutId = window.setTimeout(run, 500);
        return;
      }

      timeoutId = window.setTimeout(run, 100);
    };

    timeoutId = window.setTimeout(run, 500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <section className="relative w-screen h-screen overflow-hidden bg-black flex justify-center items-center">
      <div className="absolute inset-0 z-0">
        <ContourMap>
          <div className="w-screen h-screen flex flex-col justify-center items-center md:items-start md:px-32 pointer-events-none">
            <div className="md:w-3/5 p-4 flex flex-col md:gap-0 gap-4 text-white text-center md:text-left pointer-events-auto">
              {eventActive && (
                <p className="font-offbit font-bold md:text-2xl text-sm">
                  {latestEvent.title}: {date.days}d {date.hours}h {date.minutes}m{" "}
                  {date.seconds}s
                </p>
              )}
              <h1 className="font-offbit-dot font-bold md:text-7xl text-5xl">
                MONASH NEXUS FOR EMERGING TECHNOLOGIES
              </h1>
              <h2 className="font-offbit font-bold md:text-2xl text-sm">
                A Monash University student team pushing the boundaries of XR.
              </h2>
              <div className="flex items-center mt-1">
                <p className="font-offbit md:text-xl text-sm tracking-wide">
                  {typedText}
                </p>
                <span className="ml-1 w-2 h-0.5 bg-white animate-pulse" />
              </div>
              <br />
              <div className="w-full flex justify-center md:justify-start">
                <OurWorkButton />
              </div>
            </div>
          </div>
        </ContourMap>
      </div>
    </section>
  );
};

export default Hero;