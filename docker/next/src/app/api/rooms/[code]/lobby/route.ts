import { lobbyRoute } from "@/lib/rooms";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return lobbyRoute(code, () => {});
}
