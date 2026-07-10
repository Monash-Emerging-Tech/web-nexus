"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import { LinkedInIcon, InstagramIcon, FacebookIcon, DiscordIcon } from "@/components/icons/SocialIcons";

export default function FooterWrapper() {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none text-center w-full max-w-[90%] flex flex-col items-center gap-3">
        <div className="flex items-center gap-6 text-white text-lg pointer-events-auto">
          <a
            href="https://au.linkedin.com/company/monashemergingtech"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#DC003B] transition-colors duration-200"
            aria-label="LinkedIn"
          >
            <LinkedInIcon className="w-[1em] h-[1em]" />
          </a>
          <a
            href="https://www.instagram.com/monashemergingtech/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#DC003B] transition-colors duration-200"
            aria-label="Instagram"
          >
            <InstagramIcon className="w-[1em] h-[1em]" />
          </a>
          <a
            href="https://www.facebook.com/people/Monash-Nexus-for-Emerging-Technologies/61562647665251/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#DC003B] transition-colors duration-200"
            aria-label="Facebook"
          >
            <FacebookIcon className="w-[1em] h-[1em]" />
          </a>
          <a
            href="https://discord.gg/hFxzMnxgbK"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#DC003B] transition-colors duration-200"
            aria-label="Discord"
          >
            <DiscordIcon className="w-[1.2em] h-[1em]" />
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
