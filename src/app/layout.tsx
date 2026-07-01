import type { Metadata } from "next";
import { offbit, offbit101, offbitDot } from "@/lib/fonts";
import "./globals.css";
import { NavbarProvider } from "@/components/Navbar/NavbarProvider";
import Navbar from "@/components/Navbar/Navbar";
import FooterWrapper from "@/components/FooterWrapper";

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
          rel="preload"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          as="style"
        />
        <link
          rel="stylesheet"
          id="font-awesome-css"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          media="print"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: "document.getElementById('font-awesome-css').media='all'",
          }}
        />
        <link rel="icon" href="/img/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${offbit.variable} ${offbit101.variable} ${offbitDot.variable} antialiased w-full h-auto`}
      >
        <NavbarProvider>
          <div className="bg-black min-h-screen w-full relative">
            <Navbar />
            {children}
            <FooterWrapper />
          </div>
        </NavbarProvider>
      </body>
    </html>
  );
}
