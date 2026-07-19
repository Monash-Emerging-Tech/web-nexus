"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { homeContent } from "../../content/home";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuLabel, setMenuLabel] = useState("MENU");
  const [scrolled, setScrolled] = useState(false);
  const animationTimeoutsRef = useRef<number[]>([]);

  const clearTextAnimation = () => {
    animationTimeoutsRef.current.forEach((timeoutId) =>
      window.clearTimeout(timeoutId),
    );
    animationTimeoutsRef.current = [];
  };

  const queueTextAnimation = (
    callback: () => void,
    delayMs: number,
  ) => {
    const timeoutId = window.setTimeout(callback, delayMs);
    animationTimeoutsRef.current.push(timeoutId);
  };

  const animateMenuText = (oldText: string, newText: string) => {
    clearTextAnimation();

    const maxLength = Math.max(oldText.length, newText.length);
    let transitionText = oldText.padEnd(maxLength, " ");
    setMenuLabel(transitionText);

    const changeLetter = (index: number) => {
      if (index >= maxLength) {
        setMenuLabel(newText);
        return;
      }

      const targetChar = newText.charAt(index) || " ";
      const cycles = 3;

      const animateCycle = (currentCycle: number) => {
        if (currentCycle >= cycles) {
          transitionText = `${transitionText.slice(
            0,
            index,
          )}${targetChar}${transitionText.slice(index + 1)}`;

          setMenuLabel(transitionText);
          changeLetter(index + 1);
          return;
        }

        const randomChar = String.fromCharCode(
          Math.floor(Math.random() * (126 - 33 + 1)) + 33,
        );

        transitionText = `${transitionText.slice(
          0,
          index,
        )}${randomChar}${transitionText.slice(index + 1)}`;

        setMenuLabel(transitionText);

        queueTextAnimation(
          () => animateCycle(currentCycle + 1),
          50,
        );
      };

      animateCycle(0);
    };

    changeLetter(0);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 7);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      clearTextAnimation();
    };
  }, []);

  const handleMenuToggle = () => {
    const isMenuVisible = menuOpen;

    animateMenuText(
      isMenuVisible ? "CLOSE" : "MENU",
      isMenuVisible ? "MENU" : "CLOSE",
    );

    setMenuOpen((state) => !state);
  };

  const handleOverlayClose = () => {
    if (!menuOpen) {
      return;
    }

    animateMenuText("CLOSE", "MENU");
    setMenuOpen(false);
  };

  return (
    <>
      <div
        id="overlay"
        className={`fixed inset-0 z-40 transition-all duration-500 [transition-timing-function:cubic-bezier(0,-0.03,0,1)] ${
          menuOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{
          pointerEvents: menuOpen ? "auto" : "none",
          background: "rgba(0, 0, 0, 0.3)",
        }}
        onClick={handleOverlayClose}
        aria-hidden="true"
      />

      <nav
        id="mainNavbar"
        className={`navbar ${scrolled ? "scrolled" : ""}`}
        aria-label="Primary"
      >
        <div className="nav-logo-glow my-auto ml-0 flex h-8 flex-row items-center md:h-auto">
          <Image
            src="/img/logo.png"
            alt="MNET logo"
            width={163}
            height={168}
            priority
            className="m-auto mr-4 h-8 w-auto shrink-0 object-contain md:h-12"
          />

          <Link
            href="/"
            data-ccursor
            id="left"
            className="rounded-sm p-0.5"
          >
            <h1 className="font-offbit m-auto translate-y-0.5 text-left text-lg font-bold tracking-widest text-white md:mb-4 md:text-3xl">
              MNET
            </h1>

            <h2 className="font-offbit-dot m-auto -mt-4 hidden text-left tracking-wide text-white uppercase md:block">
              Monash Nexus for Emerging Technologies
            </h2>
          </Link>
        </div>

        <div className="m-auto mr-0 flex place-content-center gap-x-4">
          <a
            data-ccursor
            href={homeContent.nav.contactHref}
            className="font-offbit-101 my-auto hidden flex-row items-center place-content-center rounded-md bg-[#DC003B] p-2 px-3 text-sm tracking-wide text-white transition-all duration-500 [transition-timing-function:cubic-bezier(0,-0.03,0,1)] md:hover:-translate-y-0.5 lg:flex"
          >
            <span>CONTACT US</span>
          </a>

          <a
            data-ccursor
            href={homeContent.nav.joinHref}
            target="_blank"
            rel="noreferrer"
            className="font-offbit-regular my-auto hidden h-8 flex-row items-center place-content-center rounded-md border border-gray-500 bg-black p-2 px-3 text-sm tracking-wide text-white transition-all duration-500 [transition-timing-function:cubic-bezier(0,-0.03,0,1)] md:hover:-translate-y-0.5"
          >
            <span className="hidden md:block">JOIN US</span>
            <span className="block md:hidden">JOIN</span>
          </a>

          <button
            id="menuButton"
            type="button"
            data-ccursor
            onClick={handleMenuToggle}
            aria-expanded={menuOpen}
            aria-controls="mobileMenu"
            className="font-offbit-101 flex h-8 w-20 items-center place-content-center rounded-md bg-[#040dc1] p-2 px-3 text-sm text-white transition-all duration-500 [transition-timing-function:cubic-bezier(0,-0.03,0,1)] md:hover:-translate-y-0.5"
          >
            <span className="whitespace-pre">{menuLabel}</span>

            <span className="flex">
              <svg
                width="15"
                height="15"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className="m-auto -translate-y-0.5"
                  cx="10"
                  cy="10"
                  r="2"
                  fill="white"
                />
              </svg>
            </span>
          </button>
        </div>
      </nav>

      <div
        id="mobileMenu"
        className={`fixed z-50 flex w-screen flex-col gap-4 px-[24px] left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:w-auto md:translate-x-0 transition-all duration-500 [transition-timing-function:cubic-bezier(0,-0.03,0,1)] ${
          scrolled
            ? "top-[68px] md:top-[96px]"
            : "top-[88px] md:top-[128px]"
        } ${
          menuOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <div
          id="mobileMenuDiv"
          className="mobile-menu-panel flex flex-col items-stretch text-2xl uppercase shadow-2xl drop-shadow-2xl md:w-56"
        >
          {homeContent.nav.menuGroups[0].links.map((link) => {
            const isInternal = link.href.startsWith("/");

            const linkContent = link.labelLines ? (
              <span className="flex flex-col items-center justify-center text-center leading-snug">
                {link.labelLines.map((line) => (
                  <span
                    key={`${link.label}-${line}`}
                    className="block"
                  >
                    {line}
                  </span>
                ))}
              </span>
            ) : (
              <span className="block text-center">
                {link.label}
              </span>
            );

            const itemClass =
               "font-offbit-bold flex min-h-[46px] w-full items-center justify-center rounded-lg px-3 py-1.5 text-center text-[1.05rem] text-white transition-all duration-200 hover:bg-white/[0.08] hover:text-[#DC003B]";

            if (isInternal) {
              return (
                <Link
                  key={link.label}
                  data-ccursor
                  href={link.href}
                  onClick={handleOverlayClose}
                  className={itemClass}
                >
                  {linkContent}
                </Link>
              );
            }

            return (
              <a
                key={link.label}
                data-ccursor
                target="_blank"
                rel="noreferrer"
                href={link.href}
                onClick={handleOverlayClose}
                className={itemClass}
              >
                {linkContent}
              </a>
            );
          })}

          <div className="my-2 h-px w-full bg-white/35 shadow-[0_0_8px_rgba(255,255,255,0.12)]" />

          <a
            href={homeContent.nav.contactHref}
            data-ccursor
            onClick={handleOverlayClose}
            className="font-offbit-bold flex min-h-[58px] w-full items-center justify-center gap-3 rounded-lg px-3 py-2 text-base text-white transition-all duration-200 hover:bg-white/[0.08] hover:text-[#DC003B]"
          >
            <span>Contact Us</span>

            <svg
              className="h-5 w-5 shrink-0"
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
    </>
  );
}