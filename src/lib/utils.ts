import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { LeagueData, Player, Schedule } from "./LeagueDataTypes";

 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getActualTeamPoints(leagueData: LeagueData, teamId: number, selectedWeek: number): number{
  /*
    1. Get leagueData.schedule
    2. Filter schedule for matchups that meet matchupPeriodId === selectedWeek
    3. Check to see if the away team matches selectedTeamId
    4. If it doesn't the home team must match
    5. The correct team will have pointsByScoringPeriod[selectedWeek] defined
    */

    const schedule: Schedule[] = leagueData.schedule || [];
    const matchup: Schedule | undefined = schedule.find((m) =>
      m.matchupPeriodId === selectedWeek &&
      (m.away?.teamId === teamId || m.home.teamId === teamId)
    );

    if(!matchup) {
      return 0; // No matchup found for the selected week and team
    }

    const team = matchup.away?.teamId === teamId ? matchup.away : matchup.home;
    return team.pointsByScoringPeriod[selectedWeek.toString()] || 0; // Return points for the selected week or 0 if not defined
}

export function getWeekTotal(players: Player[], selectedWeek: number): number {
  console.log("Calculating total points for week:", selectedWeek);
  console.log("Players:", players);
  return players.reduce((total, player) => {
    const stat = player.stats.find(
      s =>
        s.scoringPeriodId === selectedWeek &&
        s.statSourceId === 0 &&
        s.statSplitTypeId === 1
    );
    return total + (stat?.appliedTotal ?? 0);
  }, 0);
}