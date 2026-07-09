import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Monash Nexus for Emerging Technologies",
  description:
    "Meet MNET — Monash University's student team for emerging simulation technologies. Our story, history, values, the platypus, and the people behind the projects.",
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
