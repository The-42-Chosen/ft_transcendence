import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form
        action={async (formData) => {
          "use server";

          formData.set("redirectTo", "/");

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
        }}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <h1 className="text-2xl font-semibold">
          Login
        </h1>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded border px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            className="rounded border px-3 py-2"
          />
        </div>

        {error === "CredentialsSignin" && (
          <p className="text-sm text-red-500">
            Invalid email or password
          </p>
        )}

        {error === "Default" && (
          <p className="text-sm text-red-500">
            Something went wrong
          </p>
        )}

        <button
          type="submit"
          className="rounded border px-4 py-2"
        >
          Login
        </button>
      </form>
    </main>
  );
}