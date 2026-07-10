import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | Monash Nexus for Emerging Technologies",
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
