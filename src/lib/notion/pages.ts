import { getNotionClient, NOTION_CONFIG } from "./client";
import { type QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import { BlogPageObject, PageBlock, PageMetadata, PageObject } from "./types";

async function getBlogPagePublic({
  filter,
  sorts,
}: {
  filter?: QueryDatabaseParameters["filter"];
  sorts?: QueryDatabaseParameters["sorts"];
}): Promise<PageMetadata[]> {
  const notion = getNotionClient();
  if (!NOTION_CONFIG.MEMBERS_DB_ID) {
	throw new Error("NOTION_MEMBERS_DB_ID is not defined");
  }
  const blogs: PageMetadata[] = [];
  const response = await notion.databases.query({
    database_id: NOTION_CONFIG.MEMBERS_DB_ID,
    filter,
    sorts,
  });

  for (const result of response.results) {
  try {
    const blogpage = result as BlogPageObject;
    blogs.push({
      id: blogpage.id,
      title: blogpage["properties"]["Title"]["title"][0]?.["text"][
          "content"
        ],
      in_archive: blogpage.archived,
      in_trash: blogpage.in_trash,
      cover: blogpage.cover,
    });
  } catch (error) {
    console.error("Error processing blog page:", error);
  }
  }
  return blogs;
}

async function getBlogContent({
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

async function getBlogMetadata({
  blogId,
} : {
  blogId: string;
}) {
  const notion = getNotionClient();
  const response = await notion.pages.retrieve({ page_id: blogId });

  return response as BlogPageObject;
}

export async function getBlogBySlug({
  slug,
} : {
  slug: string;
}) {

  // TODO: Revert to Slug based fetching once that's implemented in Notion
  /*
  const blog = await getBlogPagePublic({
    filter: {
      property: "Slug",
      rich_text: {
        equals: slug,
      },
    },
  });
  */

  function isValidUUID(uuid: string) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(uuid);
  }
  
  if (!isValidUUID(slug)) {
    console.error(`Invalid slug format: ${slug}`);
    return null;
  }

  try {
    const blog = await getBlogMetadata({ blogId: slug });

    if (!blog) {
      throw new Error(`No blog found with slug: ${slug}`);
    }

    const blogId = blog.id;

    const blogContent = await getBlogContent({ blogId });

    return {
      title: blog.properties["Project name"].title[0]?.text.content,
      cover: blog.cover,
      content: blogContent,
    } as PageObject;
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    
    return null;
  }
}

export async function getUserById(userId: string) {
  const notion = getNotionClient();
  if (!NOTION_CONFIG.MEMBERS_DB_ID) {
    throw new Error("NOTION_MEMBERS_DB_ID is not defined");
  }
  
  const response = await notion.users.retrieve({ user_id: userId });
  return response;
}