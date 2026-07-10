import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Monash Nexus for Emerging Technologies",
  description:
    "Explore MNET's project portfolio — VR experiences, AR applications, digital twins, and other immersive technology built by Monash students.",
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
