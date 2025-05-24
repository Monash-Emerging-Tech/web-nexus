"use client";

import { useEffect, useState } from "react";

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
  const [eventActive, setEventActive] = useState(true);

  useEffect(() => {
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

    setTimeout(() => {
      setDate({
        days: Math.floor(countdown / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (countdown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((countdown % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((countdown % (1000 * 60)) / 1000),
      });
    }, 1000);
  }, [eventActive]);

  return (
    <div className="top-0 bg-[url(/img/spacefabric.png)] bg-center bg-cover w-screen h-screen flex justify-center items-center">
      <div className="md:w-3/5 p-4 flex flex-col md:gap-0 gap-4">
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
        <div className="w-full flex justify-center">
          <button className="hover:cursor-pointer text-sm md:text-[1rem] font-offbit font-bold h-fit px-8 py-3 bg-primary rounded-md">
            OUR WORK -{">"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
