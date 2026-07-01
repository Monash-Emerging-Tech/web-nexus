import type { Metadata } from "next";
import { offbit, offbit101, offbitDot } from "@/lib/fonts";
import "./globals.css";
import { NavbarProvider } from "@/components/Navbar/NavbarProvider";
import Navbar from "@/components/Navbar/Navbar";

export const metadata: Metadata = {
  title: "Monash Nexus for Emerging Technologies",
  description: "TODO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        <link rel="icon" href="/img/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${offbit.variable} ${offbit101.variable} ${offbitDot.variable} antialiased w-full h-auto`}
      >
        <NavbarProvider>
          <div className="bg-black min-h-screen w-full relative">
            <Navbar />
            {children}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none text-center w-full max-w-[90%] flex flex-col items-center gap-3">
              <div className="flex items-center gap-6 text-white text-lg pointer-events-auto">
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
              <p className="font-offbit font-bold text-[9px] md:text-xs tracking-widest text-white/40">
                © {new Date().getFullYear()} MONASH NEXUS FOR EMERGING TECHNOLOGIES
              </p>
            </div>
          </div>
        </NavbarProvider>
      </body>
    </html>
  );
}
