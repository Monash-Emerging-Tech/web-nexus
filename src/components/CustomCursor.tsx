"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

// Reimplementation of the legacy site's context-cursor: a small white
// difference-blend dot that trails the pointer and morphs around any element
// tagged with `data-ccursor`, with a subtle parallax pull on both the cursor
// and the element. It trails the native cursor as a companion rather than
// replacing it. On the home hero it also carries a "SCROLL" tag while the
// scene is at the top (flagged by ContourMap/ScrollProgressBridge). Only
// active for fine pointers without reduced motion.
const RADIUS = 20;
const HOVER_PAD = 6;
const PARALLAX_CURSOR = 10;
const PARALLAX_EL = 15;
const SPEED = 0.2;
const HINT_OFFSET_X = 18;
const HINT_OFFSET_Y = 22;
const HINT_FADE_IN = 0.15;
const HINT_FADE_OUT = 0.25;

type Morph = { el: HTMLElement; rect: DOMRect };

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const morphRef = useRef<Morph | null>(null);
  const resetRef = useRef<() => void>(() => {});
  const syncHintRef = useRef<() => void>(() => {});
  const sizeRef = useRef(RADIUS);
  const [active, setActive] = useState(false);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setActive(fine.matches && !reduced.matches);
    update();
    fine.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    const hint = hintRef.current;
    if (!active || !cursor || !hint) return;

    gsap.set(cursor, { x: -100, y: -100, width: RADIUS, height: RADIUS, borderRadius: 100 });
    gsap.set(hint, { x: -100, y: -100, autoAlpha: 0 });
    sizeRef.current = RADIUS;

    const move = (vars: gsap.TweenVars) =>
      gsap.to(cursor, { duration: SPEED, ease: "power3.out", overwrite: "auto", ...vars });

    // SCROLL hint: only on "/", at the top of the hero (the
    // data-hero-at-top attribute ScrollProgressBridge keeps on <html> is the
    // source of truth), once the Loader has lifted, and while the cursor is a
    // plain dot (not morphed, not over the cube / an orb / a moon).
    const html = document.documentElement;
    let cursorState = "";
    let hasPointer = false;
    let hintShown = false;
    const syncHint = () => {
      const show =
        hasPointer &&
        html.dataset.heroAtTop === "true" &&
        !html.classList.contains("mnet-preload") &&
        pathnameRef.current === "/" &&
        !morphRef.current &&
        !cursorState;
      if (show === hintShown) return;
      hintShown = show;
      gsap.to(hint, {
        duration: show ? HINT_FADE_IN : HINT_FADE_OUT,
        autoAlpha: show ? 1 : 0,
        overwrite: "auto",
      });
    };
    syncHintRef.current = syncHint;

    const reset = () => {
      const morph = morphRef.current;
      morphRef.current = null;
      cursor.classList.remove("c-cursor--active");
      sizeRef.current = RADIUS;
      move({ width: RADIUS, height: RADIUS, borderRadius: 100 });
      if (morph?.el.isConnected) {
        gsap.to(morph.el, { duration: SPEED, x: 0, y: 0, overwrite: "auto", clearProps: "transform" });
      }
      syncHint();
    };
    resetRef.current = reset;

    const onMouseMove = (e: MouseEvent) => {
      const hintX = e.clientX + HINT_OFFSET_X;
      const hintY = e.clientY + HINT_OFFSET_Y;
      if (hasPointer) {
        gsap.to(hint, { duration: SPEED * 1.5, ease: "power3.out", x: hintX, y: hintY });
      } else {
        hasPointer = true;
        gsap.set(hint, { x: hintX, y: hintY });
      }
      syncHint();

      const morph = morphRef.current;
      if (morph && morph.el.isConnected) {
        const { rect } = morph;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        move({
          x: rect.left - HOVER_PAD + (e.clientX - cx) / PARALLAX_CURSOR,
          y: rect.top - HOVER_PAD + (e.clientY - cy) / PARALLAX_CURSOR,
        });
        gsap.to(morph.el, {
          duration: SPEED,
          x: (e.clientX - cx) / PARALLAX_EL,
          y: (e.clientY - cy) / PARALLAX_EL,
          overwrite: "auto",
        });
      } else {
        if (morph) reset();
        move({ x: e.clientX - sizeRef.current / 2, y: e.clientY - sizeRef.current / 2 });
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-ccursor]") as HTMLElement | null;
      const current = morphRef.current?.el ?? null;
      if (el === current) return;
      if (current) reset();
      if (!el) return;
      const rect = el.getBoundingClientRect();
      morphRef.current = { el, rect };
      cursor.classList.add("c-cursor--active");
      syncHint();
      const elRadius = parseFloat(getComputedStyle(el).borderRadius) || 0;
      move({
        x: rect.left - HOVER_PAD,
        y: rect.top - HOVER_PAD,
        width: rect.width + HOVER_PAD * 2,
        height: rect.height + HOVER_PAD * 2,
        borderRadius: Math.max(elRadius * 1.5, 4),
      });
    };

    // A morphed element can move out from under the pointer (scroll, menu
    // close) without a mouseout — bail back to the dot on any scroll intent.
    const onWheel = () => {
      if (morphRef.current) reset();
    };

    // Grab feedback for the 3D cube (dispatched from Planet.tsx).
    const onCursorState = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      cursorState = detail === "default" ? "" : detail ?? "";
      syncHint();
      cursor.classList.toggle("c-cursor--grab", detail === "grab");
      cursor.classList.toggle("c-cursor--grabbing", detail === "grabbing");
      cursor.classList.toggle("c-cursor--pointer", detail === "pointer");
      if (!morphRef.current) {
        sizeRef.current =
          detail === "grab"
            ? 34
            : detail === "grabbing"
            ? 26
            : detail === "pointer"
            ? 30
            : RADIUS;
        move({ width: sizeRef.current, height: sizeRef.current });
      }
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("mnet:cursor", onCursorState);

    // Re-check when the hero flag or the Loader's mnet-preload class changes
    // while the pointer is still (e.g. wheel-scrolling without moving).
    const htmlObserver = new MutationObserver(syncHint);
    htmlObserver.observe(html, { attributes: true, attributeFilter: ["data-hero-at-top", "class"] });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mnet:cursor", onCursorState);
      htmlObserver.disconnect();
      reset();
      resetRef.current = () => {};
      syncHintRef.current = () => {};
      gsap.killTweensOf([cursor, hint]);
      gsap.set(hint, { autoAlpha: 0 });
    };
  }, [active]);

  // Route changes can unmount the element mid-morph — snap back to the dot
  // (and re-check the SCROLL hint, which only belongs on "/").
  useEffect(() => {
    pathnameRef.current = pathname;
    resetRef.current();
    syncHintRef.current();
  }, [pathname]);

  const display = active ? undefined : "none";

  return (
    <>
      <div ref={cursorRef} className="c-cursor" style={{ display }} aria-hidden="true" />
      <div
        ref={hintRef}
        className="c-cursor-hint font-offbit"
        style={{ display }}
        aria-hidden="true"
      >
        Scroll
        <svg
          className="c-cursor-hint__chevron"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </div>
    </>
  );
};

export default CustomCursor;
