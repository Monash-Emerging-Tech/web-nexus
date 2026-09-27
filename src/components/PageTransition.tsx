"use client";

// Section-change transition, "decode & dock". When the section changes (menu
// link, any in-page link, or back/forward), a black overlay covers everything
// under the navbar, the section name decodes in the centre with a converging
// scramble, then glides and shrinks into the navbar's #nav-page-label slot
// (rendered by OldNavbar) while the new page rises in. The name stays there as
// a "you are here" label. Home clears the label, moves within a section keep
// it, first load just scrambles it in, and reduced motion only swaps it. Any
// click, wheel, touch or key during the sequence skips to the end state.
// Wraps the page content so it can hide it and lift it in. Everything is
// driven by GSAP and refs, with no React state per frame.

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { randomChar, scramble } from "@/lib/scramble";
import { getSection, type Section } from "@/lib/sections";

const SCRAMBLE_MS = 800;
const FIRST_LOAD_SCRAMBLE_MS = 400;
const GLIDE = 0.7;
const RISE_Y = 40;
const LABEL_FADE = 0.25;
// Safety net so nobody is stuck behind the cover. It never reveals the old
// page: if the route has landed it reveals the new one (even mid-loading),
// otherwise it falls back to a full page load of the destination.
const READY_TIMEOUT_MS = 8000;
// While waiting on a slow route, one letter flickers now and then so the
// resolved word doesn't look frozen.
const IDLE_FLICKER_MS = 350;
const SKIP_EVENTS = ["pointerdown", "wheel", "touchstart", "keydown"] as const;

type Controller = {
  onPathname: (pathname: string) => void;
};

