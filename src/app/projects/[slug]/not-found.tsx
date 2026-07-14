"use client"

import { useRouter } from "next/navigation"

export default function NotFound() {
	const router = useRouter();

	return (
		<div className="bg-[#0E0E0E] w-full h-screen flex flex-col items-center justify-center text-white px-4">
			<h1 className="text-[20vw]/75 font-offbit-dot font-semibold text-center">
				<span className="text-[#DC003B]">4</span>
				<span className="text-[#DC003B]">0</span>
				<span className="text-[#DC003B]">4</span>
			</h1>
			<span onClick={() => router.back()} className="cursor-pointer text-2xl font-offbit-101 font-bold spacing-wide">
				Go Back
			</span>
		</div>
	)
}