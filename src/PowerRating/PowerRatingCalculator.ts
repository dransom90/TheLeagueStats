/*
Power Ratings ⚡

Think of this as your team’s true power level — not just how many cheap wins you’ve scraped together. The formula blends:

Average Score (60%) – your steady output.

Highs + Lows (20%) – those monster weeks… and the stinkers.

Win Percentage (20%) – because at some point, actually winning matters.

The result: a number that tells us what your squad is really capable of dropping on any given weekend. It rewards consistency, exposes flukes, and keeps “lucky” teams in check.

⚠️ Heads up: Don’t start flexing your Power Rating until at least 3 weeks in — before that, it’s basically astrology.
*/

import type { LeagueData, Team } from "../lib/LeagueDataTypes";
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

        console.log("Calculating power rating for ", team.name);

        const wins = team.record.overall.wins;
        console.log("wins: ", wins);

        const losses = team.record.overall.losses;
        console.log("losses: ", losses);

        const pointsFor = team.record.overall.pointsFor;
        console.log("points for: ", pointsFor);

        const percentage = team.record.overall.percentage;
        console.log("percentage: ", percentage);

        const high = highLows[team.id].high;
        console.log("high score: ", high);

        const low = highLows[team.id].low;
        console.log("low score: ", low);

        const average = pointsFor / (wins + losses);
        console.log("average score: ", average);

        const powerRating = (average * .6) + ((high + low) * .2) + ((percentage * 400) / 10);

        powerRatings.push({teamName: team.name, powerRating: powerRating});
    });

    return powerRatings;
}