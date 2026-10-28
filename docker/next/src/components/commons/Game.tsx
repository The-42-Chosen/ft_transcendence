import GameSetup from '@/components/commons/GameSetup';
import Board from '@/components/reusables/Board';
import { ClueProvider } from '@/components/reusables/ClueContext';
import { pickCardColors, pickRandomWords } from '@/lib/words';

export default function Game() {
  const words = pickRandomWords("fr");
  const colors = pickCardColors();

  return (
    <section className="m-2 text-center">
      <GameSetup/>
      <ClueProvider>
        <Board type="agent" team="red" words={words} colors={colors}/>
        <Board type="spectator" team="spectator" words={words} colors={colors}/>
        <Board type="spymaster" team="red" words={words} colors={colors}/>
      </ClueProvider>
    </section>
  );
}
