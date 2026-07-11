import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "shader-art": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        autoPlay?: boolean;
      };
      uniform: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        [attr: string]: string | number | boolean | undefined;
      };
    }
  }
}
