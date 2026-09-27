import type { Metadata } from "next";
import { sectionTitle } from "@/lib/sections";

export const metadata: Metadata = {
  title: sectionTitle("/portfolios"),
  description:
    "Explore MNET's project portfolio - VR experiences, AR applications, digital twins, and other immersive technology built by Monash students.",
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
