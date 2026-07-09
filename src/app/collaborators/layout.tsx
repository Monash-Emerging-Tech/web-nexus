import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collaborators | Monash Nexus for Emerging Technologies",
  description:
    "MNET's partners and support network — Embodied Visualisation, eSolutions VARS, the Digital Makerspace, and the Monash teams we build with. Work with us or support the team.",
};

export default function CollaboratorsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
