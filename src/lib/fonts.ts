import localFont from "next/font/local";

export const offbit = localFont({
  src: [
    {
      path: "../../public/fonts/OffBit-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/OffBit-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-offbit",
  display: "swap",
});

export const offbitDot = localFont({
  src: [
    {
      path: "../../public/fonts/OffBit-Dot.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/OffBit-DotBold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-offbit-dot",
  display: "swap",
});

export const offbit101 = localFont({
  src: [
    {
      path: "../../public/fonts/OffBit-101.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/OffBit-101Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-offbit-101",
  display: "swap",
});

export const exo2 = localFont({
  src: [
    {
      path: "../../public/fonts/Exo2-VariableFont_wght.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-exo2",
  display: "swap",
});