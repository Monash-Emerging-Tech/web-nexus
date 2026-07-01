import os
import sys
import re
import time
import urllib.request
import urllib.error
import json

def load_env():
    try:
        env_path = os.path.join(os.path.dirname(__file__), "../.env.local")
        if not os.path.exists(env_path):
            print("No .env.local found")
            return
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                parts = line.split("=", 1)
                if len(parts) == 2:
                    key = parts[0].strip()
                    val = parts[1].strip()
                    if val.startswith('"') and val.endswith('"'):
                        val = val[1:-1]
                    elif val.startswith("'") and val.endswith("'"):
                        val = val[1:-1]
                    os.environ[key] = val
    except Exception as e:
        print("Error loading env:", e)

load_env()

NOTION_API_KEY = os.environ.get("NOTION_API_KEY")
NOTION_MEMBERS_DB_ID = os.environ.get("NOTION_MEMBERS_DB_ID")

if not NOTION_API_KEY or not NOTION_MEMBERS_DB_ID:
    print("Error: NOTION_API_KEY and NOTION_MEMBERS_DB_ID must be set")
    sys.exit(1)

def get_notion_members():
    url = f"https://api.notion.com/v1/databases/{NOTION_MEMBERS_DB_ID}/query"
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(url, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode("utf-8"))
            
            members = []
            for page in data.get("results", []):
                props = page.get("properties", {})
                name = "Unknown"
                name_prop = props.get("Name", {})
                if name_prop.get("title"):
                    name = name_prop["title"][0].get("plain_text", "Unknown")
                
                # Check LinkedIn fields
                linkedin_url = None
                for prop_name in ["LinkedIn", "linkedin", "LinkedIn Profile", "Linkedin"]:
                    prop = props.get(prop_name)
                    if not prop:
                        continue
                    if prop.get("type") == "url" and prop.get("url"):
                        linkedin_url = prop["url"]
                        break
                    elif prop.get("type") == "rich_text" and prop.get("rich_text"):
                        linkedin_url = prop["rich_text"][0].get("text", {}).get("content")
                        break
                
                members.append({
                    "id": page["id"],
                    "name": name,
                    "linkedin": linkedin_url
                })
            return members
    except Exception as e:
        print("Error querying Notion database:", e)
        return []

def scrape_linkedin_image(linkedin_url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
    req = urllib.request.Request(linkedin_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode("utf-8", errors="ignore")
            # Find og:image
            match = re.search(r'<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']', html, re.IGNORECASE) or \
                    re.search(r'<meta[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']', html, re.IGNORECASE)
            if match:
                return match.group(1).replace("&amp;", "&")
    except Exception as e:
        print(f"  Error loading/scraping LinkedIn: {e}")
    return None

def download_image(img_url, dest_path):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    req = urllib.request.Request(img_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            with open(dest_path, "wb") as f:
                f.write(response.read())
            return True
    except Exception as e:
        print(f"  Error downloading image: {e}")
    return False

def main():
    print("Fetching members from Notion...")
    members = get_notion_members()
    print(f"Found {len(members)} members.")
    
    output_dir = os.path.join(os.path.dirname(__file__), "../public/img/members")
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    for m in members:
        if not m["linkedin"]:
            print(f"- {m['name']}: No LinkedIn URL")
            continue
            
        print(f"- {m['name']}: Scraping LinkedIn ({m['linkedin']})...")
        img_url = scrape_linkedin_image(m["linkedin"])
        if img_url:
            dest = os.path.join(output_dir, f"{m['id']}.jpg")
            if download_image(img_url, dest):
                print(f"  Successfully downloaded to {dest}")
            else:
                print("  Failed to download image")
        else:
            print("  Could not find profile image (og:image)")
            
        time.sleep(2)

if __name__ == "__main__":
    main()
