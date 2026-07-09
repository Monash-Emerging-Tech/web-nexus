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
    "Status": {
      id: string;
      type: "status";
      status: {
        id: string;
        name: "Active" | "Featured" | "Inactive" | "In progress" | "Done" | string | undefined;
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
    Department?: {
      id: string;
      type: "multi_select";
      multi_select: Array<{
        id: string;
        name: string;
        color: string;
      }>;
    };
    "Parent Portfolio"?: {
      id: string;
      type: "relation";
      relation: Array<{ id: string }>;
      has_more?: boolean;
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
  status: string | undefined;
  date: {
    start: string | undefined;
    end: string | null | undefined;
  };
  parentPortfolioIds?: string[];
  department?: string[];
}



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
    "Person" : {
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
    }
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
  icon?: string | undefined;
  linkedin?: string | undefined;
}

export interface BlogPageObject
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
    "Title": {
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

export interface PageMetadata {
  id: string;
  title: string;
  in_trash: boolean;
  in_archive: boolean;
  cover: {
    type: "external";
    external: {
      url: string;
    };
  } | {
    type: "file";
    file: {
      url: string;
    };
  } | null;
}

export interface PageObject extends PageMetadata {
  content: PageBlock[];
}

export interface RichTextAnnotations {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

interface RichTextText {
  type: "text";
  text: {
    content: string;
    link: null | { url: string };
  }
  annotations: RichTextAnnotations;
}

interface RichTextMention {
  type: "mention";
  mention: RichTextMentionOpts;
  annotations: RichTextAnnotations;
}

interface RichTextEquation {
  type: "equation";
  equation: { expression: string };
  annotations: RichTextAnnotations;
}

export type RichText = RichTextText | RichTextMention | RichTextEquation;

type RichTextMentionOpts =
  | {
      type: "database";
      database: {
        id: string;
      };
    }
  | {
      type: "date";
      date: {
        start: string;
        end: string | null;
      };
    }
  | {
      type: "link_preview";
      link_preview: {
        url: string;
      };
    }
  | {
      type: "page";
      page: {
        id: string;
      };
    }
  | {
      type: "template_mention_date";
      template_mention_date: string;
    }
  | {
      type: "template_mention_user";
      template_mention_user: string;
    }
  | {
      type: "user";
      user: {
        object: "user";
        id: string;
      };
    };

interface PageBlockBase {
  id: string;
  in_trash: boolean;
  has_children: boolean;
  type: string;
}

export type PageBlock = 
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | Heading4Block
  | ParagraphBlock
  | BulletedListItemBlock

interface Heading1Block extends PageBlockBase {
  type: "heading_1";
  heading_1: {
    rich_text: RichTextText[];
    color: string;
    is_toggleable: boolean;
  };
}

interface Heading2Block extends PageBlockBase {
  type: "heading_2";
  heading_2: {
    rich_text: RichTextText[];
    color: string;
    is_toggleable: boolean;
  };
}

interface Heading3Block extends PageBlockBase {
  type: "heading_3";
  heading_3: {
    rich_text: RichTextText[];
    color: string;
    is_toggleable: boolean;
  };
}

interface Heading4Block extends PageBlockBase {
  type: "heading_4";
  heading_4: {
    rich_text: RichTextText[];
    color: string;
    is_toggleable: boolean;
  };
}

export type HeadingBlock = Heading1Block | Heading2Block | Heading3Block | Heading4Block;

export interface ParagraphBlock extends PageBlockBase {
  type: "paragraph";
  paragraph: {
    rich_text: RichText[];
    color: string;
    is_toggleable: boolean;
  };
}

export interface BulletedListItemBlock extends PageBlockBase {
  type: "bulleted_list_item";
  bulleted_list_item: {
    rich_text: RichText[];
    color: string;
  };
  children: PageBlock[];
}