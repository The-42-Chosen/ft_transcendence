import { readFileSync } from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";

export function pickRandomWords(language: "en" | "fr" | "es"): string[] {
	const file = path.join(process.cwd(), "src/app/word_lists", `words_${language}.txt`);
	const content = readFileSync(file, "utf-8");
	const allWords = content.split(/\r?\n/).map((w) => w.trim()).filter(Boolean);
	const words = [...new Set(allWords)];

	if (words.length < 25) {
		throw new Error("Not enough words in file");
	}

	for (let i = 0; i < 25; i++) {
		const j = randomInt(i, words.length);
		[words[i], words[j]] = [words[j], words[i]];
	}

	return words.slice(0, 25);
}

export type CardColor = "red" | "blue" | "neutral" | "assassin";

export function pickCardColors(): CardColor[] {
	const [first, second]: CardColor[] = randomInt(2) === 0 ? ["red", "blue"] : ["blue", "red"];
	const colors: CardColor[] = [
		...Array<CardColor>(9).fill(first),
		...Array<CardColor>(8).fill(second),
		...Array<CardColor>(7).fill("neutral"),
		"assassin",
	];

	for (let i = colors.length - 1; i > 0; i--) {
		const j = randomInt(i + 1);
		[colors[i], colors[j]] = [colors[j], colors[i]];
	}

	return colors;
}
