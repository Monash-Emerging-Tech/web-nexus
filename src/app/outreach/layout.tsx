import type { Metadata } from "next";
import { sectionTitle } from "@/lib/sections";

export const metadata: Metadata = {
  title: sectionTitle("/outreach"),
  description:
    "Workshops, industry nights, expos, and community events run by MNET, Monash University's student-led XR and emerging technology team.",
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
