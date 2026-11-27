import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
	label: string;
	id: string;
};

export default function AuthInput({
	label,
	id,
	className,
	...props
}: AuthInputProps) {
	return (
		<div className="flex flex-col gap-1.5">
			<label
				htmlFor={id}
				className="font-agent text-sm uppercase tracking-widest text-amber-800"
			>
				{label}
			</label>
			<input
				id={id}
				className={cn(
					"w-full rounded-2xl border-2 border-dashed border-amber-400 bg-white/70 px-4 py-4 font-sans text-base text-amber-900 placeholder:text-amber-300 outline-none transition focus:border-solid focus:border-amber-600 focus:bg-white",
					className,
				)}
				{...props}
			/>
		</div>
	);
}