import type { Entry, LeagueData, Player } from "../lib/LeagueDataTypes";
import type { AwardRecipient } from "./AwardTypes";
import { getOptimalLineup } from "../lib/OptimalLineupCalculator";
import { getTruePosition, getWeekTotal } from "../lib/utils";

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

export function findHighestPotentialTeam(leagueData: LeagueData, week: number): AwardRecipient{
    type bestTeam ={
        teamName: string,
        potential: number
    };

    let best: bestTeam = {teamName: "none", potential: -1};
    const teams = leagueData.teams;
    teams.forEach(t => {
        const rosterEntries = t.roster.entries ?? [];
        const players: Player[] = (rosterEntries as Entry[]).map((entry) => {
            const player = entry.playerPoolEntry.player;
            player.defaultPositionId = getTruePosition(player);
            return player;
        })

        const lineup = getOptimalLineup(players, week);
        const potential = getWeekTotal(lineup, week);
        if(potential > best.potential)
        {
            best = {teamName: t.name, potential: potential};
        }
    });

    return {teamName: best.teamName, value: best.potential};
}

export function findLowestPotentialTeam(leagueData: LeagueData, week: number): AwardRecipient{
    type worstTeam ={
        teamName: string,
        potential: number
    };

    let worst: worstTeam = {teamName: "none", potential: 1000};
    const teams = leagueData.teams;
    teams.forEach(t => {
        const rosterEntries = t.roster.entries ?? [];
        const players: Player[] = (rosterEntries as Entry[]).map((entry) => {
            const player = entry.playerPoolEntry.player;
            player.defaultPositionId = getTruePosition(player);
            return player;
        })

        const lineup = getOptimalLineup(players, week);
        const potential = getWeekTotal(lineup, week);
        if(potential > worst.potential)
        {
            worst = {teamName: t.name, potential: potential};
        }
    });

    return {teamName: worst.teamName, value: worst.potential};
}