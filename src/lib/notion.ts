import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function getPortfolioData() {
  const databaseId = process.env.NOTION_PORTFOLIOS_DB_ID!;
  const response = await notion.databases.query({ database_id: databaseId });
  return response.results;
}

export async function getMemberData() {
  const databaseId = process.env.NOTION_MEMBERS_DB_ID!;
  const response = await notion.databases.query({ database_id: databaseId });
  return response.results;
}
