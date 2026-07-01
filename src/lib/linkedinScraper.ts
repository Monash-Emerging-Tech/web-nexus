import { cache } from "react";

/**
 * Scrapes a public LinkedIn profile page for the og:image meta tag content.
 * Utilizes React cache to prevent duplicate fetches in a single render pass.
 */
export const getLinkedInProfilePic = cache(async (linkedinUrl: string | undefined): Promise<string | null> => {
  if (!linkedinUrl) return null;
  
  // Basic validation of URL
  if (!linkedinUrl.startsWith("http://") && !linkedinUrl.startsWith("https://")) {
    return null;
  }
  
  try {
    const response = await fetch(linkedinUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      console.warn(`LinkedIn scrape failed for ${linkedinUrl}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const html = await response.text();
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
                         
    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1];
    }
  } catch (error) {
    console.error(`Error fetching/scraping LinkedIn URL ${linkedinUrl}:`, error);
  }
  
  return null;
});
