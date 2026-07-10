"use client";

/* 0→100 loading screen, ported from the legacy MNET site.
   Loader concept by Faye @ https://faye.lol/

   Shown once per browser session. A pre-hydration script in layout.tsx removes
   the `mnet-preload` class from <html> for repeat visits (and reduced motion),
   which hides this overlay via CSS before it ever paints. Removing the class is
   also what lets the navbar's own transition animate it into view. */

import { useEffect, useRef, useState } from "react";

const COUNT_INTERVAL_MS = 24; // legacy: loadPercent++ every 24ms
const TEXT_INTERVAL_MS = 300; // legacy: DOM text updated every 300ms (chunky steps)
const MIN_DISPLAY_MS = 700; // don't flash a meaningless "0 → 100" on fast cached loads

const SESSION_KEY = "mnet:loader-shown";

const Loader = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const overlayEl = overlayRef.current;
    const html = document.documentElement;
    if (!overlayEl || !numberRef.current || !html.classList.contains("mnet-preload")) {
      setDone(true);
      return;
    }
    const overlay = overlayEl;
    const numberEl = numberRef.current;

    const startedAt = performance.now();
    let count = 0;
    let pageLoaded = document.readyState === "complete";
    let finished = false;
    const timers: number[] = [];

    const countTimer = window.setInterval(() => {
      count = Math.min(count + 1, 100);
      maybeFinish();
    }, COUNT_INTERVAL_MS);

    const textTimer = window.setInterval(() => {
      numberEl.textContent = String(count);
    }, TEXT_INTERVAL_MS);

    const onLoad = () => {
      pageLoaded = true;
      maybeFinish();
    };
    window.addEventListener("load", onLoad);

    function maybeFinish() {
      if (finished) return;
      const elapsed = performance.now() - startedAt;
      if ((pageLoaded || count >= 100) && elapsed >= MIN_DISPLAY_MS) {
        finished = true;
        window.clearInterval(countTimer);
        window.clearInterval(textTimer);
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          // storage unavailable — loader will just show again next load
        }

        numberEl.textContent = "100";
        requestAnimationFrame(() => {
          numberEl.style.transform = "scale(2)";
          numberEl.style.opacity = "0";
          timers.push(
            window.setTimeout(() => {
              html.classList.remove("mnet-preload"); // navbar drops in
              overlay.style.opacity = "0";
              timers.push(window.setTimeout(() => setDone(true), 1000));
            }, 200)
          );
        });
      }
    }

    return () => {
      window.clearInterval(countTimer);
      window.clearInterval(textTimer);
      window.removeEventListener("load", onLoad);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (done) return null;

  return (
    <div
      id="app-loader"
      ref={overlayRef}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black"
      style={{ transition: "opacity 1s" }}
      aria-hidden="true"
    >
      <div
        ref={numberRef}
        className="font-offbit font-bold text-9xl text-white"
        style={{ transition: "all 0.5s cubic-bezier(0, -0.03, 0, 1)" }}
      >
        0
      </div>
    </div>
  );
};

export default Loader;
