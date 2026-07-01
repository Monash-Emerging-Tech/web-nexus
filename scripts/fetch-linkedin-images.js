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

async function getMembers() {
  const response = await notion.databases.query({
    database_id: NOTION_MEMBERS_DB_ID,
  });
  
  const members = [];
  for (const page of response.results) {
    const props = page.properties;
    const name = props["Name"]?.title?.[0]?.plain_text || "Unknown";
    
    // Find LinkedIn URL
    const linkedinProp = props["LinkedIn"] || props["linkedin"] || props["LinkedIn Profile"] || props["Linkedin"];
    let linkedinUrl = null;
    if (linkedinProp) {
      if (linkedinProp.type === "url" && linkedinProp.url) {
        linkedinUrl = linkedinProp.url;
      } else if (linkedinProp.type === "rich_text" && linkedinProp.rich_text?.[0]?.text?.content) {
        linkedinUrl = linkedinProp.rich_text[0].text.content;
      }
    }
    
    members.push({
      id: page.id,
      name,
      linkedin: linkedinUrl
    });
  }
  return members;
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    };
    
    https.get(url, { headers }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}, status: ${res.statusCode}`));
        return;
      }
      
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => { resolve(data); });
    }).on("error", reject);
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download image, status: ${res.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
      });
    }).on("error", reject);
  });
}

async function main() {
  console.log("Fetching members from Notion...");
  const members = await getMembers();
  console.log(`Found ${members.length} members.`);

  const outputDir = path.join(__dirname, "../public/img/members");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const m of members) {
    if (!m.linkedin) {
      console.log(`- ${m.name}: No LinkedIn URL`);
      continue;
    }

    console.log(`- ${m.name}: Scraping LinkedIn (${m.linkedin})...`);
    try {
      const html = await fetchUrl(m.linkedin);
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                           html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      
      if (ogImageMatch && ogImageMatch[1]) {
        const imageUrl = ogImageMatch[1].replace(/&amp;/g, "&");
        const dest = path.join(outputDir, `${m.id}.jpg`);
        await downloadImage(imageUrl, dest);
        console.log(`  Successfully downloaded image for ${m.name} to ${dest}`);
      } else {
        console.warn(`  Could not find profile image (og:image) in HTML for ${m.name}`);
      }
    } catch (err) {
      console.error(`  Error scraping ${m.name}:`, err.message);
    }
    
    // Sleep a bit to be polite to LinkedIn
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

main().catch(console.error);
