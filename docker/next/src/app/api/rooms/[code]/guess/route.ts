import { NextResponse } from "next/server";
import { aiBoard, endTurn, getRoom, isGameOver, revealWord } from "@/lib/rooms";

// TODO: Check that it is the caller team turn once auth and turns are done
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await request.json().catch(() => null);
  const room = getRoom(code);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.status !== "playing") {
    return NextResponse.json({ error: "Game not started" }, { status: 409 });
  }
  if (isGameOver(room)) {
    return NextResponse.json({ error: "Game is over" }, { status: 409 });
  }
  if (typeof body?.word !== "string") {
    return NextResponse.json({ error: "Invalid word" }, { status: 400 });
  }
  const color = revealWord(room, body.word);
  if (!color) {
    return NextResponse.json({ error: "Word not on the board or already found" }, { status: 409 });
  }
  // A word that is not the playing team's color hands over to the other team
  if (color !== room.turn) {
    endTurn(room);
  }
  const { len_red, len_blue } = aiBoard(room);
  // The whole board is only sent once the game is over
  const colors = isGameOver(room) ? room.colors : undefined;
  return NextResponse.json({ word: body.word.toUpperCase(), color, len_red, len_blue, turn: room.turn, colors });
}
