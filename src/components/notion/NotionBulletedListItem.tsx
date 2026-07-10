import { BulletedListItemBlock } from "@/lib/notion/types";
import NotionRichText from "./NotionRichText";
import BlockHandler from "./BlockHandler";

const NotionBulletedListItem = ({
	block, 
	className
} : { 
	block: BulletedListItemBlock, 
	className?: string 
}) => {
	return (
		<div className={className}>
			{block.bulleted_list_item.rich_text.map((text, index) => (
				<NotionRichText key={index} richText={text} />
			))}
			{block.children && block.children.length > 0 && (
				<div className="ml-4">
					{block.children.map((child) => (
						<BlockHandler key={child.id} component={child} />
					))}
				</div>
			)}
		</div>
	);
}

export default NotionBulletedListItem;