import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "border border-gray-300 text-gray-900 hover:bg-gray-100",
  // Big amber call to action used for game steps (Play, End turn, Continue)
  action: "rounded-full bg-amber-500 px-10 py-3 font-display text-2xl tracking-widest text-white shadow-lg transition hover:scale-105 hover:bg-amber-600 active:bg-amber-700 disabled:hover:scale-100 disabled:hover:bg-amber-500",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export default function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-md px-4 py-2 font-medium transition-colors disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
