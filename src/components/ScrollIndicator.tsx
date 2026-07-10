"use client";

/* Scroll-progress pill, ported from the legacy site: native scrollbars are
   hidden globally (globals.css) and this fixed pill on the right fills with
   brand red as the page scrolls.

   The fill height is pure CSS via the --scroll-progress custom property on
   <html> (0-1), so this component never re-renders. Normal pages feed the
   property from window scroll here; the home page scrolls inside drei's
   ScrollControls, where ScrollProgressBridge feeds it instead. */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const setProgress = (value: number) => {
  document.documentElement.style.setProperty(
    "--scroll-progress",
    String(Math.min(1, Math.max(0, value)))
  );
};

const ScrollIndicator = () => {
  const pathname = usePathname();

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // The home page's window never scrolls (max ~0) — leave the property to
      // ScrollProgressBridge there instead of stomping it with 0.
      if (max > 1) {
        setProgress(window.scrollY / max);
      } else if (pathname !== "/") {
        setProgress(0);
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return (
    <div
      className="fixed right-4 top-1/2 z-50 flex h-16 w-2 -translate-y-1/2 place-content-center rounded-full border border-black bg-white p-[1px] drop-shadow-2xl mix-blend-exclusion pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="m-auto mt-0 w-1 rounded-full bg-[#DC003B] mix-blend-normal"
        style={{ height: "calc(var(--scroll-progress, 0) * 100%)" }}
      />
    </div>
  );
};

export default ScrollIndicator;
