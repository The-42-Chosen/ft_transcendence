import Profile from "@/app/profile";
import { db } from "@/prisma/db";

export default async function Home() {
  const user = await db.orm.public.User
    .where({ id: 1 })
    .first();

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>User not found</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 text-center">
      <h1 className="text-4xl font-semibold">
        All Tutors are Badass
      </h1>

      <Profile
        username={user.username}
        displayName={user.displayName}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />
    </main>
  );
}