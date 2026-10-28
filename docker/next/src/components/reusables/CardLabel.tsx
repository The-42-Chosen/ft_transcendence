type Parameters = {
	text: string;
};

// Bebas Neue + tracking-wider is ~0.45em per letter, so the word fits the card
// width (100cqi) when the font size is below 100 / (0.45 * length) cqi
function fitFontSize(text: string) {
	return `min(1.875rem, ${(210 / Math.max(text.length, 1)).toFixed(1)}cqi)`;
}

export default function CardLabel({text}: Parameters) {
	return (
		<span className="block w-full whitespace-nowrap text-center font-display leading-none tracking-wider" style={{ fontSize: fitFontSize(text) }}>
			{text}
		</span>
	);
}
