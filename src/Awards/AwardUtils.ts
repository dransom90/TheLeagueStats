import type { Entry, LeagueData, Player, Team } from "../lib/LeagueDataTypes";
import type { AwardRecipient, WeekAwards } from "./AwardTypes";
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

// function findTeamByPoints(
//   leagueData: LeagueData,
//   week: number,
//   findHighest: boolean
// ): AwardRecipient {
//   const weekTeams = getWeekTeams(leagueData, week);
//   if (weekTeams.length === 0) return { teamName: "undefined", value: 0 };

//   const sorted = [...weekTeams].sort((a, b) => b.points - a.points);

//   const targetEntry = findHighest ? sorted[0] : sorted[sorted.length - 1];

//   return {
//     teamName: targetEntry.teamName,
//     value: targetEntry.points,
//   };
// }

// function findWinnersByWeek(leagueData: LeagueData, week: number): WeekTeam[]{
//     const weekTeams = getWeekTeams(leagueData, week);
//     const winners = weekTeams.filter(team => team.victoryMargin !== undefined);
//     if(winners.length === 0)
//     {
//         return [];
//     }

//     winners.sort((a,b) => (b.victoryMargin ?? 0) - (a.victoryMargin ?? 0));

//     return winners;
// }

function findTeamsByValue(
  teams: WeekTeam[],
  getValue: (team: WeekTeam) => number,
  compare: (a: number, b: number) => boolean
): AwardRecipient[] {
  let bestValue: number | undefined = undefined;
  const winners: AwardRecipient[] = [];

  teams.forEach(team => {
    const value = getValue(team);

    if (bestValue === undefined || compare(value, bestValue)) {
      bestValue = value;
      winners.length = 0; // reset winners list
      winners.push({ teamName: team.teamName, value });
    } else if (value === bestValue) {
      winners.push({ teamName: team.teamName, value });
    }
  });

  return winners;
}

export function findLowestScore(leagueData: LeagueData, week: number): AwardRecipient[] {
  const weekTeams = getWeekTeams(leagueData, week);
  return findTeamsByValue(weekTeams, t => t.points, (a, b) => a < b);
}

export function findHighestScore(leagueData: LeagueData, week: number): AwardRecipient[] {
  const weekTeams = getWeekTeams(leagueData, week);
  return findTeamsByValue(weekTeams, t => t.points, (a, b) => a > b);
}

export function findLargestWin(leagueData: LeagueData, week: number): AwardRecipient[] {

  const weekTeams = getWeekTeams(leagueData, week);

  // Filter only teams with a defined victoryMargin (winners)
  const winners = weekTeams.filter(
    team => team.victoryMargin !== undefined
  );

  // If no winners found
  if (winners.length === 0) {
    return [{ teamName: "undefined", value: 0 }];
  }

  // Find the max victoryMargin
  const maxMargin = Math.max(
    ...winners.map(team => team.victoryMargin ?? 0)
  );

  // Return all teams that match the max margin (handles ties)
  return winners
    .filter(team => (team.victoryMargin ?? 0) === maxMargin)
    .map(team => ({
      teamName: team.teamName,
      value: team.victoryMargin ?? 0
    }));
}

export function findSmallestWin(
  leagueData: LeagueData,
  week: number
): AwardRecipient[] {
  const weekTeams = getWeekTeams(leagueData, week);

  // Only teams with a defined victoryMargin
  const winners = weekTeams.filter(
    team => team.victoryMargin !== undefined
  );

  if (winners.length === 0) {
    return [{ teamName: "undefined", value: 0 }];
  }

  // Find the smallest victory margin
  const minMargin = Math.min(
    ...winners.map(team => team.victoryMargin ?? 0)
  );

  // Return all teams matching the smallest margin (handles ties)
  return winners
    .filter(team => (team.victoryMargin ?? 0) === minMargin)
    .map(team => ({
      teamName: team.teamName,
      value: Math.round(team.victoryMargin ?? 0 * 100) / 100,
    }));
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
  //const weekTotal = getWeekTotal(lineup, week);
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
): AwardRecipient[] {
  let bestValue = -1;
  const tiedTeams: AwardRecipient[] = [];

  leagueData.teams.forEach(team => {

    const rosterEntries = team.roster.entries ?? [];

    const players: Player[] = rosterEntries.map((entry: Entry) => {
      const player = entry.playerPoolEntry.player;
      player.defaultPositionId = getTruePosition(player);
      return player;
    });

    const weekPlayers = players.map(player => ({
  ...player,
  stats: player.stats.filter(s => s.scoringPeriodId === week)
}));

    const lineup = getOptimalLineup(weekPlayers, week);
    const teamPotential = getWeekTotal(lineup, week);

    if (teamPotential > bestValue) {
      bestValue = teamPotential;
      tiedTeams.length = 0; // clear old ties
      tiedTeams.push({ teamName: team.name, value: teamPotential });
    } else if (teamPotential === bestValue) {
      tiedTeams.push({ teamName: team.name, value: teamPotential });
    }
  });

  return tiedTeams;
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
): AwardRecipient[] {
  let bestValue = -1;
  let winners: AwardRecipient[] = [];

  leagueData.teams.forEach(team => {
    const rosterEntries = team.roster.entries ?? [];

    const players: Player[] = rosterEntries.map((entry: Entry) => {
      const player = entry.playerPoolEntry.player;
      player.defaultPositionId = getTruePosition(player);
      return player;
    });

    const lineup = getOptimalLineup(players, week);
    const teamPotential = getWeekTotal(lineup, week);
    const actual = getActualTeamPoints(leagueData, team.id, week);

    const managedGap = Math.round((teamPotential - actual) * 100) / 100 ; // smaller gap = better managed, round to 2 decimal places

    if (managedGap > bestValue) {
      bestValue = managedGap;
      winners = [{ teamName: team.name, value: managedGap }];
    } else if (managedGap === bestValue) {
      winners.push({ teamName: team.name, value: managedGap });
    }
  });

  return winners;
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

export function getAllWeeklyAwards(leagueData: LeagueData | null, selectedWeek: number) {
  if(!leagueData)
  {
    return [];
  }

  const allAwards: WeekAwards[] = [];

  //for (let week = 1; week <= weeksPlayed; week++) {
    allAwards.push({
      week: selectedWeek,
      highestScore: findHighestScore(leagueData, selectedWeek),
      lowestScore: findLowestScore(leagueData, selectedWeek),
      highestPotential: findHighestPotentialTeams(leagueData, selectedWeek),
      lowestPotential: findLowestPotentialTeam(leagueData, selectedWeek),
      bestManaged: findBestManagedTeam(leagueData, selectedWeek),
      worstManaged: findWorstManagedTeam(leagueData, selectedWeek),
      largestWin: findLargestWin(leagueData, selectedWeek),
      smallestWin: findSmallestWin(leagueData, selectedWeek),
    });
  //}

  return allAwards;
}