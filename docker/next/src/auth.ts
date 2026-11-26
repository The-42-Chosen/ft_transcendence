import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/prisma/db";
import { z } from "zod";
import { log } from "@/lib/log";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
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
          log.warn({
            service: "auth",
            msg: "login failed",
            reason: "invalid_input",
          });

          return null;
        }

        const { email, password } = parsed.data;

        const user = await db.orm.public.User
          .where({ email })
          .first();

        if (!user || !user.passwordHash) {
          log.warn({
            service: "auth",
            msg: "login failed",
            error: "unknown_user",
            user_id: user?.id,
          });

          return null;
        }

        const passwordIsValid = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (!passwordIsValid) {
          log.warn({
            service: "auth",
            msg: "login failed",
            error: "bad_password",
            user_id: user.id,
          });

          return null;
        }

        log.info({
          service: "auth",
          msg: "login successful",
          user_id: user.id,
        });

        return {
          id: String(user.id),
          email: user.email,
          name: user.username,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (!token.sub) {
        return session;
      }

      const currentUser = await db.orm.public.User
        .where({
          id: Number(token.sub),
        })
        .first();

      if (!currentUser) {
        return session;
      }

      session.user.name = currentUser.username;
      session.user.email = currentUser.email;

      session.user.image = currentUser.avatarUrl
        ? `/api/users/${currentUser.id}/avatar`
        : null;

      return session;
    },
  },
});