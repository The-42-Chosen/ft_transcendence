import type { DefaultSession } from "next-auth";

// The session carry the account id (never the email) and sessionVersion used to revoke tokens
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      sessionVersion: number;
    } & DefaultSession["user"];
  }

  interface User {
    sessionVersion?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sessionVersion?: number;
  }
}
