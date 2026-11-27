"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/reusables/AuthCard";
import AuthInput from "@/components/reusables/AuthInput";
import Button from "@/components/reusables/Button";
import { useLanguage } from "@/i18n/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? t.auth.errorCreate);
        return;
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError(t.auth.errorDefault);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title={t.auth.registerTitle}
      footerText={t.auth.hasAccount}
      footerLinkText={t.auth.loginLink}
      footerHref="/login"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          id="email"
          type="email"
          label={t.auth.email}
          placeholder="TontonsForkers@mail.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <AuthInput
          id="username"
          type="text"
          label={t.auth.username}
          placeholder="Les Tontons Forkers"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          minLength={3}
        />

        <AuthInput
          id="password"
          type="password"
          label={t.auth.password}
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />

        {error && (
          <p role="alert" className="text-center font-agent text-xs text-(--color-brand-red)">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="action"
          disabled={loading}
          className="mt-2 w-full uppercase"
        >
          {loading ? t.auth.registerLoading : t.auth.registerSubmit}
        </Button>
      </form>
    </AuthCard>
  );
}