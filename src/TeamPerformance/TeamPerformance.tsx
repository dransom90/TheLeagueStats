import { useEffect, useState } from "react";
import type { LeagueData } from "../lib/LeagueDataTypes";
import Loading from "../Loading";

interface TeamPerformanceProps {
  selectedYear: number;
}

export default function TeamPerformance({
  selectedYear,
}: TeamPerformanceProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${selectedYear}/segments/0/leagues/1525510?view=mMatchup&view=mMatchupScore&view=mTeam&scoringPeriodId`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const leagueData: LeagueData = await res.json();

        if (!leagueData.schedule || !leagueData.teams) {
          throw new Error("Missing data found in API response");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch league data");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedYear]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-amber-400">Error: {error}</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl border border-white/10 bg-[#2f5a3d] p-6 text-slate-100 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-2xl font-extrabold tracking-tight">
          Team Performance 📊
        </h2>
      </div>
      <p className="leading-relaxed">
        Wins don’t always tell the full story — sometimes your squad drops 130
        points and still loses, other times you scrape by with 85. The{" "}
        <span className="font-semibold">Team Performance</span> metric cuts
        through the noise by asking:
        <span className="italic">
          “How many teams did you actually outscore this week?”
        </span>
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <p className="mt-2 text-sm text-slate-300">
              Each week, teams earn{" "}
              <span className="font-semibold">performance points</span> equal to
              the number of teams they beat. (In a 12-team league, the top
              scorer gets 11 points, last place gets 0.)
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <p className="mt-2 text-sm text-slate-300">
              Those weekly points are divided by{" "}
              <span className="font-semibold">(# of teams – 1)</span> to
              estimate an “expected win total.”
            </p>
          </div>
        </div>
        <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <p className="mt-2 text-sm text-slate-300">
              Week by week, these are added up to show{" "}
              <span className="font-semibold">
                how many wins a team should have
              </span>
              , based purely on scoring.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 rounded-lg bg-black/20 p-4 ring-1 ring-white/10">
        <p className="text-sm leading-relaxed">
          The result is a ranking system that shows whether a team’s record
          matches their true performance.
          <span className="font-semibold">Lucky teams</span> with easy schedules
          get exposed, while consistently high-scoring teams get the credit they
          deserve.
        </p>
        <p className="text-sm leading-relaxed">
          You’ll also find a chart tracking{" "}
          <span className="font-semibold">
            how many teams each squad beat week by week
          </span>
          , so you can see the story of their season unfold.
        </p>
      </div>
    </div>
  );
}
