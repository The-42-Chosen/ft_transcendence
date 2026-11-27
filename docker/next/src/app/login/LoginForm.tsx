"use client";

import AuthCard from "@/components/reusables/AuthCard";
import AuthInput from "@/components/reusables/AuthInput";
import Button from "@/components/reusables/Button";
import { useLanguage } from "@/i18n/LanguageContext";

type LoginFormProps = {
  action: (formData: FormData) => Promise<void>;
  error?: string;
};

export default function LoginForm({ action, error }: LoginFormProps) {
  const { t } = useLanguage();

  return (
    <AuthCard
      title={t.auth.loginTitle}
      footerText={t.auth.noAccount}
      footerLinkText={t.auth.createAccountLink}
      footerHref="/register"
    >
      <form action={action} className="flex flex-col gap-4">
        <AuthInput
          id="email"
          name="email"
          type="email"
          label={t.auth.email}
          placeholder="TontonsForkers@mail.com"
          required
        />

        <AuthInput
          id="password"
          name="password"
          type="password"
          label={t.auth.password}
          placeholder="••••••••"
          required
        />

        {error === "CredentialsSignin" && (
          <p role="alert" className="text-center font-agent text-xs text-(--color-brand-red)">
            {t.auth.errorCredentials}
          </p>
        )}

        {error === "Default" && (
          <p role="alert" className="text-center font-agent text-xs text-(--color-brand-red)">
            {t.auth.errorDefault}
          </p>
        )}

        <Button type="submit" variant="action" className="mt-2 w-full uppercase">
          {t.auth.loginSubmit}
        </Button>
      </form>
    </AuthCard>
  );
}