import { notFound } from 'next/navigation';
import Footer from '@/components/commons/Footer';
import Header from '@/components/commons/Header';
import WaitingRoom from '@/components/reusables/WaitingRoom';
import { ROLES, type Role } from '@/lib/lobby';
import { getRoom } from '@/lib/rooms';

type Parameters = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ role?: string }>;
};

export default async function RoomPage({ params, searchParams }: Parameters) {
  const { code } = await params;
  const { role } = await searchParams;
  const room = getRoom(code);

  if (!room) {
    notFound();
  }

  // TODO: Take the role from the logged user once auth is done
  const userRole: Role = ROLES.includes(role as Role) ? (role as Role) : "player";

  return (
    <main className="min-h-screen text-center">
      <Header/>
      <WaitingRoom role={userRole} roomCode={room.code}/>
      <Footer/>
    </main>
  );
}
