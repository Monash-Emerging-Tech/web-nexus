import { getNotionClient, NOTION_CONFIG } from "./client";
import { type QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import { type EventPageObject, Event } from "./types";

async function getEventsData({
  filter,
  sorts,
}: {
  filter?: QueryDatabaseParameters["filter"];
  sorts?: QueryDatabaseParameters["sorts"];
}): Promise<Event[]> {
  const notion = getNotionClient();
  if (!NOTION_CONFIG.EVENTS_DB_ID) {
    throw new Error("NOTION_EVENTS_DB_ID is not defined");
  }
  const events: Event[] = [];
  const response = await notion.databases.query({
    database_id: NOTION_CONFIG.EVENTS_DB_ID,
    filter,
    sorts,
  });

  for (const result of response.results) {
    try {
      const eventPage = result as EventPageObject;
      events.push({
        id: eventPage.id,
        name: eventPage["properties"]["Event name"]["title"][0]?.["text"][
          "content"
        ],
        oneliner:
          eventPage["properties"]["One Liner"]["rich_text"][0]?.["text"][
            "content"
          ],
        description:
          eventPage["properties"]["Description"]["rich_text"][0]?.["text"][
            "content"
          ],
        tag: eventPage["properties"]["Event Type"]["multi_select"][0]?.["name"],
        imageUrl:
          (eventPage["cover"]?.["type"] === "external" &&
            eventPage["cover"]["external"]["url"]) ||
          (eventPage["cover"]?.["type"] === "file" &&
            eventPage["cover"]["file"]["url"]) ||
          undefined,
        status: eventPage["properties"]["Web Status"]["select"]?.["name"],
        date: {
          start: eventPage["properties"]["Dates"]["date"]?.["start"],
          end: eventPage["properties"]["Dates"]["date"]?.["end"],
        },
      });
    } catch (error) {
      console.error("Error processing portfolio page:", error);
    }
  }
  return events;
}

/*
export async function getFeaturedEvents() {
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
  return getEventsData({ filter, sorts });
}

export async function getActiveEvents() {
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
  return getEventsData({ filter, sorts });
}

export async function getActiveIndustryShowcases() {
  const filter: QueryDatabaseParameters["filter"] = {
    or: [
      {
        property: "Web Status",
        select: {
          equals: "Featured",
        },
      },
      {
        property: "Event Type",
        select: {
          equals: "Industry Showcase",
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
  return getEventsData({ filter, sorts });
}

export async function getActiveSocialEvents() {
  const filter: QueryDatabaseParameters["filter"] = {
    or: [
      {
        property: "Web Status",
        select: {
          equals: "Featured",
        },
      },
      {
        property: "Event Type",
        select: {
          equals: "Social Events",
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
  return getEventsData({ filter, sorts });
}

export async function getActiveExpos() {
  const filter: QueryDatabaseParameters["filter"] = {
    or: [
      {
        property: "Web Status",
        select: {
          equals: "Featured",
        },
      },
      {
        property: "Event Type",
        select: {
          equals: "Expo",
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
  return getEventsData({ filter, sorts });
}

export async function getActiveWorkshop() {
  const filter: QueryDatabaseParameters["filter"] = {
    or: [
      {
        property: "Web Status",
        select: {
          equals: "Featured",
        },
      },
      {
        property: "Event Type",
        select: {
          equals: "External Workshop",
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
  return getEventsData({ filter, sorts });
}
*/