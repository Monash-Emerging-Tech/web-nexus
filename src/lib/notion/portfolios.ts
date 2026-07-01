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
export async function getPortfolios({
  department,
  timeWindow,
  limit,
}: {
  department?: "Projects" | "Education" | "Marketing";
  timeWindow?: "past" | "upcoming";
  limit?: number;
} = {}): Promise<Portfolio[]> {
  const notion = getNotionClient();
  if (!notion || !NOTION_CONFIG.PORTFOLIOS_DB_ID) {
    console.warn("Notion client or PORTFOLIOS_DB_ID unavailable — returning dummy data fallback");
    let fallback = [...DUMMY_PROJECTS, ...DUMMY_UPCOMING_EVENTS, ...DUMMY_PAST_EVENTS];
    if (department === "Projects") fallback = DUMMY_PROJECTS;
    else if (department === "Education") fallback = DUMMY_PROJECTS.filter(d => d.tags.some(t => t.toLowerCase().includes("workshop")));
    else if (department === "Marketing") {
      fallback = timeWindow === "past" ? DUMMY_PAST_EVENTS : DUMMY_UPCOMING_EVENTS;
    }
    const sortedFallback = fallback.sort((a, b) => {
      const dateA = a.date?.start ? new Date(a.date.start).getTime() : 0;
      const dateB = b.date?.start ? new Date(b.date.start).getTime() : 0;
      return dateB - dateA;
    });
    return limit ? sortedFallback.slice(0, limit) : sortedFallback;
  }

  try {
    const filters: any[] = [
      {
        or: [
          {
            property: "Status",
            status: {
              equals: "In progress",
            },
          },
          {
            property: "Status",
            status: {
              equals: "Done",
            },
          },
        ],
      },
    ];

    if (department) {
      filters.push({
        property: "Department",
        multi_select: {
          contains: department,
        },
      });
    }

    if (timeWindow === "past") {
      filters.push({
        property: "Dates",
        date: {
          before: new Date().toISOString(),
        },
      });
    } else if (timeWindow === "upcoming") {
      filters.push({
        property: "Dates",
        date: {
          after: new Date().toISOString(),
        },
      });
    }

    const queryParams: any = {
      database_id: NOTION_CONFIG.PORTFOLIOS_DB_ID,
      sorts: [
        {
          property: "Dates",
          direction: "descending",
        },
      ],
    };

    if (filters.length > 0) {
      queryParams.filter = { and: filters };
    }

    const response = await notion.databases.query(queryParams);

    const portfolios: Portfolio[] = [];
    for (const result of response.results) {
      try {
        const portfolioPage = result as PortfolioPageObject;
        portfolios.push({
          id: portfolioPage.id,
          name: portfolioPage["properties"]["Project name"]?.["title"]?.[0]?.["text"]?.["content"] || "No name",
          oneliner: portfolioPage["properties"]["One Liner"]?.["rich_text"]?.[0]?.["text"]?.["content"] || "",
          description: portfolioPage["properties"]["Description"]?.["rich_text"]?.[0]?.["text"]?.["content"] || "",
          githubUrl: portfolioPage["properties"]["GitHub Repository"]?.["url"] || undefined,
          tags: portfolioPage["properties"]["Project Type"]?.["multi_select"]?.map((item) => item.name) || [],
          tech: portfolioPage["properties"]["Tech Used"]?.["multi_select"]?.map((item) => item.name) || [],
          members: portfolioPage["properties"]["Assignee(s)"]?.["people"]?.map((item) => item.name) || [],
          imageUrl:
            (portfolioPage["cover"]?.["type"] === "external" && portfolioPage["cover"]["external"]["url"]) ||
            (portfolioPage["cover"]?.["type"] === "file" && portfolioPage["cover"]["file"]["url"]) ||
            undefined,
          status: (portfolioPage["properties"] as any)["Status"]?.["status"]?.["name"],
          date: {
            start: portfolioPage["properties"]["Dates"]?.["date"]?.["start"],
            end: portfolioPage["properties"]["Dates"]?.["date"]?.["end"],
          },
          parentPortfolioIds: (portfolioPage["properties"] as any)["Parent Portfolio"]?.["relation"]?.map(
            (item: any) => item.id
          ) || [],
          department: (portfolioPage["properties"] as any)["Department"]?.["multi_select"]?.map(
            (item: any) => item.name
          ) || [],
        });
      } catch (err) {
        console.error("Error parsing page:", err);
      }
    }

    const sortedPortfolios = portfolios.sort((a, b) => {
      const dateA = a.date?.start ? new Date(a.date.start).getTime() : 0;
      const dateB = b.date?.start ? new Date(b.date.start).getTime() : 0;
      return dateB - dateA;
    });

    return limit ? sortedPortfolios.slice(0, limit) : sortedPortfolios;
  } catch (error) {
    console.error("Error querying Notion portfolios, returning dummy data:", error);
    let fallback = [...DUMMY_PROJECTS, ...DUMMY_UPCOMING_EVENTS, ...DUMMY_PAST_EVENTS];
    if (department === "Projects") fallback = DUMMY_PROJECTS;
    else if (department === "Education") fallback = DUMMY_PROJECTS.filter(d => d.tags.some(t => t.toLowerCase().includes("workshop")));
    else if (department === "Marketing") {
      fallback = timeWindow === "past" ? DUMMY_PAST_EVENTS : DUMMY_UPCOMING_EVENTS;
    }
    const sortedFallback = fallback.sort((a, b) => {
      const dateA = a.date?.start ? new Date(a.date.start).getTime() : 0;
      const dateB = b.date?.start ? new Date(b.date.start).getTime() : 0;
      return dateB - dateA;
    });
    return limit ? sortedFallback.slice(0, limit) : sortedFallback;
  }
}

