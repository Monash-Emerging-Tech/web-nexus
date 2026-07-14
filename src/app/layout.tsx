import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { offbit, offbit101, offbitDot, exo2 } from "@/lib/fonts";
import "./globals.css";
import { NavbarProvider } from "@/components/Navbar/NavbarProvider";
import Navbar from "@/components/Navbar/Navbar";
import FooterWrapper from "@/components/FooterWrapper";
import CustomCursor from "@/components/CustomCursor";
import Loader from "@/components/Loader";
import ScrollIndicator from "@/components/ScrollIndicator";

// Runs before first paint: skip the loading screen for repeat visits in this
// session and for reduced-motion users by stripping the gate class off <html>.
const loaderGateScript = `try{if(sessionStorage.getItem('mnet:loader-shown')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.remove('mnet-preload')}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Monash Nexus for Emerging Technologies",
  description:
    "MNET is Monash University's student-led team for Extended Reality (XR) and immersive technology - building VR, AR, and mixed-reality projects that bridge academic theory and real-world implementation.",
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
    <html lang="en" className="w-full h-full mnet-preload" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/img/favicon.ico" sizes="any" />
        <script dangerouslySetInnerHTML={{ __html: loaderGateScript }} />
      </head>
      <body
        className={`${offbit.variable} ${offbit101.variable} ${offbitDot.variable} ${exo2.variable}antialiased w-full h-auto`}
      >
        <NavbarProvider>
          <Loader />
          <div className="bg-black min-h-screen w-full relative">
            <Navbar />
            {children}
            <FooterWrapper />
            <ScrollIndicator />
            <CustomCursor />
          </div>
        </NavbarProvider>
      </body>
    </html>
  );
}
