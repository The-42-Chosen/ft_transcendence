import UserCard from '@/components/reusables/UserCard';
import { cn } from '@/lib/cn';
import { AI_PLAYER } from '@/lib/lobby';

type Parameters = {
	name: string;
	isYou?: boolean;
};

export default function PlayerSlot({name, isYou = false}: Parameters) {
	const isAi = name === AI_PLAYER;
	return (
		<li className="flex w-16 flex-col items-center gap-1.5 transition-transform hover:-translate-y-0.5">
			<div className={cn("relative rounded-full shadow-md", isYou ? "ring-4 ring-amber-500" : isAi ? "ring-2 ring-cyan-400" : "ring-2 ring-white")}>
				{isAi ? (
					<div className="flex size-14 items-center justify-center rounded-full bg-slate-800 text-3xl" aria-hidden>🤖</div>
				) : (
					<UserCard username={name} size={56}/>
				)}
				{isAi && (
					<span className="absolute -right-1.5 -bottom-1 rounded-full bg-cyan-400 px-1.5 text-[10px] font-bold leading-4 text-slate-900 shadow">AI</span>
				)}
			</div>
			<span className={cn("w-full truncate text-center text-xs", isYou ? "font-bold text-amber-800" : isAi ? "font-semibold text-cyan-800" : "font-medium text-black/70")} title={name}>{isYou ? "You" : name}</span>
		</li>
	);
}
