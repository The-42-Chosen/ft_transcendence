import { db } from "@/prisma/db";
import EditProfileForm from "./EditProfileForm";
import { auth } from "@/auth"
import { redirect } from "next/navigation";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const currentUser = await db.orm.public.User
    .where({ email: session.user.email })
    .first();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.username !== username) {
    redirect(`/users/${currentUser.username}`);
  }

  const user = await db.orm.public.User
    .where({ username })
    .first();

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">
        Edit profile
      </h1>

      <EditProfileForm
        id={user.id}
        username={user.username}
        email={user.email}
        displayName={user.displayName}
      />
    </main>
  );
}