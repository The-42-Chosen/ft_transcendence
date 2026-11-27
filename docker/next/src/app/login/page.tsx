import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { currentAccount } from "@/lib/session";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const currentUser = await currentAccount();

  if (currentUser) {
    redirect(`/users/${currentUser.username}`);
  }

  const { error } = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";

    const email = formData.get("email");

    if (typeof email !== "string") {
      redirect("/login?error=Default");
    }

    const user = await db.orm.public.User
      .where({ email })
      .first();

    if (user) {
      formData.set("redirectTo", `/users/${user.username}`);
    }

    try {
      await signIn("credentials", formData);
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.type === "CredentialsSignin") {
          redirect("/login?error=CredentialsSignin");
        }

        redirect("/login?error=Default");
      }

      throw error;
    }
  }

  return <LoginForm action={loginAction} error={error} />;
}