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

export default function Board({type, team, words, colors}: Parameters) {
  return (
    <>
      {type === "agent" && (
        <section className="bg-amber-100 rounded-2xl p-6 m-4">
			<BoardTeam team={team}/>
			<div className="grid grid-cols-5 gap-4">
				{words.map((word, i) => (<Word key={word} index={i} text={word.toUpperCase()}/>))}
			</div>
			<ClueBar/>
			<EndTurnButton team={team}/>
			<RemainingWords/>
		</section>
      )}
	  {type === "spectator" && (
		  <section className="bg-amber-100 rounded-2xl p-6 m-4">
			<BoardTeam team={team}/>
			<div className="grid grid-cols-5 gap-4">
          		{words.map((word, i) => (<Word key={word} index={i} text={word.toUpperCase()} readOnly/>))}
        	</div>
			<ClueBar/>
			<RemainingWords/>
		</section>

      )}
      {type === "spymaster" && (
        <section className="bg-amber-100 rounded-2xl p-6 m-4">
			<BoardTeam team={team}/>
			<div className="grid grid-cols-5 gap-4">
          		{words.map((word, i) => (
            	<SpymasterCard key={word} index={i} text={word.toUpperCase()} color={colors[i]}/>
          	))}
        	</div>
			<ClueBar/>
			<ClueForm/>
			<RemainingWords/>
		</section>
      )}
    </>
  );
}
