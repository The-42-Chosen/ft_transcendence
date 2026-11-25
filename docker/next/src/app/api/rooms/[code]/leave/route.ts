import { lobbyRoute } from "@/lib/rooms";

export async function POST(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return lobbyRoute(code, (room, player) => room.leave(player.id));
}
