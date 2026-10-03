"use client";

// Desktop "menu preview" on the home hero: the MENU dropdown's options, already
// open, in a see-through panel beside the headline, so first-time visitors see
// the four sections without clicking or scrolling. It teaches where they live
// with a staged "deploy" out of the MENU button: a cursor-style dot pops out of
// the button, travels to the panel's top edge, stretches into a line and opens
// downward into the panel, then the rows stagger in. Scrolling plays it in
// reverse (faster) and the button bounces as the dot lands back in it.
//
// Shown only on "/", at the top of the hero (html[data-hero-at-top], kept by
// ContourMap/ScrollProgressBridge), once the Loader has lifted, while the MENU
// dropdown is closed, and at widths where it clears the headline (see
// .menu-preview in globals.css, which mirrors DESKTOP_QUERY). Opening MENU,
// clicking a row or leaving "/" skips the sequence with a quick fade. Driven
// by one GSAP timeline and refs, with no React state per frame. Below the
// breakpoint Hero.tsx shows a compact version under the hero buttons instead.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { homeContent } from "@/content/home";
import { SECTIONS } from "@/lib/sections";

// Keep in sync with the .menu-preview media query in globals.css. 1280 is the
// narrowest width where the hero text column (70% of the viewport minus its
// 128px gutters) ends left of the panel with room to spare; the height floor
// keeps it clear of the social icons on short laptop windows.
const DESKTOP_QUERY = "(min-width: 1280px) and (min-height: 600px)";

// Deploy sequence (seconds). Closing plays the same timeline in reverse,
// CLOSE_SPEED times faster (~1.2s open, ~0.7s close).
const POP = 0.1; // dot scales 0 -> 1 on the MENU button (power2.out)
const TRAVEL = 0.32; // dot glides to the panel's top edge (x power3.inOut, y power2.inOut: slight arc)
const LINE = 0.2; // dot stretches into a line the panel's width (power2.out)
const OPEN = 0.35; // line opens down into the panel, crossfading to glass
const OPEN_EASE = "back.out(1.4)";
const CONTENT_AT = 0.18; // rows start this far into OPEN
const ITEM = 0.2; // each row's fade/slide in (power2.out)
const STAGGER = 0.04;
const CLOSE_SPEED = 1.7;
const DOT = 20; // matches .c-cursor
const LINE_H = 2;
const RADIUS = 20;

const QUICK_HIDE = 0.18;
const FADE = 0.3;
// Leave room for the fixed social icons + copyright at the bottom of "/".
const BOTTOM_CLEARANCE = 96;
// Let the navbar finish dropping in (1s CSS transition) before deploying.
const AFTER_LOADER_DELAY = 0.7;
const FIRST_SHOW_DELAY = 0.35;
const AFTER_MENU_CLOSE_DELAY = 0.25;

