import type { LeagueData, Team } from "../lib/LeagueDataTypes";
import type { AwardRecipient } from "./AwardTypes";
import { getOptimalLineup } from "../lib/OptimalLineupCalculator";
import { getTruePosition, getWeekTotal, getActualTeamPoints } from "../lib/utils";

type WeekTeam = {
  teamName: string;
  teamId: number;
  points: number;
  won: boolean;
  victoryMargin?: number;
};
function getWeekTeams(leagueData: LeagueData, week: number): WeekTeam[] {
  const teams = leagueData.teams.map((team) => ({
    teamId: team.id,
    teamName: team.name,
  }));

  const getTeam = (id: number) => teams.find((t) => t.teamId === id);

  const schedule = leagueData.schedule;
  const weekMatchups = schedule.filter((matchup) => matchup.matchupPeriodId === week);

  const weekTeams: WeekTeam[] = [];

  weekMatchups.forEach((m) => {
    if (!m.home) return;

    if (m.away) {
      const homeTeam = getTeam(m.home.teamId);
      const awayTeam = getTeam(m.away.teamId);
      if (!homeTeam || !awayTeam) return;

      const homeWon = m.home.totalPoints > m.away.totalPoints;
      const awayWon = m.away.totalPoints > m.home.totalPoints;
      const victoryMargin = Math.abs(m.home.totalPoints - m.away.totalPoints);

      weekTeams.push({ teamName: homeTeam.teamName, teamId: m.home.teamId, points: m.home.totalPoints, won: homeWon, victoryMargin: homeWon ? victoryMargin : undefined });
      weekTeams.push({ teamName: awayTeam.teamName, teamId: m.away.teamId, points: m.away.totalPoints, won: awayWon, victoryMargin: awayWon ? victoryMargin : undefined });
    } else {
      // Bye week
      const team = getTeam(m.home.teamId);
      if (team) {
        weekTeams.push({ teamName: team.teamName, teamId: m.home.teamId, points: m.home.totalPoints, won: false });
      }
    }
  });

  return weekTeams;
}

function findTeamByPoints(
  leagueData: LeagueData,
  week: number,
  findHighest: boolean
): AwardRecipient {
  const weekTeams = getWeekTeams(leagueData, week);
  if (weekTeams.length === 0) return { teamName: "undefined", value: 0 };

  const sorted = [...weekTeams].sort((a, b) => b.points - a.points);

  const targetEntry = findHighest ? sorted[0] : sorted[sorted.length - 1];

  return {
    teamName: targetEntry.teamName,
    value: targetEntry.points,
  };
}

function findWinnersByWeek(leagueData: LeagueData, week: number): WeekTeam[]{
    const weekTeams = getWeekTeams(leagueData, week);
    const winners = weekTeams.filter(team => team.victoryMargin !== undefined);
    if(winners.length === 0)
    {
        return [];
    }

    winners.sort((a,b) => (b.victoryMargin ?? 0) - (a.victoryMargin ?? 0));

    return winners;
}

export function findLowestScore(leagueData: LeagueData, week: number): AwardRecipient{
    return findTeamByPoints(leagueData, week, false);
}

export function findHighestScore(leagueData: LeagueData, week: number): AwardRecipient{
    return findTeamByPoints(leagueData, week, true);
}

export function findLargestWin(leagueData: LeagueData, week: number): AwardRecipient{
    const winners = findWinnersByWeek(leagueData, week);
    const topWinner = winners[0];
    return {
    teamName: topWinner.teamName,
    value: topWinner.victoryMargin ?? 0,
  };
}

export function findSmallestWin(leagueData: LeagueData, week: number): AwardRecipient{
    const winners = findWinnersByWeek(leagueData, week);
    const lowestWinner = winners[winners.length - 1];
    return {
        teamName: lowestWinner.teamName,
        value: lowestWinner.victoryMargin ?? 0,
    }
}

function findTeamsByMetric(
  leagueData: LeagueData,
  week: number,
  metricFn: (team: Team) => number,
  comparator: (current: number, best: number) => boolean,
  initialBest: number
): AwardRecipient[] {
  let bestValue = initialBest;
  const winners: AwardRecipient[] = [];

  leagueData.teams.forEach(team => {
    const value = metricFn(team);

    if (comparator(value, bestValue)) {
      bestValue = value;
      winners.length = 0; // reset ties
      winners.push({ teamName: team.name, value });
    } else if (value === bestValue) {
      winners.push({ teamName: team.name, value });
    }
  });

  return winners;
}

// --- Metric functions ---
function potentialMetric(team: Team, week: number): number {
  const rosterEntries = team.roster.entries ?? [];
  const players = rosterEntries.map(entry => {
    const player = entry.playerPoolEntry.player;
    player.defaultPositionId = getTruePosition(player);
    return player;
  });
  const lineup = getOptimalLineup(players, week);
  return getWeekTotal(lineup, week);
}

function managedGapMetric(team: Team, week: number, leagueData: LeagueData): number {
  const teamPotential = potentialMetric(team, week);
  const actual = getActualTeamPoints(leagueData, team.id, week);
  return teamPotential - actual;
}

// --- Award functions ---
export function findHighestPotentialTeams(
  leagueData: LeagueData,
  week: number
) {
  return findTeamsByMetric(
    leagueData,
    week,
    t => potentialMetric(t, week),
    (cur, best) => cur > best,
    -1
  );
}

export function findLowestPotentialTeam(
  leagueData: LeagueData,
  week: number
) {
  return findTeamsByMetric(
    leagueData,
    week,
    t => potentialMetric(t, week),
    (cur, best) => cur < best,
    500
  );
}

export function findBestManagedTeam(
  leagueData: LeagueData,
  week: number
) {
  return findTeamsByMetric(
    leagueData,
    week,
    t => managedGapMetric(t, week, leagueData),
    (cur, best) => cur > best,
    -1
  );
}

export function findWorstManagedTeam(
  leagueData: LeagueData,
  week: number
) {
  return findTeamsByMetric(
    leagueData,
    week,
    t => managedGapMetric(t, week, leagueData),
    (cur, best) => cur < best,
    500
  );
}

