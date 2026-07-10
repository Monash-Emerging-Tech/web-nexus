import { HeadingBlock, PageBlock } from "@/lib/notion/types"
import NotionParagraph from "./NotionParagraph";
import NotionHeading from "./NotionHeading";
import NotionBulletedListItem from "./NotionBulletedListItem";
import { cn } from "@/lib/utils";

type ClassNameDef = {
	paragraph?: string;
	heading?: string;
	bulleted_list_item?: string;
}

const defaultClassNameDef: ClassNameDef = {
	paragraph: "text-md font-medium text-gray-800 [&_[data-link]]:text-gray-500 [&_[data-link]]:underline [&_[data-mention]]:text-gray-600",
	heading: "mt-4 text-2xl font-semibold text-gray-800 [&_[data-link]]:text-gray-500 [&_[data-link]]:underline [&_[data-mention]]:text-gray-600",
	bulleted_list_item: "list-item list-disc ml-4",
}

const BlockHandler = ({ component, classNameDef }: { component: PageBlock; classNameDef?: ClassNameDef }) => {
	if (!component) return null;

	classNameDef = { ...defaultClassNameDef, ...classNameDef };

	if (component.type.startsWith("heading_")) {
		return <NotionHeading block={component as HeadingBlock} className={classNameDef.heading} />;
	}

	switch (component.type) {
		case "paragraph":
			return <NotionParagraph block={component} className={classNameDef.paragraph} />;
		
		case "bulleted_list_item":
			return <NotionBulletedListItem block={component} className={cn(classNameDef.bulleted_list_item, classNameDef.paragraph)} />;

		default:
			return null;
	}
}

export default BlockHandler