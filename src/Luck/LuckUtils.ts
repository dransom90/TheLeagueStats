/*
    Luck Algorithm
    If a team either scores the highest or lowest points, they have 0 luck.

    If a team scores the second highest points and wins, they have 1 luck point.
    If a team scores the second lowest points and loses, they have -1 luck point.
    If a team scores the third highest points and wins, they have 2 luck points.
    If a team scores the third lowest points and loses, they have -2 luck points.
    And so on, up to 10 luck points for the second place team and -10 luck points for the second to last place team.
*/
import type { LeagueData } from "../lib/LeagueDataTypes";
import { getWeeksPlayed } from "../lib/utils";

export function calculateLuckPoints(leagueData: LeagueData) {
  const teams = leagueData.teams.map((team) => ({
    teamId: team.id,
    teamName: team.name,
    weekly: [] as { week: number; points: number; won: boolean; luck: number }[],
    totalLuck: 0,
  }));

  const getTeam = (id: number) => teams.find((t) => t.teamId === id);

  const weeks = getWeeksPlayed(leagueData);

  for (let week = 1; week <= weeks; week++) {
    const matchups = leagueData.schedule.filter((m) => m.matchupPeriodId === week);
    const weekTeams: {teamName: string; teamId: number; points: number; won: boolean }[] = [];

    matchups.forEach((m) => {
      if (!m.home) return;
      if (m.away) {
        const homeTeam = getTeam(m.home.teamId);
        const awayTeam = getTeam(m.away.teamId);
        if (!homeTeam || !awayTeam) return;
        // Normal matchup
        const homeWon = m.home.totalPoints > m.away.totalPoints;
        const awayWon = m.away.totalPoints > m.home.totalPoints;

        weekTeams.push({teamName: homeTeam.teamName, teamId: m.home.teamId, points: m.home.totalPoints, won: homeWon });
        weekTeams.push({teamName: awayTeam.teamName, teamId: m.away.teamId, points: m.away.totalPoints, won: awayWon });
      } else {
        // Bye week — no opponent
        const team = getTeam(m.home.teamId);
        if(team){
          weekTeams.push({teamName: team.teamName, teamId: m.home.teamId, points: m.home.totalPoints, won: false });
        }
      }
    });

    // Sort teams by points scored (highest → lowest)
    const sorted = [...weekTeams].sort((a, b) => b.points - a.points);

    // Assign luck points and push to team data
    sorted.forEach((t, idx) => {
      const team = getTeam(t.teamId);
      if (!team) return;

      let luck = 0;
      if (t.won) {
        luck = idx === 0 ? 0 : Math.min(idx, 10); // Positive luck
      } else {
        const fromBottom = sorted.length - 1 - idx;
        luck = fromBottom === 0 ? 0 : -Math.min(fromBottom, 10); // Negative luck
      }

      team.weekly.push({
        week,
        points: t.points,
        won: t.won,
        luck,
      });

      team.totalLuck += luck;
    });
  }

  // Sort each team's weekly array so that it's already in rank order for that week
  teams.forEach((team) => {
    team.weekly.sort((a, b) => a.week - b.week);
  });

  return teams;
}