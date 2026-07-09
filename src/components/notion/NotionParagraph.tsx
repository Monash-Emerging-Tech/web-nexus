import { ParagraphBlock } from "@/lib/notion/types";
import NotionRichText from "./NotionRichText";

const NotionParagraph = ({
	block, 
	className
} : { 
	block: ParagraphBlock, 
	className?: string 
}) => {
	return (
		<p className={className}>
			{block.paragraph.rich_text.map((text, index) => (
				<NotionRichText key={index} richText={text} />
			))}
		</p>
	);
}

export default NotionParagraph;