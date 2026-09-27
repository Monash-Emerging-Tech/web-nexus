import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "shader-art": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        autoPlay?: boolean;
      };
    }
  }
}
