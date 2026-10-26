import PlayerSlot from '@/components/reusables/PlayerSlot';
import JoinSlot from '@/components/reusables/JoinSlot';
import { cn } from '@/lib/cn';
import { teamStyles, type Side } from '@/lib/lobby';

type Parameters = {
	title: string;
	team: Side;
	players: string[];
	isYou?: boolean;
	max?: number;
	onJoin?: () => void;
};

export default function RoleSection({title, team, players, isYou = false, max = Infinity, onJoin}: Parameters) {
	const full = players.length >= max;
	return (
		<div>
			<div className="flex items-center justify-between mb-3">
				<h4 className={cn("font-agent text-sm uppercase tracking-widest", teamStyles[team].label)}>{title}</h4>
				<span className="text-xs font-semibold text-black/40">{players.length + (isYou ? 1 : 0)}</span>
			</div>
			<ul className="flex flex-wrap gap-4">
				{players.map((name) => (<PlayerSlot key={name} name={name}/>))}
				{isYou && (<PlayerSlot name="You" isYou/>)}
				{onJoin && !isYou && !full && (<JoinSlot team={team} onJoin={onJoin}/>)}
			</ul>
		</div>
	);
}