export async function getPortfolioById(id: string): Promise<Portfolio | null> {
  const notion = getNotionClient();
  if (!notion) return null;
  try {
    const response = await notion.pages.retrieve({ page_id: id });
    const portfolioPage = response as PortfolioPageObject;
    return {
      id: portfolioPage.id,
      name: portfolioPage["properties"]["Project name"]?.["title"][0]?.["text"]?.["content"] || "Unnamed Project",
      oneliner: portfolioPage["properties"]["One Liner"]?.["rich_text"][0]?.["text"]?.["content"] || "",
      description: portfolioPage["properties"]["Description"]?.["rich_text"][0]?.["text"]?.["content"] || "",
      githubUrl: portfolioPage["properties"]["GitHub Repository"]?.["url"] || undefined,
      tags: portfolioPage["properties"]["Project Type"]?.["multi_select"].map((item) => item.name) || [],
      tech: portfolioPage["properties"]["Tech Used"]?.["multi_select"].map((item) => item.name) || [],
      members: portfolioPage["properties"]["Assignee(s)"]?.["people"].map((item) => item.name) || [],
      imageUrl:
        (portfolioPage["cover"]?.["type"] === "external" &&
          portfolioPage["cover"]["external"]["url"]) ||
        (portfolioPage["cover"]?.["type"] === "file" &&
          portfolioPage["cover"]["file"]["url"]) ||
        undefined,
      status: (portfolioPage["properties"] as any)["Status"]?.["status"]?.["name"],
      date: {
        start: portfolioPage["properties"]["Dates"]?.["date"]?.["start"],
        end: portfolioPage["properties"]["Dates"]?.["date"]?.["end"],
      },
      parentPortfolioIds: (portfolioPage["properties"] as any)["Parent Portfolio"]?.["relation"]?.map(
        (item: any) => item.id
      ) || [],
      department: (portfolioPage["properties"] as any)["Department"]?.["multi_select"]?.map(
        (item: any) => item.name
      ) || [],
    };
  } catch (error) {
    console.error("Error fetching portfolio by id:", error);
    return null;
  }
}