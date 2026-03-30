import { RichText, RichTextAnnotations } from "@/lib/notion/types";
import { UserMention } from "./NotionRichTextMentions";

const getAnnotationClasses = (annotations: RichTextAnnotations) =>
  [
	annotations.bold && "font-bold",
	annotations.italic && "italic",
	annotations.underline && "underline",
	annotations.strikethrough && "line-through",
	annotations.code && "font-mono bg-gray-100 px-1 rounded",
	annotations.color !== "default" && `text-${annotations.color}-500`,
  ]
	.filter(Boolean)
	.join(" ");

export default function NotionRichText({ richText } : { richText: RichText }) {
	
	if (richText.type === "text") {
		if (richText.text.link) {
			return (
				<a
					href={richText.text.link.url}
					data-link
					className={getAnnotationClasses(richText.annotations)}
				>
					{richText.text.content}
				</a>
			);
		}
		return (
			<span className={getAnnotationClasses(richText.annotations)}>
				{richText.text.content}
			</span>
		);
	}

	if (richText.type === "mention") {
		if (richText.mention.type === "user") {
			return (
				<UserMention userId={richText.mention.user.id} annotationsClasses={getAnnotationClasses(richText.annotations)} />
			);
		}
	}

	return null;
}