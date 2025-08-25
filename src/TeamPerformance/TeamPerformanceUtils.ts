import type { LeagueData } from "../lib/LeagueDataTypes";
import type { TeamPerformanceResult } from "./TeamPerformanceTypes";

function getExpectedWins(
  leagueData: LeagueData,
  data: TeamPerformanceResult[]
) {
  const teams = leagueData.teams;
  const numTeams = teams.length;
  const schedules = leagueData.schedule;

  const teamExpectedWins: Record<number, number> = {};
  const teamWeeklyPoints: Record<number, number[]> = {}; // ✅ hold weekly performance points

  // Group scores by week
  const weeks: Record<number, { teamId: number; points: number }[]> = {};

  for (const game of schedules) {
    const week = game.matchupPeriodId;
    if (!weeks[week]) weeks[week] = [];

    weeks[week].push({ teamId: game.home.teamId, points: game.home.totalPoints });
    if (game.away) {
      weeks[week].push({ teamId: game.away.teamId, points: game.away.totalPoints });
    }
  }

  // Process each week
  for (const week of Object.keys(weeks).map(Number)) {
    const results = weeks[week];

    // Sort high-to-low
    const sorted = [...results].sort((a, b) => b.points - a.points);

    let rank = 0;
    while (rank < sorted.length) {
      // Find tie group
      const tieScore = sorted[rank].points;
      const tieGroup: typeof sorted = [];
      let j = rank;

      while (j < sorted.length && sorted[j].points === tieScore) {
        tieGroup.push(sorted[j]);
        j++;
      }

      // Performance points available to this group
      const startPoints = (numTeams - 1) - rank;   // points for this rank
      const endPoints = (numTeams - 1) - (j - 1);  // points for last rank in tie
      const avgPoints = (startPoints + endPoints) / 2;

      const expectedWins = avgPoints / (numTeams - 1);

      for (const team of tieGroup) {
        // ✅ update cumulative expected wins
        teamExpectedWins[team.teamId] =
          (teamExpectedWins[team.teamId] || 0) + expectedWins;

        // ✅ store weekly points for charting
        if (!teamWeeklyPoints[team.teamId]) {
          teamWeeklyPoints[team.teamId] = [];
        }
        teamWeeklyPoints[team.teamId].push(avgPoints); 
      }

      rank = j; // move past this tie group
    }
  }

  // Merge into data[]
  for (const teamId in teamExpectedWins) {
    const team = teams.find(t => t.id === Number(teamId));
    const existing = data.find((x) => x.teamName === team?.name);

    if (existing) {
      existing.expectedWins += teamExpectedWins[teamId];
      existing.weeklyPoints.push(...(teamWeeklyPoints[Number(teamId)] || []));
    } else {
      data.push({
        teamName: team?.name || "",
        expectedWins: teamExpectedWins[teamId],
        actualWins: 0,
        expectedRank: 0,
        actualRank: 0,
        weeklyPoints: teamWeeklyPoints[Number(teamId)] || []
      });
    }
  }
}

function getActualWins(leagueData: LeagueData, data: TeamPerformanceResult[]){
    const teams = leagueData.teams;
    for(const x of data){
        const team = teams.find(t => t.name === x.teamName);
        if(team){
            x.actualWins = team.record.overall.wins;
        }
    }
}

function getExpectedRank(data: TeamPerformanceResult[]){
    const sorted = [...data].sort((a,b) => b.expectedWins - a.expectedWins);
    for(let i=0; i<sorted.length; i++){
        const team = sorted[i];
        const existing = data.find(x => x.teamName === team.teamName);
        if(existing){
            existing.expectedRank = i+1;
        }
    }
}

function getActualRank(leagueData: LeagueData, data: TeamPerformanceResult[]){
  const teams = leagueData.teams;
  for(const x of data){
        const team = teams.find(t => t.name === x.teamName);
        if(team){
            x.actualRank = team.rankCalculatedFinal;
        }
    }
}

export default function getTeamPerformanceData(leagueData: LeagueData): TeamPerformanceResult[]{
    const performanceData: TeamPerformanceResult[] = [];
    getExpectedWins(leagueData, performanceData);
    getActualWins(leagueData, performanceData);
    getExpectedRank(performanceData);
    getActualRank(leagueData, performanceData);

    return performanceData;
}