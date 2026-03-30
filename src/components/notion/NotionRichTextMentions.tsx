"use server"

import { getUserById } from "@/lib/notion/pages";

const UserMention = async ({ userId, annotationsClasses }: { userId: string; annotationsClasses: string }) => {
	// TODO: Probably change this to an API or server action so that Notion components are not bound to server rendering
	const user = await getUserById(userId);

	return (
		<span data-mention className={annotationsClasses}>
			&#64;{user ? user.name : "Unknown User"}
		</span>
	);
}

export { UserMention };