import 'server-only';
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { currentAccount } from "@/lib/session";
import { GUEST_NAME_MAX } from "@/lib/lobby";
import { log } from "@/lib/log";

// What other players can see
export type Player = {
	id: string;              // "u:<hmac(email)>" account | "g:<uuid>" guest, never the DB id or the email
	name: string;            // displayName | username | guestname
	avatarUrl: string | null;
	guest: boolean;
};

// Server
export type SessionPlayer = Player & { email: string | null };

export class PlayerError extends Error {
	constructor(message: string, readonly status: number) {
		super(message);
	}
}

const GUEST_COOKIE = "guest";
const GUEST_MAX_AGE = 60 * 60 * 24; // 1 day

function secret(): string {
	const value = process.env.AUTH_SECRET;
	if (!value) {
		throw new Error("AUTH_SECRET is not set");
	}
	return value;
}

function sign(data: string): string {
	return createHmac("sha256", secret()).update(data).digest("base64url");
}

function accountId(id: number): string {
	return `u:${sign(`player:${id}`).slice(0, 22)}`;
}

function encodeGuest(guest: { id: string; name: string }): string {
	const data = Buffer.from(JSON.stringify(guest)).toString("base64url");
	return `${data}.${sign(data)}`;
}

function decodeGuest(value: string | undefined): { id: string; name: string } | null {
	const [data, signature] = value?.split(".") ?? [];
	if (!data || !signature) {
		return null;
	}
	const expected = Buffer.from(sign(data));
	const received = Buffer.from(signature);
	if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
		return null;
	}
	try {
		const guest = JSON.parse(Buffer.from(data, "base64url").toString());
		return typeof guest?.id === "string" && typeof guest?.name === "string" ? guest : null;
	} catch {
		return null;
	}
}

export function cleanGuestName(name: unknown): string | null {
	if (typeof name !== "string") {
		return null;
	}
	const trimmed = name.trim().slice(0, GUEST_NAME_MAX);
	return trimmed.length > 0 ? trimmed : null;
}

// Called by POST /api/guest.
export async function setGuest(name: string): Promise<Player> {
	const store = await cookies();
	const current = decodeGuest(store.get(GUEST_COOKIE)?.value);
	const guest = { id: current?.id ?? `g:${randomUUID()}`, name };
	store.set(GUEST_COOKIE, encodeGuest(guest), {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: GUEST_MAX_AGE,
	});
	log.info({ service: "game", msg: "guest created", player_id: guest.id });
	return { ...guest, avatarUrl: null, guest: true };
}

export async function getPlayer(): Promise<SessionPlayer | null> {
	const user = await currentAccount();
	if (user) {
		return {
			id: accountId(user.id),
			name: user.displayName || user.username,
			avatarUrl: user.avatarUrl ?? null,
			guest: false,
			email: user.email,
		};
	}
	const guest = decodeGuest((await cookies()).get(GUEST_COOKIE)?.value);
	if (guest) {
		return { ...guest, avatarUrl: null, guest: true, email: null };
	}
	return null;
}

export async function requirePlayer(): Promise<SessionPlayer> {
	const player = await getPlayer();
	if (!player) {
		throw new PlayerError("Unauthorized", 401);
	}
	return player;
}

// Strip the email before sending a player to a browser
export function publicPlayer({ id, name, avatarUrl, guest }: SessionPlayer): Player {
	return { id, name, avatarUrl, guest };
}
