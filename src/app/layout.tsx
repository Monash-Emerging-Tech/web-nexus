import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { offbit, offbit101, offbitDot } from "@/lib/fonts";
import "./globals.css";
import { NavbarProvider } from "@/components/Navbar/NavbarProvider";
import Navbar from "@/components/Navbar/Navbar";
import FooterWrapper from "@/components/FooterWrapper";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Monash Nexus for Emerging Technologies",
  description:
    "MNET is Monash University's student-led team for Extended Reality (XR) and immersive technology — building VR, AR, and mixed-reality projects that bridge academic theory and real-world implementation.",
  openGraph: {
    title: "Monash Nexus for Emerging Technologies",
    description:
      "Monash University's student-led XR and immersive technology team. Explore our projects, events, and community.",
    url: SITE_URL,
    siteName: "MNET",
    type: "website",
    images: [{ url: "/img/About-Team.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monash Nexus for Emerging Technologies",
    description:
      "Monash University's student-led XR and immersive technology team.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full h-full">
      <head>
        <link rel="icon" href="/img/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${offbit.variable} ${offbit101.variable} ${offbitDot.variable} antialiased w-full h-auto`}
      >
        <NavbarProvider>
          <div className="bg-black min-h-screen w-full relative">
            <Navbar />
            {children}
            <FooterWrapper />
          </div>
        </NavbarProvider>
      </body>
    </html>
  );
}
