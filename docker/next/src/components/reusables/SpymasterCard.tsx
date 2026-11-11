"use client";

import { cn } from "@/lib/cn";
import CardLabel from "@/components/reusables/CardLabel";
import { useClue } from "@/components/reusables/ClueContext";
import { cardColorClasses } from "@/lib/lobby";
import type { CardColor } from "@/lib/words";

type Parameters = {
	text: string;
	index: number;
	color: CardColor;
};

const hiddenColorClasses: Record<CardColor, string> = {
	red: "bg-[rgb(var(--rgb-brand-red)/0.6)] text-black",
	blue: "bg-[rgb(var(--rgb-brand-blue)/0.6)] text-black",
	neutral: "bg-[rgba(253,230,138,0.75)] text-black",
	assassin: "bg-[rgba(0,0,0,0.45)] text-white",
};

export default function SpymasterCard({text, index, color}: Parameters) {
	const { found } = useClue();
	const isFound = found[index] ?? false;

	return (
		<article className={cn(
			"@container flex h-24 items-center justify-center overflow-hidden rounded-2xl px-3 transition-colors",
			isFound ? cardColorClasses[color] : hiddenColorClasses[color]
		)}>
			<CardLabel text={text}/>
		</article>
	);
}
