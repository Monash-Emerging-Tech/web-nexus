const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");
const https = require("https");

function loadEnv() {
  try {
    const envPath = path.join(__dirname, "../.env.local");
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) {
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[match[1]] = val;
      }
    }
  } catch (e) {
    console.error("No .env.local loaded:", e.message);
  }
}

loadEnv();

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_MEMBERS_DB_ID = process.env.NOTION_MEMBERS_DB_ID;

if (!NOTION_API_KEY || !NOTION_MEMBERS_DB_ID) {
  console.error("Error: NOTION_API_KEY and NOTION_MEMBERS_DB_ID must be set in .env.local");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

const LEAD_ROLES = [
  "Team Lead",
  "Marketing Lead",
  "Education Lead",
  "Project Lead",
  "Operation Lead",
];

function coverUrl(page) {
  const cover = page.cover;
  if (!cover) return null;
  if (cover.type === "external") return cover.external.url;
  if (cover.type === "file") return cover.file.url;
  return null;
}

async function getMembers() {
  const members = [];
  let cursor = undefined;
  do {
    const response = await notion.databases.query({
      database_id: NOTION_MEMBERS_DB_ID,
      start_cursor: cursor,
    });
    for (const page of response.results) {
      const props = page.properties || {};
      const name = props["Name"]?.title?.[0]?.plain_text || "Unknown";
      const roles = (props["Role"]?.multi_select || []).map((r) => r.name);
      const departments = (props["Department"]?.multi_select || []).map((d) => d.name);
      const isLead = roles.some((r) => LEAD_ROLES.some((lr) => r.includes(lr)));
      const isAcademicAdvisor = departments.includes("Academic Advisors");
      members.push({
        id: page.id,
        name,
        cover: coverUrl(page),
        relevant: isLead || isAcademicAdvisor,
      });
    }
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return members;
}

const EXT_BY_CONTENT_TYPE = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

// destPathNoExt: full path minus extension; resolves with the extension actually written
function downloadImage(url, destPathNoExt) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return downloadImage(res.headers.location, destPathNoExt).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download image, status: ${res.statusCode}`));
          return;
        }
        const contentType = (res.headers["content-type"] || "").split(";")[0].trim();
        const ext = EXT_BY_CONTENT_TYPE[contentType] || ".jpg";
        const destPath = `${destPathNoExt}${ext}`;
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on("finish", () => {
          fileStream.close();
          resolve(destPath);
        });
      })
      .on("error", reject);
  });
}

async function main() {
  console.log("Fetching members from Notion...");
  const members = await getMembers();
  const relevantCount = members.filter((m) => m.relevant).length;
  console.log(`Found ${members.length} members, ${relevantCount} are leads or academic advisors.`);

  const outputDir = path.join(__dirname, "../public/img/members");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let downloaded = 0;
  let skipped = 0;
  let missing = 0;
  const knownExts = [".jpg", ".png", ".gif", ".webp"];

  for (const m of members) {
    if (!m.relevant) continue;

    const destNoExt = path.join(outputDir, m.id);
    const existing = knownExts.find((ext) => fs.existsSync(`${destNoExt}${ext}`));

    if (!m.cover) {
      console.log(`- ${m.name}: No cover image`);
      missing++;
      continue;
    }

    if (existing) {
      console.log(`- ${m.name}: Already downloaded, skipping`);
      skipped++;
      continue;
    }

    console.log(`- ${m.name}: Downloading cover...`);
    try {
      const dest = await downloadImage(m.cover, destNoExt);
      console.log(`  Saved to ${dest}`);
      downloaded++;
    } catch (err) {
      console.error(`  Error downloading cover for ${m.name}:`, err.message);
    }
  }

  console.log(`\nDone. Downloaded ${downloaded}, skipped ${skipped} (already local), ${missing} had no cover.`);
}

main().catch(console.error);
