import type { Metadata } from "next";
import { offbit, offbit101, offbitDot } from "@/lib/fonts";
import "./globals.css";
import { NavBarProvider } from "@/components/navbar_test/NavProvider";
import Footer from "@/components/Footer";
import Nav from "@/components/navbar_test/Nav";

export const metadata: Metadata = {
  title: "Monash Nexus for Emerging Technologies",
  description: "TODO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        <link rel="icon" href="/img/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${offbit.variable} ${offbit101.variable} ${offbitDot.variable} antialiased w-full h-auto`}
      >
        <NavBarProvider>
          <div className="bg-black min-h-screen w-full">
            <Nav />
            {children}
            <Footer />
          </div>
        </NavBarProvider>
      </body>
    </html>
  );
}
