import { getNotionClient, NOTION_CONFIG } from "./client";
import { type QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import { PageBlock } from "./types";

async function getBlogPagePublic({
  filter,
  sorts,
}: {
  filter?: QueryDatabaseParameters["filter"];
  sorts?: QueryDatabaseParameters["sorts"];
}): Promise<any[]> {
  const notion = getNotionClient();
  if (!NOTION_CONFIG.MEMBERS_DB_ID) {
	throw new Error("NOTION_MEMBERS_DB_ID is not defined");
  }
  const blogs: any[] = [];
  const response = await notion.databases.query({
    database_id: NOTION_CONFIG.MEMBERS_DB_ID,
    filter,
    sorts,
  });

  for (const result of response.results) {
	try {
	  const blogpage = result;
	  blogs.push({
      id: blogpage.id,
      name: blogpage["properties"]["Name"]["title"][0]?.["text"][
        "content"
      ],
	  });
	} catch (error) {
	  console.error("Error processing blog page:", error);
	}
  }
  return blogs;
}

export async function getBlogContent({
  blogId,
} : {
  blogId: string;
}) {
  const notion = getNotionClient();

  async function fetchBlocks(blockId: string): Promise<PageBlock[]> {
    let cursor: string | undefined = undefined;
    const blocks: PageBlock[] = [];

    while (true) {
      const response = await notion.blocks.children.list({
        block_id: blockId,
        start_cursor: cursor,
      });

      for (const block of response.results) {
        if ("has_children" in block && block.has_children) {
          const childBlocks = await fetchBlocks(block.id);
          (block as any).children = childBlocks;
        }

        if ("type" in block) {
          blocks.push(block as PageBlock);
        }
      }

      if (!response.has_more) break;

      cursor = response.next_cursor ?? undefined;
    };

    return blocks;
  }

  return fetchBlocks(blogId);
}

export async function getUserById(userId: string) {
  const notion = getNotionClient();
  if (!NOTION_CONFIG.MEMBERS_DB_ID) {
    throw new Error("NOTION_MEMBERS_DB_ID is not defined");
  }
  
  const response = await notion.users.retrieve({ user_id: userId });
  return response;
}