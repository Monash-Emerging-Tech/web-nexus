import { HeadingBlock } from "@/lib/notion/types";
import NotionRichText from "./NotionRichText";

const NotionHeading = ({
	block, 
	className="text-gray-800 [&_[data-link]]:text-gray-500 [&_[data-link]]:underline" 
} : { 
	block: HeadingBlock, 
	className?: string 
}) => {
	if (block.type === "heading_1") {
		return (
			<h1 className={className}>
				{block.heading_1.rich_text.map((text, index) => (
					<NotionRichText key={index} richText={text} />
				))}
			</h1>
		);
	}
	if (block.type === "heading_2") {
		return (
			<h2 className={className}>
				{block.heading_2.rich_text.map((text, index) => (
					<NotionRichText key={index} richText={text} />
				))}
			</h2>
		);
	}
	if (block.type === "heading_3") {
		return (
			<h3 className={className}>
				{block.heading_3.rich_text.map((text, index) => (
					<NotionRichText key={index} richText={text} />
				))}
			</h3>
		);
	}
	if (block.type === "heading_4") {
		return (
			<h4 className={className}>
				{block.heading_4.rich_text.map((text, index) => (
					<NotionRichText key={index} richText={text} />
				))}
			</h4>
		);
	}

	return null
}

export default NotionHeading;