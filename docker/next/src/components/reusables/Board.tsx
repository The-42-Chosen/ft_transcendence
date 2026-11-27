import Word from '@/components/commons/Word';
import ClueBar from '@/components/reusables/ClueBar';
import ClueForm from '@/components/reusables/ClueForm';
import BoardTeam from '@/components/reusables/BoardTeam';
import EndTurnButton from '@/components/reusables/EndTurnButton';
import RemainingWords from '@/components/reusables/RemainingWords';
import SpymasterCard from '@/components/reusables/SpymasterCard';
import type { CardColor } from '@/lib/words';

type Parameters = {
	type: "agent" | "spymaster" | "spectator";
	team: "red" | "blue" | "spectator";
	words: string[];
	colors: CardColor[];
};

const boardClass = "min-w-0 flex-1 rounded-2xl bg-amber-100 p-6";

export default function Board({ type, team, words, colors }: Parameters) {
	return (
		<>
			{type === "agent" && (
				<section className={boardClass}>
					<BoardTeam display="board" team={team}/>
					<div className="grid grid-cols-5 gap-4">
						{words.map((word, i) => (<Word key={word} index={i} text={word.toUpperCase()} />))}
					</div>
					<ClueBar />
					<EndTurnButton team={team} />
					<RemainingWords className="xl:hidden" />
				</section>
			)}
			{type === "spectator" && (
				<section className={boardClass}>
					<BoardTeam display="board" team={team} />
					<div className="grid grid-cols-5 gap-4">
						{words.map((word, i) => (<Word key={word} index={i} text={word.toUpperCase()} readOnly />))}
					</div>
					<ClueBar />
					<RemainingWords className="xl:hidden" />
				</section>

			)}
			{type === "spymaster" && (
				<section className={boardClass}>
					<BoardTeam display="board" team={team} />
					<div className="grid grid-cols-5 gap-4">
						{words.map((word, i) => (
							<SpymasterCard key={word} index={i} text={word.toUpperCase()} color={colors[i]} />
						))}
					</div>
					<ClueBar />
					<ClueForm />
					<RemainingWords className="xl:hidden" />
				</section>
			)}
		</>
	);
}
