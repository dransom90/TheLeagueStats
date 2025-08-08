import React, { useEffect, useState } from "react";

interface Matchup {
  id?: number;
  home?: any;
  away?: any;
  [key: string]: any;
}

export default function Luck() {
  const [schedule, setSchedule] = useState<Matchup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        // Replace this with your API endpoint for ESPN league data
        const res = await fetch(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${SEASON}/segments/${SEGMENT_ID}/leagues/${LEAGUE_ID}?view=mMatchup&view=mMatchupScore&view=mTeam&scoringPeriodId=${selectedWeek}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const leagueData = await res.json();

        if (!leagueData.schedule) {
          throw new Error("No schedule data found in API response");
        }

        setSchedule(leagueData.schedule);
      } catch (err: any) {
        setError(err.message || "Failed to fetch schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (loading) {
    return <div>Loading matchups...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Luck Analysis</h2>
      <ul className="space-y-2">
        {schedule.map((matchup, index) => (
          <li
            key={matchup.id || index}
            className="p-2 border rounded bg-gray-100"
          >
            <div className="font-semibold">Matchup {index + 1}</div>
            <pre className="text-sm">
              {JSON.stringify(
                {
                  home: matchup.home?.teamId,
                  away: matchup.away?.teamId,
                  week: matchup.matchupPeriodId,
                  homeScore: matchup.home?.totalPoints,
                  awayScore: matchup.away?.totalPoints,
                },
                null,
                2
              )}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}