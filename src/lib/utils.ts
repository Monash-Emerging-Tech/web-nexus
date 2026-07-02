import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shrinks remote image URLs before handing them to THREE.TextureLoader.
 * - Unsplash: uses their native Imgix params (no proxy overhead)
 * - Everything else: routes through Next.js image optimisation so the
 *   result is resized, WebP-converted, and cached at the CDN edge.
 */
export function optimizeFlashbackUrl(url: string, width = 800): string {
  if (!url.startsWith("http")) return url;

  try {
    const u = new URL(url);

    if (u.hostname === "images.unsplash.com") {
      u.searchParams.set("w", String(width));
      u.searchParams.set("q", "70");
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      return u.toString();
    }

    // Proxy all other remote images through Next.js optimiser
    return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
  } catch {
    return url;
  }
}