const MenuPreview = ({ menuOpen }: { menuOpen: boolean }) => {
  const pathname = usePathname();
  const router = useRouter();
  const panelRef = useRef<HTMLElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pathnameRef = useRef(pathname);
  const menuOpenRef = useRef(menuOpen);
  const leavingRef = useRef(false);
  const syncRef = useRef<(delay?: number) => void>(() => {});

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const glass = glassRef.current;
    const content = contentRef.current;
    const dot = dotRef.current;
    if (!panel || !glass || !content || !dot) return;
    const items = Array.from(content.querySelectorAll<HTMLElement>("[data-preview-item]"));

    const html = document.documentElement;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const menuButton = () => document.getElementById("menuButton");

    let shown = false;
    let wasPreloading = html.classList.contains("mnet-preload");
    let firstShow = true;
    let headlineTop: number | null = null;
    let tl: gsap.core.Timeline | null = null;
    let fade: gsap.core.Tween | null = null;
    let pending: gsap.core.Tween | null = null;

    const atTop = () => html.dataset.heroAtTop === "true";

    // Links are only reachable once the panel is fully open.
    const setHidden = (hidden: boolean) => {
      panel.inert = hidden;
      if (hidden) panel.setAttribute("aria-hidden", "true");
      else panel.removeAttribute("aria-hidden");
    };

    // Place the panel: right edge on the MENU button's right edge (the
    // navbar's inner right edge), top level with the hero headline. Only
    // layout reads/writes, never per frame.
    const layout = () => {
      const button = menuButton();
      if (!button) return;
      const b = button.getBoundingClientRect();
      panel.style.right = `${Math.max(16, window.innerWidth - b.right)}px`;
      // The headline lives in drei's scrolled layer, so only trust it at the top.
      const headline = document.getElementById("hero-headline");
      if (headline && atTop()) headlineTop = headline.getBoundingClientRect().top;
      const height = panel.offsetHeight;
      // Stay below the navbar and, when it's showing, the event banner docked
      // under it (EventBanner), whichever ends lower.
      const banner = document.querySelector(".nav-event-banner")?.getBoundingClientRect();
      const min = Math.max(b.bottom + 24, banner && banner.height > 0 ? banner.bottom + 16 : 0);
      const max = window.innerHeight - BOTTOM_CLEARANCE - height;
      const preferred = headlineTop ?? (window.innerHeight - height) / 2;
      panel.style.top = `${Math.round(Math.max(min, Math.min(preferred, max)))}px`;
    };

    // The MENU button's centre and the panel's final rect, in viewport px.
    const measure = () => {
      layout();
      const p = panel.getBoundingClientRect();
      const b = menuButton()?.getBoundingClientRect();
      return {
        bx: b ? b.left + b.width / 2 : p.right - 40,
        by: b ? b.top + b.height / 2 : p.top - 60,
        left: p.left,
        top: p.top,
        cx: p.left + p.width / 2,
        w: panel.offsetWidth,
        h: panel.offsetHeight,
      };
    };

    const pulseButton = () => {
      const button = menuButton();
      if (!button || reduced.matches || typeof button.animate !== "function") return;
      // Web Animations, so the button's own CSS transitions and the
      // cursor's GSAP parallax never see a changed inline style.
      button.animate(
        [
          { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(77, 96, 255, 0)" },
          { transform: "scale(1.12)", boxShadow: "0 0 0 4px rgba(77, 96, 255, 0.6)", offset: 0.35 },
          { transform: "scale(0.97)", boxShadow: "0 0 0 7px rgba(77, 96, 255, 0.25)", offset: 0.7 },
          { transform: "scale(1)", boxShadow: "0 0 0 10px rgba(77, 96, 255, 0)" },
        ],
        { duration: 550, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
      );
    };

    // One timeline, every step a fromTo with explicit values, so it can be
    // rebuilt from fresh measurements and seeked to any point (resize,
    // navbar change, mid-flight reversal) without jumping. The dot is the
    // morphing object (dot -> line -> container); during OPEN the glass
    // layer shares its exact geometry and the two crossfade.
    const build = (g: ReturnType<typeof measure>) => {
      const travelAt = POP;
      const lineAt = travelAt + TRAVEL;
      const openAt = lineAt + LINE;
      const start = { x: g.bx - DOT / 2, y: g.by - DOT / 2 };
      // Dot centred on the line's centre (top edge, horizontally centred).
      const arrive = { x: g.cx - DOT / 2, y: g.top + LINE_H / 2 - DOT / 2 };
      const round = { width: DOT, height: DOT, borderRadius: DOT / 2 };

      const timeline = gsap.timeline({
        paused: true,
        defaults: { immediateRender: false },
        onComplete: () => setHidden(false),
        onReverseComplete: () => {
          gsap.set([panel, dot], { visibility: "hidden" });
        },
      });
      timeline
        .fromTo(dot, { ...start, ...round, scale: 0, opacity: 1 }, { scale: 1, duration: POP, ease: "power2.out" }, 0)
        .fromTo(dot, { x: start.x }, { x: arrive.x, duration: TRAVEL, ease: "power3.inOut" }, travelAt)
        .fromTo(dot, { y: start.y }, { y: arrive.y, duration: TRAVEL, ease: "power2.inOut" }, travelAt)
        .fromTo(
          dot,
          { ...arrive, ...round },
          { x: g.left, y: g.top, width: g.w, height: LINE_H, borderRadius: LINE_H / 2, duration: LINE, ease: "power2.out" },
          lineAt,
        )
        .fromTo(
          [dot, glass],
          { height: LINE_H, borderRadius: LINE_H / 2 },
          { height: g.h, borderRadius: RADIUS, duration: OPEN, ease: OPEN_EASE },
          openAt,
        )
        .fromTo(dot, { opacity: 1 }, { opacity: 0, duration: OPEN, ease: "power1.inOut" }, openAt)
        .fromTo(glass, { opacity: 0 }, { opacity: 1, duration: OPEN, ease: "power1.inOut" }, openAt)
        .fromTo(
          items,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: ITEM, stagger: STAGGER, ease: "power2.out" },
          openAt + CONTENT_AT,
        )
        // Closing: bounce MENU as the dot shrinks back into it.
        .call(
          () => {
            if (timeline.reversed()) pulseButton();
          },
          [],
          POP / 2,
        );
      return timeline;
    };

    // (Re)build from fresh measurements, keeping the current time, direction
    // and speed, so the dot always starts/ends on the button.
    const rebuild = () => {
      const time = tl?.time() ?? 0;
      const active = tl?.isActive() ?? false;
      const reversed = tl?.reversed() ?? false;
      const speed = tl?.timeScale() ?? 1;
      tl?.kill();
      const next = build(measure());
      next.progress(1, true).time(time, true);
      if (active) {
        next.timeScale(speed);
        if (reversed) next.reverse();
        else next.play();
      }
      tl = next;
      return next;
    };

    // Fully closed, nothing running.
    const reset = () => {
      fade?.kill();
      fade = null;
      tl?.kill();
      tl = null;
      gsap.set(dot, { scale: 0, opacity: 1, visibility: "hidden" });
      gsap.set([glass, ...items], { opacity: 0 });
      gsap.set(content, { opacity: 1 });
      gsap.set(panel, { visibility: "hidden" });
    };

    const cancelPending = () => {
      pending?.kill();
      pending = null;
    };

    const open = () => {
      pending = null;
      fade?.kill();
      fade = null;
      gsap.set(content, { opacity: 1 });
      const timeline = rebuild();
      gsap.set([panel, dot], { visibility: "visible" });
      if (reduced.matches) {
        timeline.progress(1, true);
        fade = gsap.fromTo(
          [glass, content],
          { opacity: 0 },
          { opacity: 1, duration: FADE, onComplete: () => setHidden(false) },
        );
        return;
      }
      if (timeline.progress() === 1) setHidden(false);
      else timeline.timeScale(1).play();
    };

    // Measured when the sequence actually starts, since the MENU button may
    // still be moving (navbar dropping in after the Loader) during the delay.
    const show = (delay: number) => {
      shown = true;
      cancelPending();
      pending = gsap.delayedCall(delay, open);
    };

    // Fade everything out, then park fully closed (no sequence).
    const fadeOut = (duration: number) => {
      tl?.pause();
      fade?.kill();
      fade = gsap.to([content, glass, dot], {
        opacity: 0,
        duration,
        ease: "power2.in",
        onComplete: reset,
      });
    };

    // Scrolled away: play the deploy in reverse back into MENU.
    const close = () => {
      shown = false;
      setHidden(true);
      cancelPending();
      if (!tl) return reset();
      if (fade || reduced.matches) return fadeOut(fade ? QUICK_HIDE : FADE);
      if (tl.time() === 0 && !tl.isActive()) return reset();
      rebuild().timeScale(CLOSE_SPEED).reverse();
    };

    // Menu opened, link clicked, left "/", too narrow: just get out of the way.
    const hideQuick = () => {
      shown = false;
      setHidden(true);
      cancelPending();
      if (!tl) return reset();
      fadeOut(QUICK_HIDE);
    };

    const sync = (delay = 0) => {
      const preloading = html.classList.contains("mnet-preload");
      const blocked =
        pathnameRef.current !== "/" ||
        leavingRef.current ||
        menuOpenRef.current ||
        preloading ||
        !desktop.matches;
      const want = !blocked && atTop();

      if (want && !shown) {
        let wait = delay;
        if (wasPreloading) wait = Math.max(wait, AFTER_LOADER_DELAY);
        else if (firstShow) wait = Math.max(wait, FIRST_SHOW_DELAY);
        firstShow = false;
        wasPreloading = false;
        show(wait);
      } else if (!want && shown) {
        if (blocked) hideQuick();
        else close();
      }
    };
    syncRef.current = sync;

    reset();
    setHidden(true);
    sync();

    const htmlObserver = new MutationObserver(() => sync());
    htmlObserver.observe(html, { attributes: true, attributeFilter: ["data-hero-at-top", "class"] });

    // Re-measure on resize and when the navbar toggles .scrolled (its 1s
    // transition moves the MENU button, so measure again once it settles).
    let settleTimer = 0;
    const relayout = () => {
      if (tl && !fade) rebuild();
      else layout();
    };
    const onNavbarChange = () => {
      relayout();
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(relayout, 1000);
    };
    const navbar = document.getElementById("mainNavbar");
    const navObserver = new MutationObserver(onNavbarChange);
    if (navbar) navObserver.observe(navbar, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", relayout, { passive: true });
    const onDesktopChange = () => sync();
    desktop.addEventListener("change", onDesktopChange);

    return () => {
      htmlObserver.disconnect();
      navObserver.disconnect();
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", relayout);
      desktop.removeEventListener("change", onDesktopChange);
      cancelPending();
      fade?.kill();
      tl?.kill();
      syncRef.current = () => {};
    };
  }, []);

  useEffect(() => {
    const closed = menuOpenRef.current && !menuOpen;
    menuOpenRef.current = menuOpen;
    syncRef.current(closed ? AFTER_MENU_CLOSE_DELAY : 0);
  }, [menuOpen]);

  useEffect(() => {
    pathnameRef.current = pathname;
    leavingRef.current = false;
    syncRef.current();
    if (pathname === "/") SECTIONS.forEach((section) => router.prefetch(section.href));
  }, [pathname, router]);

  const handleLinkClick = () => {
    leavingRef.current = true;
    syncRef.current();
  };

  return (
    <>
      <nav ref={panelRef} aria-label="Sections" className="menu-preview" inert aria-hidden="true">
        <div ref={glassRef} className="menu-preview__glass" aria-hidden="true" />

        <div ref={contentRef} className="menu-preview__content">
          <ul className="flex flex-col gap-1">
            {SECTIONS.map((section) => (
              <li key={section.href} data-preview-item>
                <Link
                  href={section.href}
                  data-ccursor
                  onClick={handleLinkClick}
                  className="group flex flex-col gap-0.5 rounded-xl px-3 py-2.5 transition-[translate,background-color] duration-200 ease-out hover:-translate-x-1.5 hover:bg-white/10 focus-visible:-translate-x-1.5 focus-visible:bg-white/10"
                >
                  <span className="font-offbit text-[18px] leading-tight font-bold tracking-wide text-white uppercase transition-colors duration-200 group-hover:text-[#DC003B] group-focus-visible:text-[#DC003B]">
                    {section.label}
                  </span>
                  {section.blurb && (
                    <span className="font-offbit text-[13px] leading-snug text-white/65">{section.blurb}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div data-preview-item className="my-3 h-px w-full bg-white/25" aria-hidden="true" />

          {/* Wrapped so the stagger's transform never meets the cursor's
              parallax transform on the link itself. */}
          <div data-preview-item>
            <a
              href={homeContent.nav.contactHref}
              data-ccursor
              className="group font-offbit flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-bold text-white transition-[translate,background-color] duration-200 ease-out hover:-translate-x-1.5 hover:bg-white/10 focus-visible:-translate-x-1.5 focus-visible:bg-white/10"
            >
              <span className="transition-colors duration-200 group-hover:text-[#DC003B] group-focus-visible:text-[#DC003B]">
                Contact Us
              </span>
              <svg
                className="h-5 w-5 shrink-0 transition-colors duration-200 group-hover:text-[#DC003B]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M22 4H2v16h20V4zM4 18V6h16v12H4zM8 8H6v2h2v2h2v2h4v-2h2v-2h2V8h-2v2h-2v2h-4v-2H8V8z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>
      </nav>

      {/* The deploy dot. A sibling of the panel, not a child: the panel's
          stacking context would isolate its difference blend from the page. */}
      <div ref={dotRef} className="menu-preview-dot" aria-hidden="true" />
    </>
  );
};

export default MenuPreview;
