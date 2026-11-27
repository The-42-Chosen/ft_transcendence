import 'server-only';
import { createHmac } from "node:crypto";
import type { Seat } from "@/lib/lobby";


export type RealtimeClaims = {
	code: string;
	playerId: string | null;  	// player, guest, or null -> spectator
	name: string | null;		// Display Name
	seat: Seat;			
	exp: number;              
};

//Time to Live
const TOKEN_TTL = 60_000; 

function secret(): string {
	const value = process.env.AUTH_SECRET;
	if (!value) {
		throw new Error("AUTH_SECRET is not set");
	}
	return value;
}

export function signRealtimeToken(claims: Omit<RealtimeClaims, "exp">): string { // Need RealtimeClaims without exp
	const data = Buffer.from(JSON.stringify({ ...claims, exp: Date.now() + TOKEN_TTL })).toString("base64url");
	const signature = createHmac("sha256", secret()).update(`realtime:${data}`).digest("base64url");
	return `${data}.${signature}`;
}
