import { notFound, redirect } from 'next/navigation';
import Footer from '@/components/commons/Footer';
import Header from '@/components/commons/Header';
import Board from '@/components/reusables/Board';
import { ClueProvider } from '@/components/reusables/ClueContext';
import GameOverModal from '@/components/reusables/GameOverModal';
import GameOverSetup from '@/components/reusables/GameOverSetup';
import { audienceOf } from '@/lib/game';
import { seatBoard } from '@/lib/lobby';
import { currentSeat, getRoom } from '@/lib/rooms';

type Parameters = {
  params: Promise<{ code: string }>;
};

export default async function GamePage({ params }: Parameters) {
  const { code } = await params;
  const room = getRoom(code);

  if (!room) {
    notFound();
  }
  if (room.status !== "playing") {
    redirect(`/room/${room.code}`);
  }

  // Seat saved in the lobby, unknown players watch as spectators
  const playerSeat = await currentSeat(room);
  const board = seatBoard(playerSeat);

  return (
    <main className="min-h-screen text-center">
      <Header/>
      <ClueProvider roomCode={room.code} seat={playerSeat} initialState={room.viewFor(audienceOf(playerSeat))}>
        <Board type={board.type} team={board.team} words={room.words} colors={room.colors}/>
        <GameOverSetup/>
        <GameOverModal words={room.words}/>
      </ClueProvider>
      <Footer/>
    </main>
  );
}
