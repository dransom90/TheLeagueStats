import { useEffect, useState } from "react";
import type { LeagueData } from "../lib/LeagueDataTypes";
import type { TeamPowerRating } from "./PowerRatingTypes";
import { calculatePowerRatings } from "./PowerRatingCalculator";
import { PowerRatingsTable } from "./PowerRatingsTable";
import Loading from "../Loading";

interface PowerRatingProps {
  selectedYear: number;
}

export default function PowerRatings({ selectedYear }: PowerRatingProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamRatings, setTeamRatings] = useState<TeamPowerRating[]>([]);

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

        const powerRatings = calculatePowerRatings(leagueData);
        setTeamRatings(powerRatings);
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
        <span className="text-2xl">⚡</span>
        <h2 className="text-2xl font-extrabold tracking-tight">
          Power Ratings
        </h2>
        <span className="ml-auto inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
          real strength, not vibes
        </span>
      </div>

      <p className="leading-relaxed">
        Think of this as your team’s{" "}
        <span className="font-semibold text-yellow-300">true power level</span>{" "}
        — not how many cheap wins slipped through the cracks. We blend three
        signals to separate contenders from pretenders:
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/*Average Score*/}
        <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              Average Score
            </span>
            <span className="rounded-md bg-emerald-400/20 px-2 py-0.5 text-xs font-bold text-emerald-200 ring-1 ring-emerald-300/30">
              60%
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Your steady output — week in, week out.
          </p>
        </div>

        {/*Highs + Lows*/}
        <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              Highs + Lows
            </span>
            <span className="rounded-md bg-sky-400/20 px-2 py-0.5 text-xs font-bold text-sky-200 ring-1 ring-sky-300/30">
              20%
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Monster weeks (🔥) and the stinkers (😬) both count.
          </p>
        </div>

        {/*Win %*/}
        <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              Win Percentage
            </span>
            <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-200 ring-1 ring-amber-300/30">
              20%
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            At some point,{" "}
            <span className="font-semibold">actually winning</span> matters.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-black/20 p-4 ring-1 ring-white/10">
        <p className="text-sm leading-relaxed">
          The result is a single number that says what your squad is{" "}
          <span className="font-semibold text-yellow-300">really capable</span>{" "}
          of dropping on any given weekend. It rewards consistency, exposes
          flukes, and keeps “lucky” teams in check.
        </p>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-md bg-amber-500/15 p-3 ring-1 ring-amber-400/30">
        <span className="text-lg">⚠️</span>
        <p className="text-sm text-amber-100">
          Don’t start flexing your Power Rating until at least{" "}
          <span className="font-semibold">3 weeks in</span> — before that, it’s
          basically astrology.
        </p>
      </div>

      {/*Power ratings table*/}
      <PowerRatingsTable ratings={teamRatings} />
    </div>
  );
}
