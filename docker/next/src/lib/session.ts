import "server-only";
import { auth } from "@/auth";
import { db } from "@/prisma/db";

// Single source of truth for "who is the authenticated account?".
// The account is resolved by its IMMUTABLE id (token.sub), never by email:
// an email can change owner, an id never does (constat 4).
export async function currentAccount() {
  const session = await auth();

  const rawId = session?.user?.id;
  if (!rawId) {
    return null;
  }

  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const user = await db.orm.public.User.where({ id }).first();
  if (!user) {
    return null;
  }

  const tokenVersion = session.user.sessionVersion ?? 0;
  if ((user.sessionVersion ?? 0) !== tokenVersion) {
    return null;
  }

  return user;
}
