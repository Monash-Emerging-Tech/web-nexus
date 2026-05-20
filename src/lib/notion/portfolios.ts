import { getNotionClient, NOTION_CONFIG } from "./client";
import { type QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import { type PortfolioPageObject, Portfolio } from "../notion/types";

// ── Dummy data fallback ──────────────────────────────────────────────
const DUMMY_PROJECTS: Portfolio[] = [
  {
    id: "dummy-1",
    name: "Wastewater Treatment Digital Twin",
    oneliner: "A VR experience for exploring wastewater treatment processes.",
    description: "An immersive digital twin built in Unity that lets users walk through a wastewater treatment plant in VR, visualising real-time sensor data overlaid onto 3D-scanned infrastructure.",
    githubUrl: "https://github.com/Monash-Emerging-Tech",
    tags: ["VR", "Digital Twin"],
    tech: ["Unity", "Autodesk Maya", "Substance Painter"],
    members: ["Member A", "Member B", "Member C"],
    imageUrl: "https://placehold.co/640x360.png",
    status: "Featured",
    date: { start: "2025-03-01", end: "2025-11-30" },
  },
  {
    id: "dummy-2",
    name: "MNET Website",
    oneliner: "The website you're looking at right now.",
    description: "A Next.js web application featuring a 3D contour-map hero, Notion-backed CMS, and immersive navigation.",
    githubUrl: "https://github.com/Monash-Emerging-Tech/web-nexus",
    tags: ["Web", "3D"],
    tech: ["Next.js", "Three.js", "Notion API"],
    members: ["Member D", "Member E"],
    imageUrl: "https://placehold.co/640x360.png",
    status: "Featured",
    date: { start: "2025-01-15", end: null },
  },
  {
    id: "dummy-3",
    name: "AR Campus Navigator",
    oneliner: "Navigate Monash Clayton campus through augmented reality.",
    description: "A mobile AR application that overlays directional cues and points of interest onto the live camera feed, helping new students find their way around campus.",
    githubUrl: undefined,
    tags: ["AR", "Mobile"],
    tech: ["ARCore", "Flutter", "Firebase"],
    members: ["Member F", "Member G", "Member H"],
    imageUrl: "https://placehold.co/640x360.png",
    status: "Active",
    date: { start: "2025-06-01", end: null },
  },
];

const DUMMY_PAST_EVENTS: Portfolio[] = [
  {
    id: "dummy-event-1",
    name: "MNET x MAC Spline Workshop",
    oneliner: "3D on the web workshop",
    description: "Partnered with Monash's largest IT student club to deliver a workshop teaching the fundamentals of 3D on the web.",
    githubUrl: undefined,
    tags: ["Workshop"],
    tech: [],
    members: [],
    imageUrl: "https://placehold.co/640x360.png",
    status: undefined,
    date: { start: "2025-04-10", end: "2025-04-10" },
  },
  {
    id: "dummy-event-2",
    name: "SXSW Sydney",
    oneliner: "Premier innovation conference",
    description: "Ran a booth at one of the premier innovation conferences in the Southern Hemisphere, showcasing MNET projects to attendees from 40+ countries.",
    githubUrl: undefined,
    tags: ["Expo"],
    tech: [],
    members: [],
    imageUrl: "https://placehold.co/640x360.png",
    status: undefined,
    date: { start: "2025-03-15", end: "2025-03-17" },
  },
  {
    id: "dummy-event-3",
    name: "Tech Futures Industry Night",
    oneliner: "Networking with cutting-edge companies",
    description: "Worked with Monash Deep Neuron to organize a networking event with cutting-edge companies, featuring 2 panelists, industry partners, and over 500 student attendees.",
    githubUrl: undefined,
    tags: ["Industry"],
    tech: [],
    members: [],
    imageUrl: "https://placehold.co/640x360.png",
    status: undefined,
    date: { start: "2025-05-24", end: "2025-05-24" },
  },
];

const DUMMY_UPCOMING_EVENTS: Portfolio[] = [
  {
    id: "dummy-upcoming-1",
    name: "MNET x MDN Tech Futures Industries",
    oneliner: "Industry networking night",
    description: "An upcoming networking event featuring industry panels, live demos, and career opportunities in emerging tech.",
    githubUrl: undefined,
    tags: ["Industry"],
    tech: [],
    members: [],
    imageUrl: "https://placehold.co/640x360.png",
    status: undefined,
    date: { start: "2026-06-15", end: "2026-06-15" },
  },
];

// ── Notion fetcher ───────────────────────────────────────────────────
async function getPortfolioData({
  filter,
  sorts,
  limit
}: {
  filter?: QueryDatabaseParameters["filter"];
  sorts?: QueryDatabaseParameters["sorts"];
  limit: number | undefined;
}): Promise<Portfolio[]> {
  const notion = getNotionClient();
  if (!notion || !NOTION_CONFIG.PORTFOLIOS_DB_ID) {
    console.warn("Notion client or PORTFOLIOS_DB_ID unavailable — returning dummy data");
    return [];
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

  if (limit === undefined) {
    return portfolios;
  }

  return portfolios.slice(0, limit);
}

export async function getFeaturedPortfolios(limit? : number) {
  try {
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
    const data = await getPortfolioData({ filter, sorts, limit });
    if (data.length > 0) return data;
  } catch (error) {
    console.error("Error fetching featured portfolios, using fallback:", error);
  }
  return (limit ? DUMMY_PROJECTS.slice(0, limit) : DUMMY_PROJECTS);
}

export async function getActivePortfolios(limit? : number) {
  try {
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
    const data = await getPortfolioData({ filter, sorts, limit });
    if (data.length > 0) return data;
  } catch (error) {
    console.error("Error fetching active portfolios, using fallback:", error);
  }
  return (limit ? DUMMY_PROJECTS.slice(0, limit) : DUMMY_PROJECTS);
}

export async function getAllEventsPortfolios(limit? : number) {
  try {
    const filter: QueryDatabaseParameters["filter"] = {
      and: [
        {
          property: "Parent Portfolio",
          relation: {
            contains: "1a81d8933ee3806b92bfef94fd02634e",
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
    const data = await getPortfolioData({ filter, sorts, limit });
    if (data.length > 0) return data;
  } catch (error) {
    console.error("Error fetching all events, using fallback:", error);
  }
  const all = [...DUMMY_UPCOMING_EVENTS, ...DUMMY_PAST_EVENTS];
  return (limit ? all.slice(0, limit) : all);
}

export async function getPastEventPortfolios(limit? : number) {
  try {
    const filter: QueryDatabaseParameters["filter"] = {
      and: [
        {
          property: "Parent Portfolio",
          relation: {
            contains: "1a81d8933ee3806b92bfef94fd02634e",
          },
        },
        {
          property: "Dates",
          date: {
            before: new Date().toISOString(),
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
    const data = await getPortfolioData({ filter, sorts, limit });
    if (data.length > 0) return data;
  } catch (error) {
    console.error("Error fetching past events, using fallback:", error);
  }
  return (limit ? DUMMY_PAST_EVENTS.slice(0, limit) : DUMMY_PAST_EVENTS);
}

export async function getUpcomingEventPortfolios(limit? : number) {
  try {
    const filter: QueryDatabaseParameters["filter"] = {
      and: [
        {
          property: "Parent Portfolio",
          relation: {
            contains: "1a81d8933ee3806b92bfef94fd02634e",
          },
        },
        {
          property: "Dates",
          date: {
            after: new Date().toISOString(),
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
    const data = await getPortfolioData({ filter, sorts, limit });
    if (data.length > 0) return data;
  } catch (error) {
    console.error("Error fetching upcoming events, using fallback:", error);
  }
  return (limit ? DUMMY_UPCOMING_EVENTS.slice(0, limit) : DUMMY_UPCOMING_EVENTS);
}