import { Client } from "@notionhq/client";

let notionClient: Client | null = null;

export function getNotionClient(): Client | null {
  if (!notionClient) {
    if (!process.env.NOTION_API_KEY) {
      console.warn("NOTION_API_KEY is not defined — using dummy data fallback");
      return null;
    }
    notionClient = new Client({
       auth: process.env.NOTION_API_KEY,
       fetch: (url, options) => { // Override the default fetch function to allow nextjs CDN caching (should work)
        return fetch(url, { // Ref: https://github.com/makenotion/notion-sdk-js/issues/415
          ...options,
          next: { revalidate: 3600 }
        })
       }
      });
  }
  return notionClient;
}

export const NOTION_CONFIG = {
  PORTFOLIOS_DB_ID: process.env.NOTION_PORTFOLIOS_DB_ID,
  PORTFOLIOS_DS_ID: process.env.NOTION_PORTFOLIOS_DS_ID,
  MEMBERS_DB_ID: process.env.NOTION_MEMBERS_DB_ID,
  MEMBERS_DS_ID: process.env.NOTION_MEMBERS_DS_ID,
  EVENTS_DB_ID: process.env.NOTION_EVENTS_DB_ID,
};
