// Canonical site origin. Set NEXT_PUBLIC_SITE_URL in production so metadata,
// sitemap, and robots point at the real domain rather than the deploy URL.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
