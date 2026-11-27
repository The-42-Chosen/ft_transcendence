import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/prisma/db";
import { z } from "zod";
import { log } from "@/lib/log";
import { passwordSchema } from "@/lib/password";

const loginSchema = z.object({
  email: z.email(),
  password: passwordSchema,
});

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          log.warn({ service: "auth", msg: "login failed", reason: "invalid_input" });
          return null;
        }

        const { email, password } = parsed.data;

        const user = await db.orm.public.User
          .where({ email })
          .first();

        if (!user || !user.passwordHash) {
	  log.warn({service: 'auth', msg: 'login failed', error: 'unknown_user', user_id: user?.id});
          return null;
        }

        const passwordIsValid = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (!passwordIsValid) {
	  log.warn({service: 'auth', msg: 'login failed', error: 'bad_password', user_id: user.id});
          return null;
        }
	log.info({service: 'auth', msg: 'login successful', user_id: user.id });
        return {
          id: String(user.id),
          email: user.email,
          name: user.username,
          sessionVersion: user.sessionVersion ?? 0,
        };
      },
    }),
  ],
  callbacks: {
    // so every request can be checked for revocation (see lib/session.ts).
    async jwt({ token, user }) {
      if (user) {
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion ?? 0;
      }
      return token;
    },
    // Expose the id and sessionVersion on the session so routes resolve the account by id
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        session.user.sessionVersion =
          typeof token.sessionVersion === "number" ? token.sessionVersion : 0;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : null;
      const rawId = token?.sub;
      if (!rawId) {
        return;
      }
      const id = Number(rawId);
      if (!Number.isInteger(id) || id <= 0) {
        return;
      }
      const user = await db.orm.public.User.where({ id }).first();
      if (user) {
        await db.orm.public.User
          .where({ id })
          .update({ sessionVersion: (user.sessionVersion ?? 0) + 1 });
        log.info({ service: "auth", msg: "session revoked on signout", user_id: id });
      }
    },
  },
});
