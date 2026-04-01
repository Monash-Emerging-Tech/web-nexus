"use server"

import { getUserById } from "@/lib/notion/pages";

type UserMentionProps = {
	userId: string;
	annotationsClasses: string;
};

const UserMention = async ({ userId, annotationsClasses }: UserMentionProps) => {
	const user = await getUserById(userId);
	return (
		<span
			data-mention
			className={annotationsClasses}
			style={{ position: "relative", display: "inline-block" }}
		>
			{/* Change this to use a popover library */}
			<style>{`
				.notion-mention-hover {
					position: absolute;
					left: 50%;
					bottom: 100%;
					transform: translateX(-50%);
					margin-bottom: 8px;
					z-index: 100;
					background: #fff;
					border: 1px solid #ccc;
					border-radius: 12px;
					padding: 8px 12px;
					box-shadow: 0 2px 8px rgba(0,0,0,0.1);
					min-width: 120px;
					width: max-content;
					visibility: hidden;
					opacity: 0;
					transition: opacity 0.15s;
					pointer-events: none;
				}
				[data-mention]:hover .notion-mention-hover {
					visibility: visible;
					opacity: 1;
					pointer-events: auto;
				}
			`}</style>
			@{user ? user.name : "Unknown User"}
			<div className="notion-mention-hover flex flex-row items-center justify-start gap-2">
				<img
					src={user?.avatar_url || "/img/logo.png"}
					alt={user?.name || "Unknown User"}
					className="w-8 h-8 rounded-full"
				/>
				<div>
					<div className="text-sm text-gray-600">Name: {user ? user.name : "Unknown User"}</div>
					<div className="text-xs text-gray-400">ID: {user ? user.id : "Unknown User"}</div>
				</div>
			</div>
		</span>
	);
};

export { UserMention };