const PageTransition = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<Controller | null>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    const overlay = overlayRef.current;
    const stage = stageRef.current;
    const word = wordRef.current;
    const live = liveRef.current;
    if (!content || !overlay || !stage || !word || !live) return;

    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const slot = () => document.getElementById("nav-page-label");
    const slotText = () =>
      slot()?.querySelector<HTMLElement>(".nav-page-label__text") ?? null;

    let pathnameNow: string | null = null;
    let current: Section | null = null; // shown in the navbar, or flying there
    let run: {
      finish: () => void;
      cancel: () => void;
      check: () => void;
      retarget: (url: string) => void;
    } | null = null;
    let cancelLabelScramble = () => {};
    let stopPreloadWatch = () => {};

    const announce = (text: string) => {
      live.textContent = text;
    };

    const scrollTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Put a section's name in the navbar label (null fades it out).
    const setLabel = (section: Section | null, { animate = false } = {}) => {
      cancelLabelScramble();
      stopPreloadWatch();
      const el = slot();
      const text = slotText();
      if (!el || !text) return;
      gsap.killTweensOf(el);
      if (!section) {
        gsap.to(el, {
          autoAlpha: 0,
          duration: LABEL_FADE,
          onComplete: () => {
            text.textContent = "";
          },
        });
        return;
      }
      const label = section.label.toUpperCase();
      text.textContent = label;
      gsap.set(el, { autoAlpha: 1 });
      if (!animate || reduced.matches) return;
      const go = () => {
        cancelLabelScramble = scramble({
          to: label,
          mode: "converge",
          duration: FIRST_LOAD_SCRAMBLE_MS,
          onUpdate: (t) => (text.textContent = t),
        });
      };
      // On a fresh session the Loader is still up; scramble once it lifts.
      if (html.classList.contains("mnet-preload")) {
        const observer = new MutationObserver(() => {
          if (html.classList.contains("mnet-preload")) return;
          stopPreloadWatch();
          go();
        });
        observer.observe(html, { attributes: true, attributeFilter: ["class"] });
        stopPreloadWatch = () => {
          observer.disconnect();
          stopPreloadWatch = () => {};
        };
      } else {
        go();
      }
    };

    // Split the big word into one fixed-width cell per letter, sized to the
    // real glyph, so OffBit's proportional random chars flicker in place
    // instead of shoving the word sideways.
    const buildCells = (label: string) => {
      word.textContent = "";
      const cells = label.split("").map((char) => {
        const cell = document.createElement("span");
        cell.textContent = char;
        cell.style.display = "inline-block";
        cell.style.textAlign = "center";
        cell.style.whiteSpace = "pre";
        word.appendChild(cell);
        return cell;
      });
      const widths = cells.map((cell) => cell.getBoundingClientRect().width);
      cells.forEach((cell, i) => (cell.style.width = `${widths[i]}px`));
      return cells;
    };

    // Full sequence: cover, decode, then (once the new page has mounted)
    // dock. `url` is set when a click starts it before the router has
    // navigated; otherwise (back/forward) the new route is already rendered.
    const play = (section: Section, url?: string) => {
      run?.cancel();
      cancelLabelScramble();
      stopPreloadWatch();
      current = section;
      announce(`${section.label} page`);

      const label = section.label.toUpperCase();
      const el = slot();
      const text = slotText();
      gsap.killTweensOf([overlay, stage, word, content]);
      if (el) {
        gsap.killTweensOf(el);
        gsap.set(el, { autoAlpha: 0 });
      }
      if (text) text.textContent = label;
      gsap.set(overlay, { autoAlpha: 1 });
      gsap.set(content, { clearProps: "transform" });
      gsap.set(content, { opacity: 0 });
      gsap.set(word, { x: 0, y: 0, scale: 1 });
      gsap.set(stage, { autoAlpha: 1 });
      const cells = buildCells(label);
      // The page that was rendered when the click happened. The cover must
      // not lift while it is still in the content.
      const oldPage = url ? content.firstElementChild : null;
      let targetUrl = url ?? null;

      let resolved = false;
      let ready = false;
      let skipped = false;
      let done = false;
      let timeline: gsap.core.Timeline | null = null;

      const cancelScramble = scramble({
        to: label,
        mode: "converge",
        duration: SCRAMBLE_MS,
        onUpdate: (t) => cells.forEach((cell, i) => (cell.textContent = t[i] ?? "")),
        onComplete: () => {
          resolved = true;
          maybeGlide();
          if (!ready && !done) startIdle();
        },
      });

      let idleTimer = 0;
      const startIdle = () => {
        idleTimer = window.setInterval(() => {
          const i = Math.floor(Math.random() * label.length);
          if (label[i] === " ") return;
          cells[i].textContent = randomChar();
          window.setTimeout(() => (cells[i].textContent = label[i]), 60);
        }, IDLE_FLICKER_MS);
      };
      const stopIdle = () => {
        window.clearInterval(idleTimer);
        cells.forEach((cell, i) => (cell.textContent = label[i]));
      };

      // The router has committed the section and the pre-click page is gone.
      const landed = () =>
        getSection(pathnameNow)?.href === section.href &&
        (!oldPage || !content.contains(oldPage));

      // Ready once the new route is rendered and no loading.tsx skeleton
      // (marked data-route-loading) is left in the content.
      const check = () => {
        if (ready || done || !landed()) return;
        if (content.querySelector("[data-route-loading]")) return;
        ready = true;
        maybeGlide();
      };
      const observer = new MutationObserver(check);
      observer.observe(content, { childList: true, subtree: true });
      const readyTimer = window.setTimeout(() => {
        if (done) return;
        if (landed() || !targetUrl) {
          ready = true;
          maybeGlide();
        } else {
          // Still on the old page: keep the cover and let the browser load
          // the destination directly rather than ever revealing it.
          window.location.assign(targetUrl);
        }
      }, READY_TIMEOUT_MS);

      const maybeGlide = () => {
        if (!resolved || !ready || timeline || done) return;
        stopIdle();
        if (skipped) return finish();
        scrollTop();
        if (!slotText()) return finish();
        // Re-measured every frame (one read pass, then one write), so the
        // landing spot follows a resize or the navbar's 1s .scrolled
        // transition mid-flight. The word starts centred in the full-screen
        // stage, i.e. on the viewport centre, like the docked label.
        const flight = { p: 0 };
        const follow = () => {
          const target = slotText();
          if (!target) return;
          const to = target.getBoundingClientRect();
          const from = stage.getBoundingClientRect();
          // Width ratio rather than font-size ratio: OffBit's glyph advances
          // don't scale perfectly linearly, and matching widths makes the
          // handover to the docked text seamless.
          const scale = to.width / word.offsetWidth;
          const { p } = flight;
          gsap.set(word, {
            x: (to.left + to.width / 2 - (from.left + from.width / 2)) * p,
            y: (to.top + to.height / 2 - (from.top + from.height / 2)) * p,
            scale: 1 + (scale - 1) * p,
          });
        };
        timeline = gsap.timeline({ onComplete: finish });
        timeline
          .to(flight, { p: 1, duration: GLIDE, ease: "power3.inOut", onUpdate: follow }, 0)
          .to(overlay, { autoAlpha: 0, duration: GLIDE, ease: "power2.inOut" }, 0)
          .fromTo(
            content,
            { y: RISE_Y, opacity: 0 },
            { y: 0, opacity: 1, duration: GLIDE, ease: "power3.out" },
            0,
          );
      };

      const teardown = () => {
        done = true;
        cancelScramble();
        window.clearInterval(idleTimer);
        observer.disconnect();
        window.clearTimeout(readyTimer);
        SKIP_EVENTS.forEach((type) => window.removeEventListener(type, skip, true));
        timeline?.kill();
        run = null;
      };

      // Jump to the end state: label docked, overlay gone, page in place with
      // no leftover transform (so fixed/sticky children behave).
      function finish() {
        if (done) return;
        teardown();
        gsap.set([overlay, stage], { autoAlpha: 0 });
        gsap.set(content, { clearProps: "opacity,transform" });
        const dock = slot();
        const dockText = slotText();
        if (dockText) dockText.textContent = label;
        if (dock) gsap.set(dock, { autoAlpha: 1 });
      }

      // Skipping before the new page has landed only fast-forwards the
      // decode; the cover stays until it is ready so the old page is never
      // revealed (or clicked, which would cancel the pending navigation).
      function skip() {
        if (done) return;
        if (ready) return finish();
        skipped = true;
        cancelScramble();
        if (!resolved) {
          resolved = true;
          cells.forEach((cell, i) => (cell.textContent = label[i]));
          startIdle();
        }
      }

      SKIP_EVENTS.forEach((type) =>
        window.addEventListener(type, skip, { capture: true, passive: true }),
      );
      run = {
        finish,
        cancel: teardown,
        check,
        retarget: (next) => {
          targetUrl = next;
        },
      };
      check();
    };

    const onPathname = (next: string) => {
      const first = pathnameNow === null;
      pathnameNow = next;
      const section = getSection(next);

      if (first) {
        current = section;
        setLabel(section, { animate: true });
        return;
      }

      if (section?.href === current?.href) {
        // Same section, or the route a link click already started playing.
        if (run) {
          scrollTop();
          run.check();
        }
        return;
      }

      run?.finish();
      if (!section) {
        current = null;
        setLabel(null);
        announce("Home page");
        return;
      }
      scrollTop();
      if (reduced.matches) {
        current = section;
        setLabel(section);
        announce(`${section.label} page`);
        return;
      }
      play(section);
    };

    // Cover on click too, before Next swaps the route, so neither the old
    // page lingering nor the new one flashing is ever seen.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      const section = getSection(url.pathname);
      if (!section || section.href === current?.href || reduced.matches) {
        // A different link clicked mid-sequence (e.g. the logo) supersedes
        // the pending destination for the safety fallback.
        run?.retarget(url.href);
        return;
      }
      play(section, url.href);
    };
    document.addEventListener("click", onClick, true);

    controllerRef.current = { onPathname };

    return () => {
      document.removeEventListener("click", onClick, true);
      run?.finish();
      cancelLabelScramble();
      stopPreloadWatch();
      gsap.killTweensOf([overlay, stage, word, content]);
      controllerRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    controllerRef.current?.onPathname(pathname);
  }, [pathname]);

  // Clear the announcement after it has been read so it can't be re-read out
  // of context when the region is reached by virtual cursor.
  useEffect(() => {
    const live = liveRef.current;
    if (!live?.textContent) return;
    const id = window.setTimeout(() => (live.textContent = ""), 3000);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <>
      <div ref={contentRef}>{children}</div>

      <div
        ref={overlayRef}
        className="invisible fixed inset-0 z-[45] bg-black opacity-0"
        aria-hidden="true"
      />
      <div
        ref={stageRef}
        className="pointer-events-none invisible fixed inset-0 z-[60] flex items-center justify-center opacity-0"
        aria-hidden="true"
      >
        <div
          ref={wordRef}
          className="font-offbit-101 whitespace-pre text-[clamp(2rem,11vw,3rem)] leading-none tracking-wide text-white uppercase md:text-7xl"
        />
      </div>
      <div ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />
    </>
  );
};

export default PageTransition;
