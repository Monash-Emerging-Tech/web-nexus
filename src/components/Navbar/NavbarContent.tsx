"use client";

import Image from "next/image";
import Link from "next/link";
import { useNavbar } from "./NavbarProvider";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const NAV_ROUTES = ["/about-us", "/outreach", "/portfolios", "/collaborators"];

const NavbarContent = () => {
  const { open, toggleOpen } = useNavbar();
  const router = useRouter();

  // Eagerly prefetch all nav routes on mount
  useEffect(() => {
    NAV_ROUTES.forEach((r) => router.prefetch(r));
  }, [router]);

  const closeNav = () => { if (open) toggleOpen(); };

  const holderRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      holderRef.current,
      { y: -200 },
      { y: 0, duration: 0.5, ease: "power2.out" },
    );
  }, []);

  useEffect(() => {
    if (!navbarRef.current || !linksRef.current) return;

    gsap.killTweensOf(navbarRef.current);
    gsap.killTweensOf(linksRef.current);

    const timeline = gsap.timeline({
      defaults: { duration: 0.5, ease: "power2.out" },
    });

    if (open) {
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        gsap.set(holderRef.current, { height: "100dvh" });
      }

      timeline.to(navbarRef.current, {
        margin: 0,
        padding: "1rem 1rem",
        gap: "2rem",
        borderRadius: isMobile ? "0 0 0 0" : "0 0 1.5rem 1.5rem",
      });

      const linksHeight = linksRef.current.scrollHeight;

      timeline.to(
        linksRef.current,
        {
          height: isMobile ? "auto" : linksHeight,
          opacity: 1,
          padding: isMobile ? "" : "3rem 5rem",
        },
        "-=0.1",
      );
    } else {
      timeline.to(linksRef.current, {
        height: 0,
        opacity: 0,
        padding: 0,
      });

      timeline.to(
        navbarRef.current,
        {
          margin: "1rem",
          padding: "1.75rem",
          gap: "0",
          borderRadius: "1.5rem",
          height: "",
        },
        "-=0.2",
      );

      gsap.set(holderRef.current, { clearProps: "height" });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (holderRef.current && !holderRef.current.contains(e.target as Node)) {
        toggleOpen();
      }
    };

    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => toggleOpen(), 50);
    };

    const attachTimeout = setTimeout(() => {
      window.addEventListener("scroll", handleScroll);
    }, 600);

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(attachTimeout);
      clearTimeout(scrollTimeout);
    };
  }, [open, toggleOpen]);

  return (
    <div ref={holderRef} className={cn("fixed z-10 w-full -translate-y-200")}>
      <div
        ref={navbarRef}
        className={cn(
          "m-4 md:p-7 p-3 z-10 bg-[#00050] rounded-3xl flex flex-col items-center border-2 border-[#2C2C2D] backdrop-blur-md sticky top-0",
          open ? "md:m-4 m-0 md:rounded-3xl rounded-none md:h-auto" : "",
        )}
      >
        <div className="flex flex-row justify-between items-center w-full">
          <Link
            href="/"
            onClick={closeNav}
            className="flex flex-row gap-6 items-center z-20 cursor-pointer"
          >
            <Image
              width={128}
              height={128}
              className={cn(
                "transition-all duration-500 ease-in-out",
                "aspect-square md:w-16 w-12",
                open ? "md:w-10 w-8" : "",
              )}
              src="/img/logo.png"
              alt="MNET logo"
            />
            <div className="flex flex-col">
              <h1
                className={cn(
                  "transition-all duration-500 ease-in-out",
                  "md:text-3xl text-4xl font-offbit-dot font-bold",
                  open ? "md:text-2xl text-3xl" : "",
                )}
              >
                MNET
              </h1>
              <h2
                className={cn(
                  "transition-all duration-500 ease-in-out",
                  "md:flex hidden font-offbit font-bold",
                  open ? "text-sm" : "",
                )}
              >
                MONASH NEXUS FOR EMERGING TECHNOLOGIES
              </h2>
            </div>
          </Link>
          <div className="flex flex-row gap-6 items-center z-20">
            <a
              href="mailto:mnet@monash.edu"
              className={cn(
                "transition-all duration-500 ease-in-out",
                "hover:cursor-pointer md:flex font-offbit font-bold hidden h-fit px-8 py-3 bg-primary rounded-md items-center justify-center",
                open ? "px-4 py-2 text-sm" : "",
              )}
            >
              CONTACT
            </a>
            <div
              className={`relative w-12 h-9 cursor-pointer transition-transform duration-500 ease-in-out`}
              onClick={toggleOpen}
            >
              <span
                className={cn(
                  "block absolute h-1 bg-white rounded-sm opacity-100 left-0",
                  open ? "top-4 w-0 left-1/2 opacity-0" : "top-0 w-full",
                  "transition-all duration-500 ease-in-out",
                )}
              ></span>
              <span
                className={cn(
                  "block absolute h-1 w-full bg-white rounded-sm opacity-100 left-0 top-4",
                  open ? "rotate-45 w-[calc(80%)]" : "",
                  "transition-all duration-500 ease-in-out",
                )}
              ></span>
              <span
                className={cn(
                  "block absolute h-1 w-full bg-white rounded-sm opacity-100 left-0 top-4",
                  open ? "-rotate-45 w-[calc(80%)]" : "",
                  "transition-all duration-500 ease-in-out",
                )}
              ></span>
              <span
                className={cn(
                  "block absolute h-1 bg-white rounded-sm opacity-100 left-0",
                  open ? "top-4 w-0 left-1/2 opacity-0" : "top-8 w-full",
                  "transition-all duration-500 ease-in-out",
                )}
              ></span>
            </div>
          </div>
        </div>
        <div
          ref={linksRef}
          style={{ height: 0, overflow: "hidden", opacity: 0 }}
          className="flex md:flex-row flex-col md:justify-between gap-4 md:gap-10 items-center z-20 w-full opacity-0"
        >
          {/* ABOUT US */}
          <Link
            href="/about-us"
            onClick={closeNav}
            className="flex-1 font-offbit font-bold bg-transparent rounded-lg cursor-pointer w-full"
          >
            <div className="relative w-full md:aspect-9/16 rounded-lg grid">
              <Image
                src="/img/Nav-About-Temp.JPG"
                alt="MNET about us"
                fill
                className="hidden md:block object-cover brightness-60 hover:scale-120 transition-transform duration-300 ease-in-out"
              />
              <Image
                src="/img/Nav-About-Temp.JPG"
                alt="MNET about us"
                width={800}
                height={400}
                className="md:hidden w-full h-auto brightness-60 object-cover aspect-24/8 [grid-area:1/1]"
              />
              <div className="[grid-area:1/1] flex items-center justify-center pointer-events-none z-10 brightness-100">
                <span className="text-white text-2xl pointer-events-none uppercase tracking-widest text-shadow-md">
                  ABOUT US
                </span>
              </div>
            </div>
          </Link>

          {/* OUTREACH */}
          <Link
            href="/outreach"
            onClick={closeNav}
            className="flex-1 font-offbit font-bold bg-transparent rounded-lg cursor-pointer w-full"
          >
            <div className="relative w-full md:aspect-9/16 rounded-lg grid">
              <Image
                src="/img/Nav-Events.JPG"
                alt="MNET outreach"
                fill
                className="hidden md:block object-cover object-[20%_40%] brightness-60 hover:scale-120 transition-transform duration-300 ease-in-out"
              />
              <Image
                src="/img/Nav-Events.JPG"
                alt="MNET outreach"
                width={800}
                height={400}
                className="md:hidden w-full h-auto brightness-60 object-cover aspect-24/8 [grid-area:1/1]"
              />
              <div className="[grid-area:1/1] flex items-center justify-center pointer-events-none z-10 brightness-100">
                <span className="text-white text-2xl pointer-events-none uppercase tracking-widest text-shadow-md">
                  OUTREACH
                </span>
              </div>
            </div>
          </Link>

          {/* PORTFOLIO */}
          <Link
            href="/portfolios"
            onClick={closeNav}
            className="flex-1 font-offbit font-bold bg-transparent rounded-lg cursor-pointer w-full"
          >
            <div className="relative w-full md:aspect-9/16 rounded-lg grid">
              <Image
                src="/img/Nav-Projects.png"
                alt="MNET portfolio"
                fill
                className="hidden md:block object-cover object-[10%_60%] brightness-60 hover:scale-120 transition-transform duration-300 ease-in-out"
              />
              <Image
                src="/img/Nav-Projects.png"
                alt="MNET portfolio"
                width={800}
                height={400}
                className="md:hidden w-full h-auto brightness-60 object-cover aspect-24/8 [grid-area:1/1]"
              />
              <div className="[grid-area:1/1] flex items-center justify-center pointer-events-none z-10 brightness-100">
                <span className="text-white text-2xl pointer-events-none uppercase tracking-widest text-shadow-md">
                  PORTFOLIO
                </span>
              </div>
            </div>
          </Link>

          {/* COLLABORATORS */}
          <Link
            href="/collaborators"
            onClick={closeNav}
            className="flex-1 font-offbit font-bold bg-transparent rounded-lg cursor-pointer w-full"
          >
            <div className="relative w-full md:aspect-9/16 rounded-lg grid">
              <Image
                src="/img/Nav-Team.JPG"
                alt="MNET collaborators"
                fill
                className="hidden md:block object-cover object-[45%_60%] brightness-60 hover:scale-120 transition-transform duration-300 ease-in-out"
              />
              <Image
                src="/img/Nav-Team.JPG"
                alt="MNET collaborators"
                width={800}
                height={400}
                className="md:hidden w-full h-auto brightness-60 object-cover aspect-24/8 [grid-area:1/1]"
              />
              <div className="[grid-area:1/1] flex items-center justify-center pointer-events-none z-10 brightness-100">
                <span className="text-white text-2xl pointer-events-none uppercase tracking-widest text-shadow-md">
                  COLLABORATORS
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavbarContent;
