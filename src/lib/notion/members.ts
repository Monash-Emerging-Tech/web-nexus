import { getNotionClient, NOTION_CONFIG } from "./client";
import { type QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import { type MemberPageObject, Member } from "../notion/types";

// ── Dummy data fallback ──────────────────────────────────────────────
const DUMMY_LEADS: Member[] = [
  { id: "d-lead-1", name: "Team Lead A", role: "Team Lead", quote: "Building the future.", department: ["Projects"], icon: "👤" },
  { id: "d-lead-2", name: "Project Lead B", role: "Project Lead", quote: "Ship it!", department: ["Projects"], icon: "🚀" },
  { id: "d-lead-3", name: "Operation Lead C", role: "Operation Lead", quote: "Smooth operations.", department: ["Operations"], icon: "⚙️" },
  { id: "d-lead-4", name: "Marketing Lead D", role: "Marketing Lead", quote: "Spread the word.", department: ["Marketing"], icon: "📢" },
  { id: "d-lead-5", name: "Education Lead E", role: "Education Lead", quote: "Learn and teach.", department: ["Education"], icon: "📚" },
];

const DUMMY_SENIOR_MEMBERS: Member[] = [
  { id: "d-senior-1", name: "Senior Member F", role: "Senior Member", quote: "", department: ["Projects"], icon: "⭐" },
  { id: "d-senior-2", name: "Senior Member G", role: "Senior Member", quote: "", department: ["Marketing"], icon: "⭐" },
  { id: "d-senior-3", name: "Senior Member H", role: "Senior Member", quote: "", department: ["Operations"], icon: "⭐" },
];

const DUMMY_ACADEMIC_ADVISORS: Member[] = [
  { id: "d-adv-1", name: "Dr. Advisor I", role: "Academic Advisor", quote: "", department: ["Academic Advisors"], icon: "🎓" },
  { id: "d-adv-2", name: "Prof. Advisor J", role: "Academic Advisor", quote: "", department: ["Academic Advisors"], icon: "🎓" },
];

const DUMMY_DEPT_MEMBERS: Record<string, Member[]> = {
  Marketing: [
    { id: "d-mkt-1", name: "Marketing Member K", role: "Member", quote: "", department: ["Marketing"], icon: "📱" },
    { id: "d-mkt-2", name: "Marketing Member L", role: "Member", quote: "", department: ["Marketing"], icon: "📱" },
  ],
  Education: [
    { id: "d-edu-1", name: "Education Member M", role: "Member", quote: "", department: ["Education"], icon: "📖" },
    { id: "d-edu-2", name: "Education Member N", role: "Member", quote: "", department: ["Education"], icon: "📖" },
  ],
  Projects: [
    { id: "d-proj-1", name: "Projects Member O", role: "Member", quote: "", department: ["Projects"], icon: "💻" },
    { id: "d-proj-2", name: "Projects Member P", role: "Member", quote: "", department: ["Projects"], icon: "💻" },
    { id: "d-proj-3", name: "Projects Member Q", role: "Member", quote: "", department: ["Projects"], icon: "💻" },
  ],
  Operations: [
    { id: "d-ops-1", name: "Operations Member R", role: "Member", quote: "", department: ["Operations"], icon: "🔧" },
    { id: "d-ops-2", name: "Operations Member S", role: "Member", quote: "", department: ["Operations"], icon: "🔧" },
  ],
};

// ── Notion fetcher ───────────────────────────────────────────────────

// Team member data
async function getMemberDataPublic({
  filter,
  sorts,
}: {
  filter?: QueryDatabaseParameters["filter"];
  sorts?: QueryDatabaseParameters["sorts"];
}): Promise<Member[]> {
  const notion = getNotionClient();
  if (!notion || !NOTION_CONFIG.MEMBERS_DB_ID) {
    console.warn("Notion client or MEMBERS_DB_ID unavailable — returning empty");
    return [];
  }
  const members: Member[] = [];
  const response = await notion.databases.query({
    database_id: NOTION_CONFIG.MEMBERS_DB_ID,
    filter,
    sorts,
  });

  for (const result of response.results) {
    try {
      const memberpage = result as MemberPageObject;
      members.push({
        id: memberpage.id,
        name: memberpage["properties"]["Name"]["title"][0]?.["text"][
          "content"
        ],
        role:
          memberpage["properties"]["Role"]["multi_select"][0]?.["name"],
        quote:
          memberpage["properties"]["Quote"]["rich_text"][0]?.["text"][
            "content"
          ],
        department:
          memberpage["properties"]["Department"]["multi_select"].map(
            (item) => item.name
          ),
        icon: (
          memberpage.icon?.type === "external" 
          ? memberpage.icon.external.url 
          : memberpage.icon?.type === "file"
            ? memberpage.icon.file.url
            : memberpage.icon?.type === "emoji"
              ? memberpage.icon.emoji
              : undefined
        ),
      });
    } catch (error) {
      console.error("Error processing members page:", error);
    }
  }
  return members;
}

export async function getActiveMembers() {
  try {
    const filter: QueryDatabaseParameters["filter"] = {
      and: [
        {
          property: "Department",
          multi_select: {
            does_not_contain: "Away",
          },
        },
        {
          property: "Department",
          multi_select: {
            does_not_contain: "Alumni",
          },
        },
        {
          property: "Department",
          multi_select: {
            does_not_contain: "Academic Advisors",
          },
        },
      ],
    };
    const data = await getMemberDataPublic({ filter });
    if (data.length > 0) return data;
  } catch (error) {
    console.error("Error fetching active members, using fallback:", error);
  }
  return [...DUMMY_LEADS, ...DUMMY_SENIOR_MEMBERS];
}

export async function getLeads() {
  try {
    const filter: QueryDatabaseParameters["filter"] = {
      or: [
        {
          property: "Role",
          multi_select: {
            contains: "Team Lead",
          },
        },
        {
          property: "Role",
          multi_select: {
            contains: "Marketing Lead",
          },
        },
        {
          property: "Role",
          multi_select: {
            contains: "Education Lead",
          },
        },
        {
          property: "Role",
          multi_select: {
            contains: "Project Lead",
          },
        },
        {
          property: "Role",
          multi_select: {
            contains: "Operation Lead",
          },
        },
      ],
    };
    const data = await getMemberDataPublic({ filter });
    if (data.length > 0) return data;
  } catch (error) {
    console.error("Error fetching leads, using fallback:", error);
  }
  return DUMMY_LEADS;
}

export async function getSeniorMembers() {
  try {
    const filter: QueryDatabaseParameters["filter"] = {
      or: [
        {
          property: "Role",
          multi_select: {
            contains: "Senior Member",
          },
        },
      ],
    };
    const data = await getMemberDataPublic({ filter });
    if (data.length > 0) return data;
  } catch (error) {
    console.error("Error fetching senior members, using fallback:", error);
  }
  return DUMMY_SENIOR_MEMBERS;
}

export async function getAcademicAdvisors() {
  try {
    const filter: QueryDatabaseParameters["filter"] = {
      or: [
        {
          property: "Department",
          multi_select: {
            contains: "Academic Advisors",
          },
        },
      ],
    };
    const data = await getMemberDataPublic({ filter });
    if (data.length > 0) return data;
  } catch (error) {
    console.error("Error fetching academic advisors, using fallback:", error);
  }
  return DUMMY_ACADEMIC_ADVISORS;
}

export async function getMembersByDepartment(department : string) {
  try {
    const filter: QueryDatabaseParameters["filter"] = {
      or: [
        {
          property: "Department",
          multi_select: {
            contains: department,
          },
        },
      ],
    };
    const data = await getMemberDataPublic({ filter });
    if (data.length > 0) return data;
  } catch (error) {
    console.error(`Error fetching ${department} members, using fallback:`, error);
  }
  return DUMMY_DEPT_MEMBERS[department] || [];
}

export async function getMemberById(userId: string) {
  try {
    const filter: QueryDatabaseParameters["filter"] = {
      property: "Person",
      people: {
        contains: userId
      }
    }
    const data = await getMemberDataPublic({ filter });
    if (data.length > 0) return data;
  } catch (error) {
    console.error("Error fetching member by ID, using fallback:", error);
  }
  return [];
}