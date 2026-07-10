const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");

// Simple env parser
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      process.env[key] = val;
    }
  });
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbId = process.env.NOTION_PORTFOLIOS_DB_ID;

async function run() {
  console.log("DB ID:", dbId);
  const response = await notion.databases.query({
    database_id: dbId,
  });
  for (const page of response.results) {
    const title = page.properties["Project name"]?.title[0]?.plain_text || "No name";
    const parentRelation = page.properties["Parent Portfolio"]?.relation || [];
    console.log(`Page: ${title}`);
    console.log(`  ID: ${page.id}`);
    console.log(`  Parent Relations:`, parentRelation.map(r => r.id));
    console.log(`  Tags:`, page.properties["Project Type"]?.multi_select?.map(m => m.name));
    console.log(`  Status:`, page.properties["Web Status"]?.select?.name);
  }
}

run().catch(console.error);
