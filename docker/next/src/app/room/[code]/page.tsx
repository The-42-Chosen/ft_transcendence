import { notFound, redirect } from 'next/navigation';
import Footer from '@/components/commons/Footer';
import Header from '@/components/commons/Header';
import WaitingRoom from '@/components/reusables/WaitingRoom';
import { getPlayer } from '@/lib/player';
import { getRoom } from '@/lib/rooms';

type Parameters = {
  params: Promise<{ code: string }>;
};

export default async function RoomPage({ params }: Parameters) {
  const { code } = await params;
  const room = getRoom(code);

  if (!room) {
    notFound();
  }
  const player = await getPlayer();
  if (!player) {
    redirect('/');
  }
  // Redirect user as spectator
  room.join(player);
  if (room.status === "playing") {
    redirect(`/room/${room.code}/game`);
  }

  return (
    <main className="min-h-screen text-center">
      <Header/>
      <WaitingRoom roomCode={room.code} meId={player.id} initialLobby={room.lobbyView()}/>
      <Footer/>
    </main>
  );
}
