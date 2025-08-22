import { useEffect, useState } from "react";
import type { LeagueData } from "../lib/LeagueDataTypes";
import { getCoachRatings } from "./CoachRatingUtils";
import type { TeamCoachRatings } from "./CoachRatingTypes";
import { CoachRatingsTable } from "./CoachRatingTable";

interface CoachRatingProps {
  selectedYear: number;
}

export default function CoachRating({ selectedYear }: CoachRatingProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<TeamCoachRatings[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${selectedYear}/segments/0/leagues/1525510?view=mMatchup&view=mMatchupScore&view=mTeam&scoringPeriodId=1 `
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const leagueData: LeagueData = await res.json();

        if (!leagueData.schedule || !leagueData.teams) {
          throw new Error("Missing data found in API response");
        }

        const ratings = getCoachRatings(leagueData, selectedYear);
        setRatings(await ratings);
      } catch (err: any) {
        setError(err.message || "Failed to fetch league data");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedYear]);

  if (loading) {
    return <div>Loading power ratings...</div>;
  }

  if (error) {
    return <div className="text-amber-400">Error: {error}</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl border border-white/10 bg-[#2f5a3d] p-6 text-slate-100 shadow-lg">
      <h2 className="text-3xl font-bold text-blue-400">Coach Rating 🎯</h2>
      <p className="text-lg text-gray-200">
        Ever wonder if you’re actually a{" "}
        <span className="font-semibold text-blue-300">good coach</span> or just
        coasting on stacked rosters? That’s what{" "}
        <span className="text-yellow-400">Coach Rating</span> is for.
      </p>
      <p className="text-gray-300">The formula blends two big factors:</p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
          <span className="font-semibold text-white">Winning Percentage</span> –
          because, yeah, wins matter.
        </div>
        <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
          <span className="font-semibold text-white">
            Points Scored ÷ Optimal Points
          </span>{" "}
          – how close you’ve been to playing your perfect lineup each week.
        </div>
      </div>
      <div className="mt-5 rounded-lg bg-black/20 p-4 ring-1 ring-white/10">
        <p className="text-lg text-gray-200">
          Put it together, divide by{" "}
          <span className="font-semibold text-yellow-400">2</span>, and you get
          a number between <span className="text-red-400">0</span> and
          <span className="text-green-400">1.0</span>.
        </p>
        <p className="font-semibold text-blue-300">
          The closer you are to <span className="text-green-400">1.0</span>, the
          sharper your coaching. Slip below{" "}
          <span className="text-red-400">0.5</span>, and let’s just say… your
          bench is outscoring your starters.
        </p>
      </div>

      <CoachRatingsTable ratings={ratings} />
    </div>
  );
}
