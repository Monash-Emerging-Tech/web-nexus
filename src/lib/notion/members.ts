import { getNotionClient, NOTION_CONFIG } from "./client";
import { type QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import { type MemberPageObject, Member } from "../notion/types";

// Team member data
async function getMemberDataPublic({
  filter,
  sorts,
}: {
  filter?: QueryDatabaseParameters["filter"];
  sorts?: QueryDatabaseParameters["sorts"];
}): Promise<Member[]> {
  const notion = getNotionClient();
  if (!NOTION_CONFIG.MEMBERS_DB_ID) {
    throw new Error("NOTION_MEMBERS_DB_ID is not defined");
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
  return getMemberDataPublic({ filter });
}

export async function getLeads() {
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
  return getMemberDataPublic({ filter });
}

export async function getSeniorMembers() {
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
  return getMemberDataPublic({ filter });
}

export async function getAcademicAdvisors() {
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
  return getMemberDataPublic({ filter });
}

export async function getMembersByDepartment(department : string) {
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
  return getMemberDataPublic({ filter });
}