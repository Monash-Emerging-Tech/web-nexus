"use client";

import { useEffect, useState } from "react";
import ContourMap from "./ContourMap";

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

  useEffect(() => {
    const updateCountdown = () => {
      const timestamp = latestEvent.timestamp;
      const now = new Date().getTime();
      const countdown = timestamp - now;

      if (countdown < 0) {
        setEventActive(false);
        setDate({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      setEventActive(true);
      setDate({
        days: Math.floor(countdown / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (countdown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((countdown % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((countdown % (1000 * 60)) / 1000),
      });
    };

    // Update immediately
    updateCountdown();

    // Set up interval to update every second
    const interval = setInterval(updateCountdown, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [latestEvent.timestamp]);

  return (
    <section className="relative w-screen h-screen overflow-hidden bg-black flex justify-center items-center">
      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        <ContourMap />
      </div>
      
      {/* Content layer */}
      <div className="relative z-10 md:w-3/5 p-4 flex flex-col md:gap-0 gap-4 text-white text-center md:text-left">
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
        <br />
        <br />
        <div className="w-full flex justify-center md:justify-start">
          <button className="hover:cursor-pointer text-sm md:text-[1rem] font-offbit font-bold h-fit px-8 py-3 bg-primary rounded-md">
            OUR WORK -{">"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
