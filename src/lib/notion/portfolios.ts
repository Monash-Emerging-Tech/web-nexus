import { getNotionClient, NOTION_CONFIG } from "./client";
import { type QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import { type PortfolioPageObject, Portfolio } from "../notion/types";

async function getPortfolioData({
  filter,
  sorts,
}: {
  filter?: QueryDatabaseParameters["filter"];
  sorts?: QueryDatabaseParameters["sorts"];
}): Promise<Portfolio[]> {
  const notion = getNotionClient();
  if (!NOTION_CONFIG.PORTFOLIOS_DB_ID) {
    throw new Error("NOTION_PORTFOLIOS_DB_ID is not defined");
  }
  const portfolios: Portfolio[] = [];
  const response = await notion.databases.query({
    database_id: NOTION_CONFIG.PORTFOLIOS_DB_ID,
    filter,
    sorts,
  });

  for (const result of response.results) {
    try {
      const portfolioPage = result as PortfolioPageObject;
      portfolios.push({
        id: portfolioPage.id,
        name: portfolioPage["properties"]["Project name"]["title"][0]?.["text"][
          "content"
        ],
        oneliner:
          portfolioPage["properties"]["One Liner"]["rich_text"][0]?.["text"][
            "content"
          ],
        description:
          portfolioPage["properties"]["Description"]["rich_text"][0]?.["text"][
            "content"
          ],
        githubUrl:
          portfolioPage["properties"]["GitHub Repository"]["url"] || undefined,
        tags: portfolioPage["properties"]["Project Type"]["multi_select"].map(
          (item) => item.name
        ),
        tech: portfolioPage["properties"]["Tech Used"]["multi_select"].map(
          (item) => item.name
        ),
        members: portfolioPage["properties"]["Assignee(s)"]["people"].map(
          (item) => item.name
        ),
        imageUrl:
          (portfolioPage["cover"]?.["type"] === "external" &&
            portfolioPage["cover"]["external"]["url"]) ||
          (portfolioPage["cover"]?.["type"] === "file" &&
            portfolioPage["cover"]["file"]["url"]) ||
          undefined,
        status: portfolioPage["properties"]["Web Status"]["select"]?.["name"],
        date: {
          start: portfolioPage["properties"]["Dates"]["date"]?.["start"],
          end: portfolioPage["properties"]["Dates"]["date"]?.["end"],
        },
      });
    } catch (error) {
      console.error("Error processing portfolio page:", error);
    }
  }
  return portfolios;
}

export async function getFeaturedPortfolios() {
  const filter: QueryDatabaseParameters["filter"] = {
    property: "Web Status",
    select: {
      equals: "Featured",
    },
  };
  const sorts: QueryDatabaseParameters["sorts"] = [
    {
      property: "Dates",
      direction: "descending",
    },
  ];
  return getPortfolioData({ filter, sorts });
}

export async function getActivePortfolios() {
  const filter: QueryDatabaseParameters["filter"] = {
    or: [
      {
        property: "Web Status",
        select: {
          equals: "Active",
        },
      },
      {
        property: "Web Status",
        select: {
          equals: "Featured",
        },
      },
    ],
  };
  const sorts: QueryDatabaseParameters["sorts"] = [
    {
      property: "Dates",
      direction: "descending",
    },
  ];
  return getPortfolioData({ filter, sorts });
}
