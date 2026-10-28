import Word from '@/components/commons/Word';
import ClueBar from '@/components/reusables/ClueBar';
import ClueForm from '@/components/reusables/ClueForm';
import BoardTeam from '@/components/reusables/BoardTeam';
import EndTurnButton from '@/components/reusables/EndTurnButton';
import CardLabel from '@/components/reusables/CardLabel';
import { cn } from '@/lib/cn';
import { cardColorClasses } from '@/lib/lobby';
import type { CardColor } from '@/lib/words';

type Parameters = {
  type: "agent" | "spymaster" | "spectator";
  team: "red" | "blue" | "spectator";
  words: string[];
  colors: CardColor[];
  roomCode?: string;
};

export default function Board({type, team, words, colors, roomCode}: Parameters) {
  return (
    <>
      {type === "agent" && (
        <section className="bg-amber-100 rounded-2xl p-6 m-4">
			<BoardTeam team={team}/>
			<div className="grid grid-cols-5 gap-4">
				{words.map((word) => (<Word key={word} text={word.toUpperCase()} roomCode={roomCode}/>))}
			</div>
			<ClueBar/>
			<EndTurnButton team={team}/>
		</section>
      )}
	  {type === "spectator" && (
		  <section className="bg-amber-100 rounded-2xl p-6 m-4">
			<BoardTeam team={team}/>
			<div className="grid grid-cols-5 gap-4">
          		{words.map((word) => (<Word key={word} text={word.toUpperCase()} readOnly/>))}
        	</div>
			<ClueBar/>
		</section>

      )}
      {type === "spymaster" && (
        <section className="bg-amber-100 rounded-2xl p-6 m-4">
			<BoardTeam team={team}/>
			<div className="grid grid-cols-5 gap-4">
          		{words.map((word, i) => (
            	<article key={word} className={cn("@container flex h-24 items-center justify-center overflow-hidden rounded-2xl px-3", cardColorClasses[colors[i]])}>
              		<CardLabel text={word.toUpperCase()}/>
            	</article>
          	))}
        	</div>
			<ClueForm/>
		</section>
      )}
    </>
  );
}
