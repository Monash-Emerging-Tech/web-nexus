import type { Metadata } from "next";
import { sectionTitle } from "@/lib/sections";

export const metadata: Metadata = {
  title: sectionTitle("/portfolios"),
  description: "TODO",
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
