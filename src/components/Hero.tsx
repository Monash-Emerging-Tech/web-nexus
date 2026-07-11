"use client";

import { useEffect, useState } from "react";
import { useScroll } from "@react-three/drei";
import ContourMap from "./ContourMap";
import { optimizeFlashbackUrl } from "@/lib/utils";

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
      data-ccursor
      onClick={handleClick}
      className="hover:cursor-pointer text-xs md:text-[1rem] font-offbit font-bold h-fit px-5 py-2.5 md:px-8 md:py-3 bg-primary rounded-md pointer-events-auto transition-all duration-300"
    >
      LEARN MORE
    </button>
  );
};

export interface UpcomingEvent {
  title: string;
  timestamp: number;
}

interface HeroProps {
  flashbackUrls?: string[];
  upcomingEvent?: UpcomingEvent | null;
}

const Hero: React.FC<HeroProps> = ({ flashbackUrls = [], upcomingEvent = null }) => {
  const [date, setDate] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [eventActive, setEventActive] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (!upcomingEvent) return;

    const interval = setInterval(updateCountdown, 1000);

    function updateCountdown() {
      const now = new Date().getTime();
      const countdown = upcomingEvent!.timestamp - now;

      if (countdown < 0) {
        setEventActive(false);
        setDate({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      setEventActive(true);
      setDate({
        days: Math.floor(countdown / (1000 * 60 * 60 * 24)),
        hours: Math.floor((countdown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((countdown % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((countdown % (1000 * 60)) / 1000),
      });
    }

    updateCountdown();
    return () => clearInterval(interval);
  }, [upcomingEvent]);

  useEffect(() => {
    const words = ["Virtual Reality", "Augmented Reality", "Mixed Reality", "Extended Reality"];
    let wordIndex = 0;
    let charIndex = 0;
    let removing = false;
    let timeoutId = 0;

    const run = () => {
      const currentWord = words[wordIndex] ?? "";

      if (!removing) {
        setIsGlitching(false);
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
        setIsGlitching(true);
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

  // Warm the browser image cache for the flashback effect. Deferred to idle
  // time and capped so it never competes with the hero scene for bandwidth.
  useEffect(() => {
    const MAX_PRELOAD = 16;
    let cancelled = false;

    const preloadImages = (urls: string[]) => {
      if (cancelled) return;
      urls.slice(0, MAX_PRELOAD).forEach((url) => {
        const img = new Image();
        img.src = optimizeFlashbackUrl(url, 800);
      });
    };

    const warmCache = () => {
      const cached = sessionStorage.getItem("mnet_image_cache");
      if (cached) {
        try {
          preloadImages(JSON.parse(cached));
          return;
        } catch {
          sessionStorage.removeItem("mnet_image_cache");
        }
      }
      fetch("/api/notion-cache")
        .then((res) => res.json())
        .then((data: { imageUrls?: string[] }) => {
          if (Array.isArray(data?.imageUrls)) {
            sessionStorage.setItem("mnet_image_cache", JSON.stringify(data.imageUrls));
            preloadImages(data.imageUrls);
          }
        })
        .catch((err) => console.error("Error loading image cache:", err));
    };

    const hasIdleCallback = typeof window.requestIdleCallback === "function";
    const idleId = hasIdleCallback
      ? window.requestIdleCallback(warmCache, { timeout: 5000 })
      : window.setTimeout(warmCache, 2000);

    return () => {
      cancelled = true;
      if (hasIdleCallback) {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black flex justify-center items-center">
      <div className="absolute inset-0 z-0">
        <ContourMap flashbackUrls={flashbackUrls}>
          <div className="w-full h-screen flex flex-col justify-center items-center md:items-start md:px-32 pointer-events-none">
            <div className="md:w-[70%] p-4 flex flex-col md:gap-0 gap-2.5 text-white text-center md:text-left pointer-events-auto">
              {eventActive && upcomingEvent && (
                <p className="font-offbit font-bold md:text-2xl text-xs">
                  {upcomingEvent.title}: {date.days}d {date.hours}h {date.minutes}m{" "}
                  {date.seconds}s
                </p>
              )}
              <h1 className="font-offbit-dot font-bold md:text-7xl text-3xl leading-tight">
                MONASH NEXUS FOR <br className="hidden md:inline" /> EMERGING TECHNOLOGIES
              </h1>
              <h2 className="font-offbit font-bold md:text-2xl text-xs">
                Monash University&apos;s student team for emerging simulation
                technologies.
              </h2>
              <div className={`flex items-center justify-center md:justify-start mt-0.5 ${isGlitching ? "glitch-soft" : ""}`}>
                <p className="font-offbit md:text-xl text-xs tracking-wide">
                  {typedText}
                </p>
                <span className="ml-1 w-1.5 h-0.5 bg-white animate-pulse" />
              </div>
              <div className="w-full flex flex-row items-center gap-4 justify-center md:justify-start mt-3">
                <OurWorkButton />
                <a
                  data-ccursor
                  href="https://docs.google.com/forms/d/e/1FAIpQLSej1jyIYU_dy2uJqEs5zUvNY1GUN-6eN2DqxCbb2ucnYrTI7Q/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:cursor-pointer text-xs md:text-[1rem] font-offbit font-bold h-fit px-5 py-2.5 md:px-8 md:py-3 bg-[#040dc1] rounded-md pointer-events-auto transition-all duration-500 [transition-timing-function:cubic-bezier(0,-0.03,0,1)] md:hover:-translate-y-0.5 flex items-center justify-center text-white"
                >
                  JOIN US
                </a>
              </div>
            </div>
          </div>
        </ContourMap>
      </div>
    </section>
  );
};

export default Hero;