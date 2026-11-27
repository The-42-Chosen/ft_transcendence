import 'server-only';
import { createHmac } from "node:crypto";
import type { Seat } from "@/lib/lobby";

// Proves to the realtime service who opens a socket, checked by verifyToken() in docker/realtime/src/server.ts
export type RealtimeClaims = {
	code: string;
	playerId: string | null;  // null: unknown visitor, can watch but not chat
	name: string | null;
	seat: Seat;
	exp: number;              // ms timestamp
};

// Only used during the socket handshake, a reconnection asks for a new one
const TOKEN_TTL = 60_000;

function secret(): string {
	const value = process.env.AUTH_SECRET;
	if (!value) {
		throw new Error("AUTH_SECRET is not set");
	}
	return value;
}

export function signRealtimeToken(claims: Omit<RealtimeClaims, "exp">): string {
	const data = Buffer.from(JSON.stringify({ ...claims, exp: Date.now() + TOKEN_TTL })).toString("base64url");
	// "realtime:" prefix so this signature can never be reused as another token (guest cookie...)
	const signature = createHmac("sha256", secret()).update(`realtime:${data}`).digest("base64url");
	return `${data}.${signature}`;
}
