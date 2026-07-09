"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  // On "/" the hero owns an internal scroller, so window.scrollY stays 0 until
  // the user scrolls past it into the page sections — hide the bar then.
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    const onScroll = () => setPastHero(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (pathname === "/") {
    return (
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none text-center w-full max-w-[90%] flex flex-col items-center gap-3 transition-opacity duration-500 ${
          pastHero ? "opacity-0" : "opacity-100"
        }`}
      >
        <div
          className={`flex items-center gap-6 text-white text-lg ${
            pastHero ? "pointer-events-none" : "pointer-events-auto"
          }`}
        >
          <a
            href="https://au.linkedin.com/company/monashemergingtech"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#DC003B] transition-colors duration-200"
            aria-label="LinkedIn"
          >
            <i className="fab fa-linkedin"></i>
          </a>
          <a
            href="https://www.instagram.com/monashemergingtech/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#DC003B] transition-colors duration-200"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a
            href="https://www.facebook.com/people/Monash-Nexus-for-Emerging-Technologies/61562647665251/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#DC003B] transition-colors duration-200"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook"></i>
          </a>
          <a
            href="https://discord.gg/hFxzMnxgbK"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#DC003B] transition-colors duration-200"
            aria-label="Discord"
          >
            <i className="fab fa-discord"></i>
          </a>
        </div>
        <p className="font-offbit font-bold text-[9px] md:text-xs tracking-widest text-white/40" suppressHydrationWarning>
          © {new Date().getFullYear()} MONASH NEXUS FOR EMERGING TECHNOLOGIES
        </p>
      </div>
    );
  }

  return <Footer />;
}
