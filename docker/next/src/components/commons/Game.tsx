import GameModal from '@/components/reusables/GameModal';
import GameInput from '@/components/reusables/GameInput';
import Board from '@/components/reusables/Board';
import { ClueProvider } from '@/components/reusables/ClueContext';
import { pickCardColors, pickRandomWords } from '@/lib/words';

export default function Game() {
  const words = pickRandomWords("fr");
  const colors = pickCardColors();

  return (
    <section className="m-2 text-center">
      <GameModal title="What do you wanna do?" text1="Create a game" text2="Join a game" text3="Spectator"/>
      <GameModal title="Pick your language?" text1="🇬🇧" text2="🇫🇷" text3="🇪🇦"/>
      <GameInput title="Room code" label="Enter the room code bellow" info="Enter the code of the room you want to reach."/>

      <ClueProvider>
        <Board type="agent" team="red" words={words} colors={colors}/>
        <Board type="spectator" team="spectator" words={words} colors={colors}/>
        <Board type="spymaster" team="red" words={words} colors={colors}/>
      </ClueProvider>
    </section>
  );
}
