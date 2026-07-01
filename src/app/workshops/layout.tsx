import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workshops | Monash Nexus for Emerging Technologies",
  description: "Workshops conducted by Monash Nexus for Emerging Technologies",
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
