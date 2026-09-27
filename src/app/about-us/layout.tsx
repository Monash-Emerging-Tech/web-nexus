import type { Metadata } from "next";
import { sectionTitle } from "@/lib/sections";

export const metadata: Metadata = {
  title: sectionTitle("/about-us"),
  description:
    "Meet MNET - Monash University's student team for emerging simulation technologies and immersive XR projects. Our story, advisors, leads, members, and the people behind the projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
