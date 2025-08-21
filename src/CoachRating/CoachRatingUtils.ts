import type { Entry, LeagueData, Player } from "../lib/LeagueDataTypes";
import { getOptimalLineup } from "../lib/OptimalLineupCalculator";
import { getTruePosition, getWeeksPlayed, getWeekTotal } from "../lib/utils";
import type { TeamPossiblePoints } from "./CoachRatingTypes";

export function getTotalPossiblePoints(leagueData: LeagueData): TeamPossiblePoints[]{
    const weeks = getWeeksPlayed(leagueData);
    const teams = leagueData.teams;

    const teamPoints: TeamPossiblePoints[] = [];
    
    for (let i = 1; i <= weeks; i++){
        teams.forEach(t => {
            const rosterEntries = t?.roster?.entries ?? [];
                const players: Player[] = (rosterEntries as Entry[]).map((entry) => {
                  const player = entry.playerPoolEntry.player;
                  const truePosition = getTruePosition(player);
                  player.defaultPositionId = truePosition;
                  return player;
                });
            
                const lineup = getOptimalLineup(players, i);
                const optimalPoints = getWeekTotal(lineup, i);

                const existing = teamPoints.find(x => x.teamName === t.name);
                if (existing) {
                    // ✅ update points
                    existing.points += optimalPoints;
                } else {
                    // ✅ insert new team
                    teamPoints.push({teamName: t.name, points: optimalPoints});
                }
        });
    }

    return teamPoints;
}