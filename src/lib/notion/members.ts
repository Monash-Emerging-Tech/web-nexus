import { getNotionClient, NOTION_CONFIG } from "./client";
import { type QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import { type MemberPageObject, Member } from "../notion/types";
import { unstable_cache } from "next/cache";

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

// Strip emoji and bracket-enclosed text (e.g. "Jane Doe (President) 🎉" -> "Jane Doe")
function cleanName(name: string | undefined): string {
  if (!name) return "";
  return name
    .replace(/[([{][^)\]}]*[)\]}]/g, "")
    .replace(
      /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

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
  const results: MemberPageObject[] = [];
  let cursor: string | undefined;
  do {
    const response = await notion.databases.query({
      database_id: NOTION_CONFIG.MEMBERS_DB_ID,
      filter,
      sorts,
      start_cursor: cursor,
    });
    results.push(...(response.results as MemberPageObject[]));
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  for (const result of results) {
    try {
      const memberpage = result as MemberPageObject;
      members.push({
        id: memberpage.id,
        name: cleanName(
          memberpage["properties"]["Name"]["title"][0]?.["text"]["content"]
        ),
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
        linkedin: (() => {
          type LinkedInProperty =
            | { type: "url"; url: string | null }
            | { type: "rich_text"; rich_text: Array<{ text: { content: string } }> }
            | { type: "other" };
          const props = memberpage.properties as unknown as Record<
            string,
            LinkedInProperty | undefined
          >;
          const linkedinProp = props["LinkedIn"] || props["linkedin"] || props["LinkedIn Profile"] || props["Linkedin"];
          if (!linkedinProp) return undefined;
          if (linkedinProp.type === "url" && linkedinProp.url) {
            return linkedinProp.url;
          }
          if (linkedinProp.type === "rich_text" && linkedinProp.rich_text?.[0]?.text?.content) {
            return linkedinProp.rich_text[0].text.content;
          }
          return undefined;
        })(),
      });
    } catch (error) {
      console.error("Error processing members page:", error);
    }
  }
  return members;
}

export async function getAllMembers(): Promise<Member[]> {
  try {
    const data = await getMemberDataPublic({});
    if (data && data.length > 0) return data;
  } catch (error) {
    console.error("Error fetching all members from Notion:", error);
  }

  // Combine fallback datasets if Notion fails
  return [
    ...DUMMY_LEADS,
    ...DUMMY_SENIOR_MEMBERS,
    ...DUMMY_ACADEMIC_ADVISORS,
    ...Object.values(DUMMY_DEPT_MEMBERS).flat(),
  ];
}

// Cache for 25 minutes: Notion's signed S3 file URLs expire after ~1 hour,
// so the cache window must stay well under that or icons 403 when stale.
export const getCachedAllMembers = unstable_cache(
  async () => getAllMembers(),
  ["notion-all-members"],
  { revalidate: 1500, tags: ["notion-all-members"] }
);

export async function getActiveMembers() {
  try {
    const members = await getCachedAllMembers();
    return members.filter(
      (m) =>
        m.department &&
        !m.department.includes("Away") &&
        !m.department.includes("Alumni") &&
        !m.department.includes("Academic Advisors")
    );
  } catch (error) {
    console.error("Error filtering active members:", error);
    return [...DUMMY_LEADS, ...DUMMY_SENIOR_MEMBERS];
  }
}

export async function getLeads() {
  try {
    const members = await getCachedAllMembers();
    const leadRoles = [
      "Team Lead",
      "Marketing Lead",
      "Education Lead",
      "Project Lead",
      "Operation Lead",
    ];
    return members.filter(
      (m) => m.role && leadRoles.some((r) => m.role.includes(r))
    );
  } catch (error) {
    console.error("Error filtering leads:", error);
    return DUMMY_LEADS;
  }
}

export async function getSeniorMembers() {
  try {
    const members = await getCachedAllMembers();
    return members.filter((m) => m.role && m.role.includes("Senior Member"));
  } catch (error) {
    console.error("Error filtering senior members:", error);
    return DUMMY_SENIOR_MEMBERS;
  }
}

export async function getAcademicAdvisors() {
  try {
    const members = await getCachedAllMembers();
    return members.filter(
      (m) => m.department && m.department.includes("Academic Advisors")
    );
  } catch (error) {
    console.error("Error filtering academic advisors:", error);
    return DUMMY_ACADEMIC_ADVISORS;
  }
}

export async function getMembersByDepartment(department: string) {
  try {
    const members = await getCachedAllMembers();
    return members.filter(
      (m) => m.department && m.department.includes(department)
    );
  } catch (error) {
    console.error(`Error filtering ${department} members:`, error);
    return DUMMY_DEPT_MEMBERS[department] || [];
  }
}

export async function getMemberById(userId: string) {
  try {
    const members = await getCachedAllMembers();
    return members.filter((m) => m.id === userId);
  } catch (error) {
    console.error("Error filtering member by ID:", error);
    return [];
  }
}