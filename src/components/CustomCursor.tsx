"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

// Reimplementation of the legacy site's context-cursor: a small white
// difference-blend dot that trails the pointer and morphs around any element
// tagged with `data-ccursor`, with a subtle parallax pull on both the cursor
// and the element. Only active for fine pointers without reduced motion.
const RADIUS = 20;
const HOVER_PAD = 6;
const PARALLAX_CURSOR = 10;
const PARALLAX_EL = 15;
const SPEED = 0.2;

type Morph = { el: HTMLElement; rect: DOMRect };

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const morphRef = useRef<Morph | null>(null);
  const resetRef = useRef<() => void>(() => {});
  const sizeRef = useRef(RADIUS);
  const [active, setActive] = useState(false);
  const pathname = usePathname();

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
    if (!active || !cursor) return;

    const html = document.documentElement;
    html.classList.add("has-custom-cursor");
    gsap.set(cursor, { x: -100, y: -100, width: RADIUS, height: RADIUS, borderRadius: 100 });
    sizeRef.current = RADIUS;

    const move = (vars: gsap.TweenVars) =>
      gsap.to(cursor, { duration: SPEED, ease: "power3.out", overwrite: "auto", ...vars });

    const reset = () => {
      const morph = morphRef.current;
      morphRef.current = null;
      cursor.classList.remove("c-cursor--active");
      sizeRef.current = RADIUS;
      move({ width: RADIUS, height: RADIUS, borderRadius: 100 });
      if (morph?.el.isConnected) {
        gsap.to(morph.el, { duration: SPEED, x: 0, y: 0, overwrite: "auto", clearProps: "transform" });
      }
    };
    resetRef.current = reset;

    const onMouseMove = (e: MouseEvent) => {
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
      cursor.classList.toggle("c-cursor--grab", detail === "grab");
      cursor.classList.toggle("c-cursor--grabbing", detail === "grabbing");
      if (!morphRef.current) {
        sizeRef.current = detail === "grab" ? 34 : detail === "grabbing" ? 26 : RADIUS;
        move({ width: sizeRef.current, height: sizeRef.current });
      }
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("mnet:cursor", onCursorState);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mnet:cursor", onCursorState);
      reset();
      resetRef.current = () => {};
      gsap.killTweensOf(cursor);
      html.classList.remove("has-custom-cursor");
    };
  }, [active]);

  // Route changes can unmount the element mid-morph — snap back to the dot.
  useEffect(() => {
    resetRef.current();
  }, [pathname]);

  return (
    <div
      ref={cursorRef}
      className="c-cursor"
      style={{ display: active ? undefined : "none" }}
      aria-hidden="true"
    />
  );
};

export default CustomCursor;
