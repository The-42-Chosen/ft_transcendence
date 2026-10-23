import Word from '@/components/commons/Word';
import ClueBar from '@/components/reusables/ClueBar';
import ClueForm from '@/components/reusables/ClueForm';
import BoardTeam from '@/components/reusables/BoardTeam';
import { cn } from '@/lib/cn';
import type { CardColor } from '@/lib/words';

const colorClasses: Record<CardColor, string> = {
  red: "bg-(--color-brand-red) text-white",
  blue: "bg-(--color-brand-blue) text-white",
  neutral: "bg-amber-200 text-black",
  assassin: "bg-black text-white",
};

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
				{words.map((word) => (<Word key={word} text={word.toUpperCase()} />))}
			</div>
			<ClueBar/>
		</section>
      )}
	  {type === "spectator" && (
		  <section className="bg-amber-100 rounded-2xl p-6 m-4">
			<BoardTeam team={team}/>
			<div className="grid grid-cols-5 gap-4">
          		{words.map((word) => (<Word key={word} text={word.toUpperCase()} />))}
        	</div>
			<ClueBar/>
		</section>

      )}
      {type === "spymaster" && (
        <section className="bg-amber-100 rounded-2xl p-6 m-4">
			<BoardTeam team={team}/>
			<div className="grid grid-cols-5 gap-4">
          		{words.map((word, i) => (
            	<article key={word} className={cn("rounded-2xl p-8 text-center", colorClasses[colors[i]])}>
              		{word.toUpperCase()}
            	</article>
          	))}
        	</div>
			<ClueForm/>
		</section>
      )}
    </>
  );
}
