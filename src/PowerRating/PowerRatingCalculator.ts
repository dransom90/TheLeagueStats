import type { LeagueData, Schedule, Team } from "../lib/LeagueDataTypes";
import type { TeamPowerRating } from "./PowerRatingTypes";

// Get high and low scores for each team in a season
function getTeamHighLowScores(leagueData: LeagueData) {
  if (!leagueData || !leagueData.schedule) return {};

  const results: Record<
    string,
    { teamId: number; high: number; low: number }
  > = {};

  leagueData.schedule.forEach((matchup: Schedule) => {
    const { home, away } = matchup;

    [home, away].forEach((team) => {
      if (!team || team.totalPoints == null) return;

      const teamId = team.teamId;
      const score = team.totalPoints;

      if (!results[teamId]) {
        results[teamId] = { teamId, high: score, low: score };
      } else {
        results[teamId].high = Math.max(results[teamId].high, score);
        results[teamId].low = Math.min(results[teamId].low, score);
      }
    });
  });

  return results;
}


export function calculatePowerRatings(leagueData: LeagueData): TeamPowerRating[]{

    const powerRatings: TeamPowerRating[] = [];
    const highLows = getTeamHighLowScores(leagueData);

    leagueData.teams.forEach((team: Team) => {

        const wins = team.record.overall.wins;
        const losses = team.record.overall.losses;
        const pointsFor = team.record.overall.pointsFor;
        const percentage = team.record.overall.percentage;
        const high = highLows[team.id].high;
        const low = highLows[team.id].low;
        const average = pointsFor / (wins + losses);
        const powerRating = (average * .6) + ((high + low) * .2) + ((percentage * 400) / 10);
        powerRatings.push({teamName: team.name, powerRating: powerRating});
    });

    return powerRatings;
}