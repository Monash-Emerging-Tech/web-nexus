import { getNotionClient, NOTION_CONFIG } from "./client";
import {
  BlogPageObject,
  BulletedListItemBlock,
  PageBlock,
  PageObject,
} from "./types";

async function getBlogContent({ blogId }: { blogId: string }) {
  const notion = getNotionClient();
  if (!notion) {
    throw new Error("Notion client unavailable");
  }

  async function fetchBlocks(blockId: string): Promise<PageBlock[]> {
    let cursor: string | undefined = undefined;
    const blocks: PageBlock[] = [];

    while (notion) {
      const response = await notion.blocks.children.list({
        block_id: blockId,
        start_cursor: cursor,
      });

      for (const block of response.results) {
        if ("has_children" in block && block.has_children) {
          const childBlocks = await fetchBlocks(block.id);
          (block as unknown as BulletedListItemBlock).children = childBlocks;
        }

        if ("type" in block) {
          blocks.push(block as PageBlock);
        }
      }

      if (!response.has_more) break;

      cursor = response.next_cursor ?? undefined;
    }

    return blocks;
  }

  return fetchBlocks(blogId);
}

async function getBlogMetadata({ blogId }: { blogId: string }) {
  const notion = getNotionClient();
  if (!notion) {
    throw new Error("Notion client unavailable");
  }
  const response = await notion.pages.retrieve({ page_id: blogId });

  return response as BlogPageObject;
}

export async function getBlogBySlug({ slug }: { slug: string }) {
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
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
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
  if (!notion || !NOTION_CONFIG.MEMBERS_DB_ID) {
    console.warn("Notion client unavailable for user lookup");
    return null;
  }

  const response = await notion.users.retrieve({ user_id: userId });
  return response;
}
