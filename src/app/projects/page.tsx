import { getActivePortfolios } from "@/lib/notion/portfolios";

export const revalidate = 86400;

export default async function Projects() {
  // const data = await getActivePortfolios();
  // console.log(data);
  return <div>This is the projects page</div>;
}
