import BoardTeam from '@/components/reusables/BoardTeam';
import RoleSection from '@/components/reusables/RoleSection';
import { cn } from '@/lib/cn';
import { MAX_SPYMASTERS, teamStyles, type Seat, type TeamColor, type TeamRoster } from '@/lib/lobby';

type Parameters = {
	team: TeamColor;
	roster: TeamRoster;
	seat: Seat | null;
	onJoin?: (seat: Seat) => void;
};

export default function TeamPanel({team, roster, seat, onJoin}: Parameters) {
	return (
		<div className={cn("flex flex-col gap-5 rounded-2xl border-2 p-4", teamStyles[team].panel)}>
			<BoardTeam team={team}/>
			<RoleSection
				title="Spymasters"
				team={team}
				players={roster.spymasters}
				isYou={seat === `${team}-spymaster`}
				max={MAX_SPYMASTERS}
				onJoin={onJoin && (() => onJoin(`${team}-spymaster`))}
			/>
			<div className="h-px bg-black/10"/>
			<RoleSection
				title="Operatives"
				team={team}
				players={roster.operatives}
				isYou={seat === `${team}-operative`}
				onJoin={onJoin && (() => onJoin(`${team}-operative`))}
			/>
		</div>
	);
}
