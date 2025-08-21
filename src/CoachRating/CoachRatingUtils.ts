import type { Entry, LeagueData, Player, Team } from "../lib/LeagueDataTypes";
import { getOptimalLineup } from "../lib/OptimalLineupCalculator";
import { getTruePosition, getWeeksPlayed, getWeekTotal } from "../lib/utils";
import type { TeamCoachRatings, TeamPossiblePoints } from "./CoachRatingTypes";

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

export function getCoachRatings(leagueData: LeagueData): TeamCoachRatings[]{
    const optimalPoints = getTotalPossiblePoints(leagueData);
    const teamRatings: TeamCoachRatings[] = [];

    optimalPoints.forEach(x => {
        const team: Team | undefined = leagueData.teams.find(t => t.name === x.teamName);
        const winPercentage = team?.record.overall.percentage;
        const pointsFor = team?.record.overall.pointsFor;
        const coachRating = (winPercentage ?? 0 + (pointsFor ?? 0 / x.points)) / 2;
        teamRatings.push({teamName: x.teamName, rating: coachRating});
    });

    return teamRatings;
}