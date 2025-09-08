import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export interface PortfolioPageObject
  extends Omit<PageObjectResponse, "properties"> {
  properties: {
    "Project name": {
      id: string;
      type: "title";
      title: Array<{
        type: "text";
        text: {
          content: string;
          link: null | { url: string };
        };
        plain_text: string;
        href: null | string;
        annotations?: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          code: boolean;
          color: string;
        };
      }>;
    };
    "One Liner": {
      id: string;
      type: "rich_text";
      rich_text: Array<{
        type: "text";
        text: {
          content: string;
          link: null | { url: string };
        };
        plain_text: string;
        href: null | string;
      }>;
    };
    Description: {
      id: string;
      type: "rich_text";
      rich_text: Array<{
        type: "text";
        text: {
          content: string;
          link: null | { url: string };
        };
        plain_text: string;
        href: null | string;
      }>;
    };
    "GitHub Repository": {
      id: string;
      type: "url";
      url: string | null;
    };
    "Project Type": {
      id: string;
      type: "multi_select";
      multi_select: Array<{
        id: string;
        name: string;
        color: string;
      }>;
    };
    "Tech Used": {
      id: string;
      type: "multi_select";
      multi_select: Array<{
        id: string;
        name: string;
        color: string;
      }>;
    };
    "Assignee(s)": {
      id: string;
      type: "people";
      people: Array<{
        id: string;
        name: string;
        avatar_url: string | null;
        type: "person";
        person: {
          email: string;
        };
      }>;
    };
    "Web Status": {
      id: string;
      type: "select";
      select: {
        id: string;
        name: "Active" | "Featured" | "Inactive" | undefined;
        color: string;
      } | null;
    };
    Dates: {
      id: string;
      type: "date";
      date: {
        start: string;
        end: string | null;
        time_zone: string | null;
      } | null;
    };
  };
}

export interface Portfolio {
  id: string;
  name: string;
  oneliner: string;
  description: string;
  githubUrl: string | undefined;
  tags: string[];
  tech: string[];
  members: string[];
  imageUrl: string | undefined;
  status: "Active" | "Featured" | "Inactive" | undefined;
  date: {
    start: string | undefined;
    end: string | null | undefined;
  };
}

export type PortfolioData = Portfolio[];

export interface EventPageObject
  extends Omit<PageObjectResponse, "properties"> {
  properties: {
    "Event name": {
      id: string;
      type: "title";
      title: Array<{
        type: "text";
        text: {
          content: string;
          link: null | { url: string };
        };
        plain_text: string;
        href: null | string;
        annotations?: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          code: boolean;
          color: string;
        };
      }>;
    };
    "One Liner": {
      id: string;
      type: "rich_text";
      rich_text: Array<{
        type: "text";
        text: {
          content: string;
          link: null | { url: string };
        };
        plain_text: string;
        href: null | string;
      }>;
    };
    Description: {
      id: string;
      type: "rich_text";
      rich_text: Array<{
        type: "text";
        text: {
          content: string;
          link: null | { url: string };
        };
        plain_text: string;
        href: null | string;
      }>;
    };
    "Event Type": {
      id: string;
      type: "multi_select";
      multi_select: Array<{
        id: string;
        name: "External Workshop" | "Expo" | "Industry Showcase" | "Social Event" | string | undefined;
        color: string;
      }>;
      /*
      multi_select: Array<{
        id: string;
        name: string;
        color: string;
      }>;
      */
    };
    "Web Status": {
      id: string;
      type: "select";
      select: {
        id: string;
        name: "Active" | "Featured" | "Inactive" | undefined;
        color: string;
      } | null;
    };
    Dates: {
      id: string;
      type: "date";
      date: {
        start: string;
        end: string | null;
        time_zone: string | null;
      } | null;
    };
  };
}

export interface Event {
  id: string;
  name: string;
  oneliner: string;
  description: string;
  tag: "External Workshop" | "Expo" | "Industry Showcase" | "Social Event" | string | undefined;
  imageUrl: string | undefined;
  status: "Active" | "Featured" | "Inactive" | undefined;
  date: {
    start: string | undefined;
    end: string | null | undefined;
  };
}

export type EventData = Event[];

export interface MemberPageObject
  extends Omit<PageObjectResponse, "properties"> {
  properties: {
    "Name": {
      id: string;
      type: "title";
      title: Array<{
        type: "text";
        text: {
          content: string;
          link: null | { url: string };
        };
        plain_text: string;
        href: null | string;
        annotations?: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          code: boolean;
          color: string;
        };
      }>;
    };
    "Role": {
      id: string;
      type: "multi_select";
      multi_select: Array<{
        id: string;
        name: "Team Lead" | "Senior Member" | "Member" | 
        "Marketing Lead" | "Education Lead" | "Project Lead" | "Operation Lead" | "Deputy Operation Lead" |
        "Away" | "Alumni" | "Academic Advisor"
      }>;
    };
    "Quote": {
      id: string;
      type: "rich_text";
      rich_text: Array<{
        type: "text";
        text: {
          content: string;
          link: null | { url: string };
        };
        plain_text: string;
        href: null | string;
      }>;
    };
    "Department": {
      id: string;
      type: "multi_select";
      multi_select: Array<{
        id: string;
        name: "Marketing" | "Education" | "Projects" | "Operations" |
         "Away" | "Alumni" | "Academic Advisors" |
         string | undefined
        color: string;
      }>;
    };
    "Email" : {
      id: string;
      type: "email";
      email: string;
    };
    "Phone" : {
      id: string;
      type: "phone_number";
      phone_number: string;
    };
    "Discord": {
      id: string;
      type: "rich_text";
      rich_text: Array<{
        type: "text";
        text: {
          content: string;
          link: null | { url: string };
        };
        plain_text: string;
        href: null | string;
        annotations?: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          code: boolean;
          color: string;
        };
      }>;
    };
  };
}

export interface Member {
  id: string;
  name: string;
  role: string;
  quote: string;
  department: (string | undefined)[];
  email?: string | undefined;
  phone?: string | undefined;
  discord?: string | undefined;
}

export type MemberData = Member[];