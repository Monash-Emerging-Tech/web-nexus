import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Monash Nexus for Emerging Technologies",
  description:
    "Meet the MNET team — the academic advisors, leads, and members behind Monash University's student-led XR and immersive technology initiative.",
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
