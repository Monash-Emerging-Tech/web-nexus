import { Client } from "@notionhq/client";

let notionClient: Client | null = null;

export function getNotionClient(): Client {
  if (!notionClient) {
    if (!process.env.NOTION_API_KEY) {
      throw new Error("NOTION_API_KEY is not defined");
    }
    notionClient = new Client({ auth: process.env.NOTION_API_KEY });
  }
  return notionClient;
}

export const NOTION_CONFIG = {
  PORTFOLIOS_DB_ID: process.env.NOTION_PORTFOLIOS_DB_ID,
  MEMBERS_DB_ID: process.env.NOTION_MEMBERS_DB_ID,
  EVENTS_DB_ID: process.env.NOTION_EVENTS_DB_ID,
};
