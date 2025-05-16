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
        name: string;
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
  github: string;
  category: string[];
  tech: string[];
  members: string[];
  image: string;
  status: string;
  date: {
    start: string;
    end?: string;
  };
}

export type PortfolioData = Portfolio[];
