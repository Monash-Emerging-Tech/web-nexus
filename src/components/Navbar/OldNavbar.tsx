"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { homeContent } from "../../content/home";
interface NavbarProps {
  disableContextCursor?: boolean;
}

const CONTEXT_CURSOR_SCRIPT_ID = "context-cursor-script";
const CONTEXT_CURSOR_SCRIPT_SRC = "/context-cursor.v2.js?v=1";


export function Navbar({ disableContextCursor = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuLabel, setMenuLabel] = useState("MENU");
  const [scrolled, setScrolled] = useState(false);
  const animationTimeoutsRef = useRef<number[]>([]);

  const clearTextAnimation = () => {
    animationTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    animationTimeoutsRef.current = [];
  };

  const queueTextAnimation = (callback: () => void, delayMs: number) => {
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
          transitionText = `${transitionText.slice(0, index)}${targetChar}${transitionText.slice(index + 1)}`;
          setMenuLabel(transitionText);
          changeLetter(index + 1);
          return;
        }

        const randomChar = String.fromCharCode(Math.floor(Math.random() * (126 - 33 + 1)) + 33);
        transitionText = `${transitionText.slice(0, index)}${randomChar}${transitionText.slice(index + 1)}`;
        setMenuLabel(transitionText);
        queueTextAnimation(() => animateCycle(currentCycle + 1), 50);
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
    window.addEventListener("scroll", handleScroll, { passive: true });

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
    const html = document.documentElement;

    const removeCursorDom = () => {
      document.querySelectorAll(".c-cursor").forEach((node) => node.remove());
    };

    const unloadContextCursor = () => {
      const script = document.getElementById(CONTEXT_CURSOR_SCRIPT_ID);
      if (script?.parentNode) {
        script.parentNode.removeChild(script);
      }
      document
        .querySelectorAll<HTMLScriptElement>('script[src*="context-cursor.js"], script[src*="context-cursor.v2.js"]')
        .forEach((node) => node.parentNode?.removeChild(node));
      removeCursorDom();
    };

    const loadContextCursor = () => {
      if (document.querySelector(`script[src*="${CONTEXT_CURSOR_SCRIPT_SRC.split("?")[0]}"]`)) {
        return;
      }

      const script = document.createElement("script");
      script.id = CONTEXT_CURSOR_SCRIPT_ID;
      script.src = CONTEXT_CURSOR_SCRIPT_SRC;
      script.async = true;
      script.onload = () => {
        if (document.readyState === "complete") {
          window.dispatchEvent(new Event("load"));
        }
      };
      document.head.appendChild(script);
    };

    const setNativeCursorMode = () => {
      html.dataset.cursorMode = "native";
      html.style.cursor = "auto";
      unloadContextCursor();
    };

    const setCustomCursorMode = () => {
      html.dataset.cursorMode = "custom";
      html.style.cursor = "none";
      loadContextCursor();
    };

    let mounted = true;

    const updateContextCursor = async () => {
      if (!mounted) {
        return;
      }

      if (disableContextCursor) {
        setNativeCursorMode();
        return;
      }

      const hasMouse = window.matchMedia("(pointer: fine)").matches;
        if (hasMouse) {
        setCustomCursorMode();
        } else {
        setNativeCursorMode();
        }
    };

    void updateContextCursor();
    const intervalId = window.setInterval(() => {
      void updateContextCursor();
    }, 10000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      setNativeCursorMode();
      delete html.dataset.cursorMode;
      html.style.cursor = "auto";
    };
  }, [disableContextCursor]);

  useEffect(() => {
    return () => {
      clearTextAnimation();
    };
  }, []);

  const handleMenuToggle = () => {
    const isMenuVisible = menuOpen;
    animateMenuText(isMenuVisible ? "CLOSE" : "MENU", isMenuVisible ? "MENU" : "CLOSE");
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
            background: "rgba(0, 0, 0, 0.3)"
        }}
        onClick={handleOverlayClose}
        aria-hidden="true"
        />

      <nav id="mainNavbar" className={`navbar ${scrolled ? "scrolled" : ""}`} aria-label="Primary">
        <div className="my-auto ml-0 flex h-8 flex-row md:h-auto">
          <img src="/img/logo.png" alt="MNET logo" className="m-auto mr-4 h-8 w-auto" />
          <Link href="/" data-ccursor id="left" className="rounded-sm p-0.5">
            <h1 className="font-offbit-bold m-auto translate-y-0.5 text-left text-lg tracking-widest text-white md:mb-4 md:text-3xl">
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
            className="font-offbit-101 flex h-8 w-20 items-center place-content-center rounded-md bg-[#040dc1] p-2 px-3 text-sm text-white transition-all duration-500 [transition-timing-function:cubic-bezier(0,-0.03,0,1)] md:hover:-translate-y-0.5"
          >
            <span className="whitespace-pre">{menuLabel}</span>
            <span className="flex">
              <svg width="15" height="15" xmlns="http://www.w3.org/2000/svg">
                <circle className="m-auto -translate-y-0.5" cx="10" cy="10" r="2" fill="white" />
              </svg>
            </span>
          </button>
        </div>
      </nav>

      <div
        id="mobileMenu"
        className="fixed top-32 left-1/2 z-50 flex w-screen -translate-x-1/2 flex-col gap-4 px-[24px] md:left-auto md:right-0 md:w-auto md:-translate-x-0"
        style={{
          transition: "all 1s cubic-bezier(0,-0.03,0,1)",
          pointerEvents: menuOpen ? "auto" : "none",
        }}
      >
        <div
          id="mobileMenuDiv1"
          className={`mobile-menu-panel-primary text-2xl uppercase shadow-2xl drop-shadow-2xl md:w-56 ${menuOpen ? "mobileMenuDiv1Visible" : "mobileMenuDiv1Hidden"}`}
        >
          {homeContent.nav.menuGroups[0].links.map((link) => {
            const isInternal = link.href.startsWith("/");
            const linkContent = link.labelLines ? (
              <>
                {link.labelLines.map((line, index) => (
                  <span key={`${link.label}-${line}`}>
                    {index > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </>
            ) : (
              link.label
            );

            if (isInternal) {
              return (
                <Link
                  key={link.label}
                  data-ccursor
                  href={link.href}
                  onClick={handleOverlayClose}
                  className={`font-offbit-bold m-auto h-min w-full rounded-lg p-1 pl-4 text-center text-base text-white ${
                    menuOpen ? "" : "hidden"
                  }`}
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
                className={`font-offbit-bold m-auto h-min w-full rounded-lg p-1 pl-4 text-center text-base text-white ${
                  menuOpen ? "" : "hidden"
                }`}
              >
                {linkContent}
              </a>
            );
          })}
        </div>

        <div
          id="mobileMenuDiv2"
          className={`mobile-menu-panel-secondary font-offbit-bold md:w-56 ${menuOpen ? "mobileMenuDiv2Visible" : "mobileMenuDiv2Hidden"}`}
        >
          <a
            href={homeContent.nav.contactHref}
            data-ccursor
            className={`m-auto mx-4 ml-0 mb-4 flex h-min w-full place-content-center rounded-lg text-xl ${menuOpen ? "" : "hidden"}`}
          >
            <span className="font-offbit-bold m-auto translate-y-0.5 text-lg">Contact Us</span>
            <svg className="m-auto mr-4 h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
