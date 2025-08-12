import type { LeagueData } from "../lib/LeagueDataTypes";
import type { AwardRecipient } from "./AwardTypes";

type WeekTeam = {
  teamName: string;
  teamId: number;
  points: number;
  won: boolean;
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

      weekTeams.push({ teamName: homeTeam.teamName, teamId: m.home.teamId, points: m.home.totalPoints, won: homeWon });
      weekTeams.push({ teamName: awayTeam.teamName, teamId: m.away.teamId, points: m.away.totalPoints, won: awayWon });
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

export function findLowestScore(leagueData: LeagueData, week: number): AwardRecipient{
    return findTeamByPoints(leagueData, week, false);
}

export function findHighestScore(leagueData: LeagueData, week: number): AwardRecipient{
    return findTeamByPoints(leagueData, week, true);
}