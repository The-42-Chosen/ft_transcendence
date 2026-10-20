import { db } from "@/prisma/db";
import EditProfileForm from "./EditProfileForm";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return <p>Invalid user id</p>;
  }

  const user = await db.orm.public.User
    .where({ id: userId })
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