import { getNotionClient, NOTION_CONFIG } from "./client";

// Team member data
export async function getMemberData() {
  const notion = getNotionClient();
  if (!NOTION_CONFIG.MEMBERS_DB_ID) {
    throw new Error("NOTION_MEMBERS_DB_ID is not defined");
  }

  const response = await notion.databases.query({
    database_id: NOTION_CONFIG.MEMBERS_DB_ID,
  });
  return response.results;
}
