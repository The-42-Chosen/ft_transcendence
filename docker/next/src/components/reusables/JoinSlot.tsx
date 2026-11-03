import { cn } from '@/lib/cn';
import { teamStyles, type Side } from '@/lib/lobby';

type Parameters = {
	team: Side;
	onJoin: () => void;
};

export default function JoinSlot({team, onJoin}: Parameters) {
	return (
		<li>
			<button
				type="button"
				onClick={onJoin}
				className="group flex w-16 flex-col items-center gap-1.5 bg-transparent hover:bg-transparent active:bg-transparent"
			>
				<span className={cn("flex size-14 items-center justify-center rounded-full border-2 border-dashed text-2xl transition-colors", teamStyles[team].slot)}>+</span>
				<span className="text-xs text-black/40 group-hover:text-black/70">Join</span>
			</button>
		</li>
	);
}
