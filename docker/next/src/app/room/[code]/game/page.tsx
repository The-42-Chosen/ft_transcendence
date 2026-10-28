import { notFound, redirect } from 'next/navigation';
import Footer from '@/components/commons/Footer';
import Header from '@/components/commons/Header';
import Board from '@/components/reusables/Board';
import { ClueProvider } from '@/components/reusables/ClueContext';
import { parseSeat, seatBoard } from '@/lib/lobby';
import { getRoom } from '@/lib/rooms';

type Parameters = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ seat?: string }>;
};

export default async function GamePage({ params, searchParams }: Parameters) {
  const { code } = await params;
  const { seat } = await searchParams;
  const room = getRoom(code);

  if (!room) {
    notFound();
  }
  if (room.status !== "playing") {
    redirect(`/room/${room.code}`);
  }

  // TODO: Take the seat from the logged user once auth is done
  const board = seatBoard(parseSeat(seat));

  return (
    <main className="min-h-screen text-center">
      <Header/>
      <ClueProvider>
        <Board type={board.type} team={board.team} words={room.words} colors={room.colors} roomCode={room.code}/>
      </ClueProvider>
      <Footer/>
    </main>
  );
}
