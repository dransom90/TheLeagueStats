import type { Entry, LeagueData, Player, Team } from "../lib/LeagueDataTypes";
import { getOptimalLineup } from "../lib/OptimalLineupCalculator";
import { getTruePosition, getWeeksPlayed, getWeekTotal } from "../lib/utils";
import type { TeamCoachRatings, TeamPossiblePoints } from "./CoachRatingTypes";

export async function getTotalPossiblePoints(
  leagueData: LeagueData,
  selectedYear: number
): Promise<TeamPossiblePoints[]> {
  const weeks = getWeeksPlayed(leagueData);
  const teamPoints: TeamPossiblePoints[] = [];

  // 🔹 Build an array of fetch promises
  const fetches = Array.from({ length: weeks }, (_, i) =>
    fetch(
      `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${selectedYear}/segments/0/leagues/1525510?view=mMatchup&view=mMatchupScore&view=mTeam&scoringPeriodId=${i + 1}`
    ).then(async (res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json() as Promise<LeagueData>;
    })
  );

  // 🔹 Wait for all responses in parallel
  const allWeeksData = await Promise.all(fetches);

  // 🔹 Process each week’s data
  allWeeksData.forEach((weekData, weekIndex) => {
    weekData.teams.forEach((t) => {
      const rosterEntries = t.roster.entries ?? [];

      const players: Player[] = rosterEntries.map((entry: Entry) => {
        const player = entry.playerPoolEntry.player;
        player.defaultPositionId = getTruePosition(player);
        return player;
      });

      const lineup = getOptimalLineup(players, weekIndex + 1);
      const optimalPoints = getWeekTotal(lineup, weekIndex + 1);

      const existing = teamPoints.find((x) => x.teamName === t.name);
      if (existing) {
        existing.points += optimalPoints;
      } else {
        teamPoints.push({ teamName: t.name, points: optimalPoints });
      }
    });
  });

  return teamPoints;
}

export async function getCoachRatings(leagueData: LeagueData, selectedYear: number): Promise<TeamCoachRatings[]>{
    const optimalPoints = getTotalPossiblePoints(leagueData, selectedYear);
    const teamRatings: TeamCoachRatings[] = [];

    (await optimalPoints).forEach(x => {
        const team: Team | undefined = leagueData.teams.find(t => t.name === x.teamName);
        const winPercentage = team?.record.overall.percentage;
        const pointsFor = team?.record.overall.pointsFor;
        const pointsPercentage = (pointsFor ?? 0) / x.points;
        const coachRating = ((winPercentage ?? 0) + pointsPercentage) / 2;
        teamRatings.push({teamName: x.teamName, rating: coachRating});
    });

    return teamRatings;
}