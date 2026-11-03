import { cn } from "@/lib/cn";

type Team = "red" | "blue" | "spectator";

const teamClasses: Record<Team, string> = {
	red: "bg-(--color-brand-red) text-white",
	blue: "bg-(--color-brand-blue) text-white",
	spectator: "bg-amber-200 text-black",
};

type Parameters = {
	team: Team;
};

export default function BoardTeam ({team}: Parameters) {
	return (
		<h3 className={cn("font-display text-2xl tracking-widest uppercase rounded-4xl py-1.5 mb-3", teamClasses[team])}>Team {team}</h3>
	);
}
