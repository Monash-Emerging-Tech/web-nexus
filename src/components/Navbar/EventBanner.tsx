"use client";

import { useEffect, useState } from "react";

// Countdown banner docked under the navbar for the next headline event.
// 28/09/2026 falls before Victoria's DST switch (4 Oct), so Melbourne is AEST.
const EVENT = {
  title: "Tech Futures Expo",
  dateLabel: "28.09.26 · 6PM AEST",
  start: new Date("2026-09-28T18:00:00+10:00").getTime(),
  // Banner shows "LIVE NOW" from the start time and disappears after this.
  hideAfter: new Date("2026-09-29T00:00:00+10:00").getTime(),
  livestreamHref: "https://www.youtube.com/watch?v=FrKRFaJreHY",
  ticketsHref: "https://events.humanitix.com/tech-futures-expo-26",
};

const pad = (n: number) => n.toString().padStart(2, "0");

const getRemaining = (now: number) => {
  const ms = Math.max(EVENT.start - now, 0);
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
  };
};

const buttonClass =
  "font-offbit-101 flex h-8 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#030CAB] px-3 text-xs md:flex-none md:text-sm tracking-wide text-white transition-all duration-500 [transition-timing-function:cubic-bezier(0,-0.03,0,1)] md:hover:-translate-y-0.5";

export function EventBanner({ scrolled }: { scrolled: boolean }) {
  // null until mounted, so server and client render the same markup.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now !== null && now >= EVENT.hideAfter) return null;

  const isLive = now !== null && now >= EVENT.start;
  const remaining = getRemaining(now ?? 0);
  const cells: [string, number][] = [
    ["D", remaining.days],
    ["H", remaining.hours],
    ["M", remaining.minutes],
    ["S", remaining.seconds],
  ];

  return (
    <aside
      className={`nav-event-banner ${scrolled ? "scrolled" : ""}`}
      aria-label={`${EVENT.title} countdown`}
    >
      <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start md:gap-6">
        <div className="flex min-w-0 flex-col">
          <p className="font-offbit flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white md:text-lg">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#DC003B]" aria-hidden="true" />
            {EVENT.title}
          </p>
          <p className="font-offbit-101 pl-3.5 text-[10px] uppercase tracking-wide text-white/60 md:text-xs">
            {EVENT.dateLabel}
          </p>
        </div>

        {isLive ? (
          <p className="font-offbit text-sm font-bold uppercase tracking-widest text-[#DC003B] md:text-lg">
            Live now
          </p>
        ) : (
          <p
            className="font-offbit flex items-baseline gap-2 font-bold tabular-nums text-white md:gap-3"
            role="timer"
            aria-live="off"
          >
            {cells.map(([unit, value]) => (
              <span key={unit} className="flex items-baseline">
                <span className="text-base md:text-2xl">{now === null ? "--" : pad(value)}</span>
                <span className="font-offbit-101 ml-0.5 text-[10px] text-white/60 md:text-xs">{unit}</span>
              </span>
            ))}
          </p>
        )}
      </div>

      <div className="flex w-full gap-2 md:w-auto md:gap-3">
        <a
          data-ccursor
          href={EVENT.livestreamHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M3 1.5v9l7.5-4.5z" />
          </svg>
          <span>{isLive ? "WATCH LIVE" : "WATCH LIVESTREAM"}</span>
        </a>
        <a
          data-ccursor
          href={EVENT.ticketsHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          <span>GET TICKETS NOW</span>
        </a>
      </div>
    </aside>
  );
}
